const express = require("express");
const router = express.Router();
const multer = require("multer");
var path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.dirname(require.main.filename) + "/uploads/images");
  },
  filename: (req, file, cb) => {
    const fileName = file.originalname.toLowerCase().split(" ").join("-");
    cb(null, fileName);
  },
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === "image/png" ||
      file.mimetype === "image/jpg" ||
      file.mimetype === "image/jpeg"
    ) {
      cb(null, true);
    } else {
      cb(null, false);
      return cb(new Error("Only .png .jpg and .jpeg files are allowed"));
    }
  },
});

router.post("/upload", upload.single("photo"), (req, res) => {
  if (req.file) {
    res.send(req.file);
  } else res.send("Error");
});

module.exports = router;
