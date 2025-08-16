import { prisma } from "../app";
import { Request, Response } from "express";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

export const getPreferences = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const preferences = await prisma.userPreference.findUnique({
      where: { userId },
    });

    if (!preferences) {
      res.status(404).json({ message: "Preferences not found." });
      return;
    }

    res.status(200).json(preferences);
  } catch (error) {
    console.error("Error fetching preferences:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

export const createPreferenceHandler = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { emailNotifications, theme } = req.body;

  if (!userId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const newPreference = await prisma.userPreference.create({
      data: {
        userId: userId,
        emailNotifications,
        theme,
      },
    });

    res.status(201).json(newPreference);
    return;
  } catch (error) {
    console.error("Failed to create user preference:", error);
    res.status(500).json({ message: "Internal Server Error" });
    return;
  }
};

export const updatePreferenceHandler = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { emailNotifications, theme } = req.body;

  if (!userId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const updatedPreference = await prisma.userPreference.update({
      where: {
        userId: userId,
      },
      data: {
        emailNotifications,
        theme,
      },
    });

    res.status(200).json(updatedPreference);
  } catch (error) {
    if (
      error instanceof PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      res.status(404).json({ message: "Preferences not found." });
      return;
    }
    console.error("Failed to update user preference:", error);
    res.status(500).json({ message: "Internal Server Error" });
    return;
  }
};
