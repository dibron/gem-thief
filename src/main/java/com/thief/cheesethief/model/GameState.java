package com.thief.cheesethief.model;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

public class GameState {
    private final List<Player> players;
    private volatile Player conman;
    private final List<Player> followers;
    private volatile boolean isGemStolen;
    private volatile int requiredFollowers;

    private final Map<Integer, List<Player>> playersAtTime;
    private final Map<String, String> votes;
    private final Map<Player, List<String>> playerMessages;

    public GameState() {
        this.isGemStolen = false;
        this.requiredFollowers = 0;
        this.players = new CopyOnWriteArrayList<>();
        this.followers = new CopyOnWriteArrayList<>();
        this.playersAtTime = new ConcurrentHashMap<>();
        this.votes = new ConcurrentHashMap<>();
        this.playerMessages = new ConcurrentHashMap<>();
    }

    public void addPlayer(Player player) { players.add(player); }
    public List<Player> getPlayers() { return players; }
    public Player getConman() { return conman; }
    public void setConman(Player conman) { this.conman = conman; }
    public List<Player> getFollowers() { return followers; }

    public void addFollower(Player player) {
        player.setFollower(true);
        followers.add(player);
    }

    public int getRequiredFollowers() { return requiredFollowers; }
    public void setRequiredFollowers(int n) { this.requiredFollowers = n; }

    public void setPlayerAtTime(Player player, int time) {
        playersAtTime.computeIfAbsent(time, k -> new CopyOnWriteArrayList<>()).add(player);
    }

    public Map<Integer, List<Player>> getPlayersAtTime() { return playersAtTime; }

    public void stealGem() { isGemStolen = true; }
    public boolean isGemStolen() { return isGemStolen; }

    public void castVote(String voterName, String targetName) { votes.put(voterName, targetName); }
    public int getVoteCount() { return votes.size(); }
    public Map<String, String> getVotes() { return votes; }

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

    public void pushMessage(Player p, String msg) {
        playerMessages.computeIfAbsent(p, k -> new CopyOnWriteArrayList<>()).add(msg);
    }

    public List<String> getMessages(Player p) {
        return playerMessages.getOrDefault(p, new CopyOnWriteArrayList<>());
    }

    public void clearMessages() { playerMessages.clear(); }

    public void reset() {
        conman = null;
        followers.clear();
        isGemStolen = false;
        requiredFollowers = 0;
        playersAtTime.clear();
        votes.clear();
        playerMessages.clear();
        for (Player p : players) {
            p.setDiceRoll(0);
            p.setConman(false);
            p.setFollower(false);
            p.setHasVoted(false);
        }
    }
}
