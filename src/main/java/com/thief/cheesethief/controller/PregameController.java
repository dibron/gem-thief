package com.thief.cheesethief.controller;

import com.thief.cheesethief.model.GameState;
import com.thief.cheesethief.model.Player;

import java.util.List;
import java.util.concurrent.ThreadLocalRandom;

public class PregameController {
    GameState gameState;

    public PregameController(GameState gameState) {
        this.gameState = gameState;
    }

    public void process() {
        List<Player> players = gameState.getPlayers();
        Player thief = players.get(ThreadLocalRandom.current().nextInt(players.size()));
        gameState.setThief(thief);
        thief.setThief(true);
    }
}