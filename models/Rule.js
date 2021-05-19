const mongoose = require("mongoose");
const Joi = require("joi");

const { Schema } = mongoose;

const ruleSchema = new Schema({
  name: String,
  description: String,
});

function validateRule(rule) {
  const schema = Joi.object({
    name: Joi.string().required().min(2).max(100),
    description: Joi.string().max(500),
  });
}

const Rule = mongoose.model("Rule", ruleSchema);

exports.Rule = Rule;
exports.validate = validateRule;
