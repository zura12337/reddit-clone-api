const express = require("express");
const router = express.Router();
const { Category, validate } = require("../models/Category");
const auth = require("../middleware/auth");

router.get("/", async (req, res) => {
  const categories = await Category.find({});
  res.send(categories);
});

router.get("/:name", async (req, res) => {
  const categories = await Category.find({ name: req.body.name });
  res.send(categories);
});

router.post("/", auth, async (req, res) => {
  const { error } = validate(req.body);
  if (error) res.status(400).send(error.details[0].message);

  let category = await Category.findOne({ name: req.body.name });
  if (category) res.status(400).send("Category already exists.");

  category = await new Category(req.body);
  await category.save();

  res.send(category);
});

module.exports = router;
