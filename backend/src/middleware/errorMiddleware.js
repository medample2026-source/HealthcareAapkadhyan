const errorMiddleware = (err, req, res, next) => {
  console.error(err);

  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;

  res.status(statusCode).json({
    success: false,
    message:
      process.env.NODE_ENV === "production"
        ? "Server error"
        : err.message || "Server error",
  });
};

module.exports = errorMiddleware;
