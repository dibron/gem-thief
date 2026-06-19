package com.thief.cheesethief.ws;

import com.thief.cheesethief.service.GameService;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.util.ArrayList;
import java.util.List;

@Component
public class GameWebSocketHandler extends TextWebSocketHandler {

    private static final Logger log = LoggerFactory.getLogger(GameWebSocketHandler.class);
    private final GameService gameService;
    private final ObjectMapper mapper = new ObjectMapper();

    public GameWebSocketHandler(GameService gameService) {
        this.gameService = gameService;
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        String payload = message.getPayload();
        log.info("Received: {}", payload);

        try {
            JsonNode node = mapper.readTree(payload);
            String action = node.path("action").asText("");
            String roomId = node.path("roomId").asText("");

            switch (action) {
                case "JOIN" -> {
                    String name = node.path("name").asText("Unknown");
                    gameService.joinRoom(roomId, session, name);
                }
                case "ROLL_DICE" -> {
                    int roll = node.path("roll").asInt(1);
                    gameService.playerReadyUp(roomId, session, roll);
                }
                case "PEEK" -> {
                    String target = node.path("targetName").asText("");
                    gameService.playerPeek(roomId, session, target);
                }
                case "CHOOSE_FOLLOWERS" -> {
                    JsonNode arr = node.path("followers");
                    List<String> names = new ArrayList<>();
                    if (arr.isArray()) {
                        for (JsonNode n : arr) names.add(n.asText());
                    }
                    gameService.chooseFollower(roomId, session, names);
                }
                case "VOTE" -> {
                    String target = node.path("targetName").asText("");
                    gameService.castVote(roomId, session, target);
                }
                case "SET_PHASES" -> {
                    int count = node.path("count").asInt(6);
                    gameService.setPhases(roomId, session, count);
                }
                case "TOGGLE_PAUSE" -> gameService.togglePause(roomId, session);
                case "RESTART" -> gameService.restartGame(roomId, session);
                default -> {
                    log.warn("Unknown action: {}", action);
                    session.sendMessage(new TextMessage("{\"type\":\"ERROR\",\"message\":\"Unknown action\"}"));
                }
            }
        } catch (Exception e) {
            log.error("Failed to process message", e);
            session.sendMessage(new TextMessage("{\"type\":\"ERROR\",\"message\":\"Invalid message\"}"));
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        gameService.handleDisconnect(session);
    }
}
