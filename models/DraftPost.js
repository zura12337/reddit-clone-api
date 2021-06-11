const mongoose = require("mongoose");

const { Schema } = mongoose;

const draftPostSchema = new Schema({
  title: String,
  body: String,
  image: String,
  url: String,
  postedTo: { type: { label: String, value: String } },
  date: String,
  postedBy: { type: Schema.Types.ObjectId, ref: "User" },
});

const DraftPost = mongoose.model("DraftPost", draftPostSchema);

exports.DraftPost = DraftPost;
