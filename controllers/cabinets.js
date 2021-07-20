const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const Cabinet = require("../models/Cabinet");
const { get, set } = require("../config/redis");
const { submit } = require("../utils/discord");

// @desc      Get all cabinets
// @route     GET /api/v1/cabinets
// @access    Public
exports.getCabinets = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc      Get single cabinet
// @route     GET /api/v1/cabinets/:id
// @access    Public
exports.getCabinet = asyncHandler(async (req, res, next) => {
  let cabinet;
  const cache = await get(req.params.id);
  if (cache) {
    cabinet = cache;
  } else {
    cabinet = await Cabinet.findById(req.params.id);
  }
  set(req.params.id, cabinet);
  res.status(200).json({
    success: true,
    data: cabinet,
  });
});

// @desc      Add a new cabinet to the database
// @route     POST /api/v1/cabinets
// @access    Public
exports.createCabinet = asyncHandler(async (req, res, next) => {
  const check = await Cabinet.findOne({
    // check if there's already a cabinet in those coordinates
    position: req.body.position,
  });

  if (check) {
    // if there is return an error
    return next(
      new ErrorResponse(`There is already a cabinet in those coordinates`, 400)
    );
  }
  // make sure approved is not true
  req.body.approved = false;
  // otherwise add cabinet to the database
  const cabinet = await Cabinet.create(req.body);

  res.status(201).json({
    success: true,
    data: cabinet,
  });

  submit(
    `New cabinet added with ID ${cabinet._id} by ${
      cabinet.username ? cabinet.username : "Unknown"
    }\n${cabinet.isp}/${cabinet.type}/${
      cabinet.img_url ? cabinet.img_url : "No image"
    }/${cabinet.address.full}`
  );
});

// @desc      Update cabinet information
// @route     PUT /api/v1/cabinets/:id
// @access    Protected
exports.updateCabinet = asyncHandler(async (req, res, next) => {
  const cabinet = await Cabinet.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!cabinet) {
    return next(new ErrorResponse("Cabinet with that ID does not exist", 400));
  }
  res.status(200).json({
    success: true,
    data: cabinet,
  });
});

// @desc      Delete cabinet
// @route     DELETE /api/v1/cabinets/:id
// @access    Protected
exports.deleteCabinet = asyncHandler(async (req, res, next) => {
  await Cabinet.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    data: {},
  });
});
