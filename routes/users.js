const express = require("express");
const router = express.Router();
const _ = require("lodash");
const bcrypt = require("bcrypt");
const auth = require("../middleware/auth");

const { User, validate } = require("../models/User");

router.get("/me", auth, async (req, res) => {
  await User.findById(req.user._id)
    .select("-password")
    .populate("likedPosts")
    .populate("dislikedPosts")
    .populate("joined")
    .then((user) => {
      res.json(user);
    });
});

router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findOne({ email: req.body.email });
  if (user) return res.status(400).send("User already registered");

  user = new User(req.body);
  const salt = await bcrypt.genSalt(10);

  user.password = await bcrypt.hash(user.password, salt);

  await user.save();

  const token = user.generateAuthToken();
  res.cookie("token", token, { httpOnly: true }).send();
});

router.get("/logout", auth, async (req, res) => {
  res.clearCookie("token").send();
});

router.get("/:id", async (req, res) => {
  const id = req.params.id;
  let user = await User.findById(id);
  if (!user) res.status(404).send("No User Found");

  res.send(user).populate("likedPosts").populate("joined");
});

router.post("/:id/follow", auth, async (req, res) => {
  const id = req.params.id;

  const targetUser = await User.findById(id);
  if (!targetUser) res.status(400).send("Bad Request. Try Again.");

  const user = await User.findById(req.user._id);
  if (!user) res.status(400).send("Bad Request. Try Again.");

  if (user._id === targetUser._id)
    res.status(400).send("Can not follow yourself");

  if (user.following.includes(targetUser._id)) {
    targetUser.followers.splice(user._id, 1);
    user.following.splice(targetUser._id, 1);
  } else {
    targetUser.followers.push(req.user._id);
    user.following.push(targetUser._id);
  }

  user.save();
  targetUser.save();

  res.json(targetUser);
});

module.exports = router;
