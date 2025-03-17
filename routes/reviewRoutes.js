const express = require("express");
const {
  createReview,
  getAllReviews,
  getReviewById, // Add this import for the new controller function
  updateReview,
  deleteReview,
} = require("../controllers/reviewController");
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/multer");
const { body } = require("express-validator");

const router = express.Router();

// ✅ Create a new review (Protected, With Image Upload)
router.post(
  "/",
  protect,
  upload.single("image"),
  [
    body("animeTitle").notEmpty().withMessage("Anime title is required"),
    body("reviewText")
      .isLength({ min: 10 })
      .withMessage("Review text must be at least 10 characters"),
    body("rating")
      .isInt({ min: 1, max: 10 })
      .withMessage("Rating must be between 1 and 10"),
  ],
  createReview
);

// ✅ Update an existing review (Protected, With Image Upload)
router.put(
  "/:id",
  protect,
  upload.single("image"),
  [
    body("animeTitle")
      .optional()
      .notEmpty()
      .withMessage("Anime title cannot be empty"),
    body("reviewText")
      .optional()
      .isLength({ min: 10 })
      .withMessage("Review text must be at least 10 characters"),
    body("rating")
      .optional()
      .isInt({ min: 1, max: 10 })
      .withMessage("Rating must be between 1 and 10"),
  ],
  updateReview
);

// ✅ Get all reviews (Public) with Pagination & Sorting
router.get("/", getAllReviews);

// ✅ Get a specific review by ID (Public)
router.get("/:id", getReviewById); // Add this line to get review by ID

// ✅ Delete a review (Protected)
router.delete("/:id", protect, deleteReview);

module.exports = router;
