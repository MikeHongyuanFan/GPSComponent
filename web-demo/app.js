// API Base URL
const API_BASE_URL = 'http://localhost:3000';

// Current user info
const currentUser = {
  id: 1,
  name: 'John Doe',
  status: 'NOT_WORKING'
};

// Maps
let mainMap, historyMap, routePreviewMap;
let currentLocationMarker;
let historyMarkers = [];
let historyPath;
let companyLocations = [];

// Simulation
let selectedRoute = null;
let simulationActive = false;
let refreshInterval;

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
  // Initialize tabs
  initTabs();
  
  // Initialize maps
  initMaps();
  
  // Load initial data
  loadUserStatus();
  loadCompanyLocations();
  loadAvailableRoutes();
  checkActiveSimulations();
  
  // Set up event listeners
  setupEventListeners();
  
  // Start refresh interval
  startRefreshInterval();
});

// Initialize tab navigation
function initTabs() {
  const tabs = document.querySelectorAll('.tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Remove active class from all tabs
      tabs.forEach(t => t.classList.remove('active'));
      
      // Add active class to clicked tab
      tab.classList.add('active');
      
      // Hide all tab content
      document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
      });
      
      // Show selected tab content
      const tabId = tab.getAttribute('data-tab');
      document.getElementById(tabId).classList.add('active');
      
      // Refresh maps when tab changes
      if (tabId === 'check-in') {
        if (mainMap) google.maps.event.trigger(mainMap, 'resize');
      } else if (tabId === 'history') {
        if (historyMap) google.maps.event.trigger(historyMap, 'resize');
        loadLocationHistory();
      } else if (tabId === 'simulation') {
        if (routePreviewMap) google.maps.event.trigger(routePreviewMap, 'resize');
        checkActiveSimulations();
      }
    });
  });
}

// Initialize Google Maps
function initMaps() {
  // Default center (San Francisco)
  const defaultCenter = { lat: 37.7749, lng: -122.4194 };
  
  // Main map
  mainMap = new google.maps.Map(document.getElementById('main-map'), {
    center: defaultCenter,
    zoom: 14,
    mapTypeControl: true,
    streetViewControl: false
  });
  
  // History map
  historyMap = new google.maps.Map(document.getElementById('history-map'), {
    center: defaultCenter,
    zoom: 14,
    mapTypeControl: true,
    streetViewControl: false
  });
  
  // Route preview map
  routePreviewMap = new google.maps.Map(document.getElementById('route-preview-map'), {
    center: defaultCenter,
    zoom: 14,
    mapTypeControl: false,
    streetViewControl: false
  });
  
  // Get current location
  getCurrentLocation();
}

// Set up event listeners
function setupEventListeners() {
  // Check-in buttons
  document.getElementById('btn-clock-in-office').addEventListener('click', () => clockIn('CLOCK_IN_OFFICE'));
  document.getElementById('btn-clock-in-remote').addEventListener('click', () => clockIn('CLOCK_IN_REMOTE'));
  document.getElementById('btn-clock-out').addEventListener('click', clockOut);
  
  // History filter
  document.getElementById('btn-filter-history').addEventListener('click', loadLocationHistory);
  
  // Simulation controls
  document.getElementById('interval-slider').addEventListener('input', updateIntervalValue);
  document.getElementById('route-select').addEventListener('change', onRouteSelect);
  document.getElementById('btn-toggle-simulation').addEventListener('click', toggleSimulation);
  document.getElementById('btn-create-route').addEventListener('click', createCustomRoute);
  document.getElementById('point-count').addEventListener('input', updatePointCountValue);
}

// Start refresh interval
function startRefreshInterval() {
  refreshInterval = setInterval(() => {
    getCurrentLocation();
    loadUserStatus();
    
    if (simulationActive) {
      checkActiveSimulations();
    }
  }, 5000);
}

// API Calls

// Get current location
async function getCurrentLocation() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/tracking/current/${currentUser.id}`);
    if (!response.ok) throw new Error('Failed to fetch current location');
    
    const data = await response.json();
    updateCurrentLocation(data);
  } catch (error) {
    console.error('Error fetching current location:', error);
  }
}

// Load user status
async function loadUserStatus() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/user/status/${currentUser.id}`);
    if (!response.ok) throw new Error('Failed to fetch user status');
    
    const data = await response.json();
    updateUserStatus(data);
  } catch (error) {
    console.error('Error fetching user status:', error);
  }
}

// Load company locations
async function loadCompanyLocations() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/company/locations`);
    if (!response.ok) throw new Error('Failed to fetch company locations');
    
    const data = await response.json();
    companyLocations = data;
    displayCompanyLocations();
  } catch (error) {
    console.error('Error fetching company locations:', error);
  }
}

// Load location history
async function loadLocationHistory() {
  try {
    const dateFilter = document.getElementById('history-date').value;
    let url = `${API_BASE_URL}/api/tracking/history/${currentUser.id}`;
    
    if (dateFilter) {
      url += `?date=${dateFilter}`;
    }
    
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch location history');
    
    const data = await response.json();
    displayLocationHistory(data);
  } catch (error) {
    console.error('Error fetching location history:', error);
  }
}

// Load available routes
async function loadAvailableRoutes() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/simulation/routes`);
    if (!response.ok) throw new Error('Failed to fetch routes');
    
    const data = await response.json();
    populateRouteSelect(data);
  } catch (error) {
    console.error('Error fetching routes:', error);
  }
}

// Check active simulations
async function checkActiveSimulations() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/simulation/active`);
    if (!response.ok) throw new Error('Failed to fetch active simulations');
    
    const data = await response.json();
    updateActiveSimulations(data);
  } catch (error) {
    console.error('Error fetching active simulations:', error);
  }
}

// Get route details
async function getRouteDetails(routeName) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/simulation/route/${routeName}`);
    if (!response.ok) throw new Error('Failed to fetch route details');
    
    const data = await response.json();
    displayRoutePreview(data);
  } catch (error) {
    console.error('Error fetching route details:', error);
  }
}

// Clock in
async function clockIn(type) {
  if (!currentLocationMarker) {
    alert('Current location not available');
    return;
  }
  
  try {
    // Submit location
    const locationData = {
      userId: currentUser.id,
      trackingType: type,
      latitude: currentLocationMarker.getPosition().lat(),
      longitude: currentLocationMarker.getPosition().lng(),
      accuracy: 10,
      batteryLevel: 80,
      networkType: 'WIFI'
    };
    
    const locationResponse = await fetch(`${API_BASE_URL}/api/tracking/location`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(locationData)
    });
    
    if (!locationResponse.ok) throw new Error('Failed to submit location');
    
    // Update user status
    const status = type === 'CLOCK_IN_OFFICE' ? 'WORKING_OFFICE' : 'WORKING_REMOTE';
    const statusData = {
      userId: currentUser.id,
      status,
      startTime: new Date().toISOString()
    };
    
    const statusResponse = await fetch(`${API_BASE_URL}/api/user/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(statusData)
    });
    
    if (!statusResponse.ok) throw new Error('Failed to update status');
    
    // Refresh data
    loadUserStatus();
    getCurrentLocation();
    
    alert(`Successfully clocked in (${status})`);
  } catch (error) {
    console.error('Error clocking in:', error);
    alert('Failed to clock in');
  }
}

// Clock out
async function clockOut() {
  if (!currentLocationMarker) {
    alert('Current location not available');
    return;
  }
  
  try {
    // Submit location
    const locationData = {
      userId: currentUser.id,
      trackingType: 'CLOCK_OUT',
      latitude: currentLocationMarker.getPosition().lat(),
      longitude: currentLocationMarker.getPosition().lng(),
      accuracy: 10,
      batteryLevel: 70,
      networkType: 'WIFI'
    };
    
    const locationResponse = await fetch(`${API_BASE_URL}/api/tracking/location`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(locationData)
    });
    
    if (!locationResponse.ok) throw new Error('Failed to submit location');
    
    // Update user status
    const statusData = {
      userId: currentUser.id,
      status: 'NOT_WORKING',
      startTime: new Date().toISOString()
    };
    
    const statusResponse = await fetch(`${API_BASE_URL}/api/user/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(statusData)
    });
    
    if (!statusResponse.ok) throw new Error('Failed to update status');
    
    // Refresh data
    loadUserStatus();
    getCurrentLocation();
    
    alert('Successfully clocked out');
  } catch (error) {
    console.error('Error clocking out:', error);
    alert('Failed to clock out');
  }
}

// Start simulation
async function startSimulation() {
  const routeName = document.getElementById('route-select').value;
  if (!routeName) {
    alert('Please select a route');
    return;
  }
  
  try {
    const interval = parseInt(document.getElementById('interval-slider').value);
    const autoClockIn = document.getElementById('auto-clock-in').checked;
    const autoClockOut = document.getElementById('auto-clock-out').checked;
    
    const data = {
      userId: currentUser.id,
      routeName,
      options: {
        interval,
        autoClockIn,
        autoClockOut
      }
    };
    
    const response = await fetch(`${API_BASE_URL}/api/simulation/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) throw new Error('Failed to start simulation');
    
    simulationActive = true;
    document.getElementById('btn-toggle-simulation').textContent = 'Stop Simulation';
    document.getElementById('btn-toggle-simulation').classList.remove('btn-primary');
    document.getElementById('btn-toggle-simulation').classList.add('btn-danger');
    
    checkActiveSimulations();
  } catch (error) {
    console.error('Error starting simulation:', error);
    alert('Failed to start simulation');
  }
}

// Stop simulation
async function stopSimulation() {
  try {
    const data = {
      userId: currentUser.id
    };
    
    const response = await fetch(`${API_BASE_URL}/api/simulation/stop`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) throw new Error('Failed to stop simulation');
    
    simulationActive = false;
    document.getElementById('btn-toggle-simulation').textContent = 'Start Simulation';
    document.getElementById('btn-toggle-simulation').classList.remove('btn-danger');
    document.getElementById('btn-toggle-simulation').classList.add('btn-primary');
    document.getElementById('simulation-status').classList.add('hidden');
    
    checkActiveSimulations();
  } catch (error) {
    console.error('Error stopping simulation:', error);
    alert('Failed to stop simulation');
  }
}

// Create custom route
async function createCustomRoute() {
  const routeName = document.getElementById('new-route-name').value;
  const startLat = parseFloat(document.getElementById('start-lat').value);
  const startLng = parseFloat(document.getElementById('start-lng').value);
  const endLat = parseFloat(document.getElementById('end-lat').value);
  const endLng = parseFloat(document.getElementById('end-lng').value);
  const pointCount = parseInt(document.getElementById('point-count').value);
  
  if (!routeName || isNaN(startLat) || isNaN(startLng) || isNaN(endLat) || isNaN(endLng)) {
    alert('Please fill in all fields');
    return;
  }
  
  try {
    const points = generateRoutePoints(startLat, startLng, endLat, endLng, pointCount);
    
    const data = {
      routeName,
      points
    };
    
    const response = await fetch(`${API_BASE_URL}/api/simulation/route`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) throw new Error('Failed to create route');
    
    alert('Route created successfully');
    
    // Reset form
    document.getElementById('new-route-name').value = '';
    document.getElementById('start-lat').value = '';
    document.getElementById('start-lng').value = '';
    document.getElementById('end-lat').value = '';
    document.getElementById('end-lng').value = '';
    
    // Refresh routes
    loadAvailableRoutes();
  } catch (error) {
    console.error('Error creating route:', error);
    alert('Failed to create route');
  }
}

// UI Updates

// Update current location
function updateCurrentLocation(location) {
  if (!location) return;
  
  const position = { lat: location.latitude, lng: location.longitude };
  
  // Update info display
  document.getElementById('current-lat').textContent = location.latitude.toFixed(6);
  document.getElementById('current-lng').textContent = location.longitude.toFixed(6);
  document.getElementById('current-time').textContent = new Date(location.timestamp).toLocaleString();
  
  // Update or create marker
  if (currentLocationMarker) {
    currentLocationMarker.setPosition(position);
  } else {
    currentLocationMarker = new google.maps.Marker({
      position,
      map: mainMap,
      title: 'Current Location',
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 10,
        fillColor: '#4285F4',
        fillOpacity: 1,
        strokeColor: '#FFFFFF',
        strokeWeight: 2
      }
    });
  }
  
  // Center map on current location
  mainMap.setCenter(position);
}

// Update user status
function updateUserStatus(status) {
  if (!status) return;
  
  currentUser.status = status.status;
  
  // Update display
  document.getElementById('user-status').textContent = `Status: ${formatStatus(status.status)}`;
  
  // Update button states
  const clockInOfficeBtn = document.getElementById('btn-clock-in-office');
  const clockInRemoteBtn = document.getElementById('btn-clock-in-remote');
  const clockOutBtn = document.getElementById('btn-clock-out');
  
  if (status.status === 'WORKING_OFFICE' || status.status === 'WORKING_REMOTE') {
    clockInOfficeBtn.disabled = true;
    clockInRemoteBtn.disabled = true;
    clockOutBtn.disabled = false;
  } else {
    clockInOfficeBtn.disabled = false;
    clockInRemoteBtn.disabled = false;
    clockOutBtn.disabled = true;
  }
}

// Display company locations
function displayCompanyLocations() {
  // Clear existing markers
  if (window.companyMarkers) {
    window.companyMarkers.forEach(marker => marker.setMap(null));
  }
  
  window.companyMarkers = [];
  
  // Add markers for company locations
  companyLocations.forEach(location => {
    const marker = new google.maps.Marker({
      position: { lat: location.latitude, lng: location.longitude },
      map: mainMap,
      title: location.name,
      icon: {
        url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png'
      }
    });
    
    const infoWindow = new google.maps.InfoWindow({
      content: `<div><strong>${location.name}</strong><br>${location.address}</div>`
    });
    
    marker.addListener('click', () => {
      infoWindow.open(mainMap, marker);
    });
    
    window.companyMarkers.push(marker);
  });
}

// Display location history
function displayLocationHistory(history) {
  // Clear existing markers and path
  historyMarkers.forEach(marker => marker.setMap(null));
  historyMarkers = [];
  
  if (historyPath) {
    historyPath.setMap(null);
  }
  
  // Clear history items
  document.getElementById('history-items').innerHTML = '';
  
  if (!history || history.length === 0) {
    document.getElementById('history-items').innerHTML = '<p>No history data available</p>';
    return;
  }
  
  // Create path
  const pathCoordinates = history.map(point => ({
    lat: point.latitude,
    lng: point.longitude
  }));
  
  historyPath = new google.maps.Polyline({
    path: pathCoordinates,
    geodesic: true,
    strokeColor: '#007AFF',
    strokeOpacity: 1.0,
    strokeWeight: 3
  });
  
  historyPath.setMap(historyMap);
  
  // Create markers for special points
  history.forEach((point, index) => {
    if (point.trackingType === 'CLOCK_IN_OFFICE' || 
        point.trackingType === 'CLOCK_IN_REMOTE' || 
        point.trackingType === 'CLOCK_OUT') {
      
      let icon = 'https://maps.google.com/mapfiles/ms/icons/red-dot.png';
      let label = 'Tracking Point';
      
      if (point.trackingType === 'CLOCK_IN_OFFICE') {
        icon = 'https://maps.google.com/mapfiles/ms/icons/green-dot.png';
        label = 'Clock In (Office)';
      } else if (point.trackingType === 'CLOCK_IN_REMOTE') {
        icon = 'https://maps.google.com/mapfiles/ms/icons/yellow-dot.png';
        label = 'Clock In (Remote)';
      } else if (point.trackingType === 'CLOCK_OUT') {
        icon = 'https://maps.google.com/mapfiles/ms/icons/red-dot.png';
        label = 'Clock Out';
      }
      
      const marker = new google.maps.Marker({
        position: { lat: point.latitude, lng: point.longitude },
        map: historyMap,
        title: label,
        icon
      });
      
      const infoWindow = new google.maps.InfoWindow({
        content: `<div><strong>${label}</strong><br>${new Date(point.timestamp).toLocaleString()}</div>`
      });
      
      marker.addListener('click', () => {
        infoWindow.open(historyMap, marker);
      });
      
      historyMarkers.push(marker);
    }
    
    // Add to history list
    const historyItem = document.createElement('div');
    historyItem.className = 'history-item';
    historyItem.innerHTML = `
      <div><strong>${formatTrackingType(point.trackingType)}</strong></div>
      <div>Time: ${new Date(point.timestamp).toLocaleString()}</div>
      <div>Location: ${point.latitude.toFixed(6)}, ${point.longitude.toFixed(6)}</div>
    `;
    document.getElementById('history-items').appendChild(historyItem);
  });
  
  // Center map on first point
  if (history.length > 0) {
    historyMap.setCenter({
      lat: history[0].latitude,
      lng: history[0].longitude
    });
  }
}

// Populate route select
function populateRouteSelect(routes) {
  const select = document.getElementById('route-select');
  
  // Clear existing options
  select.innerHTML = '<option value="">Select a route</option>';
  
  // Add routes
  routes.forEach(route => {
    const option = document.createElement('option');
    option.value = route.name;
    option.textContent = `${route.name} (${route.pointCount} points)`;
    select.appendChild(option);
  });
}

// Display route preview
function displayRoutePreview(routeData) {
  if (!routeData || !routeData.points || routeData.points.length < 2) return;
  
  // Clear existing markers and path
  if (window.routeMarkers) {
    window.routeMarkers.forEach(marker => marker.setMap(null));
  }
  
  if (window.routePath) {
    window.routePath.setMap(null);
  }
  
  window.routeMarkers = [];
  
  // Create path
  const pathCoordinates = routeData.points.map(point => ({
    lat: point.latitude,
    lng: point.longitude
  }));
  
  window.routePath = new google.maps.Polyline({
    path: pathCoordinates,
    geodesic: true,
    strokeColor: '#007AFF',
    strokeOpacity: 1.0,
    strokeWeight: 3
  });
  
  window.routePath.setMap(routePreviewMap);
  
  // Create start and end markers
  const startPoint = routeData.points[0];
  const endPoint = routeData.points[routeData.points.length - 1];
  
  const startMarker = new google.maps.Marker({
    position: { lat: startPoint.latitude, lng: startPoint.longitude },
    map: routePreviewMap,
    title: 'Start',
    label: 'S'
  });
  
  const endMarker = new google.maps.Marker({
    position: { lat: endPoint.latitude, lng: endPoint.longitude },
    map: routePreviewMap,
    title: 'End',
    label: 'E'
  });
  
  window.routeMarkers.push(startMarker, endMarker);
  
  // Fit map to bounds
  const bounds = new google.maps.LatLngBounds();
  pathCoordinates.forEach(coord => bounds.extend(coord));
  routePreviewMap.fitBounds(bounds);
  
  // Update route details
  document.getElementById('route-start').textContent = `${startPoint.latitude.toFixed(6)}, ${startPoint.longitude.toFixed(6)}`;
  document.getElementById('route-end').textContent = `${endPoint.latitude.toFixed(6)}, ${endPoint.longitude.toFixed(6)}`;
  document.getElementById('route-points').textContent = routeData.points.length;
}

// Update active simulations
function updateActiveSimulations(simulations) {
  const list = document.getElementById('active-simulations-list');
  list.innerHTML = '';
  
  if (!simulations || simulations.length === 0) {
    list.innerHTML = '<p>No active simulations</p>';
    return;
  }
  
  simulations.forEach(sim => {
    const item = document.createElement('div');
    item.className = 'simulation-item';
    item.innerHTML = `
      <div><strong>User ID: ${sim.userId}</strong></div>
      <div>Route: ${sim.routeName}</div>
      <div>Progress: ${sim.currentPointIndex} / ${sim.totalPoints}</div>
      <div>Started: ${new Date(sim.startTime).toLocaleString()}</div>
      <button class="btn btn-small btn-danger stop-sim-btn" data-user-id="${sim.userId}">Stop</button>
    `;
    list.appendChild(item);
    
    // Add event listener to stop button
    item.querySelector('.stop-sim-btn').addEventListener('click', () => {
      stopSimulationForUser(sim.userId);
    });
    
    // Update simulation status if it's for current user
    if (sim.userId === currentUser.id) {
      simulationActive = true;
      document.getElementById('btn-toggle-simulation').textContent = 'Stop Simulation';
      document.getElementById('btn-toggle-simulation').classList.remove('btn-primary');
      document.getElementById('btn-toggle-simulation').classList.add('btn-danger');
      
      document.getElementById('simulation-status').classList.remove('hidden');
      document.getElementById('active-route').textContent = sim.routeName;
      document.getElementById('simulation-progress').textContent = `${sim.currentPointIndex} / ${sim.totalPoints}`;
      document.getElementById('simulation-start-time').textContent = new Date(sim.startTime).toLocaleString();
    }
  });
}

// Event Handlers

// Route select change
function onRouteSelect() {
  const routeName = document.getElementById('route-select').value;
  if (routeName) {
    selectedRoute = routeName;
    getRouteDetails(routeName);
  } else {
    selectedRoute = null;
    // Clear route preview
    if (window.routePath) {
      window.routePath.setMap(null);
    }
    if (window.routeMarkers) {
      window.routeMarkers.forEach(marker => marker.setMap(null));
    }
  }
}

// Toggle simulation
function toggleSimulation() {
  if (simulationActive) {
    stopSimulation();
  } else {
    startSimulation();
  }
}

// Update interval value display
function updateIntervalValue() {
  const value = document.getElementById('interval-slider').value;
  document.getElementById('interval-value').textContent = value;
}

// Update point count value display
function updatePointCountValue() {
  const value = document.getElementById('point-count').value;
  document.getElementById('point-count-value').textContent = value;
}

// Stop simulation for specific user
async function stopSimulationForUser(userId) {
  try {
    const data = { userId };
    
    const response = await fetch(`${API_BASE_URL}/api/simulation/stop`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) throw new Error('Failed to stop simulation');
    
    if (userId === currentUser.id) {
      simulationActive = false;
      document.getElementById('btn-toggle-simulation').textContent = 'Start Simulation';
      document.getElementById('btn-toggle-simulation').classList.remove('btn-danger');
      document.getElementById('btn-toggle-simulation').classList.add('btn-primary');
      document.getElementById('simulation-status').classList.add('hidden');
    }
    
    checkActiveSimulations();
  } catch (error) {
    console.error('Error stopping simulation:', error);
    alert('Failed to stop simulation');
  }
}

// Helper Functions

// Format status for display
function formatStatus(status) {
  switch (status) {
    case 'WORKING_OFFICE':
      return 'Working (Office)';
    case 'WORKING_REMOTE':
      return 'Working (Remote)';
    case 'NOT_WORKING':
      return 'Not Working';
    default:
      return status;
  }
}

// Format tracking type for display
function formatTrackingType(type) {
  switch (type) {
    case 'CLOCK_IN_OFFICE':
      return 'Clock In (Office)';
    case 'CLOCK_IN_REMOTE':
      return 'Clock In (Remote)';
    case 'CLOCK_OUT':
      return 'Clock Out';
    case 'TRACKING_POINT':
      return 'Tracking Point';
    default:
      return type;
  }
}

// Generate route points
function generateRoutePoints(startLat, startLng, endLat, endLng, pointCount) {
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
}
