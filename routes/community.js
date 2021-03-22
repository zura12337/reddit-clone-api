const express = require("express");
const router = express.Router();
const { Community, validate } = require("../models/Community");
const { User } = require("../models/User");
const auth = require("../middleware/auth");
const isAdmin = require("../middleware/isAdmin");
const querystring = require("querystring");

router.get("/", async (req, res) => {
  const community = await Community.find();
  community.reverse();
  res.send(community);
});

router.get("/trending", async (req, res) => {
  const limit = parseInt(req.query.limit) || 4;

  const community = await Community.find().sort({ members: 1 }).limit(limit);
  res.send(community);
});

router.post("/", auth, async (req, res) => {
  const { error } = validate(req.body);
  if (error) {
    res.status(400).send(error.details[0].message);
  } else {
    let community = await Community.findOne({
      username: req.body.name.split(" ").join(""),
    });
    if (community) {
      res.status(400).send("Community with given name already exists.");
    } else {
      community = await new Community(req.body);
      community.members = [req.user._id];
      community.moderators = [req.user._id];
      community.createdBy = req.user._id;
      community.username = community.name.split(" ").join("");
      community.save();

      let user = await User.findById(req.user._id);
      user.joined = [...user.joined, community._id];
      user.createdCommunities = [...user.createdCommunities, community._id];
      user.save();

      res.send(community);
    }
  }
});

router.get("/:username", async (req, res) => {
  await Community.findOne({
    username: req.params.username,
  })
    .populate({
      path: "posts",
      model: "Post",
      populate: [
        {
          path: "postedTo",
          model: "Community",
        },
        {
          path: "postedBy",
          model: "User",
        },
      ],
    })
    .populate({ path: "posts.postedTo", model: "Community" })
    .populate({ path: "posts.postedBy", model: "User" })
    .populate({ path: "members", model: "User" })
    .populate({ path: "moderators", model: "User" })
    .populate({ path: "createdBy", model: "User" })
    .then((community) => {
      res.send(community);
    });
});

router.post("/:id/join", auth, async (req, res) => {
  let user = await User.findById(req.user._id);
  if (!user) res.status(400).send("Bad Request.");

  let community = await Community.findById(req.params.id);
  if (!community) res.status(404).send("Community not found.");

  let joinedCommunities = [];

  user.joined.forEach((community) => {
    joinedCommunities.push(community.toString());
  });

  if (joinedCommunities.indexOf(community._id.toString()) >= 0) {
    user.joined.splice(user.joined.indexOf(community._id.toString()), 1);
    community.members.splice(community.members.indexOf(user._id.toString()), 1);
  } else {
    user.joined.push(community._id);
    community.members.push(user._id);
  }

  user.save();
  community.save();

  res.send(community);
});

router.delete("/:id", auth, isAdmin, async (req, res) => {
  let community = await Community.findByIdAndDelete(req.params.id);
  if (!community) res.status(400).send("Community not found");

  res.send(community);
});

module.exports = router;
