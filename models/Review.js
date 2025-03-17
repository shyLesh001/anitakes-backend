const mongoose = require("mongoose");
const Comment = require("./Comment"); // ✅ Add this to access the Comment model

const reviewSchema = new mongoose.Schema(
  {
    animeTitle: {
      type: String,
      required: true,
    },
    reviewText: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
    },
    imageUrl: {
      type: String,
    },
    imagePublicId: {
      type: String,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

// ✅ OPTIONAL: Mongoose middleware to auto-delete comments when review is deleted
reviewSchema.pre("remove", async function (next) {
  await Comment.deleteMany({ review: this._id });
  next();
});

module.exports = mongoose.model("Review", reviewSchema);
