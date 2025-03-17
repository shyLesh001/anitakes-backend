const { validationResult } = require("express-validator");
const Review = require("../models/Review");
const Comment = require("../models/Comment");
const cloudinary = require("../utils/cloudinary");

// @desc    Create a review
// @route   POST /api/reviews
// @access  Private (protected)
const createReview = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { animeTitle, reviewText, rating, animeImage } = req.body; // Get animeImage (poster) from the request body

    // Check if all required fields are provided
    if (!animeTitle || !reviewText || !rating || !animeImage) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const review = new Review({
      animeTitle,
      reviewText,
      rating,
      animeImage, // Save anime poster image URL
      user: req.user._id, // Assuming user is authenticated via `protect` middleware
    });

    // Optional image upload (user-uploaded image)
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path);
      review.imageUrl = result.secure_url;
      review.imagePublicId = result.public_id;
    }

    // Save the review to the database
    await review.save();
    res.status(201).json(review); // Return the created review
  } catch (err) {
    console.error("Create review error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get all reviews
// @route   GET /api/reviews
// @access  Public
const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find().populate("user", "username"); // Optionally populate user to show username only
    res.status(200).json(reviews); // Send back the reviews
  } catch (err) {
    console.error("Get reviews error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get a single review by ID
// @route   GET /api/reviews/:id
// @access  Public
const getReviewById = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id).populate("user", "username");

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    res.status(200).json(review);
  } catch (err) {
    console.error("Get review error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Update a review
// @route   PUT /api/reviews/:id
// @access  Private (protected)
const updateReview = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Update review fields
    review.animeTitle = req.body.animeTitle || review.animeTitle;
    review.reviewText = req.body.reviewText || review.reviewText;
    review.rating = req.body.rating || review.rating;

    // Optional: replace image
    if (req.file) {
      if (review.imagePublicId) {
        await cloudinary.uploader.destroy(review.imagePublicId);
      }
      const result = await cloudinary.uploader.upload(req.file.path);
      review.imageUrl = result.secure_url;
      review.imagePublicId = result.public_id;
    }

    await review.save();
    res.status(200).json(review);
  } catch (err) {
    console.error("Update review error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private (protected)
const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized action" });
    }

    if (review.imagePublicId) {
      await cloudinary.uploader.destroy(review.imagePublicId);
    }

    await Comment.deleteMany({ review: review._id });
    await review.deleteOne();

    res.status(200).json({
      message: "Review, image, and related comments deleted successfully.",
    });
  } catch (err) {
    console.error("Delete review error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createReview,
  getAllReviews,
  getReviewById,
  updateReview,
  deleteReview,
};
