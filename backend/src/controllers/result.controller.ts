import {Request, Response} from "express";
import {prisma} from "../app";
import {PrismaClientKnownRequestError} from "@prisma/client/runtime/library";

export const submitResult = async (req: Request, res: Response) => {
  const userId = req.user?.id;
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
    res.status(401).json({message: "Unauthorized"});
    return;
  }

  if (wpm === undefined || accuracy === undefined || !sentenceId) {
    res
      .status(400)
      .json({message: "wpm, accuracy, and sentenceId are required"});
    return;
  }

  try {
    // If the result is for a competition, perform extra validation
    if (competitionId) {
      const competition = await prisma.competition.findUnique({
        where: {id: competitionId},
      });
      const now = new Date();

      // 1. Check if competition exists and is active
      /*   if (
        !competition ||
        now < new Date(competition.startTime) ||
        now > new Date(competition.endTime)
      ) {
        res
          .status(400)
          .json({message: "Competition not found, not active, or has ended"});
        return;
      } */

      // 2. Check if the user is a participant
      const participant = await prisma.participant.findUnique({
        where: {userId_competitionId: {userId, competitionId}},
      });
      if (!participant) {
        res.status(403).json({message: "You have not joined this competition"});
        return;
      }
    }

    // Create the result
    const result = await prisma.result.create({
      data: {
        wpm,
        accuracy,
        rawWpm,
        errorCount,
        timeTaken,
        sentenceId,
        competitionId, // Will be null if not provided, which is correct
        userId,
      },
    });

    res.status(201).json(result);
  } catch (error) {
    // P2003 is foreign key constraint failed (e.g., sentenceId doesn't exist)
    console.error("Failed to submit result:", error);
    res.status(500).json({message: "Internal Server Error"});
  }
};

export const getUserResults = async (req: Request, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    res.status(401).json({message: "Unauthorized"});
    return;
  }

  try {
    const results = await prisma.result.findMany({
      where: {userId: userId},
      orderBy: {createdAt: "desc"},
      include: {
        sentence: {select: {text: true, category: true}}, // Include sentence details
      },
    });
    res.status(200).json(results);
  } catch (error) {
    console.error("Failed to get user results:", error);
    res.status(500).json({message: "Internal Server Error"});
  }
};
