import { Router } from "express";
import {
  createPreferenceHandler,
  getPreferences,
  updatePreferenceHandler,
} from "../controllers/preference.controller"; // Adjust path as needed
import { authenticateToken } from "../middlewares/auth.middleware"; // Adjust path as needed

const preferenceRouter = Router();


preferenceRouter.get("/", authenticateToken, getPreferences);


preferenceRouter.post("/", authenticateToken, createPreferenceHandler);


preferenceRouter.patch("/", authenticateToken, updatePreferenceHandler);

export default preferenceRouter;
