const Redis = require("ioredis");
const redis = new Redis({
  host: process.env.REDIS_HOST,
  password: process.env.REDIS_PASS,
});

redis.on("ready", (err) => {
  if (err) console.log(err);
  console.log("[REDIS] Connection established".red.underline.bold);
});

const set = ({ key, data, expiry = 60 }) => {
  redis.set(key, JSON.stringify(data), "EX", expiry);
};

const get = async (key) => {
  return JSON.parse(await redis.get(key));
};

module.exports = { redis, set, get };
