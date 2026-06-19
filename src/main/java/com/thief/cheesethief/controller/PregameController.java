package com.thief.cheesethief.controller;

import com.thief.cheesethief.model.GameState;
import com.thief.cheesethief.model.Player;

import java.util.List;
import java.util.concurrent.ThreadLocalRandom;

public class PregameController {
    private final GameState gameState;

    public PregameController(GameState gameState) {
        this.gameState = gameState;
    }

    public void process() {
        List<Player> players = gameState.getPlayers();
        Player conman = players.get(ThreadLocalRandom.current().nextInt(players.size()));
        gameState.setConman(conman);
        conman.setConman(true);

        int size = players.size();
        gameState.setRequiredFollowers(size <= 4 ? 0 : size >= 7 ? 2 : 1);
    }
}
