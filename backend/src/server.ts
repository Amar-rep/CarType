// src/server.ts
import express from "express";
import http from "http";
import { Server, Socket } from "socket.io";
import path from "path";
import app from "./app";
import { prisma } from "../src/app";
import { createCompetition } from "./controllers/competition.controller";
import {
  getRandomSentence,
  getRandomSentenceByCategory,
} from "./controllers/sentence.controller";

import {
  ServerToClientEvents,
  ClientToServerEvents,
  typingUpdatePayload,
  gameOverPayload,
  runningGames,
  loserFinishedPayload,
} from "./utils/types";
import { SentenceCategory } from "./generated/prisma";

const httpServer = http.createServer(app);
const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});
let waitingQueue: Socket<ClientToServerEvents, ServerToClientEvents>[] = [];
let runningGames: runningGames[] = [];
const paragraphs = [
  "The quick brown fox jumps over the lazy dog. This sentence contains every letter of the alphabet.",
  "Never underestimate the power of a good book. It can transport you to different worlds and times.",
  "Technology has revolutionized the way we live, work, and communicate with each other.",
  "The sun always shines brightest after the rain. Remember that challenges are temporary.",
  "Creativity is intelligence having fun. Don't be afraid to experiment and think outside the box.",
];
io.use(async (socket, next) => {
  const token = socket.handshake.auth.token;

  if (!token) {
    return next(new Error("Authentication token missing"));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    const userId = (decoded as any).userId;

    const user = await prisma.user_d.findUnique({ where: { id: userId } });
    if (!user) {
      return next(new Error("User not found"));
    }

    socket.data.userId = userId;
    next();
  } catch (err) {
    return next(new Error("Invalid token"));
  }
});

const processQueue = async () => {
  while (waitingQueue.length >= 2) {
    console.log("Found pair");
    const player1 = waitingQueue.shift()!;
    const player2 = waitingQueue.shift()!;

    const player1ID = player1.data.userId;
    const player2ID = player2.data.userId;
    const paragraph = paragraphs[Math.floor(Math.random() * paragraphs.length)];

    try {
      const roomName = `room-${player1.id}-${player2.id}`;
      const category = SentenceCategory.FIFTEEN;
      const sentence = await getRandomSentenceByCategory(category);
      const newCompetition = await prisma.competition.create({
        data: {
          category,
          startTime: new Date(),
          endTime: new Date(),
          user: {
            create: [{ userId: player1ID }, { userId: player2ID }],
          },
        },
      });
      console.log(`DB Competition created with ID: ${newCompetition.id}`);
      player1.join(roomName);
      player2.join(roomName);
      runningGames.push({
        competitionId: newCompetition.id,
        player1: player1ID,
        player2: player2ID,
      });
      io.to(roomName).emit("gameStart", {
        room: roomName,
        competitionId: newCompetition.id,
        sentenceId: sentence.id,
        player1: player1.id,
        player2: player2.id,
        text: sentence.text,
      });
    } catch (error) {
      console.error("Failed to create competition and start game:", error);

      waitingQueue.unshift(player1, player2);
    }
  }
};

io.on("connection", (socket: Socket) => {
  socket.on("findMatch", () => {
    console.log(`🔎 ${socket.id} is looking for a match.`);

    // Avoid adding the same player to the queue twice
    if (waitingQueue.some((player) => player.id === socket.id)) {
      console.log(`⚠️ ${socket.id} is already in the queue.`);
      return;
    }

    // Add the new player to the queue and let them know they're waiting
    waitingQueue.push(socket);
    socket.emit("waitingForPlayer");
    console.log(
      `👍 ${socket.id} added to queue. Queue size: ${waitingQueue.length}`
    );

    // Attempt to process the queue to form a match
    processQueue();
  });


  socket.on("typingUpdate", (payload: typingUpdatePayload) => {
    socket.to(payload.room).emit("opponentProgress", {
      progress: payload.progress,
      wpm: payload.wpm,
    });
  });

  socket.on("gameFinished", async (payload: gameOverPayload) => {
    const {
      room,
      competitionId,
      sentenceId,
      time,
      wpm,
      accuracy,
      rawWpm,
      errorCount,
    } = payload;
    if (!competitionId || !sentenceId) {
      console.log(
        "Critical error: competitionId or sentenceId is missing in gameOverPayload"
      );
      return;
    }

    const winnerId = socket.data.userId;

    if (!winnerId) {
      console.log("Critical error: winnerId is missing in gameOverPayload");
      return;
    }
    try {
      const [updatedCompetition, result] = await prisma.$transaction([
        prisma.competition.update({
          where: { id: competitionId },
          data: {
            endTime: new Date(),
          },
        }),
        prisma.result.create({
          data: {
            competitionId,
            userId: winnerId,
            sentenceId,
            timeTaken: time,
            wpm,
            accuracy,
            rawWpm,
            errorCount,
          },
        }),
      ]);
      io.to(payload.room).emit("gameOver", {
        room,
        competitionId,
        sentenceId,
        time,
        wpm,
        accuracy,
        rawWpm,
        errorCount,
      });
    } catch (error) { }
  });

  socket.on("loserFinised", async (payload: loserFinishedPayload) => {
    const {
      competitionId,
      sentenceId,
      wpm,
      accuracy,
      rawWpm,
      errorCount,
      timeTaken,
    } = payload;
    const loserId = socket.data.userId;

    if (!competitionId || !sentenceId || !loserId) {
      console.log("Critical error: Missing data in loserFinishedPayload");
      return;
    }
    const competition = prisma.competition.findUnique({
      where: { id: competitionId },
    });

    try {
      await prisma.result.create({
        data: {
          competitionId,
          userId: loserId,
          sentenceId,
          wpm,
          accuracy,
          rawWpm,
          errorCount,
          timeTaken,
        },
      });
    } catch (error) {
      console.error("Error saving loser result:", error);
    }
  });


  socket.on("disconnect", () => {
    console.log(`🔌 ${socket.id} disconnected.`);

    const playerIndex = waitingQueue.findIndex(
      (player) => player.id === socket.id
    );
    if (playerIndex !== -1) {
      waitingQueue.splice(playerIndex, 1);
      console.log(
        `🧹 Removed ${socket.id} from queue. Queue size: ${waitingQueue.length}`
      );
    }

    for (const room of socket.rooms) {
      if (room != socket.id) {
        const clientsInRoom = io.sockets.adapter.rooms.get(room);
        const opponentSocketId = Array.from(clientsInRoom || []).find(
          (id) => id != socket.id
        );
        io.to(room).emit("gameOver", {
          room: room,
          winnerId: socket.id,
          time: 0,
        });
        io.socketsLeave(room);
      }
    }
  });
});
