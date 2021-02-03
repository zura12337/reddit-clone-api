const express = require("express");
const router = express.Router();
const { Post, validate } = require("../models/Post");
const { User } = require("../models/User");
const { Community } = require("../models/Community");

const auth = require("../middleware/auth");

router.get("/", async (req, res) => {
  let posts;
  if (req.header("Authorization")) {
    auth(req, res);
    let user = await User.findById(req.user._id);
    posts = await Post.find({ postedTo: { $in: user.joined } })
      .populate("postedBy")
      .populate("postedTo");
    if (posts.length < 5) {
      posts.push(await Post.find());
    }
  } else {
    posts = await Post.find({}).populate("postedBy").populate("postedTo");
  }
  res.send(posts);
});

router.post("/", auth, async (req, res) => {
  const { error } = validate(req.body);
  if (error) res.status(400).send(error.details[0].message);

  let community = await Community.findById(req.body.postedTo);
  if (!community) res.status(404).send("No community found");

  let post = new Post(req.body);
  post.postedBy = req.user._id;
  community.posts = [...community.posts, post._id];
  community.save();
  post.save((error) => {
    if (!error) {
      Post.find({})
        .populate("postedBy")
        .exec(function (error, posts) {
          console.log(posts);
        });
    }
  });

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

  const post = await Post.findById(req.params.id);
  if (!post) res.status(404).send("No Post found with given ID");
  const user = await User.findById(req.user._id);

  let counter = action === "like" ? 1 : -1;
  let status = action === "like" ? "like" : "unlike";

  // This shitty code needs to be updated ASAP.
  if (user.likedPosts && user.dislikedPosts) {
    if (
      action === "like" &&
      !user.likedPosts.includes(post._id) &&
      !user.dislikedPosts.includes(post._id)
    ) {
      user.likedPosts = [...user.likedPosts, post._id];
    } else if (
      action === "unlike" &&
      !user.dislikedPosts.includes(post._id) &&
      !user.likedPosts.includes(post._id)
    ) {
      user.dislikedPosts = [...user.dislikedPosts, post._id];
    } else if (
      action === "like" &&
      user.likedPosts.includes(post._id) &&
      !user.dislikedPosts.includes(post._id)
    ) {
      user.likedPosts.splice(post._id, 1);
      status = "removed";
      counter = -1;
    } else if (
      action === "like" &&
      !user.likedPosts.includes(post._id) &&
      user.dislikedPosts.includes(post._id)
    ) {
      counter = 2;
      user.likedPosts = [...user.likedPosts, post._id];
      user.dislikedPosts.splice(post._id, 1);
    } else if (
      action === "unlike" &&
      !user.likedPosts.includes(post._id) &&
      user.dislikedPosts.includes(post._id)
    ) {
      counter = 1;
      status = "removed";
      user.dislikedPosts.splice(post._id, 1);
    } else if (
      action === "unlike" &&
      user.likedPosts.includes(post._id) &&
      !user.dislikedPosts.includes(post._id)
    ) {
      counter = -2;
      user.likedPosts.splice(post._id, 1);
      user.dislikedPosts = [...user.dislikedPosts, post._id];
    }
  }
  post.votes = post.votes + counter;

  post.save();
  user.save();
  res.send({ votes: post.votes, status });
});

module.exports = router;
