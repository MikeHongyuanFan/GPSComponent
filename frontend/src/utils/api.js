import axios from 'axios';

// API Base URL - change this to your production API when deploying
const API_BASE_URL = 'http://localhost:3000';

// Create axios instance with base URL
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds
});

// API endpoints
export default {
  // User endpoints
  user: {
    getStatus: (userId) => apiClient.get(`/api/user/status/${userId}`),
    updateStatus: (data) => apiClient.post('/api/user/status', data),
  },
  
  // Tracking endpoints
  tracking: {
    submitLocation: (data) => apiClient.post('/api/tracking/location', data),
    getHistory: (userId, date) => {
      const params = date ? { date } : {};
      return apiClient.get(`/api/tracking/history/${userId}`, { params });
    },
    getCurrentLocation: (userId) => apiClient.get(`/api/tracking/current/${userId}`),
  },
  
  // Company endpoints
  company: {
    getLocations: () => apiClient.get('/api/company/locations'),
  },
  
  // Simulation endpoints
  simulation: {
    start: (data) => apiClient.post('/api/simulation/start', data),
    stop: (data) => apiClient.post('/api/simulation/stop', data),
    getActive: () => apiClient.get('/api/simulation/active'),
    addRoute: (data) => apiClient.post('/api/simulation/route', data),
    getRoutes: () => apiClient.get('/api/simulation/routes'),
    getRoute: (routeName) => apiClient.get(`/api/simulation/route/${routeName}`),
  },
};
