import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

const socket = io(process.env.REACT_APP_BACKEND_URL);

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    // Fetch existing messages from the backend
    const fetchMessages = async () => {
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/messages`);
      const data = await res.json();
      setMessages(data);
    };
    fetchMessages();

    // Listen for new messages from the server
    socket.on('message', (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    // Cleanup on component unmount
    return () => socket.off('message');
  }, []);

  const sendMessage = async () => {
    if (!input.trim()) return;

    // Emit the message to the server
    const newMessage = { content: input };
    socket.emit('message', newMessage);

    // Save the message in the backend
    await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newMessage),
    });

    setInput(''); // Clear the input field
  };

  return (
    <div>
      <div>
        {messages.map((msg, idx) => (
          <div key={idx}>
            <strong>{msg.user?.username || 'Anonymous'}:</strong> {msg.content}
          </div>
        ))}
      </div>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type a message..."
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
};

export default Chat;
