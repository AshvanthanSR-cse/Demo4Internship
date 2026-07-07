# CloudVault

CloudVault is a simple Cloud Storage application developed using
Node.js and Express.

This project demonstrates a simple cloud storage workflow where users
can register, login, upload files and view their uploaded files.

---

## Technologies Used

Frontend

- HTML
- CSS
- JavaScript

Backend

- Node.js
- Express.js

Database

- PostgreSQL
- Amazon RDS (Later)

Cloud Storage

- Amazon S3

---

## Project Structure

CloudVault/

frontend/

- index.html
- style.css
- script.js

backend/

- server.js
- database.js
- s3.js
- package.json
- .env

README.md

---

## REST APIs

### Register User

POST

/register

---

### Login

POST

/login

---

### Upload File

POST

/upload

---

### View Files

GET

/files/:username

---

### Health Check

GET

/health

---

## PostgreSQL

Table

users

Columns

- id
- username
- email
- password

---

## Amazon S3

Bucket

cloudvault-storage

Example

cloudvault-storage/

ashvanthan/

photo.png

resume.pdf

john/

project.zip

Each user will have a separate folder inside the same S3 bucket.

---

## Run Backend

Install Packages

npm install

Run

npm start

---

## Frontend

Open

index.html

inside the browser.

---

## Future Improvements

- Password Encryption
- JWT Authentication
- Docker
- Amazon ECR
- Amazon ECS Fargate
- Application Load Balancer
- Auto Scaling
- GitHub Actions CI/CD