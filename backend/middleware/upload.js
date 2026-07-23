// -------------------------------------------------------------------------
// middleware/upload.js
//
// Configures Multer for handling payment screenshot uploads.
// - Stores files on disk in /uploads with a unique, collision-safe name.
// - Restricts uploads to image files only (png/jpg/jpeg).
// - Caps file size at 10MB (matches the frontend's own limit).
// -------------------------------------------------------------------------

const multer = require("multer");
const path = require("path");
const fs = require("fs");

const UPLOAD_DIR = path.join(__dirname, "..", "uploads");

// Make sure the uploads directory exists at startup.
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    // Example result: 1721460000000-a1b2c3d4.png
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

const ALLOWED_MIME_TYPES = ["image/png", "image/jpeg"];

function fileFilter(req, file, cb) {
  const isAllowedMime = ALLOWED_MIME_TYPES.includes(file.mimetype);
  const isAllowedExt = /\.(png|jpe?g)$/i.test(file.originalname);

  if (isAllowedMime && isAllowedExt) {
    cb(null, true);
  } else {
    cb(new Error("Unsupported file type. Only PNG, JPG and JPEG images are allowed."));
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB — matches frontend validation
  },
});

module.exports = upload;
