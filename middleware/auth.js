const asyncHandler = require("./async");
const ErrorResponse = require("../utils/errorResponse");

// Key protection for protected routes
exports.protect = asyncHandler(async (req, res, next) => {
  let key;

  if (req.headers.key) {
    key = req.headers.key;
  }

  // Make sure key exists
  if (!key) {
    return next(new ErrorResponse("Not authorized to access this route", 401));
  }

  if (key === process.env.KEY) {
    // if key is correct, continue
    next();
  } else {
    // otherwise throw error :~)
    return next(new ErrorResponse("Not authorized to access this route", 401));
  }
});
