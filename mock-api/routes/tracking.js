const express = require('express');
const router = express.Router();
const { userTrackingData, currentLocations } = require('../data/locations');

// Submit location data
router.post('/location', (req, res) => {
  const { userId, trackingType, latitude, longitude, accuracy, batteryLevel, networkType } = req.body;
  
  if (!userId || !trackingType || !latitude || !longitude) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  // Generate a new tracking entry
  const newTrackingEntry = {
    id: Date.now(), // Simple ID generation
    userId,
    trackingType,
    latitude,
    longitude,
    timestamp: new Date().toISOString(),
    accuracy: accuracy || null,
    batteryLevel: batteryLevel || null,
    networkType: networkType || null
  };
  
  // Add to tracking data
  if (!userTrackingData[userId]) {
    userTrackingData[userId] = [];
  }
  userTrackingData[userId].push(newTrackingEntry);
  
  // Update current location
  currentLocations[userId] = {
    userId,
    latitude,
    longitude,
    timestamp: newTrackingEntry.timestamp,
    accuracy: accuracy || null
  };
  
  res.status(201).json(newTrackingEntry);
});

// Get location history for a user
router.get('/history/:userId', (req, res) => {
  const userId = parseInt(req.params.userId);
  
  if (!userTrackingData[userId]) {
    return res.status(404).json({ error: 'No tracking data found for this user' });
  }
  
  res.json(userTrackingData[userId]);
});

// Get current location for a user
router.get('/current/:userId', (req, res) => {
  const userId = parseInt(req.params.userId);
  
  if (!currentLocations[userId]) {
    return res.status(404).json({ error: 'No current location found for this user' });
  }
  
  res.json(currentLocations[userId]);
});

module.exports = router;
