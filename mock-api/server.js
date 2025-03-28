const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');

// Import routes
const trackingRoutes = require('./routes/tracking');
const userRoutes = require('./routes/user');
const companyRoutes = require('./routes/company');
const simulationRoutes = require('./routes/simulation');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(morgan('dev'));

// Routes
app.use('/api/tracking', trackingRoutes);
app.use('/api/user', userRoutes);
app.use('/api/company', companyRoutes);
app.use('/api/simulation', simulationRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'GPS Tracking Check-In System Mock API',
    endpoints: {
      tracking: [
        { method: 'POST', path: '/api/tracking/location', description: 'Submit location data' },
        { method: 'GET', path: '/api/tracking/history/:userId', description: 'Get location history for a user' },
        { method: 'GET', path: '/api/tracking/current/:userId', description: 'Get current location for a user' }
      ],
      user: [
        { method: 'POST', path: '/api/user/status', description: 'Update user status' },
        { method: 'GET', path: '/api/user/status/:userId', description: 'Get user status' }
      ],
      company: [
        { method: 'GET', path: '/api/company/locations', description: 'Get company locations' }
      ],
      simulation: [
        { method: 'POST', path: '/api/simulation/start', description: 'Start a GPS movement simulation' },
        { method: 'POST', path: '/api/simulation/stop', description: 'Stop an active simulation' },
        { method: 'GET', path: '/api/simulation/active', description: 'Get all active simulations' },
        { method: 'POST', path: '/api/simulation/route', description: 'Add a custom route' },
        { method: 'GET', path: '/api/simulation/routes', description: 'Get all available routes' },
        { method: 'GET', path: '/api/simulation/route/:routeName', description: 'Get specific route details' }
      ]
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Mock API server running on port ${PORT}`);
});
