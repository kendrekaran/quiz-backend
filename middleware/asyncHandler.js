/**
 * Wraps an async route handler so that rejected promises are passed to next(err).
 * Use: app.get("/path", asyncHandler(async (req, res) => { ... }))
 */
export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
