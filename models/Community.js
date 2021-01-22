const mongoose = require("mongoose");
const Post = require("./Post");
const User = require("./User");

const { Schema } = mongoose;

const communitySchema = new Schema({
  name: { type: String, required: true },
  description: String,
  members: User,
  posts: { type: Post },
});

const Community = mongoose.model("Community", communitySchema);

module.exports = Community;
