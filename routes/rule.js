const express = require("express");
const router = express.Router();
const { Rule, validate } = require("../models/Rule");
const auth = require("../middleware/auth");
const isAdmin = require("../middleware/isAdmin");
const { Community } = require("../models/Community");

router.get("/:username", async (req, res) => {
  const { rules } = await Community.findOne({
    username: req.params.username,
  }).populate("rules");

  res.send(rules);
});

router.post("/:username", auth, isAdmin, async (req, res) => {
  const error = validate(req.body);
  if (error && error.error) {
    res.status(400).send(error.error.details[0].message);
  } else {
    const rule = await new Rule({
      name: req.body.name,
      description: req.body.description,
      communityUsername: req.params.username,
    });

    const community = await Community.findOne({
      username: req.params.username,
    });
    if (community.rules) {
      community.rules = [...community.rules, rule._id];
    } else {
      community.rules = [rule._id];
    }
    await community.save();
    await rule.save();
    res.send(rule);
  }
});

router.put("/:username/:rule", auth, isAdmin, async (req, res) => {
  const error = validate(req.body);
  if (error && error.error) {
    res.status(400).send(error.error.details[0].message);
  } else {
    const rule = await Rule.findOneAndUpdate(
      { name: req.params.rule },
      req.body,
      { new: true }
    );

    await rule.save();

    res.send(rule);
  }
});

router.post("/:username/reorderRules", auth, isAdmin, async (req, res) => {
  const community = await Community.findOneAndUpdate(
    {
      username: req.params.username,
    },
    { rules: req.body },
    { new: true }
  );

  res.send(community.rules);
});

router.delete("/:username/:rule", auth, isAdmin, async (req, res) => {
  const community = await Community.findOne({
    username: req.params.username,
  }).populate("rules");
  await Rule.findOneAndRemove({ name: req.params.rule });

  res.send("Deleted");
});

module.exports = router;
