import { Request, Response } from "express";
import { prisma } from "../app";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";


export const createCompetition = async (req: Request, res: Response) => {
  const { category, startTime } = req.body;

  if (!category || !startTime) {
    res
      .status(400)
      .json({ message: "Category, startTime, and endTime are required" });
    return;
  }

  try {
    const competition = await prisma.competition.create({
      data: {
        category,
        startTime: new Date(startTime),
        endTime: new Date(),
      },
    });
    res.status(201).json(competition);
  } catch (error) {
    console.error("Failed to create competition:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getAllCompetitions = async (req: Request, res: Response) => {
  try {
    const competitions = await prisma.competition.findMany({
      orderBy: { startTime: "desc" },
    });
    res.status(200).json(competitions);
  } catch (error) {
    console.error("Failed to get competitions:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getCompetitionById = async (req: Request, res: Response) => {
  const { competitionId } = req.params;
  try {
    const competition = await prisma.competition.findUnique({
      where: { id: competitionId },
      include: {

        user: {

          include: {
            user: {

              select: { id: true, name: true },
            },
          },
        },

        results: {
          orderBy: { wpm: "desc" },
          include: {
            user: {
              select: { id: true, name: true },
            },
          },
        },
      },
    });

    if (!competition) {
      res.status(404).json({ message: "Competition not found" });
      return;
    }
    res.status(200).json(competition);
  } catch (error) {
    console.error("Failed to get competition:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// --- Participant Handlers ---

/* export const joinCompetition = async (req: Request, res: Response) => {
  const {competitionId} = req.params;
  const userId = req.user?.id;

  if (!userId) {
    res.status(401).json({message: "Unauthorized"});
    return;
  }

  try {
    // Optional: Check if the competition is still open for joining
    const competition = await prisma.competition.findUnique({
      where: {id: competitionId},
    });
    if (!competition || new Date() > new Date(competition.startTime)) {
      res
        .status(400)
        .json({message: "Competition not found or has already started"});
      return;
    }

    const participant = await prisma.participant.create({
      data: {
        userId,
        competitionId,
      },
    });
    res.status(201).json(participant);
  } catch (error) {
   
    if (
      error instanceof prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      res
        .status(409)
        .json({message: "User has already joined this competition"});
      return;
    }
    console.error("Failed to join competition:", error);
    res.status(500).json({message: "Internal Server Error"});
  }
};

export const leaveCompetition = async (req: Request, res: Response) => {
  const {competitionId} = req.params;
  const userId = req.user?.id;

  if (!userId) {
    res.status(401).json({message: "Unauthorized"});
    return;
  }

  try {
    await prisma.participant.delete({
      where: {
    
        userId_competitionId: {
          userId,
          competitionId,
        },
      },
    });
    res.status(204).send(); // No Content
  } catch (error) {
    
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      res.status(404).json({message: "Participant record not found"});
      return;
    }
    console.error("Failed to leave competition:", error);
    res.status(500).json({message: "Internal Server Error"});
  }
}; */
