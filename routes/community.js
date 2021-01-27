const express = require("express");
const router = express.Router();
const { Community, validate } = require("../models/Community");
const { User } = require("../models/User");
const auth = require("../middleware/auth");

router.get("/", async (req, res) => {
  const community = await Community.find();
  res.send(community);
});

router.post("/", auth, async (req, res) => {
  const { error } = validate(req.body);
  if (error) res.status(400).send(error.details[0].message);

  let community = new Community(req.body);
  community.members = [req.user._id];
  community.save();

  res.send(community);
});

router.get("/:id", async (req, res) => {
  const community = await Community.findById(req.params.id);
  if (!community) res.status(404).send("No community found with given ID");

  res.send(community);
});

router.post("/:id/join", auth, async (req, res) => {
  let user = await User.findById(req.user._id);
  if (!user) res.status(400).send("Bad Request.");

  let community = await Community.findById(req.params.id);
  if (!community) res.status(404).send("Community not found.");

  user.joined.push(community._id);
  community.members.push(user._id);

  user.save();
  community.save();

  res.send(community);
});

module.exports = router;
