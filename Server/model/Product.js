const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
  name: String,
  price: Number,
  quantity: Number,
  image: String // File path to image
});

module.exports = mongoose.model("Product", ProductSchema);
