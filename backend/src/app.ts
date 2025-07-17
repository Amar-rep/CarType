import express, {Application} from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.routes";
import sentenceRoutes from "./routes/sentence.routes";
import preferenceRouter from "./routes/preference.routes";
import {PrismaClient} from "./generated/prisma";
export const prisma = new PrismaClient();
//console.log(prisma.user_d);
dotenv.config();

const app: Application = express();
export default app;
// Middleware
app.use(cors());
app.use(express.json());

// --- API Routes ---
app.use("/api/auth", authRoutes);
app.use("/api/sentences", sentenceRoutes);
app.use("/api/preferences", preferenceRouter);
// --- Start Server ---
const PORT: number = Number(process.env.PORT || 5000);
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
