const express = require("express");
const {
  getCabinets,
  getCabinet,
  createCabinet,
  updateCabinet,
  deleteCabinet,
} = require("../controllers/cabinets");

const Cabinet = require("../models/Cabinet");

const router = express.Router({ mergeParams: true });

const advancedResults = require("../middleware/advancedResults");
const { protect } = require("../middleware/auth");

router
  .route("/")
  .get(advancedResults(Cabinet), getCabinets)
  .post(createCabinet);

router
  .route("/:id")
  .get(getCabinet)
  .put(protect, updateCabinet)
  .delete(protect, deleteCabinet);

module.exports = router;
