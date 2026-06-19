package com.thief.cheesethief.model;

public class Player {
    private String name;
    private boolean isThief;
    private int diceRoll;
    private volatile boolean hasVoted;

    public Player(String name) {
        this.name = name;
        this.diceRoll = 0;
        this.isThief = false;
        this.hasVoted = false;
    }

    public int getDiceRoll() { return diceRoll; }
    public void setDiceRoll(int diceRoll) { this.diceRoll = diceRoll; }
    public boolean isThief() { return isThief; }
    public void setThief(boolean thief) { this.isThief = thief; }
    public String getName() { return name; }
    public boolean hasVoted() { return hasVoted; }
    public void setHasVoted(boolean hasVoted) { this.hasVoted = hasVoted; }
}
