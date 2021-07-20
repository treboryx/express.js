const fs = require("fs");
const colors = require("colors");
const dotenv = require("dotenv");
const geocoder = require("./utils/geocoder");
const connectDB = require("./config/db");
// Load env vars
dotenv.config({ path: "./config/config.env" });

// Load model
const Cabinet = require("./models/Cabinet");
const Center = require("./models/Center");

// Connect to database
connectDB().catch((err) => {
  console.log(err);
  process.exit(1); // Close & exit if connection to the database fails.
});

// Read JSON file that contains the data
const data = JSON.parse(
  fs.readFileSync(`${__dirname}/inputlast.json`, "utf-8")
);

data.forEach(async (e, i) => {
  setTimeout(async () => {
    const res = await geocoder.reverse({
      lat: e.position.lat,
      lon: e.position.lng,
    });
    e.address = {
      full: res[0].formattedAddress,
      streetNumber: res[0].streetNumber,
      streetName: res[0].streetName,
      city: res[0].city,
      country: res[0].country,
      countryCode: res[0].countryCode,
      zipcode: res[0].zipcode,
      administrationLevels: res[0].administrationLevels,
    };
    await Cabinet.create(e).then((c) => console.log(c));
  }, 5000 * (i + 1));
});

const centers = data.filter((d) => d.type === "DSLAM");

centers.forEach(async (e, i) => {
  setTimeout(async () => {
    let payload = {
      id: e.id,
      name: e.img_url,
      position: e.position,
      verified: true,
      approved: true,
      username: undefined,
      createdAt: Date.now(),
    };
    const res = await geocoder.reverse({
      lat: e.position.lat,
      lon: e.position.lng,
    });
    payload.address = {
      full: res[0].formattedAddress,
      streetNumber: res[0].streetNumber,
      streetName: res[0].streetName,
      city: res[0].city,
      country: res[0].country,
      countryCode: res[0].countryCode,
      zipcode: res[0].zipcode,
      administrationLevels: res[0].administrationLevels,
    };
    payload.img_url = undefined;
    await Center.create(payload)
      .then((c) => console.log(c))
      .catch((e) => console.log(e));
  }, 5000 * i);
});
