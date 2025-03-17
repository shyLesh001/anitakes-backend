// /middleware/multer.js
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../utils/cloudinary");

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "anitakes",
    allowed_formats: ["jpeg", "png", "jpg", "webp"],
  },
});

const upload = multer({ storage: storage });

module.exports = upload;
