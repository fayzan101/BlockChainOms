const AppError = require('../errors/AppError');

function roleCheck(roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new AppError('Forbidden', 403));
    }
    next();
  };
}

module.exports = roleCheck;
