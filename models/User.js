const mongoose = require("mongoose");
const Joi = require("joi");

const { Schema } = mongoose;

const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  description: { type: String },
  profileImage: { type: String },
  coverImage: { type: String },
});

function validateUser(user) {
  const schema = Joi.object({
    name: Joi.string().min(5).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(4).required(),
    description: Joi.string().min(10),
    profileImage: Joi.string(),
    coverImage: Joi.string(),
  });
  return schema.validate(user);
}

const User = mongoose.model("User", userSchema);

exports.User = User;
exports.validate = validateUser;
