import express from "express";
import {authenticateToken} from "../middlewares/auth.middleware";
const router = express.Router();
import {submitResult, getUserResults} from "../controllers/result.controller";
router.post("/submit", authenticateToken, submitResult);
router.get("/getResults", authenticateToken, getUserResults);
export default router;
