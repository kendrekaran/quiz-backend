import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";

const router = Router();

/**
 * GET /api/quizzes
 * Returns all quizzes for the authenticated teacher (RLS filters by teacher_id).
 */
router.get("/", asyncHandler(async (req, res) => {
  const supabase = req.authSupabase;

  const { data, error } = await supabase
    .from("quizzes")
    .select("id, name, description, class, topic, questions, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    return res.status(500).json({
      error: "Failed to list quizzes",
      message: error.message,
    });
  }

  res.json(data ?? []);
}));

/**
 * GET /api/quizzes/:id
 * Returns one quiz by id (RLS ensures teacher owns it).
 */
router.get("/:id", asyncHandler(async (req, res) => {
  const { id } = req.params;
  const supabase = req.authSupabase;

  const { data, error } = await supabase
    .from("quizzes")
    .select("id, name, description, class, topic, questions, created_at")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    return res.status(500).json({
      error: "Failed to fetch quiz",
      message: error.message,
    });
  }

  if (!data) {
    return res.status(404).json({
      error: "Not found",
      message: "Quiz not found",
    });
  }

  res.json(data);
}));

/**
 * POST /api/quizzes
 * Body: { name, description?, class?, topic?, questions }
 * Creates a quiz for the authenticated teacher.
 */
router.post("/", asyncHandler(async (req, res) => {
  const { name, description, class: className, topic, questions } = req.body ?? {};
  const teacherId = req.user.id;
  const supabase = req.authSupabase;

  if (!name || typeof name !== "string" || !name.trim()) {
    return res.status(400).json({
      error: "Bad request",
      message: "name is required",
    });
  }

  const payload = {
    teacher_id: teacherId,
    name: String(name).trim(),
    description: description != null ? String(description) : null,
    class: className != null ? String(className) : null,
    topic: topic != null ? String(topic) : null,
    questions: Array.isArray(questions) ? questions : [],
  };

  const { data, error } = await supabase
    .from("quizzes")
    .insert(payload)
    .select("id, name, description, class, topic, questions, created_at")
    .single();

  if (error) {
    return res.status(500).json({
      error: "Failed to create quiz",
      message: error.message,
    });
  }

  res.status(201).json(data);
}));

export default router;
