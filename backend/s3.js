// s3.js
// Handles all S3 operations for CloudVault

require("dotenv").config();

const {
  S3Client,
  PutObjectCommand,
  ListObjectsV2Command,
} = require("@aws-sdk/client-s3");

const REGION = process.env.AWS_REGION || "us-east-1";
const BUCKET_NAME = process.env.S3_BUCKET;

const s3Client = new S3Client({ region: REGION });

/**
 * Creates a "folder" for a user inside the S3 bucket.
 * S3 doesn't have real folders, so we create a zero-byte object
 * ending in "/" to represent one.
 *
 * @param {string} username
 */
async function createFolder(username) {
  try {
    await s3Client.send(
      new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: `${username}/`,
        Body: "",
      })
    );
    return { success: true };
  } catch (error) {
    console.error("createFolder error:", error);
    return { success: false, message: "Failed to create user folder in S3" };
  }
}

/**
 * Uploads a file into the given user's folder inside the bucket.
 *
 * @param {string} username
 * @param {object} file - multer file object (has originalname, buffer, mimetype)
 */
async function uploadFile(username, file) {
  try {
    const key = `${username}/${file.originalname}`;

    await s3Client.send(
      new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      })
    );

    return { success: true, key };
  } catch (error) {
    console.error("uploadFile error:", error);
    return { success: false, message: "Failed to upload file to S3" };
  }
}

/**
 * Lists every file inside a user's folder in the bucket.
 *
 * @param {string} username
 */
async function listFiles(username) {
  try {
    const prefix = `${username}/`;

    const result = await s3Client.send(
      new ListObjectsV2Command({
        Bucket: BUCKET_NAME,
        Prefix: prefix,
      })
    );

    const files = (result.Contents || [])
      // Remove the folder placeholder object itself from the results
      .filter((item) => item.Key !== prefix)
      .map((item) => ({
        name: item.Key.replace(prefix, ""),
        size: item.Size,
        lastModified: item.LastModified,
      }));

    return { success: true, files };
  } catch (error) {
    console.error("listFiles error:", error);
    return { success: false, message: "Failed to list files from S3" };
  }
}

module.exports = {
  createFolder,
  uploadFile,
  listFiles,
};
