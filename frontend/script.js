// script.js
// Handles all frontend logic for CloudVault

// Automatically uses whatever host/port the page was loaded from.
// This way it works no matter what port you map in `docker run -p HOST:5000`,
// and it'll keep working later when you deploy to EC2/a real domain.
const API_BASE_URL = window.location.origin;

// Holds the currently logged in username (in-memory only)
let currentUsername = null;

// ------------------------------------------------------------------
// Element references
// ------------------------------------------------------------------
const registerSection = document.getElementById("register-section");
const loginSection = document.getElementById("login-section");
const dashboardSection = document.getElementById("dashboard-section");

const registerForm = document.getElementById("register-form");
const loginForm = document.getElementById("login-form");
const uploadForm = document.getElementById("upload-form");

const registerMessage = document.getElementById("register-message");
const loginMessage = document.getElementById("login-message");
const uploadMessage = document.getElementById("upload-message");

const dashboardUsername = document.getElementById("dashboard-username");
const fileList = document.getElementById("file-list");

const showLoginLink = document.getElementById("show-login-link");
const showRegisterLink = document.getElementById("show-register-link");
const logoutButton = document.getElementById("logout-button");
const refreshFilesButton = document.getElementById("refresh-files-button");

// ------------------------------------------------------------------
// View helpers
// ------------------------------------------------------------------
function showSection(section) {
  registerSection.classList.add("hidden");
  loginSection.classList.add("hidden");
  dashboardSection.classList.add("hidden");
  section.classList.remove("hidden");
}

showLoginLink.addEventListener("click", (e) => {
  e.preventDefault();
  showSection(loginSection);
});

showRegisterLink.addEventListener("click", (e) => {
  e.preventDefault();
  showSection(registerSection);
});

// ------------------------------------------------------------------
// REGISTER
// ------------------------------------------------------------------
registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = document.getElementById("register-username").value.trim();
  const email = document.getElementById("register-email").value.trim();
  const password = document.getElementById("register-password").value;

  registerMessage.textContent = "Registering...";

  try {
    const response = await fetch(`${API_BASE_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
    });

    const data = await response.json();
    registerMessage.textContent = data.message;

    if (response.ok && data.success) {
      registerForm.reset();
      setTimeout(() => showSection(loginSection), 1000);
    }
  } catch (error) {
    console.error("Register error:", error);
    registerMessage.textContent = "Something went wrong. Please try again.";
  }
});

// ------------------------------------------------------------------
// LOGIN
// ------------------------------------------------------------------
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = document.getElementById("login-username").value.trim();
  const password = document.getElementById("login-password").value;

  loginMessage.textContent = "Logging in...";

  try {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();
    loginMessage.textContent = data.message;

    if (response.ok && data.success) {
      currentUsername = username;
      dashboardUsername.textContent = currentUsername;
      loginForm.reset();
      loginMessage.textContent = "";
      showSection(dashboardSection);
      loadFiles();
    }
  } catch (error) {
    console.error("Login error:", error);
    loginMessage.textContent = "Something went wrong. Please try again.";
  }
});

// ------------------------------------------------------------------
// LOGOUT
// ------------------------------------------------------------------
logoutButton.addEventListener("click", () => {
  currentUsername = null;
  fileList.innerHTML = "";
  showSection(loginSection);
});

// ------------------------------------------------------------------
// UPLOAD
// ------------------------------------------------------------------
uploadForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const fileInput = document.getElementById("file-input");
  const file = fileInput.files[0];

  if (!file || !currentUsername) {
    uploadMessage.textContent = "Please select a file first.";
    return;
  }

  const formData = new FormData();
  formData.append("username", currentUsername);
  formData.append("file", file);

  uploadMessage.textContent = "Uploading...";

  try {
    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    uploadMessage.textContent = data.message;

    if (response.ok && data.success) {
      uploadForm.reset();
      loadFiles();
    }
  } catch (error) {
    console.error("Upload error:", error);
    uploadMessage.textContent = "Something went wrong. Please try again.";
  }
});

// ------------------------------------------------------------------
// LIST FILES
// ------------------------------------------------------------------
async function loadFiles() {
  if (!currentUsername) return;

  fileList.innerHTML = "<li>Loading files...</li>";

  try {
    const response = await fetch(`${API_BASE_URL}/files/${currentUsername}`);
    const data = await response.json();

    fileList.innerHTML = "";

    if (response.ok && data.success) {
      if (data.files.length === 0) {
        fileList.innerHTML = "<li>No files uploaded yet.</li>";
        return;
      }

      data.files.forEach((file) => {
        const li = document.createElement("li");
        li.textContent = file.name;
        fileList.appendChild(li);
      });
    } else {
      fileList.innerHTML = "<li>Failed to load files.</li>";
    }
  } catch (error) {
    console.error("Load files error:", error);
    fileList.innerHTML = "<li>Something went wrong loading files.</li>";
  }
}

refreshFilesButton.addEventListener("click", loadFiles);
