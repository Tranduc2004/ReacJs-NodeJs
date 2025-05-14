const mongoose = require("mongoose");

const footerSchema = new mongoose.Schema(
  {
    topInfo: [
      {
        icon: {
          type: String,
          required: true,
        },
        text: {
          type: String,
          required: true,
        },
      },
    ],
    categories: [
      {
        title: {
          type: String,
          required: true,
        },
        items: [
          {
            type: String,
            required: true,
          },
        ],
      },
    ],
    contactInfo: {
      phone: {
        type: String,
        required: true,
      },
      workingHours: {
        type: String,
        required: true,
      },
    },
    appDownload: {
      title: {
        type: String,
        required: true,
      },
      subtitle: {
        type: String,
        required: true,
      },
      googlePlayLink: {
        type: String,
        required: true,
      },
      appStoreLink: {
        type: String,
        required: true,
      },
    },
    socialMedia: {
      facebook: {
        type: String,
        required: true,
      },
      twitter: {
        type: String,
        required: true,
      },
      instagram: {
        type: String,
        required: true,
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Footer", footerSchema);
