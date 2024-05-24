const express = require('express'); // Importing Express.js framework
const mongoose = require('mongoose'); // Importing Mongoose for MongoDB interactions
const bcrypt = require('bcryptjs'); // Importing bcrypt for password hashing
const bodyParser = require('body-parser'); // Middleware for parsing request bodies
const cors = require('cors'); // Middleware for enabling CORS
const jwt = require('jsonwebtoken');
const authenticateToken = require('./middleware/authMiddleware');

const app = express(); // Creating an Express application
app.use(cors()); // Using CORS middleware to enable cross-origin requests
app.use(bodyParser.json()); // Using bodyParser middleware to parse JSON request bodies


//testing jwt protected route
app.get('/test', authenticateToken, (req, res) => {
  res.send('This is a protected test endpoint!');
});


const PORT = process.env.PORT || 3000; // Define port for the server to listen on
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`); // Log server start message
});
