const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const { Storage } = require("@google-cloud/storage");
const fs = require("fs");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const storage = new Storage();
const bucketName = "user-data-bucket-shreyas";
const fileName = "users.csv";

const bucket = storage.bucket(bucketName);
const file = bucket.file(fileName);

const tempPath = path.join("/tmp", fileName);

// Ensure CSV exists
async function ensureCSV() {
  const [exists] = await file.exists();
  if (!exists) {
    await file.save("username,password_hash,is_logged_in\n");
  }
}

// Download CSV
async function downloadCSV() {
  await ensureCSV();
  await file.download({ destination: tempPath });
}

// Upload CSV
async function uploadCSV() {
  await file.save(fs.readFileSync(tempPath));
}

// Parse CSV
function parseCSV() {
  const data = fs.readFileSync(tempPath, "utf-8");
  const lines = data.trim().split("\n").slice(1);
  const users = {};

  for (const line of lines) {
    const [username, hash, loggedIn] = line.split(",");
    users[username] = {
      hash,
      loggedIn: loggedIn === "true"
    };
  }

  return users;
}

// Write CSV from object
function writeCSV(users) {
  let content = "username,password_hash,is_logged_in\n";

  for (const username in users) {
    content += `${username},${users[username].hash},${users[username].loggedIn}\n`;
  }

  fs.writeFileSync(tempPath, content);
}

// ===== REGISTER =====
app.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password)
      return res.status(400).send("Missing fields");

    await downloadCSV();
    const users = parseCSV();

    if (users[username])
      return res.status(400).send("User already exists");

    const hash = await bcrypt.hash(password, 10);

    users[username] = {
      hash,
      loggedIn: false
    };

    writeCSV(users);
    await uploadCSV();

    res.send("Registration successful");

  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// ===== LOGIN =====
app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password)
      return res.status(400).send("Missing fields");

    await downloadCSV();
    const users = parseCSV();

    if (!users[username])
      return res.status(401).send("Invalid credentials");

    if (users[username].loggedIn)
      return res.status(403).send("User already logged in");

    const match = await bcrypt.compare(password, users[username].hash);

    if (!match)
      return res.status(401).send("Invalid credentials");

    users[username].loggedIn = true;

    writeCSV(users);
    await uploadCSV();

    res.send("Login successful");

  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// ===== LOGOUT =====
app.post("/logout", async (req, res) => {
  try {
    const { username } = req.body;

    if (!username)
      return res.status(400).send("Missing username");

    await downloadCSV();
    const users = parseCSV();

    if (!users[username])
      return res.status(400).send("User not found");

    users[username].loggedIn = false;

    writeCSV(users);
    await uploadCSV();

    res.send("Logged out successfully");

  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
