// server.js
// CloudVault Express server

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const multer = require("multer");

const { registerUser, loginUser } = require("./database");
const { createFolder, uploadFile, listFiles } = require("./s3");

const path = require("path");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve the frontend (index.html, style.css, script.js) as static files
app.use(express.static(path.join(__dirname, "frontend")));

// Multer stores the uploaded file in memory so we can stream its buffer to S3
const upload = multer({ storage: multer.memoryStorage() });

// ------------------------------------------------------------------
// GET /health
// ------------------------------------------------------------------
app.get("/health", (req, res) => {
  res.status(200).send("Backend Running");
});

// ------------------------------------------------------------------
// POST /register
// ------------------------------------------------------------------
app.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "username, email, and password are required",
      });
    }

    // Save user record in DynamoDB
    const dbResult = await registerUser(username, email, password);

    if (!dbResult.success) {
      return res.status(400).json(dbResult);
    }

    // Create the user's folder in S3
    const folderResult = await createFolder(username);

    if (!folderResult.success) {
      return res.status(500).json({
        success: false,
        message: folderResult.message,
      });
    }

    return res.status(201).json({
      success: true,
      message: "User Registered Successfully",
    });
  } catch (error) {
    console.error("POST /register error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// ------------------------------------------------------------------
// POST /login
// ------------------------------------------------------------------
app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "username and password are required",
      });
    }

    const result = await loginUser(username, password);

    if (!result.success) {
      return res.status(401).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error("POST /login error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// ------------------------------------------------------------------
// POST /upload
// ------------------------------------------------------------------
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const { username } = req.body;
    const file = req.file;

    if (!username) {
      return res.status(400).json({
        success: false,
        message: "username is required",
      });
    }

    if (!file) {
      return res.status(400).json({
        success: false,
        message: "file is required",
      });
    }

    const result = await uploadFile(username, file);

    if (!result.success) {
      return res.status(500).json(result);
    }

    return res.status(200).json({
      success: true,
      message: "File uploaded successfully",
      key: result.key,
    });
  } catch (error) {
    console.error("POST /upload error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// ------------------------------------------------------------------
// GET /files/:username
// ------------------------------------------------------------------
app.get("/files/:username", async (req, res) => {
  try {
    const { username } = req.params;

    const result = await listFiles(username);

    if (!result.success) {
      return res.status(500).json(result);
    }

    return res.status(200).json({
      success: true,
      files: result.files,
    });
  } catch (error) {
    console.error("GET /files/:username error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// ------------------------------------------------------------------
// Start server
// ------------------------------------------------------------------
app.listen(PORT, '0.0.0.0', () => {
  console.log(`CloudVault backend running on port ${PORT}`);
});
