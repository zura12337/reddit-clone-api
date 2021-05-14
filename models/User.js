const mongoose = require("mongoose");
const Joi = require("joi");
const jwt = require("jsonwebtoken");
const deepPopulate = require("mongoose-deep-populate")(mongoose);
const moment = require("moment");

var time = Date.now();
const { Schema } = mongoose;

const userSchema = new Schema({
  username: { type: String, required: true },
  displayName: { type: String },
  email: { type: String, required: true },
  password: { type: String, required: true },
  description: { type: String },
  image: { type: String },
  coverImage: { type: String },
  posts: [{ type: Schema.Types.ObjectId, ref: "Post" }],
  likedPosts: [{ type: Schema.Types.ObjectId, ref: "Post" }],
  dislikedPosts: [{ type: Schema.Types.ObjectId, ref: "Post" }],
  followers: [{ type: Schema.Types.ObjectId, ref: "User" }],
  following: [{ type: Schema.Types.ObjectId, ref: "User" }],
  joined: [{ type: Schema.Types.ObjectId, ref: "Community" }],
  createdCommunities: [{ type: Schema.Types.ObjectId, ref: "Community" }],
  drafts: [{ type: Schema.Types.ObjectId, ref: "DraftPost" }],
  cakeDay: { type: String, default: time },
});

userSchema.plugin(deepPopulate);

userSchema.methods.generateAuthToken = function () {
  const token = jwt.sign({ _id: this._id }, process.env.JWT_SECRET);
  return token;
};

function validateUser(user) {
  const schema = Joi.object({
    username: Joi.string().min(5).required().label("Name"),
    displayName: Joi.string().min(3).label("Display Name"),
    email: Joi.string().email().required().label("Email"),
    password: Joi.string().min(4).required().label("Password"),
    description: Joi.string().min(10).label("Description"),
    image: Joi.string().label("Profile Image"),
    coverImage: Joi.string().label("Cover Image"),
    likedPosts: Joi.string().label("Liked Posts"),
    dislikedPosts: Joi.string().label("Disliked Posts"),
    followers: Joi.array().label("Followers"),
    following: Joi.array().label("Following"),
    joined: Joi.string(),
    createdCommunities: Joi.string(),
    drafts: Joi.object(),
  });
  return schema.validate(user);
}

const User = mongoose.model("User", userSchema);

exports.User = User;
exports.validate = validateUser;
exports.userSchema = userSchema;
