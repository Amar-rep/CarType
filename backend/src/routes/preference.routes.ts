import {Router} from "express";
import {
  createPreferenceHandler,
  getPreferences,
  updatePreferenceHandler,
} from "../controllers/preference.controller"; // Adjust path as needed
import {authenticateToken} from "../middlewares/auth.middleware"; // Adjust path as needed

const preferenceRouter = Router();

// All routes here are for the authenticated user, so they operate on `/`
// The base path (e.g., '/api/preferences') is defined in your main app file.

// GET /api/preferences - Get the current user's preferences
preferenceRouter.get("/", authenticateToken, getPreferences);

// POST /api/preferences - Create preferences for the current user
preferenceRouter.post("/", authenticateToken, createPreferenceHandler);

// PATCH /api/preferences - Update the current user's preferences
preferenceRouter.patch("/", authenticateToken, updatePreferenceHandler);

export default preferenceRouter;
