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
  membersCount: { type: Number, default: 0 },
  moderators: { type: [Schema.Types.ObjectId], ref: "User" },
  posts: { type: [Schema.Types.ObjectId], ref: "Posts" },
  postsCount: { type: Number, default: 0 },
  createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: String, default: time },
  category: { type: String },
  rules: [{ type: Schema.Types.ObjectId, ref: "Rule" }],
  theme: {
    type: { main: String, highlight: String },
    default: { main: "#0079D3", highlight: "#0079D3" },
  },
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
    membersCount: Joi.number(),
    moderators: Joi.string(),
    posts: Joi.string(),
    postsCount: Joi.number(),
    createdBy: Joi.string(),
    createdAt: Joi.string(),
    category: Joi.string(),
    rules: Joi.any(),
    theme: Joi.object({ main: Joi.string(), highlight: Joi.string() }),
  });
  return schema.validate(community);
}

exports.Community = Community;
exports.validate = validateCommunity;
