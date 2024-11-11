// server.js

const express = require('express');
const http = require('http');
const cors = require('cors');
const mongoose = require('mongoose');
const socketIo = require('socket.io');
const config = require('./config');
const authRoutes = require('./routes/auth');

const app = express();
const server = http.createServer(app);

// Initialize socket.io with CORS settings (specific to socket.io)
const io = socketIo(server, {
  cors: {
    origin: 'http://localhost:3000',  // Allow frontend to connect from localhost:3000
    methods: ['GET', 'POST'],        // Allow only GET and POST methods
    allowedHeaders: ['Content-Type'], // Allow headers if needed
  }
});

app.use(cors()); // Enable CORS for Express
app.use(express.json()); // Parse incoming JSON requests
app.use('/api/auth', authRoutes);  // Authentication routes

let users = [];

io.on('connection', (socket) => {
  console.log('A user connected');

  // Listen for the 'register' event to save the username
  socket.on('register', (username) => {
    socket.username = username;  // Save the username to the socket
    users.push(username);  // Add user to the users list
    console.log(`${username} has joined the chat`);

    // Broadcast message to all users that a new user has joined
    io.emit('message', `${username} has joined the chat!`);

    // Send the current list of connected users
    io.emit('userList', users);
  });

  // Listen for 'sendMessage' event to broadcast messages
  socket.on('sendMessage', (message) => {
    console.log(`${socket.username}: ${message}`);

    // Broadcast message to all users except the sender
    io.emit('message', `${socket.username}: ${message}`);
  });

  // Handle user disconnection event
  socket.on('disconnect', () => {
    console.log(`${socket.username} has disconnected`);

    // Remove the user from the users array
    users = users.filter((user) => user !== socket.username);

    // Broadcast message to all users that a user has left
    io.emit('message', `${socket.username} has left the chat!`);

    // Send the updated user list
    io.emit('userList', users);
  });
});

// Connect to MongoDB
mongoose
  .connect(config.mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log('MongoDB connection error:', err));

// Start the server
server.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
});
