const express = require("express");
const router = express.Router();
const { DraftPost } = require("../models/DraftPost");

const auth = require("../middleware/auth");
const { User } = require("../models/User");

router.get("/", auth, async (req, res) => {
  let draftPosts = await DraftPost.find({ postedBy: req.user._id });

  res.send(draftPosts);
});

router.post("/", auth, async (req, res) => {
  let draftPost = new DraftPost(req.body);
  draftPost.postedBy = req.user._id;

  let user = await User.findById(req.user._id);
  if (!user) res.status(400).send("No user found.");

  user.drafts.push(draftPost);

  draftPost.save();
  user.save();
  res.send(draftPost);
});

router.delete("/:id", auth, async (req, res) => {
  let user = await User.findById(req.user._id);

  if (user.drafts.includes(req.params.id)) {
    await DraftPost.findByIdAndDelete(req.params.id);
    user.drafts.splice(req.params.id, 1);
    user.save();
    res.send("Deleted Succesfully.");
  }
  res.status(400).send("Can not delete.");
});

module.exports = router;
