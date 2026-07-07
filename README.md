# CloudVault

CloudVault is a simple cloud storage application built to demonstrate AWS
cloud architecture. It allows a user to register, log in, upload files, and
view their uploaded files. The frontend is intentionally minimal (plain
HTML/CSS/JavaScript) — the focus of this project is the backend integration
with **Amazon S3** and **Amazon DynamoDB**.

## Features

- Register a new user
- Login with username and password
- Upload files to a personal, per-user folder in S3
- View a list of previously uploaded files

There is no delete, update, admin, or profile functionality by design.

## Folder Structure

```
CloudVault/
├── frontend/
│   ├── index.html      Register / Login / Dashboard UI
│   ├── style.css        Basic styling
│   └── script.js        Fetch calls to the backend API
├── backend/
│   ├── server.js         Express server and route definitions
│   ├── database.js       DynamoDB logic (registerUser, loginUser)
│   ├── s3.js              S3 logic (createFolder, uploadFile, listFiles)
│   ├── package.json      Backend dependencies
│   └── .env.example      Environment variable template
└── README.md
```

## Installation

### 1. Install backend dependencies

```bash
cd backend
npm install
```

### 2. Configure environment variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

```
AWS_REGION=us-east-1
S3_BUCKET=cloudvault-storage
DYNAMODB_TABLE=Users
PORT=5000
```

Make sure your AWS credentials are available to the AWS SDK, either via:
- The AWS CLI (`aws configure`)
- Environment variables (`AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY`)
- An IAM role (if running on EC2 / ECS / Lambda)

### 3. Start the backend server

```bash
npm start
```

The server will start on `http://localhost:5000` (or whatever `PORT` you set).

### 4. Open the frontend

Open `frontend/index.html` directly in your browser, or serve it with any
static file server. It will call the backend at `http://localhost:5000` by
default — update the `API_BASE_URL` constant in `script.js` if your backend
runs elsewhere.

## AWS Setup

### DynamoDB Table

Create a table named **Users** with:

| Setting        | Value      |
|----------------|------------|
| Table name     | Users      |
| Partition key  | username (String) |

No sort key is required. Attributes `email` and `password` are stored as
regular item attributes (no schema needed beyond the partition key).

> Note: passwords are stored as plain text for this learning project. Do not
> use this pattern in a production application.

You can create it via the AWS CLI:

```bash
aws dynamodb create-table \
  --table-name Users \
  --attribute-definitions AttributeName=username,AttributeType=S \
  --key-schema AttributeName=username,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST
```

### S3 Bucket

Create a bucket named **cloudvault-storage** (or update `S3_BUCKET` in your
`.env` to match your own bucket name — S3 bucket names must be globally
unique).

```bash
aws s3 mb s3://cloudvault-storage --region us-east-1
```

When a user registers, the backend automatically creates a folder for them
inside this bucket:

```
cloudvault-storage/
├── ashvanthan/
│   ├── resume.pdf
│   └── photo.png
└── john/
    └── project.zip
```

### Required IAM Permissions

The IAM user or role running this backend needs at least:

- `dynamodb:GetItem`
- `dynamodb:PutItem`
- `s3:PutObject`
- `s3:ListBucket`

## API Endpoints

### `GET /health`

Returns a plain text health check.

**Response:** `Backend Running`

---

### `POST /register`

Registers a new user, saves them to DynamoDB, and creates their S3 folder.

**Request body (JSON):**
```json
{
  "username": "ashvanthan",
  "email": "ashvanthan@example.com",
  "password": "mypassword"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User Registered Successfully"
}
```

---

### `POST /login`

Validates a username and password against DynamoDB.

**Request body (JSON):**
```json
{
  "username": "ashvanthan",
  "password": "mypassword"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login Successful"
}
```

---

### `POST /upload`

Uploads a file into the user's folder in S3.

**Request:** `multipart/form-data`
- `username` (text field)
- `file` (file field)

**Response:**
```json
{
  "success": true,
  "message": "File uploaded successfully",
  "key": "ashvanthan/resume.pdf"
}
```

---

### `GET /files/:username`

Returns every file inside the given user's S3 folder.

**Response:**
```json
{
  "success": true,
  "files": [
    { "name": "resume.pdf", "size": 10234, "lastModified": "2026-07-01T10:00:00.000Z" },
    { "name": "photo.png", "size": 45021, "lastModified": "2026-07-02T09:15:00.000Z" }
  ]
}
```

## Tech Stack

- **Frontend:** HTML, CSS, Vanilla JavaScript
- **Backend:** Node.js, Express.js
- **Database:** Amazon DynamoDB
- **File Storage:** Amazon S3
- **Other packages:** cors, multer, dotenv, AWS SDK v3
