import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

/**
 * Middleware that requires Authorization: Bearer <access_token>.
 * Creates a Supabase client with the user's token and attaches
 * req.authSupabase and req.user (or returns 401).
 */
export function requireTeacherAuth(req, res, next) {
  if (!supabaseUrl || !supabaseAnonKey) {
    return res.status(503).json({
      error: "Auth not configured",
      message: "Set SUPABASE_URL and SUPABASE_ANON_KEY in backend .env",
    });
  }

  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7)
    : null;

  if (!token) {
    return res.status(401).json({
      error: "Unauthorized",
      message: "Missing or invalid Authorization header",
    });
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });

  supabase.auth.getUser(token).then(({ data: { user }, error }) => {
    if (error || !user) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "Your session has expired or is invalid. Please sign in again.",
      });
    }
    req.authSupabase = supabase;
    req.user = user;
    next();
  }).catch(next);
}
