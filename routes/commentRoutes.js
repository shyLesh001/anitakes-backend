const express = require("express");
const router = express.Router();
const {
  addComment,
  getCommentsForReview,
  deleteComment,
} = require("../controllers/commentController");
const { protect } = require("../middleware/authMiddleware");
const { body } = require("express-validator");

// ✅ Add validation for adding a comment
router.post(
  "/:reviewId/comments",
  protect,
  [body("text").notEmpty().withMessage("Comment text cannot be empty")],
  addComment
);

// ✅ Get all comments for a specific review (Public, With Pagination & Sorting)
router.get("/:reviewId/comments", getCommentsForReview);

// ✅ Delete a comment (Only the comment owner can delete)
router.delete("/comment/:commentId", protect, deleteComment);

module.exports = router;
