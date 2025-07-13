// backend/src/server.ts
import http from "http";
import {Server as SocketIOServer, Socket} from "socket.io";
import app from "./app"; // Your configured Express app from app.ts
import {PrismaClient} from "./generated/prisma";
const prisma = new PrismaClient();

// --- Game Logic Imports (You'll create these modules) ---
// These are placeholders. Your actual game logic will be more complex.
// import { handlePlayerJoin, handlePlayerProgress, handlePlayerDisconnect, GameState } from './game/gameManager';
// interface PlayerProgressPayload { gameId: string; progress: number; wpm: number; }

// --- Environment Configuration ---
// dotenv.config() is already called in app.ts, so process.env is available
const PORT = process.env.PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000"; // Important for Socket.IO CORS

// --- Create HTTP Server ---
const httpServer = http.createServer(app);

async function main() {
  const user = await prisma.user_d.findMany();
  console.log(user);
}
main()
  .catch((e) => {
    console.log(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
//---------------------------------------------------

// --- Initialize Socket.IO Server ---
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: FRONTEND_URL, // Allow connections from your frontend
    methods: ["GET", "POST"],
    credentials: true,
  },
  // You might want to configure transports if needed, e.g., for older browsers/proxies
  // transports: ['websocket', 'polling'],
});

// --- In-memory store for active games (very basic example, consider a proper store/DB for production) ---
// interface Game { id: string; players: Set<string>; text: string; startTime?: number; status: 'waiting' | 'in-progress' | 'finished'; }
// const activeGames: Map<string, Game> = new Map();

// --- Socket.IO Connection Handling ---
io.on("connection", (socket: Socket) => {
  console.log(`🔌 New client connected: ${socket.id}`);

  // --- Example Game-Related Event Listeners ---

  // Player wants to join or create a game
  socket.on("joinGame", (data: {gameId?: string; playerName: string}) => {
    // TODO: Implement game joining/creation logic
    // - If gameId is provided, try to join.
    // - If not, or if game is full/doesn't exist, create a new game or use matchmaking.
    // - Add player to a Socket.IO room for that game: socket.join(actualGameId);
    // - Emit updates to the room or player.
    console.log(
      `Player ${data.playerName} (ID: ${socket.id}) wants to join/create game:`,
      data.gameId
    );
    const gameIdToJoin =
      data.gameId || `game-${Math.random().toString(36).substr(2, 5)}`; // Simplistic ID
    socket.join(gameIdToJoin);
    socket.emit("gameJoined", {
      gameId: gameIdToJoin,
      message: `Welcome ${data.playerName} to game ${gameIdToJoin}`,
    });
    io.to(gameIdToJoin).emit("playerUpdate", {
      message: `${data.playerName} has joined the game!`,
    });
    // You would also send the game text, current players, etc.
  });

  // Player sends their typing progress
  socket.on(
    "playerProgress",
    (data: {
      gameId: string;
      progress: number;
      wpm: number /* other relevant data */;
    }) => {
      // TODO: Validate progress, update game state
      // - Broadcast updated progress to all players in the same game room (io.to(data.gameId).emit(...))
      console.log(`Progress from ${socket.id} in game ${data.gameId}:`, data);
      io.to(data.gameId).emit("progressUpdate", {playerId: socket.id, ...data});

      // Check for game completion for this player
      // If player finished, emit 'playerFinished' and check for game over
    }
  );

  // Player starts typing (could be used to trigger game start for all if first typer)
  socket.on("startTyping", (data: {gameId: string}) => {
    console.log(`Player ${socket.id} started typing in game ${data.gameId}`);
    // Potentially trigger a countdown or game start broadcast to the room
    io.to(data.gameId).emit("gameStarting", {message: "Get ready!"});
  });

  // Player requests new text (e.g., for a new round or game)
  socket.on("requestNewText", (data: {gameId: string}) => {
    // TODO: Fetch/generate new text and send it to the room
    const newText =
      "The quick brown fox jumps over the lazy dog. A new challenge awaits!";
    io.to(data.gameId).emit("newGameText", {text: newText});
  });

  // --- Client Disconnects ---
  socket.on("disconnect", (reason: string) => {
    console.log(`🔌 Client disconnected: ${socket.id}. Reason: ${reason}`);
    // TODO: Handle player leaving a game
    // - Remove player from any game rooms they were in.
    // - Notify other players in those rooms.
    // - Clean up game state if necessary (e.g., if game becomes empty).
    // Example: Iterate through rooms the socket was in
    // socket.rooms.forEach(room => {
    //   if (room !== socket.id) { // socket.id is the default room for the socket itself
    //     io.to(room).emit('playerLeft', { playerId: socket.id, message: `A player has left the game.` });
    //     // Remove from your internal game state management
    //   }
    // });
  });

  // --- Error Handling for Socket ---
  socket.on("error", (err) => {
    console.error(`Socket error for ${socket.id}:`, err);
  });
});

// --- Start the HTTP Server ---
const startServer = async () => {
  try {
    httpServer.listen(PORT, () => {
      console.log(
        `🚀 HTTP Server with Socket.IO is running on http://localhost:${PORT}`
      );
      console.log(`🟢 Socket.IO accepting connections from: ${FRONTEND_URL}`);
    });
  } catch (error) {
    console.error("❌ Failed to start the server:", error);
    process.exit(1);
  }
};

// --- Graceful Shutdown ---
const signals: NodeJS.Signals[] = ["SIGINT", "SIGTERM", "SIGQUIT"];
signals.forEach((signal) => {
  process.on(signal, () => {
    console.log(`\n👋 ${signal} received, shutting down gracefully...`);
    io.close(() => {
      // Close Socket.IO connections
      console.log("🔌 Socket.IO connections closed.");
      httpServer.close(() => {
        console.log("✅ HTTP server closed.");
        // Add any other cleanup logic here (e.g., close database connections)
        process.exit(0);
      });
    });
  });
});

// --- Unhandled Errors ---
process.on("unhandledRejection", (reason, promise) => {
  console.error("🚨 Unhandled Rejection at:", promise, "reason:", reason);
});

process.on("uncaughtException", (error) => {
  console.error("🚨 Uncaught Exception:", error);
  // Consider a more robust shutdown mechanism here for production
});

// --- Initiate Server Start ---
startServer();

export default httpServer; // Export if needed for testing
