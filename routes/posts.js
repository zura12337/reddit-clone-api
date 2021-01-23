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
  const counter = action === "like" ? 1 : -1;

  const post = await Post.findById(req.params.id);

  post.votes = post.votes + counter;
  post.save();

  if (action === "like") {
    User.updateOne(
      { _id: req.user._id },
      {
        $push: {
          likedPosts: post,
        },
      },
      { new: true },
      (err, numberAffected) => {
        res.send("");
      }
    );
  } else {
    User.updateOne(
      { _id: req.user._id },
      {
        $unset: {
          likedPosts: post,
        },
      },
      { new: true },
      (err, numberAffected) => {
        res.send("");
      }
    );
  }
});

module.exports = router;
