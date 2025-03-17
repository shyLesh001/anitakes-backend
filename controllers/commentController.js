const { validationResult } = require("express-validator");
const Comment = require("../models/Comment");
const Review = require("../models/Review");

// @desc    Add a comment to a review
// @route   POST /api/reviews/:reviewId/comments
// @access  Private
const addComment = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const review = await Review.findById(req.params.reviewId);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    const comment = await Comment.create({
      text: req.body.text,
      user: req.user._id,
      review: req.params.reviewId,
    });

    res.status(201).json({
      message: "Comment added successfully",
      comment,
    });
  } catch (err) {
    console.error("Add comment error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get all comments for a review (with pagination & sorting)
// @route   GET /api/reviews/:reviewId/comments
// @access  Public
const getCommentsForReview = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 5,
      sortBy = "createdAt",
      order = "desc",
    } = req.query;

    const comments = await Comment.find({ review: req.params.reviewId })
      .populate("user", "username")
      .sort({ [sortBy]: order === "desc" ? -1 : 1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    res.status(200).json(comments);
  } catch (err) {
    console.error("Get comments error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Delete a comment
// @route   DELETE /api/reviews/comment/:commentId
// @access  Private (only comment owner)
const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (comment.user.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "You can only delete your own comments" });
    }

    await comment.deleteOne();
    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (err) {
    console.error("Delete comment error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  addComment,
  getCommentsForReview,
  deleteComment,
};
