const mongoose = require("mongoose");
const Joi = require("joi");
const moment = require("moment");

const { Schema } = mongoose;

const time = moment().format("MMM DD, YYYY");

const communitySchema = new Schema({
  name: { type: String, required: true },
  username: { type: String },
  description: String,
  image: { type: String },
  cover: { type: String },
  members: { type: [Schema.Types.ObjectId], ref: "User" },
  moderators: { type: [Schema.Types.ObjectId], ref: "User" },
  posts: { type: [Schema.Types.ObjectId], ref: "Posts" },
  createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: String, default: time },
});

const Community = mongoose.model("Community", communitySchema);

function validateCommunity(community) {
  const schema = Joi.object({
    name: Joi.string().required().label("Name"),
    username: Joi.string(),
    description: Joi.string().min(10).required().label("Description"),
    image: Joi.string(),
    cover: Joi.string(),
    members: Joi.string(),
    moderators: Joi.string(),
    posts: Joi.string(),
    createdBy: Joi.string(),
    createdAt: Joi.string(),
  });
  return schema.validate(community);
}

exports.Community = Community;
exports.validate = validateCommunity;
