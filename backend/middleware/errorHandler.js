const AppError = require('../errors/AppError');

function notFoundHandler(req, res, next) {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
}

function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  const statusCode = err.statusCode || (err.name === 'InventoryError' ? 400 : 500);
  const response = {
    message: err.isOperational ? err.message : 'Internal server error',
  };

  if (process.env.NODE_ENV !== 'production' && !err.isOperational) {
    response.error = err.message;
  }

  if (err.name === 'ZodError') {
    return res.status(400).json({
      message: 'Validation failed',
      errors: err.errors.map((e) => ({ path: e.path.join('.'), message: e.message })),
    });
  }

  res.status(statusCode).json(response);
}

module.exports = { notFoundHandler, errorHandler };
