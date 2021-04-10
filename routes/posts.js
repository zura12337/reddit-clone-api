const express = require("express");
const router = express.Router();
const { Post, validate } = require("../models/Post");
const { User } = require("../models/User");
const { Community } = require("../models/Community");

const { getLinkPreview } = require("link-preview-js");

const auth = require("../middleware/auth");
const querystring = require("querystring");

router.get("/", async (req, res) => {
  let posts;
  const page = parseInt(req.query.page) || 0;
  if (req.cookies.token) {
    auth(req, res);
    let user = await User.findById(req.user._id);
    posts = await Post.find({ postedTo: { $in: user.joined } })
      .sort({ _id: -1 })
      .populate("postedBy")
      .populate("postedTo")
      .skip(page * 10)
      .limit(10);
  } else {
    posts = await Post.find({})
      .sort({ _id: -1 })
      .populate("postedBy")
      .populate("postedTo")
      .skip(page * 10)
      .limit(10);
  }

  if (posts.length === 0) res.status(404).send("No more posts.");

  res.send(posts);
});

router.get("/trending", async (req, res) => {
  let posts = await Post.find({
    $or: [{ image: { $exists: true } }, { url: { $exists: true } }],
  })
    .sort({ votes: -1 })
    .limit(4)
    .populate("postedBy")
    .populate("postedTo");
  res.send(posts);
});

router.post("/", auth, async (req, res) => {
  const { error } = validate(req.body);
  if (error) res.status(400).send(error.details[0].message);

  let user = await User.findById(req.user._id);

  let community = await Community.findById(req.body.postedTo);
  if (!community) res.status(404).send("No community found");

  let urlData;

  if (req.body.url) {
    urlData = await getLinkPreview(req.body.url);
  }

  let post = new Post(req.body);
  if (!post.hideVotes) {
    post.votes = 0;
  }
  user.posts = [...user.posts, post];
  post.postedBy = req.user._id;
  post.urlData = urlData;

  community.posts = [...community.posts, post._id];
  community.postsCount += 1;

  await community.save();
  await user.save();
  await post.save((error) => {
    if (!error) {
      Post.find({}).populate("postedBy");
    }
  });

  res.send(post);
});

router.get("/:id", async (req, res) => {
  const post = await Post.findById(req.params.id)
    .populate("postedBy")
    .populate("postedTo");
  if (!post) res.status(404).send("No Post Found with given ID");

  res.send(post);
});

module.exports = router;
