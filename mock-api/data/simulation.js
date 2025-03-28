// Simulation data for GPS tracking
const { userTrackingData, currentLocations } = require('./locations');
const { userStatus } = require('./status');

// Simulation routes - predefined paths for simulation
const simulationRoutes = {
  // Office to home route
  officeToHome: [
    { latitude: 37.7749, longitude: -122.4194 }, // Office start point
    { latitude: 37.7755, longitude: -122.4180 },
    { latitude: 37.7762, longitude: -122.4165 },
    { latitude: 37.7775, longitude: -122.4150 },
    { latitude: 37.7790, longitude: -122.4135 },
    { latitude: 37.7805, longitude: -122.4120 },
    { latitude: 37.7820, longitude: -122.4105 },
    { latitude: 37.7835, longitude: -122.4090 },
    { latitude: 37.7850, longitude: -122.4075 }, // Home end point
  ],
  
  // Home to office route
  homeToOffice: [
    { latitude: 37.7850, longitude: -122.4075 }, // Home start point
    { latitude: 37.7835, longitude: -122.4090 },
    { latitude: 37.7820, longitude: -122.4105 },
    { latitude: 37.7805, longitude: -122.4120 },
    { latitude: 37.7790, longitude: -122.4135 },
    { latitude: 37.7775, longitude: -122.4150 },
    { latitude: 37.7762, longitude: -122.4165 },
    { latitude: 37.7755, longitude: -122.4180 },
    { latitude: 37.7749, longitude: -122.4194 }, // Office end point
  ],
  
  // Office to client meeting route
  officeToClient: [
    { latitude: 37.7749, longitude: -122.4194 }, // Office start point
    { latitude: 37.7740, longitude: -122.4180 },
    { latitude: 37.7730, longitude: -122.4165 },
    { latitude: 37.7720, longitude: -122.4150 },
    { latitude: 37.7710, longitude: -122.4135 },
    { latitude: 37.7700, longitude: -122.4120 },
    { latitude: 37.7690, longitude: -122.4105 }, // Client location
  ],
  
  // Client meeting to office route
  clientToOffice: [
    { latitude: 37.7690, longitude: -122.4105 }, // Client location
    { latitude: 37.7700, longitude: -122.4120 },
    { latitude: 37.7710, longitude: -122.4135 },
    { latitude: 37.7720, longitude: -122.4150 },
    { latitude: 37.7730, longitude: -122.4165 },
    { latitude: 37.7740, longitude: -122.4180 },
    { latitude: 37.7749, longitude: -122.4194 }, // Office end point
  ]
};

// Active simulations
const activeSimulations = {};

// Start a new simulation
const startSimulation = (userId, routeName, options = {}) => {
  // Default options
  const defaultOptions = {
    interval: 10, // seconds between points
    trackingType: 'TRACKING_POINT',
    accuracy: 10,
    batteryLevel: 80,
    networkType: 'WIFI',
    autoClockIn: false,
    autoClockOut: false
  };
  
  const simulationOptions = { ...defaultOptions, ...options };
  
  // Check if route exists
  if (!simulationRoutes[routeName]) {
    throw new Error(`Route "${routeName}" not found`);
  }
  
  // Stop any existing simulation for this user
  if (activeSimulations[userId]) {
    stopSimulation(userId);
  }
  
  const route = simulationRoutes[routeName];
  let currentPointIndex = 0;
  
  // Auto clock-in if specified
  if (simulationOptions.autoClockIn) {
    const clockInType = routeName.includes('Office') ? 'CLOCK_IN_OFFICE' : 'CLOCK_IN_REMOTE';
    
    // Add clock-in point
    const startPoint = route[0];
    addTrackingPoint(userId, {
      trackingType: clockInType,
      latitude: startPoint.latitude,
      longitude: startPoint.longitude,
      accuracy: simulationOptions.accuracy,
      batteryLevel: simulationOptions.batteryLevel,
      networkType: simulationOptions.networkType
    });
    
    // Update user status
    const status = clockInType === 'CLOCK_IN_OFFICE' ? 'WORKING_OFFICE' : 'WORKING_REMOTE';
    userStatus[userId] = {
      userId: parseInt(userId),
      status,
      startTime: new Date().toISOString(),
      endTime: null
    };
  }
  
  // Start interval to move through route
  const intervalId = setInterval(() => {
    if (currentPointIndex < route.length) {
      const point = route[currentPointIndex];
      
      // Add tracking point
      addTrackingPoint(userId, {
        trackingType: simulationOptions.trackingType,
        latitude: point.latitude,
        longitude: point.longitude,
        accuracy: simulationOptions.accuracy,
        batteryLevel: Math.max(30, simulationOptions.batteryLevel - currentPointIndex * 2), // Battery decreases over time
        networkType: simulationOptions.networkType
      });
      
      currentPointIndex++;
      
      // If reached end of route and autoClockOut is true
      if (currentPointIndex === route.length && simulationOptions.autoClockOut) {
        const endPoint = route[route.length - 1];
        
        // Add clock-out point
        addTrackingPoint(userId, {
          trackingType: 'CLOCK_OUT',
          latitude: endPoint.latitude,
          longitude: endPoint.longitude,
          accuracy: simulationOptions.accuracy,
          batteryLevel: Math.max(30, simulationOptions.batteryLevel - currentPointIndex * 2),
          networkType: simulationOptions.networkType
        });
        
        // Update user status
        userStatus[userId] = {
          userId: parseInt(userId),
          status: 'NOT_WORKING',
          startTime: new Date().toISOString(),
          endTime: null
        };
        
        // Stop simulation
        stopSimulation(userId);
      }
    } else {
      // End of route, stop simulation
      stopSimulation(userId);
    }
  }, simulationOptions.interval * 1000);
  
  // Store simulation info
  activeSimulations[userId] = {
    routeName,
    intervalId,
    options: simulationOptions,
    startTime: new Date(),
    currentPointIndex
  };
  
  return {
    userId,
    routeName,
    status: 'started',
    totalPoints: route.length,
    estimatedDuration: route.length * simulationOptions.interval
  };
};

// Stop a simulation
const stopSimulation = (userId) => {
  if (activeSimulations[userId]) {
    clearInterval(activeSimulations[userId].intervalId);
    const simulationInfo = { ...activeSimulations[userId] };
    delete activeSimulations[userId];
    
    return {
      userId,
      routeName: simulationInfo.routeName,
      status: 'stopped',
      startTime: simulationInfo.startTime,
      endTime: new Date(),
      pointsCompleted: simulationInfo.currentPointIndex
    };
  }
  
  return null;
};

// Get all active simulations
const getActiveSimulations = () => {
  return Object.keys(activeSimulations).map(userId => ({
    userId,
    routeName: activeSimulations[userId].routeName,
    startTime: activeSimulations[userId].startTime,
    currentPointIndex: activeSimulations[userId].currentPointIndex,
    totalPoints: simulationRoutes[activeSimulations[userId].routeName].length
  }));
};

// Helper function to add tracking point
const addTrackingPoint = (userId, pointData) => {
  const { trackingType, latitude, longitude, accuracy, batteryLevel, networkType } = pointData;
  
  // Generate a new tracking entry
  const newTrackingEntry = {
    id: Date.now(), // Simple ID generation
    userId: parseInt(userId),
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
    userId: parseInt(userId),
    latitude,
    longitude,
    timestamp: newTrackingEntry.timestamp,
    accuracy: accuracy || null
  };
  
  return newTrackingEntry;
};

// Add a custom route
const addCustomRoute = (routeName, points) => {
  if (points && Array.isArray(points) && points.length >= 2) {
    simulationRoutes[routeName] = points;
    return {
      routeName,
      pointCount: points.length,
      status: 'added'
    };
  }
  
  throw new Error('Invalid route points. Must be an array with at least 2 points.');
};

// Get available routes
const getAvailableRoutes = () => {
  return Object.keys(simulationRoutes).map(routeName => ({
    name: routeName,
    pointCount: simulationRoutes[routeName].length,
    startPoint: simulationRoutes[routeName][0],
    endPoint: simulationRoutes[routeName][simulationRoutes[routeName].length - 1]
  }));
};

module.exports = {
  startSimulation,
  stopSimulation,
  getActiveSimulations,
  addCustomRoute,
  getAvailableRoutes,
  simulationRoutes
};
