// Mock location tracking data
const userTrackingData = {
  1: [
    {
      id: 101,
      userId: 1,
      trackingType: 'CLOCK_IN_OFFICE',
      latitude: 37.7749,
      longitude: -122.4194,
      timestamp: '2025-03-28T08:00:00Z',
      accuracy: 10.5,
      batteryLevel: 85,
      networkType: 'WIFI'
    },
    {
      id: 102,
      userId: 1,
      trackingType: 'TRACKING_POINT',
      latitude: 37.7750,
      longitude: -122.4195,
      timestamp: '2025-03-28T10:15:00Z',
      accuracy: 8.2,
      batteryLevel: 75,
      networkType: 'WIFI'
    },
    {
      id: 103,
      userId: 1,
      trackingType: 'CLOCK_OUT',
      latitude: 37.7751,
      longitude: -122.4196,
      timestamp: '2025-03-28T17:00:00Z',
      accuracy: 12.0,
      batteryLevel: 60,
      networkType: 'WIFI'
    }
  ],
  2: [
    {
      id: 201,
      userId: 2,
      trackingType: 'CLOCK_IN_REMOTE',
      latitude: 37.7833,
      longitude: -122.4167,
      timestamp: '2025-03-28T09:00:00Z',
      accuracy: 15.0,
      batteryLevel: 90,
      networkType: 'CELLULAR'
    },
    {
      id: 202,
      userId: 2,
      trackingType: 'TRACKING_POINT',
      latitude: 37.7834,
      longitude: -122.4168,
      timestamp: '2025-03-28T12:30:00Z',
      accuracy: 9.5,
      batteryLevel: 70,
      networkType: 'CELLULAR'
    },
    {
      id: 203,
      userId: 2,
      trackingType: 'CLOCK_OUT',
      latitude: 37.7835,
      longitude: -122.4169,
      timestamp: '2025-03-28T18:00:00Z',
      accuracy: 11.0,
      batteryLevel: 45,
      networkType: 'WIFI'
    }
  ]
};

// Current user locations (last known position)
const currentLocations = {
  1: {
    userId: 1,
    latitude: 37.7751,
    longitude: -122.4196,
    timestamp: '2025-03-28T17:00:00Z',
    accuracy: 12.0
  },
  2: {
    userId: 2,
    latitude: 37.7835,
    longitude: -122.4169,
    timestamp: '2025-03-28T18:00:00Z',
    accuracy: 11.0
  },
  3: {
    userId: 3,
    latitude: 37.7855,
    longitude: -122.4129,
    timestamp: '2025-03-28T16:45:00Z',
    accuracy: 8.5
  }
};

module.exports = {
  userTrackingData,
  currentLocations
};
