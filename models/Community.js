const mongoose = require("mongoose");
const Joi = require("joi");

const { Schema } = mongoose;

const communitySchema = new Schema({
  name: { type: String, required: true },
  description: String,
  image: { type: String },
  cover: { type: String },
  members: { type: [Schema.Types.ObjectId], ref: "User" },
  posts: { type: [Schema.Types.ObjectId], ref: "Posts" },
  createdBy: { type: Schema.Types.ObjectId, ref: "User" },
});

const Community = mongoose.model("Community", communitySchema);

function validateCommunity(community) {
  const schema = Joi.object({
    name: Joi.string().required(),
    description: Joi.string().min(10).required(),
    image: Joi.string().required(),
    cover: Joi.string(),
    members: Joi.string(),
    posts: Joi.string(),
    createdBy: Joi.string(),
  });
  return schema.validate(community);
}

exports.Community = Community;
exports.validate = validateCommunity;
