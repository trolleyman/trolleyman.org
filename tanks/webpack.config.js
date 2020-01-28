const path = require('path');

var dir = path.resolve(__dirname, "..");

module.exports = {
  entry: path.join(dir, "tanks", "bootstrap.js"),
  output: {
    path: path.join(dir, "static", "wasm", "tanks"),
    filename: "bootstrap.js",
  },
  mode: "development"
};
