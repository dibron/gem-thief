package com.thief.cheesethief.service;

import com.thief.cheesethief.controller.NightController;
import com.thief.cheesethief.controller.PregameController;
import com.thief.cheesethief.model.GameState;
import com.thief.cheesethief.model.Player;
import com.thief.cheesethief.model.Room;
import tools.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;

import java.io.IOException;
import java.util.*;
import java.util.concurrent.*;

@Service
public class GameService {

    private static final Logger log = LoggerFactory.getLogger(GameService.class);
    private final Map<String, Room> rooms = new ConcurrentHashMap<>();
    private final ObjectMapper mapper = new ObjectMapper();
    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(10);

    public String createRoom() {
        String roomId = UUID.randomUUID().toString().substring(0, 4).toUpperCase();
        rooms.put(roomId, new Room(roomId));
        return roomId;
    }

    public void joinRoom(String roomId, WebSocketSession session, String name) {
        Room room = rooms.get(roomId);
        if (room == null) { sendError(session, "Room not found"); return; }

        boolean isReconnect = room.getGameState().getPlayers().stream()
                .anyMatch(p -> p.getName().equalsIgnoreCase(name));

        if (room.isGameStarted() && !isReconnect) {
            sendError(session, "Heist already in progress");
            return;
        }

        try {
            room.addPlayer(session, name);
            if (room.getHostName() == null) room.setHostName(name);
            broadcastLobby(room);
        } catch (Exception e) {
            sendError(session, e.getMessage());
        }
    }

    public void playerReadyUp(String roomId, WebSocketSession session, int roll) {
        Room room = rooms.get(roomId);
        if (room == null) return;

        Player p = room.getPlayer(session);
        if (p == null || p.getDiceRoll() != 0) return;
        if (roll < 1 || roll > 6) return;

        p.setDiceRoll(roll);
        room.getGameState().setPlayerAtTime(p, roll);

        sendJson(session, Map.of("type", "DICE_ROLLED", "myDice", roll));
        broadcastReadyCount(room);

        long ready = room.getGameState().getPlayers().stream().filter(pl -> pl.getDiceRoll() > 0).count();
        int total = room.getGameState().getPlayers().size();

        if (ready == total && total >= Room.MIN_PLAYERS) {
            room.setGameStarted(true);
            new PregameController(room.getGameState()).process();

            for (WebSocketSession s : room.getSessions()) {
                Player player = room.getPlayer(s);
                sendJson(s, Map.of("type", "SETUP_PHASE", "myRole", player.getRole()));
            }

            broadcastJson(room, Map.of("type", "GAME_START"));
            startNightPhaseLoop(room);
        }
    }

    private void startNightPhaseLoop(Room room) {
        room.setNightRunning(true);
        NightController nightCtrl = new NightController(room.getGameState());
        scheduler.schedule(() -> runPhase(room, nightCtrl, 1), 3, TimeUnit.SECONDS);
    }

    private void runPhase(Room room, NightController nightCtrl, int phase) {
        if (!room.isNightRunning()) return;

        if (room.isPaused()) {
            scheduler.schedule(() -> runPhase(room, nightCtrl, phase), 1, TimeUnit.SECONDS);
            return;
        }

        if (phase > 6) {
            room.setNightRunning(false);
            startFollowerPhase(room);
            return;
        }

        nightCtrl.processPhase(phase);
        broadcastNightUpdate(room, phase);
        scheduler.schedule(() -> runPhase(room, nightCtrl, phase + 1), 10, TimeUnit.SECONDS);
    }

    private void startFollowerPhase(Room room) {
        GameState gs = room.getGameState();

        if (gs.getRequiredFollowers() == 0) {
            for (WebSocketSession s : room.getSessions()) {
                Player p = room.getPlayer(s);
                if (p != null) sendJson(s, Map.of("type", "DAY_PHASE", "myRole", p.getRole()));
            }
            return;
        }

        room.setFollowerPhase(true);
        Player conman = gs.getConman();
        WebSocketSession conmanSession = room.getSession(conman);

        List<String> candidates = gs.getPlayers().stream()
                .filter(p -> !p.isConman())
                .map(Player::getName).toList();

        if (conmanSession != null) {
            Map<String, Object> msg = new HashMap<>();
            msg.put("type", "FOLLOWER_PHASE");
            msg.put("candidates", candidates);
            msg.put("requiredFollowers", gs.getRequiredFollowers());
            sendJson(conmanSession, msg);
        }

        for (WebSocketSession s : room.getSessions()) {
            Player p = room.getPlayer(s);
            if (p != null && !p.isConman()) {
                sendJson(s, Map.of("type", "FOLLOWER_WAIT"));
            }
        }

        scheduler.schedule(() -> {
            if (room.isFollowerPhase()) {
                autoPickFollowers(room);
            }
        }, 30, TimeUnit.SECONDS);
    }

    public void chooseFollower(String roomId, WebSocketSession session, List<String> followerNames) {
        Room room = rooms.get(roomId);
        if (room == null || !room.isFollowerPhase()) return;

        Player conman = room.getGameState().getConman();
        Player sender = room.getPlayer(session);
        if (sender == null || sender != conman) return;

        GameState gs = room.getGameState();
        int required = gs.getRequiredFollowers();

        int picked = 0;
        for (String name : followerNames) {
            if (picked >= required) break;
            Player target = gs.getPlayers().stream()
                    .filter(p -> p.getName().equals(name) && !p.isConman() && !p.isFollower())
                    .findFirst().orElse(null);
            if (target != null) {
                gs.addFollower(target);
                picked++;
            }
        }

        finishFollowerPhase(room);
    }

    private void autoPickFollowers(Room room) {
        GameState gs = room.getGameState();
        if (!room.isFollowerPhase()) return;

        int needed = gs.getRequiredFollowers() - gs.getFollowers().size();
        if (needed > 0) {
            List<Player> candidates = gs.getPlayers().stream()
                    .filter(p -> !p.isConman() && !p.isFollower()).toList();
            Collections.shuffle(new ArrayList<>(candidates));
            for (int i = 0; i < Math.min(needed, candidates.size()); i++) {
                gs.addFollower(candidates.get(i));
            }
        }
        finishFollowerPhase(room);
    }

    private void finishFollowerPhase(Room room) {
        room.setFollowerPhase(false);
        GameState gs = room.getGameState();

        Player conman = gs.getConman();
        List<String> followerNames = gs.getFollowers().stream().map(Player::getName).toList();

        WebSocketSession conmanSession = room.getSession(conman);
        if (conmanSession != null) {
            sendJson(conmanSession, Map.of("type", "FOLLOWERS_CHOSEN", "followers", followerNames));
        }

        for (Player f : gs.getFollowers()) {
            WebSocketSession fs = room.getSession(f);
            if (fs != null) {
                Map<String, Object> msg = new HashMap<>();
                msg.put("type", "YOU_ARE_INSIDER");
                msg.put("conmanName", conman.getName());
                msg.put("otherInsiders", followerNames.stream().filter(n -> !n.equals(f.getName())).toList());
                sendJson(fs, msg);
            }
        }

        scheduler.schedule(() -> {
            for (WebSocketSession s : room.getSessions()) {
                Player p = room.getPlayer(s);
                if (p != null) {
                    sendJson(s, Map.of("type", "DAY_PHASE", "myRole", p.getRole()));
                }
            }
        }, 5, TimeUnit.SECONDS);
    }

    // --- NIGHT BROADCAST ---

    private void broadcastNightUpdate(Room room, int phaseNum) {
        GameState gs = room.getGameState();
        List<Player> awakeNow = gs.getPlayersAtTime().getOrDefault(phaseNum, List.of());

        boolean gemSafe = !gs.isGemStolen();
        Player conman = gs.getConman();
        boolean stolenNow = conman != null && gs.getMessages(conman).contains("STOLEN_THIS_PHASE");
        if (stolenNow) gs.clearMessages();

        for (WebSocketSession s : room.getSessions()) {
            Player p = room.getPlayer(s);
            if (p == null) continue;

            boolean isAwake = awakeNow.contains(p);
            Map<String, Object> msg = new HashMap<>();
            msg.put("type", "NIGHT_UPDATE");
            msg.put("phase", phaseNum);
            msg.put("isAwake", isAwake);

            if (isAwake) {
                List<String> others = awakeNow.stream()
                        .filter(x -> x != p).map(Player::getName).toList();
                msg.put("awakeWithMe", others);
                msg.put("canPeek", others.isEmpty() && !p.isConman());

                if (gemSafe) {
                    msg.put("gemStatus", "SAFE");
                } else if (stolenNow) {
                    msg.put("gemStatus", "STOLEN_NOW");
                    msg.put("conmanName", conman.getName());
                } else {
                    msg.put("gemStatus", "MISSING");
                }
            }
            sendJson(s, msg);
        }
    }

    public void playerPeek(String roomId, WebSocketSession session, String targetName) {
        Room room = rooms.get(roomId);
        if (room == null) return;

        Player target = room.getGameState().getPlayers().stream()
                .filter(x -> x.getName().equals(targetName))
                .findFirst().orElse(null);

        if (target != null) {
            sendJson(session, Map.of(
                "type", "PEEK_RESULT",
                "message", target.getName() + " patrols during Shift " + target.getDiceRoll() + "."
            ));
        }
    }


    public void castVote(String roomId, WebSocketSession session, String targetName) {
        Room room = rooms.get(roomId);
        if (room == null) return;

        Player voter = room.getPlayer(session);
        if (voter == null || voter.hasVoted()) return;
        if (voter.getName().equals(targetName)) { sendError(session, "Can't vote for yourself"); return; }

        GameState gs = room.getGameState();
        if (gs.getPlayers().stream().noneMatch(p -> p.getName().equals(targetName))) return;

        voter.setHasVoted(true);
        gs.castVote(voter.getName(), targetName);

        int votesSoFar = gs.getVoteCount();
        int totalPlayers = gs.getPlayers().size();
        broadcastJson(room, Map.of("type", "VOTE_COUNT", "count", votesSoFar, "total", totalPlayers));

        if (votesSoFar >= totalPlayers) resolveVotes(room);
    }

    private void resolveVotes(Room room) {
        GameState gs = room.getGameState();
        String eliminated = gs.getMostVotedPlayer();
        Player conman = gs.getConman();
        boolean conmanCaught = eliminated != null && eliminated.equals(conman.getName());
        boolean gemStolen = gs.isGemStolen();

        boolean guardsWin = conmanCaught;

        List<String> followerNames = gs.getFollowers().stream().map(Player::getName).toList();

        Map<String, Object> result = new HashMap<>();
        result.put("type", "GAME_OVER");
        result.put("eliminated", eliminated != null ? eliminated : "nobody");
        result.put("conmanName", conman.getName());
        result.put("followers", followerNames);
        result.put("conmanCaught", conmanCaught);
        result.put("gemStolen", gemStolen);
        result.put("guardsWin", guardsWin);
        result.put("votes", new HashMap<>(gs.getVotes()));

        broadcastJson(room, result);
    }

    // --- ADMIN ---

    public void restartGame(String roomId, WebSocketSession session) {
        Room room = rooms.get(roomId);
        if (room == null) return;
        if (!room.isHost(session)) { sendError(session, "Only the lead guard can restart"); return; }

        room.resetForNewGame();
        broadcastJson(room, Map.of("type", "GAME_RESTART"));
        broadcastLobby(room);
    }

    public void togglePause(String roomId, WebSocketSession session) {
        Room room = rooms.get(roomId);
        if (room == null) return;
        if (!room.isHost(session)) { sendError(session, "Only the lead guard can pause"); return; }

        boolean newState = !room.isPaused();
        room.setPaused(newState);
        broadcastJson(room, Map.of("type", "PAUSE_UPDATE", "paused", newState));
    }

    // --- BROADCAST HELPERS ---

    public void broadcastLobby(Room room) {
        List<String> names = room.getGameState().getPlayers().stream().map(Player::getName).toList();
        Map<String, Object> msg = new HashMap<>();
        msg.put("type", "LOBBY_UPDATE");
        msg.put("players", names);
        msg.put("hostName", room.getHostName() != null ? room.getHostName() : "");
        msg.put("minPlayers", Room.MIN_PLAYERS);
        msg.put("maxPlayers", Room.MAX_PLAYERS);
        broadcastJson(room, msg);
    }

    private void broadcastReadyCount(Room room) {
        GameState gs = room.getGameState();
        List<String> readyNames = gs.getPlayers().stream()
                .filter(p -> p.getDiceRoll() > 0).map(Player::getName).toList();
        Map<String, Object> msg = new HashMap<>();
        msg.put("type", "READY_COUNT");
        msg.put("count", readyNames.size());
        msg.put("total", gs.getPlayers().size());
        msg.put("readyPlayers", readyNames);
        broadcastJson(room, msg);
    }

    private void broadcastJson(Room room, Map<String, ?> data) {
        try {
            String json = mapper.writeValueAsString(data);
            for (WebSocketSession s : room.getSessions()) sendMessage(s, json);
        } catch (Exception e) { log.error("Failed to serialize broadcast", e); }
    }

    private void sendJson(WebSocketSession session, Map<String, ?> data) {
        try { sendMessage(session, mapper.writeValueAsString(data)); }
        catch (Exception e) { log.error("Failed to serialize message", e); }
    }

    private void sendError(WebSocketSession session, String msg) {
        sendMessage(session, "{\"type\":\"ERROR\",\"message\":\"" + msg + "\"}");
    }

    private void sendMessage(WebSocketSession session, String json) {
        try {
            if (session.isOpen()) {
                synchronized (session) { session.sendMessage(new TextMessage(json)); }
            }
        } catch (IllegalStateException | IOException e) {
            log.trace("Skipped sending to closing session");
        }
    }

    public void handleDisconnect(WebSocketSession session) {
        Room room = rooms.values().stream()
                .filter(r -> r.getSessions().contains(session))
                .findFirst().orElse(null);
        if (room == null) return;

        Player player = room.getPlayer(session);
        room.removePlayer(session);

        if (player != null) {
            broadcastJson(room, Map.of("type", "PLAYER_LEFT", "name", player.getName()));
            broadcastLobby(room);
        }

        if (room.isEmpty()) {
            room.setNightRunning(false);
            rooms.remove(room.getRoomId());
        }
    }
}
