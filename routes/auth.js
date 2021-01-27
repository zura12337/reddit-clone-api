const express = require("express");
const router = express.Router();
const { User } = require("../models/User");
const Joi = require("joi");
const _ = require("lodash");
const bcrypt = require("bcrypt");

router.post("/", async (req, res) => {
  let user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(400).send("Invalid Email or Password");

  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword) return res.status(400).send("Invalid Email or Password");

  const token = user.generateAuthToken();
  res.send(token);
});

function validate(user) {
  const schema = Joi.object({
    email: Joi.string().email().required().label("Email"),
    password: Joi.string().min(4).required().label("Password"),
  });
  return schema.validate(user);
}

module.exports = router;
