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

/**
 * PATCH /api/quizzes/:id
 * Body: { name?, description?, class?, topic?, questions? }
 * Updates a quiz by id (RLS ensures teacher owns it).
 */
router.patch("/:id", asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, description, class: className, topic, questions } = req.body ?? {};
  const supabase = req.authSupabase;

  // Build update payload only with provided fields
  const payload = {};
  if (name !== undefined) {
    if (!name || typeof name !== "string" || !name.trim()) {
      return res.status(400).json({
        error: "Bad request",
        message: "name cannot be empty",
      });
    }
    payload.name = String(name).trim();
  }
  if (description !== undefined) {
    payload.description = description != null ? String(description) : null;
  }
  if (className !== undefined) {
    payload.class = className != null ? String(className).trim() || null : null;
  }
  if (topic !== undefined) {
    payload.topic = topic != null ? String(topic).trim() || null : null;
  }
  if (questions !== undefined) {
    payload.questions = Array.isArray(questions) ? questions : [];
  }

  // If no fields to update, return error
  if (Object.keys(payload).length === 0) {
    return res.status(400).json({
      error: "Bad request",
      message: "No fields to update",
    });
  }

  const { data, error } = await supabase
    .from("quizzes")
    .update(payload)
    .eq("id", id)
    .select("id, name, description, class, topic, questions, created_at")
    .single();

  if (error) {
    return res.status(500).json({
      error: "Failed to update quiz",
      message: error.message,
    });
  }

  if (!data) {
    return res.status(404).json({
      error: "Not found",
      message: "Quiz not found or you don't have permission to update it",
    });
  }

  res.json(data);
}));

/**
 * DELETE /api/quizzes/:id
 * Deletes a quiz by id (RLS ensures teacher owns it).
 */
router.delete("/:id", asyncHandler(async (req, res) => {
  const { id } = req.params;
  const supabase = req.authSupabase;

  console.log(`[DELETE /api/quizzes/:id] Deleting quiz ${id}`);

  const { error, data } = await supabase
    .from("quizzes")
    .delete()
    .eq("id", id)
    .select();

  if (error) {
    console.error(`[DELETE /api/quizzes/:id] Error:`, error);
    return res.status(500).json({
      error: "Failed to delete quiz",
      message: error.message,
    });
  }

  // Check if any rows were deleted (RLS might prevent deletion)
  if (!data || data.length === 0) {
    return res.status(404).json({
      error: "Not found",
      message: "Quiz not found or you don't have permission to delete it",
    });
  }

  res.status(204).send();
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

export default router;
