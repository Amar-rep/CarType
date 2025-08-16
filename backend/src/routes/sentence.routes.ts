// src/routes/sentence.routes.js
import express from "express";
import { getRandomSentence } from "../controllers/sentence.controller";
import { authenticateToken } from "../middlewares/auth.middleware";

const router = express.Router();


router.get("/random", authenticateToken, getRandomSentence);

export default router;
