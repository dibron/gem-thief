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
        if (room == null) {
            sendError(session, "Room not found");
            return;
        }
        if (room.isGameStarted()) {
            sendError(session, "Game already in progress");
            return;
        }
        if (room.getGameState().getPlayers().size() >= 4) {
            sendError(session, "Room is full");
            return;
        }
        try {
            room.addPlayer(session, name);
            if (room.getHostName() == null) {
                room.setHostName(name);
            }
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

        if (ready == total && total >= 4) {
            room.setGameStarted(true);
            new PregameController(room.getGameState()).process();

            for (WebSocketSession s : room.getSessions()) {
                Player player = room.getPlayer(s);
                String role = player.isThief() ? "THIEF" : "SLEEPYHEAD";
                sendJson(s, Map.of("type", "SETUP_PHASE", "myRole", role));
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
            broadcastJson(room, Map.of("type", "DAY_PHASE"));
            return;
        }

        nightCtrl.processPhase(phase);
        broadcastNightUpdate(room, phase);
        scheduler.schedule(() -> runPhase(room, nightCtrl, phase + 1), 10, TimeUnit.SECONDS);
    }

    private void broadcastNightUpdate(Room room, int phaseNum) {
        GameState gs = room.getGameState();
        List<Player> awakeNow = gs.getPlayersAtTime().getOrDefault(phaseNum, List.of());

        boolean gemSafe = !gs.isGemStolen();
        Player thief = gs.getThief();
        boolean stolenNow = thief != null && gs.getMessages(thief).contains("STOLEN_THIS_PHASE");
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
                msg.put("canPeek", others.isEmpty() && !p.isThief());

                if (gemSafe) {
                    msg.put("gemStatus", "SAFE");
                } else if (stolenNow) {
                    msg.put("gemStatus", "STOLEN_NOW");
                    msg.put("thiefName", thief.getName());
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
                "message", target.getName() + " wakes up in Phase " + target.getDiceRoll() + "."
            ));
        }
    }

    public void castVote(String roomId, WebSocketSession session, String targetName) {
        Room room = rooms.get(roomId);
        if (room == null) return;

        Player voter = room.getPlayer(session);
        if (voter == null || voter.hasVoted()) return;
        if (voter.getName().equals(targetName)) {
            sendError(session, "You can't vote for yourself");
            return;
        }

        GameState gs = room.getGameState();
        boolean targetExists = gs.getPlayers().stream().anyMatch(p -> p.getName().equals(targetName));
        if (!targetExists) return;

        voter.setHasVoted(true);
        gs.castVote(voter.getName(), targetName);

        int votesSoFar = gs.getVoteCount();
        int totalPlayers = gs.getPlayers().size();

        broadcastJson(room, Map.of("type", "VOTE_COUNT", "count", votesSoFar, "total", totalPlayers));

        if (votesSoFar >= totalPlayers) {
            resolveVotes(room);
        }
    }

    private void resolveVotes(Room room) {
        GameState gs = room.getGameState();
        String eliminated = gs.getMostVotedPlayer();
        Player thief = gs.getThief();
        boolean thiefCaught = eliminated != null && eliminated.equals(thief.getName());
        boolean gemStolen = gs.isGemStolen();

        // Sleepyheads win if they catch the thief.
        // Thief wins if they voted out a non-thief (or if gem was stolen and thief not caught).
        boolean sleepyheadsWin = thiefCaught;

        Map<String, Object> result = new HashMap<>();
        result.put("type", "GAME_OVER");
        result.put("eliminated", eliminated != null ? eliminated : "nobody");
        result.put("thiefName", thief.getName());
        result.put("thiefCaught", thiefCaught);
        result.put("gemStolen", gemStolen);
        result.put("sleepyheadsWin", sleepyheadsWin);

        Map<String, String> allVotes = new HashMap<>(gs.getVotes());
        result.put("votes", allVotes);

        broadcastJson(room, result);
    }

    public void restartGame(String roomId, WebSocketSession session) {
        Room room = rooms.get(roomId);
        if (room == null) return;

        if (!room.isHost(session)) {
            sendError(session, "Only the host can restart");
            return;
        }

        room.resetForNewGame();
        broadcastJson(room, Map.of("type", "GAME_RESTART"));
        broadcastLobby(room);
    }

    public void togglePause(String roomId, WebSocketSession session) {
        Room room = rooms.get(roomId);
        if (room == null) return;

        if (!room.isHost(session)) {
            sendError(session, "Only the host can pause");
            return;
        }

        boolean newState = !room.isPaused();
        room.setPaused(newState);
        broadcastJson(room, Map.of("type", "PAUSE_UPDATE", "paused", newState));
    }

    public void broadcastLobby(Room room) {
        List<String> names = room.getGameState().getPlayers().stream().map(Player::getName).toList();
        Map<String, Object> msg = new HashMap<>();
        msg.put("type", "LOBBY_UPDATE");
        msg.put("players", names);
        msg.put("hostName", room.getHostName() != null ? room.getHostName() : "");
        broadcastJson(room, msg);
    }

    private void broadcastReadyCount(Room room) {
        GameState gs = room.getGameState();
        List<String> readyNames = gs.getPlayers().stream()
                .filter(p -> p.getDiceRoll() > 0).map(Player::getName).toList();
        broadcastJson(room, Map.of(
            "type", "READY_COUNT",
            "count", readyNames.size(),
            "total", gs.getPlayers().size(),
            "readyPlayers", readyNames
        ));
    }

    private void broadcastJson(Room room, Map<String, ?> data) {
        try {
            String json = mapper.writeValueAsString(data);
            for (WebSocketSession s : room.getSessions()) {
                sendMessage(s, json);
            }
        } catch (Exception e) {
            log.error("Failed to serialize broadcast", e);
        }
    }

    private void sendJson(WebSocketSession session, Map<String, ?> data) {
        try {
            sendMessage(session, mapper.writeValueAsString(data));
        } catch (Exception e) {
            log.error("Failed to serialize message", e);
        }
    }

    private void sendError(WebSocketSession session, String msg) {
        sendMessage(session, "{\"type\":\"ERROR\",\"message\":\"" + msg + "\"}");
    }

    private void sendMessage(WebSocketSession session, String json) {
        try {
            if (session.isOpen()) {
                synchronized (session) {
                    session.sendMessage(new TextMessage(json));
                }
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
