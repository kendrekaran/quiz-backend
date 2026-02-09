import "dotenv/config";
import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import quizRoutes from "./routes/quizzes.js";
import studentRoutes from "./routes/students.js";
import { requireTeacherAuth } from "./middleware/auth.js";
import errorHandler from "./middleware/errorHandler.js";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: process.env.FRONTEND_ORIGIN || "http://localhost:5173", credentials: true }));
app.use(express.json());

app.get("/health", (_, res) => res.json({ ok: true }));
app.use("/api/auth", authRoutes);
app.use("/api/quizzes", requireTeacherAuth, quizRoutes);
app.use("/api/students", requireTeacherAuth, studentRoutes);

// 404: no route matched
app.use((req, res, next) => {
  res.status(404).json({
    error: "Not found",
    message: `Cannot ${req.method} ${req.path}`,
  });
});

// Global error boundary: catches errors passed to next(err) and unhandled rejections from asyncHandler
app.use(errorHandler);

// Only start HTTP server when not running on Vercel (serverless)
if (process.env.VERCEL !== "1") {
  app.listen(PORT, () => {
    console.log(`Backend running at http://localhost:${PORT}`);
  });
}

export default app;
