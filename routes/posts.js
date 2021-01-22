const express = require("express");
const router = express.Router();
const { Post, validate } = require("../models/Post");
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

module.exports = router;
