const mongoose = require("mongoose");
const Joi = require("joi");
const moment = require("moment");
const { number } = require("joi");

var now = Date.now();
var time = moment(now).utc().format("DD-MM-YYYY h:mm");
const { Schema } = mongoose;

const ruleSchema = new Schema({
  name: String,
  description: String,
  communityUsername: String,
  date: { type: String, default: time },
});

function validateRule(rule) {
  const schema = Joi.object({
    name: Joi.string().required().min(2).max(100),
    description: Joi.any(),
    communityUsername: Joi.string(),
    date: Joi.string(),
  });
  return schema.validate(rule);
}

const Rule = mongoose.model("Rule", ruleSchema);

exports.Rule = Rule;
exports.validate = validateRule;
