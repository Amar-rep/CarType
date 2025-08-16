// backend/src/server.ts
import http from "http";
import { Server as SocketIOServer, Socket } from "socket.io";
import app from "./app";
import { prisma } from "./app";

const PORT = process.env.PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000"; // Important for Socket.IO CORS


const httpServer = http.createServer(app);

const io = new SocketIOServer(httpServer, {
  cors: {
    origin: FRONTEND_URL,
    methods: ["GET", "POST"],
    credentials: true,
  },

});


io.on("connection", (socket: Socket) => {
  console.log(`🔌 New client connected: ${socket.id}`);


  socket.on("joinGame", (data: { gameId?: string; playerName: string }) => {

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

  });


  socket.on(
    "playerProgress",
    (data: {
      gameId: string;
      progress: number;
      wpm: number;
    }) => {

      console.log(`Progress from ${socket.id} in game ${data.gameId}:`, data);
      io.to(data.gameId).emit("progressUpdate", { playerId: socket.id, ...data });


    }
  );


  socket.on("startTyping", (data: { gameId: string }) => {
    console.log(`Player ${socket.id} started typing in game ${data.gameId}`);

    io.to(data.gameId).emit("gameStarting", { message: "Get ready!" });
  });


  socket.on("requestNewText", (data: { gameId: string }) => {

    const newText =
      "The quick brown fox jumps over the lazy dog. A new challenge awaits!";
    io.to(data.gameId).emit("newGameText", { text: newText });
  });


  socket.on("disconnect", (reason: string) => {
    console.log(`🔌 Client disconnected: ${socket.id}. Reason: ${reason}`);
    // TODO: Handle player leaving a game

  });


  socket.on("error", (err) => {
    console.error(`Socket error for ${socket.id}:`, err);
  });
});


const startServer = async () => {
  try {
    httpServer.listen(PORT, () => {
      console.log(
        ` HTTP Server with Socket.IO is running on http://localhost:${PORT}`
      );
      console.log(` Socket.IO accepting connections from: ${FRONTEND_URL}`);
    });
  } catch (error) {
    console.error(" Failed to start the server:", error);
    process.exit(1);
  }
};


/* const signals: NodeJS.Signals[] = ["SIGINT", "SIGTERM", "SIGQUIT"];
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
}); */


process.on("unhandledRejection", (reason, promise) => {
  console.error("🚨 Unhandled Rejection at:", promise, "reason:", reason);
});

process.on("uncaughtException", (error) => {
  console.error("🚨 Uncaught Exception:", error);

});

startServer();

export default httpServer; 
