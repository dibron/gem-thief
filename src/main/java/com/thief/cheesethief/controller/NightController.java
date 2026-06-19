package com.thief.cheesethief.controller;

import com.thief.cheesethief.model.GameState;
import com.thief.cheesethief.model.Player;

import java.util.ArrayList;
import java.util.List;

public class NightController {

    private final GameState gameState;

    public NightController(GameState gameState) {
        this.gameState = gameState;
    }

    public void processPhase(int phase) {

        List<Player> awakePlayers = gameState.getPlayersAtTime().getOrDefault(phase, new ArrayList<>());

        boolean thiefIsAwake = awakePlayers.contains(gameState.getThief());


        if (thiefIsAwake && !gameState.isGemStolen()) {
            gameState.stealGem();

            gameState.pushMessage(gameState.getThief(), "STOLEN_THIS_PHASE");
        }
    }
}