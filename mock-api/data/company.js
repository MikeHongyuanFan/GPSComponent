// Mock company locations data
module.exports = [
  {
    id: 1,
    name: 'Headquarters',
    address: '123 Main St, San Francisco, CA 94105',
    latitude: 37.7749,
    longitude: -122.4194,
    radius: 100, // Radius in meters to consider "at company"
    isActive: true
  },
  {
    id: 2,
    name: 'Branch Office',
    address: '456 Market St, San Francisco, CA 94105',
    latitude: 37.7900,
    longitude: -122.4000,
    radius: 75,
    isActive: true
  },
  {
    id: 3,
    name: 'Research Center',
    address: '789 Howard St, San Francisco, CA 94105',
    latitude: 37.7850,
    longitude: -122.4050,
    radius: 120,
    isActive: true
  }
];
