const mongoose = require("mongoose");
const Joi = require("joi");
const jwt = require("jsonwebtoken");
const { postSchema } = require("./Post");

const { Schema } = mongoose;

const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  description: { type: String },
  profileImage: { type: String },
  coverImage: { type: String },
  likedPosts: { type: [String] },
  joined: { type: [String] },
});

userSchema.methods.generateAuthToken = function () {
  const token = jwt.sign({ _id: this._id }, "jwtPrivateKey");
  return token;
};

function validateUser(user) {
  const schema = Joi.object({
    name: Joi.string().min(5).required().label("Name"),
    email: Joi.string().email().required().label("Email"),
    password: Joi.string().min(4).required().label("Password"),
    description: Joi.string().min(10).label("Description"),
    profileImage: Joi.string().label("Profile Image"),
    coverImage: Joi.string().label("Cover Image"),
    likedPosts: Joi.string(),
    joined: Joi.string(),
  });
  return schema.validate(user);
}

const User = mongoose.model("User", userSchema);

exports.User = User;
exports.validate = validateUser;
exports.userSchema = userSchema;
