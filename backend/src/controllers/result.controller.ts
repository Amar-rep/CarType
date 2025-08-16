import { Request, Response } from "express";
import { prisma } from "../app";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

export const submitResult = async (req: Request, res: Response) => {
  console.log(req.user);
  const userId = req.user?.userId;
  const {
    wpm,
    accuracy,
    rawWpm,
    errorCount,
    timeTaken,
    sentenceId,
    competitionId,
  } = req.body;

  if (!userId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  if (wpm === undefined || accuracy === undefined || !sentenceId) {
    res
      .status(400)
      .json({ message: "wpm, accuracy, and sentenceId are required" });
    return;
  }

  try {

    if (competitionId) {
      const competition = await prisma.competition.findUnique({
        where: { id: competitionId },
      });
      const now = new Date();


      const participant = await prisma.participant.findUnique({
        where: { userId_competitionId: { userId, competitionId } },
      });
      if (!participant) {
        res.status(403).json({ message: "You have not joined this competition" });
        return;
      }
    }


    const result = await prisma.result.create({
      data: {
        wpm,
        accuracy,
        rawWpm,
        errorCount,
        timeTaken,
        sentenceId,
        competitionId,
        userId,
      },
    });

    res.status(201).json(result);
  } catch (error) {

    console.error("Failed to submit result:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getUserResults = async (req: Request, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const results = await prisma.result.findMany({
      where: { userId: userId },
      orderBy: { createdAt: "desc" },
      include: {
        sentence: { select: { text: true, category: true } },
      },
    });
    res.status(200).json(results);
  } catch (error) {
    console.error("Failed to get user results:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
