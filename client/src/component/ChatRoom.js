import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import { TextField, Button, List, ListItem, Typography, CircularProgress } from '@mui/material';
import { FaUserPlus, FaPaperPlane } from 'react-icons/fa';
import './App.css'; // Import the styles

let socket;

const ChatRoom = () => {
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isRegistered, setIsRegistered] = useState(false);
  const [userList, setUserList] = useState([]);
  const [loading, setLoading] = useState(false);

  // Connect to the server when the component mounts
  useEffect(() => {
    socket = io('http://localhost:5000'); // Connect to the backend server

    // Listen for incoming messages from the server
    socket.on('message', (msg) => {
      setMessages((prevMessages) => [...prevMessages, msg]);
    });

    // Listen for user list updates
    socket.on('userList', (users) => {
      setUserList(users);  // Update the list of online users
    });

    // Cleanup when the component is unmounted
    return () => {
      socket.disconnect();
    };
  }, []);

  // Handle user registration
  const handleRegister = () => {
    if (username.trim()) {
      setLoading(true);
      socket.emit('register', username);
      setIsRegistered(true);
      setLoading(false);
    }
  };

  // Handle sending messages
  const handleSendMessage = () => {
    if (message.trim()) {
      socket.emit('sendMessage', message);
      setMessage('');  // Clear input after sending
    }
  };

  return (
    <div className="chat-container">
      {!isRegistered ? (
        <div className="header">
          <Typography variant="h5">Welcome to Chat Room</Typography>
          <TextField
            className="username-input"
            label="Enter Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            variant="outlined"
            fullWidth
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleRegister}
            startIcon={<FaUserPlus />}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Register'}
          </Button>
        </div>
      ) : (
        <div>
          <div className="header">
            <Typography variant="h6">Welcome, {username}!</Typography>
          </div>
          
          <div className="messages">
            {messages.map((msg, index) => (
              <Typography key={index} variant="body1">{msg}</Typography>
            ))}
          </div>

          <div className="input-section">
            <TextField
              label="Type a message..."
              variant="outlined"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              fullWidth
            />
            <Button
              variant="contained"
              color="primary"
              onClick={handleSendMessage}
              startIcon={<FaPaperPlane />}
            >
              Send
            </Button>
          </div>

          <div className="user-list">
            <Typography variant="h6">Online Users:</Typography>
            <List>
              {userList.map((user, index) => (
                <ListItem key={index}>{user}</ListItem>
              ))}
            </List>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatRoom;
