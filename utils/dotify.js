// dotify function because it is needed when you use the .find() function with mongoose
// you can't .find({ address: { country: "Greece" } }) unfortunately
// you have to .find({ "address.country": "Greece" })

const dotify = (obj) => {
  const res = {};
  const recurse = (obj, current) => {
    for (let key in obj) {
      let value = obj[key];
      let newKey = current ? current + "." + key : key; // joined key with dot
      if (value && typeof value === "object") {
        recurse(value, newKey); // it's a nested object, so do it again
      } else {
        res[newKey] = value; // it's not an object, so set the property
      }
    }
  };

  recurse(obj);
  return res;
};

module.exports = dotify;
