const mongoose = require("mongoose");
const Post = require("./Post");
const { userSchema } = require("./User");

const { Schema } = mongoose;

const communitySchema = new Schema({
  name: { type: String, required: true },
  description: String,
  members: { type: [userSchema] },
  posts: { type: Post },
});

const Community = mongoose.model("Community", communitySchema);

module.exports = Community;
