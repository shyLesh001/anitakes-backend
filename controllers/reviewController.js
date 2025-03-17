const { validationResult } = require("express-validator");
const Review = require("../models/Review");
const Comment = require("../models/Comment");
const cloudinary = require("../utils/cloudinary");

// @desc    Create a review
const createReview = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { animeTitle, reviewText, rating } = req.body;

    const review = new Review({
      animeTitle,
      reviewText,
      rating,
      user: req.user._id,
    });

    // Optional image upload
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path);
      review.imageUrl = result.secure_url;
      review.imagePublicId = result.public_id;
    }

    await review.save();
    res.status(201).json(review);
  } catch (err) {
    console.error("Create review error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get all reviews (with pagination & sorting)
const getAllReviews = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      order = "desc",
    } = req.query;

    const reviews = await Review.find()
      .populate("user", "username") // Show only username, not full user object
      .sort({ [sortBy]: order === "desc" ? -1 : 1 }) // Sort by date or rating
      .limit(parseInt(limit)) // Convert to number
      .skip((parseInt(page) - 1) * parseInt(limit)); // Skip results for pagination

    res.status(200).json(reviews);
  } catch (err) {
    console.error("Get reviews error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get a single review by ID
const getReviewById = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id).populate(
      "user",
      "username"
    );

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    res.status(200).json(review);
  } catch (err) {
    console.error("Error fetching review by ID:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Update a review
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
  getReviewById, // Make sure this is exported
  updateReview,
  deleteReview,
};
