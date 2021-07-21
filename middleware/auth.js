const jwt = require("jsonwebtoken");
const asyncHandler = require("./async");
const ErrorResponse = require("../utils/errorResponse");
const User = require("../models/User");

// Protect middleware
exports.protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    // Grab the Bearer token from the Authorization header
    token = req.headers.authorization.split(" ")[1];
    // Get token from cookie (if it exists)
  } else if (req.cookies.token) {
    token = req.cookies.token;
  }

  // Make sure token exists
  if (!token) {
    return next(
      new ErrorResponse(
        "Unauthorized - Not authorized to access this route",
        401
      )
    );
  }

  try {
    // Verify jwt token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decoded.id);

    next();
  } catch (err) {
    return next(
      new ErrorResponse(
        "Unauthorized - Not authorized to access this route",
        401
      )
    );
  }
});

// Role-specific access
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorResponse(
          `Unauthorized - Your access level is unauthorized`,
          403
        )
      );
    }
    next();
  };
};
