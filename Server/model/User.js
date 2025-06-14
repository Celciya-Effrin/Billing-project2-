const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: String,
  mail: { type: String, unique: true },
  pass: String,
});

module.exports = mongoose.model("User_Data", UserSchema);
