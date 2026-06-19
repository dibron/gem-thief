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
        boolean conmanIsAwake = awakePlayers.contains(gameState.getConman());

        if (conmanIsAwake && !gameState.isGemStolen()) {
            gameState.stealGem();
            gameState.pushMessage(gameState.getConman(), "STOLEN_THIS_PHASE");
        }
    }
}
