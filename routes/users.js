const express = require("express");
const router = express.Router();
const _ = require("lodash");
const bcrypt = require("bcrypt");
const auth = require("../middleware/auth");

const { User, validate } = require("../models/User");

/**
 ** GET
 * Get Current Logged in user
 */

router.get("/me", auth, async (req, res) => {
  await User.findById(req.user._id)
    .select("-password")
    .populate("likedPosts")
    .populate("dislikedPosts")
    .populate("joined")
    .populate("following")
    .populate("followers")
    .then((user) => {
      res.json(user);
    });
});

/**
 ** POST
 * Create New User
 */

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

/**
 * * GET
 * Logout
 */

router.get("/logout", auth, async (req, res) => {
  res.clearCookie("token").send();
});

/**
 * * GET
 * Get User by given ID
 */

router.get("/:id", async (req, res) => {
  const id = req.params.id;
  await User.findById(id)
    .select("-password")
    .populate("likedPosts")
    .populate("dislikedPosts")
    .populate("joined")
    .populate("following")
    .populate("followers")
    .then((user) => {
      res.json(user);
    });
});

/**
 * * POST
 * Follow/Unfollow User
 */

router.post("/:id/follow", auth, async (req, res) => {
  const id = req.params.id;
  let status;
  const targetUser = await User.findById(id);
  if (!targetUser) res.status(400).send("Bad Request. Try Again.");

  const user = await User.findById(req.user._id);
  if (!user) res.status(400).send("Bad Request. Try Again.");

  if (user._id.toString() == targetUser._id.toString()) {
    res.status(400).send("Can not follow yourself");
  } else {
    if (user.following.includes(targetUser._id)) {
      targetUser.followers.splice(user._id, 1);
      user.following.splice(targetUser._id, 1);
      status = "unfollow";
    } else {
      targetUser.followers.push(req.user._id);
      user.following.push(targetUser._id);
      status = "follow";
    }

    user.save();
    targetUser.save();

    res.send(status);
  }
});

/**
 * * GET
 * Get Followers
 */

router.get("/:id/followers", async (req, res) => {
  const id = req.params.id;
  await User.findById(id)
    .select("followers")
    .populate("followers")
    .then(({ followers }) => res.send(followers))
    .catch(() => res.status(400).send("Bad Request."));
});

/**
 * * GET
 * Get Followers
 */

router.get("/:id/followers", async (req, res) => {
  const id = req.params.id;
  await User.findById(id)
    .select("following")
    .populate("following")
    .then(({ following }) => res.send(following))
    .catch(() => res.status(400).send("Bad Request."));
});

/**
 * * PUT
 * Change User information
 */

module.exports = router;
