const express = require("express");
const router = express.Router();
const { Category, validate } = require("../models/Category");
const auth = require("../middleware/auth");

router.get("/", async (req, res) => {
  const categories = await Category.find({});
  res.send(categories);
});

router.get("/:value", async (req, res) => {
  const category = await Category.find({ value: req.params.value });
  res.send(category);
});

router.post("/", auth, async (req, res) => {
  const { error } = validate(req.body);
  if (error) res.status(400).send(error.details[0].message);

  let category = await Category.findOne({ name: req.body.name });
  if (category) res.status(400).send("Category already exists.");

  category = await new Category(req.body);

  category.value = req.body.name
    .split(" ")
    .join("_")
    .split("&")
    .join("and")
    .toLowerCase();

  await category.save();

  res.send(category);
});

module.exports = router;
