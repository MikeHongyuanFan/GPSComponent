const express = require('express');
const router = express.Router();
const simulation = require('../data/simulation');

// Start a simulation
router.post('/start', (req, res) => {
  const { userId, routeName, options } = req.body;
  
  if (!userId || !routeName) {
    return res.status(400).json({ error: 'Missing required fields: userId and routeName' });
  }
  
  try {
    const result = simulation.startSimulation(userId, routeName, options);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Stop a simulation
router.post('/stop', (req, res) => {
  const { userId } = req.body;
  
  if (!userId) {
    return res.status(400).json({ error: 'Missing required field: userId' });
  }
  
  const result = simulation.stopSimulation(userId);
  
  if (result) {
    res.json(result);
  } else {
    res.status(404).json({ error: 'No active simulation found for this user' });
  }
});

// Get active simulations
router.get('/active', (req, res) => {
  const activeSimulations = simulation.getActiveSimulations();
  res.json(activeSimulations);
});

// Add custom route
router.post('/route', (req, res) => {
  const { routeName, points } = req.body;
  
  if (!routeName || !points) {
    return res.status(400).json({ error: 'Missing required fields: routeName and points' });
  }
  
  try {
    const result = simulation.addCustomRoute(routeName, points);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get available routes
router.get('/routes', (req, res) => {
  const routes = simulation.getAvailableRoutes();
  res.json(routes);
});

// Get specific route details
router.get('/route/:routeName', (req, res) => {
  const { routeName } = req.params;
  
  if (simulation.simulationRoutes[routeName]) {
    res.json({
      name: routeName,
      points: simulation.simulationRoutes[routeName]
    });
  } else {
    res.status(404).json({ error: 'Route not found' });
  }
});

module.exports = router;
