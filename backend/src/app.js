const express = require('express');
const cors = require('cors');

const app = express();

// Middleware — these two lines allow the app to receive JSON data
// and allow the mobile app to communicate with this server
app.use(cors());
app.use(express.json());

// Test route — just to confirm the server is working
app.get('/', (req, res) => {
  res.json({ message: 'Restau API is running' });
});

// Routes will go here as you build them
// app.use('/api/auth', require('./modules/auth/auth.routes'));
// app.use('/api/users', require('./modules/users/users.routes'));
// etc.

module.exports = app;