const mongoose = require("mongoose");

const contactInfoSchema = new mongoose.Schema(
  {
    address: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    phoneNote: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    emailNote: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("ContactInfo", contactInfoSchema);
