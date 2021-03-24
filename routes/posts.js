const express = require("express");
const router = express.Router();
const { Post, validate } = require("../models/Post");
const { User } = require("../models/User");
const { Community } = require("../models/Community");

const { getLinkPreview } = require("link-preview-js");

const auth = require("../middleware/auth");

router.get("/", async (req, res) => {
  let posts;
  if (req.cookies.token) {
    auth(req, res);
    let user = await User.findById(req.user._id);
    posts = await Post.find({ postedTo: { $in: user.joined } })
      .populate("postedBy")
      .populate("postedTo");
  } else {
    posts = await Post.find({}).populate("postedBy").populate("postedTo");
  }
  posts = posts.reverse();

  res.send(posts);
});

router.post("/", auth, async (req, res) => {
  const { error } = validate(req.body);
  if (error) res.status(400).send(error.details[0].message);

  let community = await Community.findById(req.body.postedTo);
  if (!community) res.status(404).send("No community found");

  let urlData;

  if (req.body.url) {
    urlData = await getLinkPreview(req.body.url);
  }

  let post = new Post(req.body);
  post.votes = 0;
  post.postedBy = req.user._id;
  post.urlData = urlData;
  community.posts = [...community.posts, post._id];
  community.save();
  post.save((error) => {
    if (!error) {
      Post.find({})
        .populate("postedBy")
        .exec(function (error, posts) {});
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
