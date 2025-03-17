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
    const { animeTitle, reviewText, rating, animeImage } = req.body; // Get animeImage from request body

    // Check if required fields are present
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
    res.status(201).json(review); // Send the created review back as response
  } catch (err) {
    console.error("Create review error:", err);
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
