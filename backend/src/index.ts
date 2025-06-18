import express, {Request, Response} from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables from .env file

const app = express();
const PORT = process.env.BACKEND_PORT || 3001; // Choose a port for your backend

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000", // Allow requests from your Next.js app
    credentials: true, // If you need to send cookies or authorization headers
  })
);
app.use(express.json()); // To parse JSON request bodies

// --- Define your API routes here ---
app.get("/api/health", (req: Request, res: Response) => {
  res.json({status: "UP", message: "Backend is healthy!"});
});

// Example route for saving game results
app.post("/api/results", (req: Request, res: Response) => {
  const resultData = req.body;
  console.log("Received result data from frontend:", resultData);

  // TODO: Add your logic here:
  // 1. Validate incoming data (resultData)
  // 2. Save the data to a database (MongoDB, PostgreSQL, etc.)
  // 3. Handle any errors during saving

  // For now, just send a success response
  // In a real app, you might return the saved data or an ID
  const mockSavedResult = {
    ...resultData,
    id: Date.now().toString(),
    savedAt: new Date(),
  };
  res
    .status(201)
    .json({message: "Result saved successfully!", result: mockSavedResult});
});

// Start the server
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
