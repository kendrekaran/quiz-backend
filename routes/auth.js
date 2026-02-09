import { Router } from "express";
import { createClient } from "@supabase/supabase-js";
import { asyncHandler } from "../middleware/asyncHandler.js";

const router = Router();
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * POST /api/auth/teacher/login
 * Body: { email, password }
 * Returns: { access_token, refresh_token, user } or 401
 */
router.post("/teacher/login", asyncHandler(async (req, res) => {
  if (!supabase) {
    return res.status(503).json({
      error: "Auth not configured",
      message: "Set SUPABASE_URL and SUPABASE_ANON_KEY in backend .env",
    });
  }

  const { email, password } = req.body ?? {};
  if (!email || !password) {
    return res.status(400).json({
      error: "Bad request",
      message: "Email and password are required",
    });
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: String(email).trim(),
    password: String(password),
  });

  if (error) {
    return res.status(401).json({
      error: "Invalid credentials",
      message: error.message,
    });
  }

  res.json({
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
    expires_at: data.session.expires_at,
    user: {
      id: data.user.id,
      email: data.user.email,
      role: "teacher",
    },
  });
}));

export default router;
