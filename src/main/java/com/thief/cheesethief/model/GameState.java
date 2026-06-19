package com.thief.cheesethief.model;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

public class GameState {
    private final List<Player> players;
    private volatile Player thief;
    private volatile boolean isGemStolen;

    private final Map<Integer, List<Player>> playersAtTime;
    private final Map<String, String> votes; // voterName -> targetName
    private final Map<Player, List<String>> playerMessages;

    public GameState() {
        this.isGemStolen = false;
        this.players = new CopyOnWriteArrayList<>();
        this.playersAtTime = new ConcurrentHashMap<>();
        this.votes = new ConcurrentHashMap<>();
        this.playerMessages = new ConcurrentHashMap<>();
    }

    public void addPlayer(Player player) { players.add(player); }
    public List<Player> getPlayers() { return players; }
    public Player getThief() { return thief; }
    public void setThief(Player thief) { this.thief = thief; }

    public void setPlayerAtTime(Player player, int time) {
        playersAtTime.computeIfAbsent(time, k -> new CopyOnWriteArrayList<>()).add(player);
    }

    public Map<Integer, List<Player>> getPlayersAtTime() { return playersAtTime; }

    public void stealGem() { isGemStolen = true; }
    public boolean isGemStolen() { return isGemStolen; }

    public void castVote(String voterName, String targetName) {
        votes.put(voterName, targetName);
    }

    public int getVoteCount() { return votes.size(); }

    public String getMostVotedPlayer() {
        Map<String, Integer> counts = new ConcurrentHashMap<>();
        for (String target : votes.values()) {
            counts.merge(target, 1, Integer::sum);
        }
        return counts.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse(null);
    }

    public Map<String, String> getVotes() { return votes; }

    public void pushMessage(Player p, String msg) {
        playerMessages.computeIfAbsent(p, k -> new CopyOnWriteArrayList<>()).add(msg);
    }

    public List<String> getMessages(Player p) {
        return playerMessages.getOrDefault(p, new CopyOnWriteArrayList<>());
    }

    public void clearMessages() { playerMessages.clear(); }

    public void reset() {
        thief = null;
        isGemStolen = false;
        playersAtTime.clear();
        votes.clear();
        playerMessages.clear();
        for (Player p : players) {
            p.setDiceRoll(0);
            p.setThief(false);
            p.setHasVoted(false);
        }
    }
}
