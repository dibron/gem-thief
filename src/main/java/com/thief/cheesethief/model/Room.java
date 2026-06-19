package com.thief.cheesethief.model;

import org.springframework.web.socket.WebSocketSession;
import java.util.Collection;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

public class Room {

    private final String roomId;
    private final GameState gameState;
    private final Map<WebSocketSession, Player> sessionToPlayer;
    private volatile boolean gameStarted;
    private volatile boolean paused;
    private volatile boolean nightRunning;
    private volatile boolean followerPhase;
    private String hostName;

     public static final int MIN_PLAYERS = 4;
    public static final int MAX_PLAYERS = 8;

    public Room(String roomId) {
        this.roomId = roomId;
        this.gameState = new GameState();
        this.sessionToPlayer = new ConcurrentHashMap<>();
        this.gameStarted = false;
        this.paused = false;
        this.nightRunning = false;
        this.followerPhase = false;
    }

    public String getRoomId() { return roomId; }
    public GameState getGameState() { return gameState; }

    public void addPlayer(WebSocketSession session, String name) {
        Player existing = gameState.getPlayers().stream()
                .filter(p -> p.getName().equalsIgnoreCase(name))
                .findFirst().orElse(null);

        if (existing != null) {
            sessionToPlayer.entrySet().removeIf(e -> e.getValue() == existing);
            sessionToPlayer.put(session, existing);
            return;
        }

        if (gameState.getPlayers().size() >= MAX_PLAYERS)
            throw new RuntimeException("Room is full (max " + MAX_PLAYERS + ")");

        Player player = new Player(name);
        gameState.addPlayer(player);
        sessionToPlayer.put(session, player);
    }

    public Player getPlayer(WebSocketSession session) { return sessionToPlayer.get(session); }

    public WebSocketSession getSession(Player player) {
        return sessionToPlayer.entrySet().stream()
                .filter(e -> e.getValue() == player)
                .map(Map.Entry::getKey)
                .findFirst().orElse(null);
    }

    public Collection<WebSocketSession> getSessions() { return sessionToPlayer.keySet(); }
    public boolean isGameStarted() { return gameStarted; }
    public void setGameStarted(boolean gameStarted) { this.gameStarted = gameStarted; }

    public void removePlayer(WebSocketSession session) {
        Player player = sessionToPlayer.remove(session);
        if (player != null) gameState.getPlayers().remove(player);
    }

    public boolean isEmpty() { return sessionToPlayer.isEmpty(); }
    public boolean isPaused() { return paused; }
    public void setPaused(boolean paused) { this.paused = paused; }
    public boolean isNightRunning() { return nightRunning; }
    public void setNightRunning(boolean nightRunning) { this.nightRunning = nightRunning; }
    public boolean isFollowerPhase() { return followerPhase; }
    public void setFollowerPhase(boolean followerPhase) { this.followerPhase = followerPhase; }
    public String getHostName() { return hostName; }
    public void setHostName(String hostName) { this.hostName = hostName; }

    public boolean isHost(WebSocketSession session) {
        Player p = sessionToPlayer.get(session);
        return p != null && p.getName().equalsIgnoreCase(hostName);
    }

    public void resetForNewGame() {
        gameState.reset();
        gameStarted = false;
        paused = false;
        nightRunning = false;
        followerPhase = false;
    }
}
