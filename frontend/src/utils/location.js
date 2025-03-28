/**
 * Location utility functions for GPS tracking
 */

// Get current location using uni-app API
export const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    uni.getLocation({
      type: 'gcj02', // gcj02 for China, wgs84 for other countries
      success: (res) => {
        resolve({
          latitude: res.latitude,
          longitude: res.longitude,
          accuracy: res.accuracy,
          timestamp: new Date().toISOString()
        });
      },
      fail: (err) => {
        console.error('Failed to get location:', err);
        reject(err);
      }
    });
  });
};

// Calculate distance between two points in meters
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; // Earth radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;

  return d; // distance in meters
};

// Check if a location is within a radius of another location
export const isWithinRadius = (lat1, lon1, lat2, lon2, radiusMeters) => {
  const distance = calculateDistance(lat1, lon1, lat2, lon2);
  return distance <= radiusMeters;
};

// Generate route points between two locations
export const generateRoutePoints = (startLat, startLng, endLat, endLng, pointCount) => {
  const points = [];
  
  // Add start point
  points.push({
    latitude: startLat,
    longitude: startLng
  });
  
  // Generate intermediate points
  const latStep = (endLat - startLat) / (pointCount - 1);
  const lngStep = (endLng - startLng) / (pointCount - 1);
  
  for (let i = 1; i < pointCount - 1; i++) {
    // Add some randomness to make the route more realistic
    const jitter = 0.0005; // About 50 meters
    const randomLat = (Math.random() * jitter * 2) - jitter;
    const randomLng = (Math.random() * jitter * 2) - jitter;
    
    points.push({
      latitude: startLat + (latStep * i) + randomLat,
      longitude: startLng + (lngStep * i) + randomLng
    });
  }
  
  // Add end point
  points.push({
    latitude: endLat,
    longitude: endLng
  });
  
  return points;
};

// Format coordinates for display
export const formatCoordinates = (latitude, longitude) => {
  return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
};

// Get device information
export const getDeviceInfo = () => {
  return new Promise((resolve) => {
    uni.getSystemInfo({
      success: (res) => {
        resolve({
          platform: res.platform,
          model: res.model,
          system: res.system,
          batteryLevel: res.batteryLevel || 100,
          networkType: res.networkType || 'unknown'
        });
      },
      fail: () => {
        resolve({
          platform: 'unknown',
          model: 'unknown',
          system: 'unknown',
          batteryLevel: 100,
          networkType: 'unknown'
        });
      }
    });
  });
};
