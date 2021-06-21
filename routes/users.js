const express = require("express");
const router = express.Router();
const _ = require("lodash");
const bcrypt = require("bcrypt");
const auth = require("../middleware/auth");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const ejs = require("ejs");

const { User, validate } = require("../models/User");
const { Community } = require("../models/Community");
const { Post } = require("../models/Post");

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
    .deepPopulate(
      "likedPosts.postedBy, likedPosts.postedTo, dislikedPosts.postedBy, dislikedPosts.postedTo"
    )
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

  user = await User.findOne({ username: req.body.username });
  if (user) return res.status(400).send("User already registered");

  user = new User(req.body);
  const salt = await bcrypt.genSalt(10);

  user.password = await bcrypt.hash(user.password, salt);
  if (!user.coverImage) {
    user.coverImage =
      "https://www.zipjob.com/blog/wp-content/uploads/2020/08/linkedin-default-background-cover-photo-1.png";
  }

  await user.save();

  const token = user.generateAuthToken();
  res.cookie("token", token, { httpOnly: true }).send();
});

router.get("/role/:username", auth, async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) res.send("anon");
  if (user.username === req.params.username) {
    res.send("admin");
  } else {
    res.send("auth");
  }
});

/**
 ** POST
 * Check if user is already registered
 */

router.post("/check", async (req, res) => {
  let user = await User.findOne({ email: req.body.email });
  if (user) return res.status(400).send("User already registered");

  res.send("Not registered");
});

router.put("/", auth, async (req, res) => {
  let user = await User.findById(req.user._id);
  if (!user) res.send(400).send("Bad request");

  user = _.extend(user, req.body);

  await user.save();

  res.send();
});

/**
 * * GET
 * Logout
 */

router.get("/logout", auth, async (req, res) => {
  res.clearCookie("token").send();
});

router.post("/notification/:to", auth, async (req, res) => {
  let destinationUser = await User.findOne({ username: req.params.to });
  if (!destinationUser)
    return res.status(400).send("User not found with given username");

  const { title, description, type, more } = req.body;

  const date = Date.now();
  const notification = {
    title,
    description,
    type,
    more,
    from: req.user._id,
    to: destinationUser._id,
    date,
    seen: false,
  };

  if (
    destinationUser.notifications &&
    destinationUser.notifications.length > 0
  ) {
    if (destinationUser.notifications.length >= 15)
      destinationUser.notifications.pop();
    destinationUser.notifications = [
      notification,
      ...destinationUser.notifications,
    ];
  } else {
    destinationUser.notifications = [notification];
  }

  await destinationUser.save();

  destinationUser = await User.findOne({ username: req.params.to })
    .select("notifications")
    .populate([
      {
        path: "notifications.from",
        model: "User",
      },
      {
        path: "notifications.to",
        model: "User",
      },
    ]);

  res.send("Notification has been sent.");
});

router.get("/notifications", auth, async (req, res) => {
  const { notifications } = await User.findById(req.user._id)
    .select("notifications")
    .populate([
      {
        path: "notifications.from",
        model: "User",
      },
      {
        path: "notifications.to",
        model: "User",
      },
      {
        path: "notifications.more.community",
        model: "Community",
      },
    ]);

  let unread = 0;

  notifications.forEach((notification) => {
    !notification.seen ? unread++ : (unread = unread);
  });

  res.send({ unread, notifications });
});

router.get("/seen/:id", auth, async (req, res) => {
  const user = await User.findById(req.user._id).select("notifications");

  let unread = 0;

  user.notifications.forEach((notification) => {
    if (notification._id.equals(req.params.id)) {
      notification.seen = true;
    }
    !notification.seen ? unread++ : (unread = unread);
  });

  await user.save();

  res.send({ unread, notifications: user.notifications });
});

/**
 * * GET
 * Get User by given ID
 */

router.get("/:username", async (req, res) => {
  const username = req.params.username;
  await User.findOne({ username: username })
    .select("-password")
    .populate("likedPosts")
    .populate("dislikedPosts")
    .populate("joined")
    .populate("following")
    .populate("followers")
    .populate("posts")
    .deepPopulate(
      "likedPosts.postedBy, likedPosts.postedTo, dislikedPosts.postedBy, dislikedPosts.postedTo, posts.postedTo, posts.postedBy"
    )
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

router.get("/:id/following", async (req, res) => {
  const id = req.params.id;
  await User.findById(id)
    .select("following")
    .populate("following")
    .then(({ following }) => res.send(following))
    .catch(() => res.status(400).send("Bad Request."));
});

router.post("/update-password", auth, async (req, res) => {
  const user = await User.findById(req.user._id);

  const { oldPassword, newPassword } = req.body;
  const validPassword = await bcrypt.compare(oldPassword, user.password);
  if (!validPassword) return res.status(400).send("Invalid password");

  const salt = await bcrypt.genSalt(10);

  user.password = await bcrypt.hash(newPassword, salt);

  await user.save();

  return res.send(user);
});

router.post("/reset-password", async (req, res) => {
  const email = req.body.email;
  const username = req.body.username;

  let user = await User.findOne({ email });
  if (!user) res.status(400).send("User not found.");
  if (user.username !== username) res.status(400).send("User not found.");

  let expire = Math.floor(Date.now() / 1000) + 20 * 60;
  let payload = { userId: user._id, expire };
  let token = jwt.sign(payload, process.env.JWT_SECRET);

  var transport = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_MAIL,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  ejs.renderFile(
    "./templates/password-reset.ejs",
    { username: user.username, token, image: user.image },
    async function (err, html) {
      if (err) {
        console.log(err);
      } else {
        let message = {
          from: "zura.reddit@gmail.com",
          to: email,
          subject: "Reddit password reset",
          html,
        };
        await transport.sendMail(message, function (err) {
          if (err) {
            res.status(400).send(err);
          } else {
            res.send("Email has been sent.");
          }
        });
      }
    }
  );
});

router.post("/reset-password/submit", async (req, res) => {
  let user = await User.findById(req.body.userId);
  if (!user) res.status(400).send("User not found.");

  const salt = await bcrypt.genSalt(10);

  user.password = await bcrypt.hash(req.body.password, salt);

  await user.save();
  res.send("Password changed succesfully");
});

router.post("/request-confirm-email/", auth, async (req, res) => {
  let user = await User.findById(req.user._id);

  var transport = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_MAIL,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  let expire = Math.floor(Date.now() / 1000) + 20 * 60;
  let payload = { userId: user._id, expire };
  let token = jwt.sign(payload, process.env.JWT_SECRET);

  ejs.renderFile(
    "./templates/email-confirm.ejs",
    { username: user.username, email: user.email, image: user.image, token },
    async function (err, html) {
      if (err) {
        console.log(err);
      } else {
        let message = {
          from: "zura.reddit@gmail.com",
          to: user.email,
          subject: "Verify email address",
          html,
        };
        await transport.sendMail(message, function (err) {
          if (err) {
            res.status(400).send(err);
          } else {
            res.send("Email has been sent.");
          }
        });
      }
    }
  );
});

router.post("/update-mail", auth, async (req, res) => {
  let user = await User.findById(req.user._id);

  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword) return res.status(400).send("Invalid password.");

  if (validPassword) {
    user.email = req.body.newEmail;
    await user.save();
    res.send("Email changed succesfully.");
  }
});

router.delete("/", auth, async (req, res) => {
  let user = await User.findById(req.user._id);
  if (user.createdCommunities) {
    user.createdCommunities.forEach(async (communityId) => {
      await Community.findByIdAndDelete(communityId);
    });
  }
  if (user.posts) {
    user.posts.forEach(async (postId) => {
      await Post.findByIdAndDelete(postId);
    });
  }

  await User.deleteOne({ _id: req.user._id });

  res.send("Deleted succesfully.");
});

router.put("/activeStatus", auth, async (req, res) => {
  const user = await User.findById(req.user._id);

  user.active = req.body.active;

  await user.save();

  res.send(user.active);
});

module.exports = router;
