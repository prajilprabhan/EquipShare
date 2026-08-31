const mongoose = require("mongoose");

const ContactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
    },
    department: {
      type: String,
      default: "general",
    },
    subject: {
      type: String,
      default: "Campus Equipment & Lab Inquiry",
      trim: true,
    },
    message: {
      type: String,
      required: [true, "Message is required"],
      trim: true,
    },
    status: {
      type: String,
      enum: ["unread", "read", "resolved"],
      default: "unread",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Contact", ContactSchema);
