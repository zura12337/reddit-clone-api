const mongoose = require("mongoose");

const { Schema } = mongoose;

const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  description: { type: String, required: true },
  profileImage: { type: String, required: true },
  coverImage: { type: String, required: true },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
