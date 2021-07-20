// restore true visitor IP when behind cloudflare

const asyncHandler = require("./async");

const trueIp = asyncHandler(async (req, res, next) => {
  const header =
    req.headers["cf-connecting-ip"] ||
    req.headers["x-forwarded-for"] ||
    req.connection.remoteAddress;
  if (header) req.cf_ip = header;
  next();
});

module.exports = trueIp;
