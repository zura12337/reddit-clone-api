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
  image: String,
  url: String,
  urlData: Object,
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
  },
  hideVotes: Boolean,
  category: [{ type: String, ref: "Category" }],
});

function validatePost(post) {
  const schema = Joi.object({
    title: Joi.string().required().label("Title"),
    body: Joi.string().required().label("Description"),
    image: Joi.string().label("Image"),
    url: Joi.string(),
    urlData: Joi.object(),
    postedTo: Joi.string().required().label("PostedTo"),
    postedBy: Joi.string(),
    postedAt: Joi.string(),
    votes: Joi.number(),
    hideVotes: Joi.boolean().default(false),
    category: Joi.array(),
  });
  return schema.validate(post);
}

const Post = mongoose.model("Post", postSchema);

exports.Post = Post;
exports.postSchema = postSchema;
exports.validate = validatePost;
