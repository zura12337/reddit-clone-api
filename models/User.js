const mongoose = require("mongoose");
const Joi = require("joi");
const jwt = require("jsonwebtoken");
const deepPopulate = require("mongoose-deep-populate")(mongoose);

const { Schema } = mongoose;

const userSchema = new Schema({
  username: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  description: { type: String },
  image: { type: String },
  coverImage: { type: String },
  likedPosts: [{ type: Schema.Types.ObjectId, ref: "Post" }],
  dislikedPosts: [{ type: Schema.Types.ObjectId, ref: "Post" }],
  followers: [{ type: Schema.Types.ObjectId, ref: "User" }],
  following: [{ type: Schema.Types.ObjectId, ref: "User" }],
  joined: [{ type: Schema.Types.ObjectId, ref: "Community" }],
  createdCommunities: [{ type: Schema.Types.ObjectId, ref: "Community" }],
});

userSchema.plugin(deepPopulate);

userSchema.methods.generateAuthToken = function () {
  const token = jwt.sign({ _id: this._id }, "jwtPrivateKey");
  return token;
};

function validateUser(user) {
  const schema = Joi.object({
    username: Joi.string().min(5).required().label("Name"),
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
  });
  return schema.validate(user);
}

const User = mongoose.model("User", userSchema);

exports.User = User;
exports.validate = validateUser;
exports.userSchema = userSchema;
