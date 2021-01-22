const express = require("express");
const router = express.Router();
const Post = require("../models/Post");

router.get("/", async (req, res) => {
  const posts = await Post.find();

  res.send(posts);
});

router.post("/", async (req, res) => {});

module.exports = router;
