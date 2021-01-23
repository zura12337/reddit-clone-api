const express = require("express");
const router = express.Router();
const { Post, validate } = require("../models/Post");
const { User } = require("../models/User");
const auth = require("../middleware/auth");

router.get("/", async (req, res) => {
  const posts = await Post.find();

  res.send(posts);
});

router.post("/", auth, async (req, res) => {
  const { error } = validate(req.body);
  if (error) res.status(400).send(error.details[0].message);

  let post = new Post(req.body);
  post.save();

  res.send(post);
});

router.get("/:id", async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) res.status(404).send("No Post Found with given ID");

  res.send(post);
});

router.post("/:id/action", auth, async (req, res) => {
  const action = req.body.action;
  if (!action) res.status(400).send("No Action Provided");
  const counter = action === "like" ? 1 : -1;

  const post = await Post.findById(req.params.id);
  const user = await User.findById(req.user._id);

  if (!user.likedPosts.includes(post._id)) {
    post.votes = post.votes + counter;
  } else {
    res.status(400).send("Already Liked");
  }

  if (user.likedPosts) {
    if (action === "like") {
      user["likedPosts"] = [post._id];
    } else {
      user["likedPosts"].splice(post, 1);
    }
  }

  post.save();
  user.save();
  res.send("");
});

module.exports = router;
