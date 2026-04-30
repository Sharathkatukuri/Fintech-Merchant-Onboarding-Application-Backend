const errorHandler = (error, req, res, next) => {
  let statusCode = error.statusCode || 500;
  let message = error.message || "Internal server error";

  if (error.name === "MulterError") {
    statusCode = 400;
    message =
      error.code === "LIMIT_FILE_SIZE"
        ? "File size exceeds the 5MB limit."
        : error.message;
  }

  if (error.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(error.errors)
      .map((item) => item.message)
      .join(" ");
  }

  if (error.code === 11000) {
    statusCode = 409;
    const duplicateField = Object.keys(error.keyValue || {})[0];
    message = `${duplicateField} already exists.`;
  }

  if (error.name === "CastError") {
    statusCode = 400;
    message = `Invalid ${error.path}.`;
  }

  return res.status(statusCode).json({
    success: false,
    message,
  });
};

module.exports = errorHandler;
