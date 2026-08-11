// 404 handler
function notFound(req, res, next) {
  const error = new Error(`Not Found — ${req.method} ${req.originalUrl}`);
  res.status(404);
  next(error);
}

// Central error handler — always JSON (React frontend handles UI)
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  const isDev = process.env.NODE_ENV !== "production";

  return res.status(statusCode).json({
    success: false,
    status: "error",
    message: err.message || "Internal Server Error",
    ...(isDev && { stack: err.stack }),
  });
}

module.exports = { notFound, errorHandler };
