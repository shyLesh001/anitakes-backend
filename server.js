// Load environment variables first
require("dotenv").config();

// Import dependencies
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

// Import route files
const userRoutes = require("./routes/userRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const commentRoutes = require("./routes/commentRoutes");

// Initialize Express app
const app = express();

// Middlewares
app.use(express.json());
app.use(cors());

// Routes
app.use("/api/users", userRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/reviews", commentRoutes);  // 🔥 Fix nested routes


// Connect to MongoDB Atlas
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected successfully!"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1); // Stops the app if DB connection fails
  });

// Test route
app.get("/", (req, res) => {
  res.send("AniTakes API is running 🚀");
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});
