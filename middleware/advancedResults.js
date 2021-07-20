const dotify = require("../utils/dotify");

const advancedResults = (model) => async (req, res, next) => {
  let query;

  // Copy req.query
  let reqQuery = { ...req.query };

  // Fields to exclude
  const removeFields = ["select", "sort", "page", "limit"];

  // Loop over removeFields and delete them from reqQuery
  removeFields.forEach((param) => delete reqQuery[param]);

  // Create query string
  let queryStr = JSON.stringify(reqQuery);

  // Create operators ($gt, $gte, etc)
  queryStr = queryStr.replace(
    /\b(gt|gte|lt|lte|in)\b/g,
    (match) => `$${match}`
  );

  // Get cabinet based on address object value (explanation found in utils/dotify.js)
  if (Object.keys(reqQuery)[0] === "address") {
    reqQuery = model.find(dotify(reqQuery));
  }

  // Finding resource
  query = model.find(reqQuery);

  // Select Fields
  if (req.query.select) {
    const fields = req.query.select.split(",").join(" ");
    query = query.select(fields);
  }

  // Sort
  if (req.query.sort) {
    const sortBy = req.query.sort.split(",").join(" ");
    query = query.sort(sortBy);
  } else {
    query = query.sort("-createdAt");
  }

  // Pagination
  const total = await model.countDocuments();
  const page = parseInt(req.query.page, 10) || 1;
  let limit;
  if (req.query.limit == 0) limit = total;
  else limit = parseInt(req.query.limit, 10) || 25;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  query = query.skip(startIndex).limit(limit);

  // Executing query
  const results = await query;

  // Pagination result
  const pagination = {};

  // if last index is less than total, display information about the next page
  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit,
    };
  }

  // if the startindex is more than 0, display information about the previous page
  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit,
    };
  }

  res.advancedResults = {
    success: true,
    count: results.length,
    pagination: results.length ? pagination : null,
    data: results,
  };

  next();
};

module.exports = advancedResults;
