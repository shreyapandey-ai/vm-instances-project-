const express = require('express');
const cors = require('cors');        // Import cors
const bcrypt = require('bcrypt');
const { Storage } = require('@google-cloud/storage');
const fs = require('fs');

// Declare app first
const app = express();

// Then use middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));



// GCS client (uses VM service account automatically)
const storage = new Storage();
const bucketName = 'user-data-bucket-shreyas';
const fileName = 'users.csv';

// Create CSV header if file not exists
async function ensureCSV() {
  const bucket = storage.bucket(bucketName);
  const file = bucket.file(fileName);

  const [exists] = await file.exists();
  if (!exists) {
    await file.save('username,password_hash,login_time\n');
  }
}

// Login endpoint
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).send('Missing fields');
  }

  const hash = await bcrypt.hash(password, 10);
  const row = `${username},${hash},${new Date().toISOString()}\n`;

  const bucket = storage.bucket(bucketName);
  const file = bucket.file(fileName);

  await ensureCSV();

  // Append row
  const temp = `/tmp/${fileName}`;
  await file.download({ destination: temp });
  fs.appendFileSync(temp, row);
  await file.save(fs.readFileSync(temp));

  res.send('Login saved');
});

app.listen(3000, '0.0.0.0', () => {
  console.log('Backend running on port 3000');
});
