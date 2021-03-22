const mongoose = require("mongoose");
const moment = require("moment");
const Joi = require("joi");

var now = Date.now();
var time = moment(now).format("DD-MM-YYYY h:mm");
const { Schema } = mongoose;

const postSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  body: {
    type: String,
    required: true,
  },
  image: {
    type: String,
  },
  url: String,
  postedTo: {
    type: Schema.Types.ObjectId,
    ref: "Community",
    required: true,
  },
  postedBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  postedAt: {
    type: String,
    default: time,
  },
  votes: {
    type: Number,
    default: 0,
    required: true,
  },
});

function validatePost(post) {
  const schema = Joi.object({
    title: Joi.string().required(),
    body: Joi.string().required(),
    image: Joi.string(),
    url: Joi.string(),
    postedTo: Joi.string().required(),
    postedBy: Joi.string(),
    postedAt: Joi.string(),
    votes: Joi.number(),
  });
  return schema.validate(post);
}

const Post = mongoose.model("Post", postSchema);

exports.Post = Post;
exports.postSchema = postSchema;
exports.validate = validatePost;
