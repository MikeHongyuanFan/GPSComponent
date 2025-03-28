const express = require('express');
const router = express.Router();
const { userStatus, statusHistory } = require('../data/status');
const users = require('../data/users');

// Update user status
router.post('/status', (req, res) => {
  const { userId, status } = req.body;
  
  if (!userId || !status) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  // Validate user exists
  const userExists = users.some(user => user.id === parseInt(userId));
  if (!userExists) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  // Validate status
  const validStatuses = ['WORKING_OFFICE', 'WORKING_REMOTE', 'NOT_WORKING'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status. Must be one of: ' + validStatuses.join(', ') });
  }
  
  const timestamp = new Date().toISOString();
  
  // Update current status
  const oldStatus = userStatus[userId] ? { ...userStatus[userId] } : null;
  
  // If there was a previous status, update its end time
  if (oldStatus) {
    oldStatus.endTime = timestamp;
    
    // Add to history
    if (!statusHistory[userId]) {
      statusHistory[userId] = [];
    }
    statusHistory[userId].push(oldStatus);
  }
  
  // Set new status
  userStatus[userId] = {
    userId: parseInt(userId),
    status,
    startTime: timestamp,
    endTime: null
  };
  
  res.json(userStatus[userId]);
});

// Get user status
router.get('/status/:userId', (req, res) => {
  const userId = parseInt(req.params.userId);
  
  if (!userStatus[userId]) {
    return res.status(404).json({ error: 'No status found for this user' });
  }
  
  res.json(userStatus[userId]);
});

module.exports = router;
