const mongoose = require("mongoose");
const Joi = require("joi");

const { Schema } = mongoose;

const categorySchema = new Schema({
  name: String,
});

const Category = mongoose.model("Category", categorySchema);

function validateCategory(category) {
  const schema = Joi.object({
    name: Joi.string().required().label("Name"),
  });
  return schema.validate(category);
}

exports.Category = Category;
exports.validate = validateCategory;
