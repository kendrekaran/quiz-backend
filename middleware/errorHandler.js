/**
 * Global error handler for Express. Must be registered last (after all routes).
 * Catches any error passed to next(err) and sends a consistent JSON response.
 */

const isDev = process.env.NODE_ENV !== "production";

function errorHandler(err, req, res, next) {
  const status = err.status ?? err.statusCode ?? 500;
  const message = err.message ?? "Internal server error";

  if (isDev && status >= 500) {
    console.error("[Error]", status, message, err.stack);
  } else if (status >= 500) {
    console.error("[Error]", status, message);
  }

  res.status(status).json({
    error: status >= 500 ? "Internal server error" : err.name ?? "Error",
    message: status >= 500 && !isDev ? "Something went wrong" : message,
    ...(isDev && err.stack && { stack: err.stack }),
  });
}

export default errorHandler;
