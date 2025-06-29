// server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const path = require('path');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Load and verify route file
try {
  const authRoutes = require('./routes/auth'); // ✅ Must export a valid router
  app.use('/auth', authRoutes); // Attach routes
} catch (error) {
  console.error('❌ Error loading /auth route:', error.message);
}
// Add this before app.listen()
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:5000`);
});
