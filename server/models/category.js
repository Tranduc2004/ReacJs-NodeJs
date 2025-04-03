const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  color: {
    type: String,
    required: true,
  },
});
categorySchema.set("toJSON", {
  virtuals: true,
});

exports.Category = mongoose.model("Category", categorySchema);
exports.categorySchema = categorySchema;
