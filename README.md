# The Vault

A real-time multiplayer social deduction game for 5-8 players. One player is the **Conman** posing as a guard — the rest are **Guards** protecting a diamond.

## How It Works

1. **Join the vault** — create a room and share the 4-letter code
2. **Roll for patrol shifts** — your dice roll (1-6) determines which shift you patrol during the night
3. **Night shifts** — 6 shifts play out over ~60 seconds. You only wake during your shift. The conman steals the diamond when they patrol. If you're alone, you can peek at someone else's schedule
4. **Insider recruitment** — after night ends, the conman secretly picks 1-2 guards as insiders (1 for 5-6 players, 2 for 7-8). Insiders learn who the conman is and win with them
5. **Interrogation** — everyone votes on who to detain
6. **Win condition** — Guards win if they detain the conman. Conman + insiders win if the conman survives

## Roles

| Role | Count | Goal |
|------|-------|------|
| Guard | Most players | Find and detain the conman |
| Conman | 1 | Steal the diamond and survive the vote |
| Insider | 1-2 (chosen post-night) | Protect the conman — win together |

## Tech Stack

| Layer | Tech |
|-------|------|
| Backend | Java 17, Spring Boot, Spring WebSocket |
| Frontend | React 19, Vite |
| Communication | WebSocket + REST |
| Storage | In-memory only |

## Running Locally

**Prerequisites:** Java 17+, Node.js 18+

```bash
# Backend (port 8080)
./mvnw spring-boot:run

# Frontend (port 5173)
cd client && npm install && npm run dev
```

Open 5+ browser tabs, create a room, share the code.

## Project Structure

```
├── src/main/java/com/thief/cheesethief/
│   ├── model/        Player, Room, GameState
│   ├── service/      GameService (core engine)
│   ├── controller/   Night + pregame logic
│   ├── ws/           WebSocket handler
│   └── config/       WebSocket config
├── client/src/
│   ├── context/      GameContext (state + WebSocket)
│   └── screens/      Home, Lobby, Night, Follower, Vote, GameOver
└── pom.xml
```
