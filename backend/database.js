// database.js
// Handles all DynamoDB operations for CloudVault (Users table)

require("dotenv").config();

const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
} = require("@aws-sdk/lib-dynamodb");

const REGION = process.env.AWS_REGION || "us-east-1";
const TABLE_NAME = process.env.DYNAMODB_TABLE;

// Base low-level DynamoDB client
const client = new DynamoDBClient({ region: REGION });

// Document client lets us work with plain JS objects instead of AttributeValue maps
const docClient = DynamoDBDocumentClient.from(client);

/**
 * Registers a new user in DynamoDB.
 * Checks if the username already exists before creating.
 *
 * @param {string} username
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{success: boolean, message: string}>}
 */
async function registerUser(username, email, password) {
  try {
    // Check if user already exists
    const existingUser = await docClient.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: { username },
      })
    );

    if (existingUser.Item) {
      return { success: false, message: "Username already exists" };
    }

    // Save new user (password stored as plain text - learning project only)
    await docClient.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: {
          username,
          email,
          password,
        },
      })
    );

    return { success: true, message: "User Registered Successfully" };
  } catch (error) {
    console.error("registerUser error:", error);
    return { success: false, message: "Failed to register user" };
  }
}

/**
 * Validates login credentials against DynamoDB.
 *
 * @param {string} username
 * @param {string} password
 * @returns {Promise<{success: boolean, message: string}>}
 */
async function loginUser(username, password) {
  try {
    const result = await docClient.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: { username },
      })
    );

    if (!result.Item) {
      return { success: false, message: "User not found" };
    }

    if (result.Item.password !== password) {
      return { success: false, message: "Incorrect password" };
    }

    return { success: true, message: "Login Successful" };
  } catch (error) {
    console.error("loginUser error:", error);
    return { success: false, message: "Failed to login" };
  }
}

module.exports = {
  registerUser,
  loginUser,
};
