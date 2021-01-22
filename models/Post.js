const mongoose = require("mongoose");
const moment = require("moment");

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
    type: String,
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

const Post = mongoose.model("Post", postSchema);

module.exports = Post;
