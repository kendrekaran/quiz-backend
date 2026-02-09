import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";

const router = Router();

/**
 * GET /api/students
 * Returns all students for the authenticated teacher (RLS filters by teacher_id).
 */
router.get("/", asyncHandler(async (req, res) => {
  const supabase = req.authSupabase;

  const { data, error } = await supabase
    .from("students")
    .select("id, name, email, number, class, div, roll_number, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    return res.status(500).json({
      error: "Failed to list students",
      message: error.message,
    });
  }

  res.json(data ?? []);
}));

/**
 * POST /api/students
 * Body: { name, email, number?, class?, div?, roll_number? }
 * Creates a student for the authenticated teacher.
 */
router.post("/", asyncHandler(async (req, res) => {
  const { name, email, number, class: className, div: divValue, roll_number } = req.body ?? {};
  const teacherId = req.user.id;
  const supabase = req.authSupabase;

  if (!name || typeof name !== "string" || !name.trim()) {
    return res.status(400).json({
      error: "Bad request",
      message: "name is required",
    });
  }
  if (!email || typeof email !== "string" || !email.trim()) {
    return res.status(400).json({
      error: "Bad request",
      message: "email is required",
    });
  }

  const payload = {
    teacher_id: teacherId,
    name: String(name).trim(),
    email: String(email).trim(),
    number: number != null ? String(number).trim() || null : null,
    class: className != null ? String(className).trim() || null : null,
    div: divValue != null ? String(divValue).trim() || null : null,
    roll_number: roll_number != null ? String(roll_number).trim() || null : null,
  };

  const { data, error } = await supabase
    .from("students")
    .insert(payload)
    .select("id, name, email, number, class, div, roll_number, created_at")
    .single();

  if (error) {
    return res.status(500).json({
      error: "Failed to create student",
      message: error.message,
    });
  }

  res.status(201).json(data);
}));

export default router;
