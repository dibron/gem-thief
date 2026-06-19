# Gem Thief

A real-time multiplayer party game for 4 players. One player is secretly the **Thief** — the rest are **Sleepyheads** trying to figure out who stole the gem.

## How It Works

1. **Create or join a room** — share the 4-letter code with friends
2. **Roll dice** — your roll (1–6) determines which phase you wake up during the night
3. **Night phase** — 6 phases play out over ~60 seconds. You only wake up during your phase and can see who else is awake. The thief automatically steals the gem when they wake up
4. **Peek** — if you wake up alone (and you're not the thief), you can peek at another player's dice roll to gather intel
5. **Vote** — after the night ends, everyone votes on who they think the thief is
6. **Win condition** — Sleepyheads win if they correctly vote out the thief. The thief wins if they survive the vote

## Tech Stack

| Layer | Tech |
|-------|------|
| Backend | Java 17, Spring Boot, Spring WebSocket |
| Frontend | React 19, Vite |
| Communication | WebSocket (real-time) + REST (room creation) |
| Storage | In-memory (no database needed) |

## Running Locally

### Prerequisites

- Java 17+
- Node.js 18+

### Backend

```bash
./mvnw spring-boot:run
```

Starts on `http://localhost:8080`.

### Frontend

```bash
cd client
npm install
npm run dev
```

Starts on `http://localhost:5173`.

Open 4 browser tabs, create a room in one, and join with the code in the others.

## Project Structure

```
gem-thief/
├── src/main/java/com/thief/cheesethief/
│   ├── config/          # WebSocket configuration
│   ├── controller/      # Night phase + pregame logic
│   ├── model/           # Player, Room, GameState
│   ├── service/         # Core game engine (GameService)
│   └── ws/              # WebSocket message handler
├── client/src/
│   ├── context/         # React context (global state + WS)
│   └── screens/         # Home, Lobby, Night, Vote, GameOver
└── pom.xml
```

## Game Features

- **Real-time WebSocket** communication — no polling
- **Dice-based wake schedule** — your roll = your phase, creating natural information asymmetry
- **Peek mechanic** — lone sleepyheads can spy on others' dice rolls for clues
- **Pause button** — host can pause during night phase (useful for debugging or if someone needs a break)
- **Instant restart** — host can start a new round without anyone leaving the room
