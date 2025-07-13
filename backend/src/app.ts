import express, {Application} from "express";
import cors from "cors";
import dotenv from "dotenv";
import {errorHandler} from "./middlewares/errorHandler";
import {notFoundHandler} from "./middlewares/notFoundHandler";

dotenv.config();

const app: Application = express();

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({extended: true}));

// Basic route for testing
app.get("/", (req, res) => {
  res.json({message: "Welcome to the API"});
});

// Routes will be added here
// app.use('/api/v1', routes);

// Error handling middleware
/* app.use(notFoundHandler);
app.use(errorHandler); */

export default app;
