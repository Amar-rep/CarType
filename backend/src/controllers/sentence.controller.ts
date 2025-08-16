// src/controllers/sentence.controller.js
import {prisma} from "../app";
import {SentenceCategory} from "../generated/prisma";
import {Request, Response} from "express";

export const getRandomSentence = async (req: Request, res: Response) => {
  const {category} = req.query;

  if (
    !category ||
    !Object.values(SentenceCategory).includes(category as SentenceCategory)
  ) {
    res.status(400).json({message: "Invalid or missing category."});
    return;
  }

  try {
    // Get all sentences for the given category
    const sentences = await prisma.sentence.findMany({
      where: {category: category as SentenceCategory},
      take: 20,
    });

    if (sentences.length === 0) {
      res.status(404).json({message: "No sentences found for this category."});
      return;
    }

    const randomIndex = Math.floor(Math.random() * sentences.length);
    const randomSentence = sentences[randomIndex];

    res.status(200).json(randomSentence);
  } catch (error) {
    res.status(500).json({message: "Server error", error});
  }
};

export const getRandomSentenceByCategory = async (
  category: SentenceCategory
) => {
  try {
    const sentences = await prisma.sentence.findMany({
      where: {category},
      take: 20,
    });

    if (sentences.length === 0) {
      throw new Error("No sentences found for this category.");
    }

    const randomIndex = Math.floor(Math.random() * sentences.length);
    return sentences[randomIndex];
  } catch (error) {
    console.error("Error fetching random sentence:", error);
    throw error;
  }
};
