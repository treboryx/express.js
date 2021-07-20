const express = require("express");
const {
  getCenters,
  getCenter,
  createCenter,
  updateCenter,
  deleteCenter,
} = require("../controllers/centers");

const Center = require("../models/Center");

const router = express.Router({ mergeParams: true });

const advancedResults = require("../middleware/advancedResults");
const { protect } = require("../middleware/auth");

router.route("/").get(advancedResults(Center), getCenters).post(createCenter);

router
  .route("/:id")
  .get(getCenter)
  .put(protect, updateCenter)
  .delete(protect, deleteCenter);

module.exports = router;
