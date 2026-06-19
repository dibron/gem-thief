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
    private String hostName;

    public Room(String roomId) {
        this.roomId = roomId;
        this.gameState = new GameState();
        this.sessionToPlayer = new ConcurrentHashMap<>();
        this.gameStarted = false;
        this.paused = false;
        this.nightRunning = false;
    }

    public String getRoomId() { return roomId; }
    public GameState getGameState() { return gameState; }

    public void addPlayer(WebSocketSession session, String name) {
        boolean exists = gameState.getPlayers().stream()
                .anyMatch(p -> p.getName().equalsIgnoreCase(name));
        if (exists) throw new RuntimeException("Name already taken");

        Player player = new Player(name);
        gameState.addPlayer(player);
        sessionToPlayer.put(session, player);
    }

    public Player getPlayer(WebSocketSession session) { return sessionToPlayer.get(session); }
    public Collection<WebSocketSession> getSessions() { return sessionToPlayer.keySet(); }
    public boolean isGameStarted() { return gameStarted; }
    public void setGameStarted(boolean gameStarted) { this.gameStarted = gameStarted; }

    public void removePlayer(WebSocketSession session) {
        Player player = sessionToPlayer.remove(session);
        if (player != null) {
            gameState.getPlayers().remove(player);
        }
    }

    public boolean isEmpty() { return sessionToPlayer.isEmpty(); }
    public boolean isPaused() { return paused; }
    public void setPaused(boolean paused) { this.paused = paused; }
    public boolean isNightRunning() { return nightRunning; }
    public void setNightRunning(boolean nightRunning) { this.nightRunning = nightRunning; }
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
    }
}
