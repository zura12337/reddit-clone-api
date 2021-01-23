const mongoose = require("mongoose");
const { postSchema } = require("./Post");
const Joi = require("joi");
const { userSchema } = require("./User");

const { Schema } = mongoose;

const communitySchema = new Schema({
  name: { type: String, required: true },
  description: String,
  image: { type: String },
  members: { type: [userSchema] },
  posts: { type: [postSchema] },
});

const Community = mongoose.model("Community", communitySchema);

function validateCommunity(community) {
  const schema = Joi.object({
    name: Joi.string().required(),
    description: Joi.string().min(10).required(),
    image: Joi.string().required(),
    members: Joi.array(),
    posts: Joi.array(),
  });
  return schema.validate(community);
}

exports.Community = Community;
exports.validate = validateCommunity;
