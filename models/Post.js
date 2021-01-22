const mongoose = require("mongoose");
const moment = require("moment");
const Joi = require("joi");

const { userSchema } = require("./User");

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
  postedTo: {
    type: String,
    required: true,
  },
  postedBy: {
    type: Schema.ObjectId,
    required: true,
  },
  postedAt: {
    type: String,
    default: time,
  },
  votes: {
    type: Object,
    required: true,
  },
});

function validatePost(post) {
  const schema = Joi.object({
    title: Joi.string().required(),
    body: Joi.string().required(),
    image: Joi.string().required(),
    postedTo: Joi.string().required(),
    postedBy: Joi.string().required(),
    postedAt: Joi.string().required(),
    votes: Joi.object({ up: Joi.number(), down: Joi.number() }),
  });
  return schema.validate(post);
}

const Post = mongoose.model("Post", postSchema);

exports.Post = Post;
exports.validate = validatePost;
