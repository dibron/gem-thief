package com.thief.cheesethief.model;

public class Player {
    private String name;
    private boolean isConman;
    private boolean isFollower;
    private int diceRoll;
    private volatile boolean hasVoted;

    public Player(String name) {
        this.name = name;
        this.diceRoll = 0;
        this.isConman = false;
        this.isFollower = false;
        this.hasVoted = false;
    }

    public int getDiceRoll() { return diceRoll; }
    public void setDiceRoll(int diceRoll) { this.diceRoll = diceRoll; }
    public boolean isConman() { return isConman; }
    public void setConman(boolean conman) { this.isConman = conman; }
    public boolean isFollower() { return isFollower; }
    public void setFollower(boolean follower) { this.isFollower = follower; }
    public String getName() { return name; }
    public boolean hasVoted() { return hasVoted; }
    public void setHasVoted(boolean hasVoted) { this.hasVoted = hasVoted; }

    public String getRole() {
        if (isConman) return "CONMAN";
        if (isFollower) return "INSIDER";
        return "GUARD";
    }
}
