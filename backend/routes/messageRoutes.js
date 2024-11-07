const express = require('express');
const Message = require('../models/Message');
const router = express.Router();

// Get Messages
router.get('/', async (req, res) => {
  const messages = await Message.find().populate('user', 'username');
  res.json(messages);
});

// Post Message
router.post('/', async (req, res) => {
  const message = new Message(req.body);
  await message.save();
  res.json(message);
});

module.exports = router;
