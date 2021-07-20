const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const Center = require("../models/Center");
const { get, set } = require("../config/redis");
const { submit } = require("../utils/discord");

// @desc      Get all centers
// @route     GET /api/v1/centers
// @access    Public
exports.getCenters = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc      Get single center
// @route     GET /api/v1/center/:id
// @access    Public
exports.getCenter = asyncHandler(async (req, res, next) => {
  let center;
  const cache = await get(req.params.id);
  if (cache) {
    center = cache;
  } else {
    center = await Center.findById(req.params.id);
  }
  set(req.params.id, center);
  res.status(200).json({
    success: true,
    data: center,
  });
});

// @desc      Add a new center to the database
// @route     POST /api/v1/centers
// @access    Public
exports.createCenter = asyncHandler(async (req, res, next) => {
  const check = await Center.findOne({
    // check if there's already a center in those coordinates
    position: req.body.position,
  });

  if (check) {
    // if there is return an error
    return next(
      new ErrorResponse(`There is already a center in those coordinates`, 400)
    );
  }
  // make sure approved isn't true
  req.body.approved = false;
  // otherwise add center to the database
  const center = await Center.create(req.body);

  res.status(201).json({
    success: true,
    data: center,
  });

  submit(
    `New center added with ID ${center._id} by ${
      center.nickname ? center.nickname : "Unknown"
    }`
  );
});

// @desc      Update center information
// @route     PUT /api/v1/center/:id
// @access    Protected
exports.updateCenter = asyncHandler(async (req, res, next) => {
  const center = await Center.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!center) {
    return next(new ErrorResponse("Center with that ID does not exist", 400));
  }

  res.status(200).json({
    success: true,
    data: center,
  });
});

// @desc      Delete center
// @route     DELETE /api/v1/centers/:id
// @access    Protected
exports.deleteCenter = asyncHandler(async (req, res, next) => {
  await Center.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    data: {},
  });
});
