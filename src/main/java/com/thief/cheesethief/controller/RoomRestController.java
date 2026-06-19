package com.thief.cheesethief.controller;

import com.thief.cheesethief.service.GameService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/room")
@CrossOrigin(origins = "*") // Allows your Vite client port 5173 to connect seamlessly
public class RoomRestController {
    private final GameService gameService;

    public RoomRestController(GameService gameService) {
        this.gameService = gameService;
    }

    @PostMapping("/create")
    public String createRoom() {
        return gameService.createRoom();
    }
}