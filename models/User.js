const mongoose = require("mongoose");

// Create a schema for Users
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  { timestamps: true } // Automatically creates "createdAt" & "updatedAt"
);

// Export model to use it elsewhere
module.exports = mongoose.model("User", userSchema);
