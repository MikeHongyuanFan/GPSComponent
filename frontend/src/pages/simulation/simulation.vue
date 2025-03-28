<template>
  <view class="container">
    <!-- Simulation Controls -->
    <view class="card">
      <view class="section-title">Simulation Controls</view>
      
      <view v-if="simulationStore.simulationActive" class="simulation-active">
        <view class="active-info">
          <text class="active-label">Active Simulation</text>
          <text class="active-route">{{ getActiveSimulationInfo().routeName }}</text>
          <text class="active-progress">Progress: {{ getActiveSimulationInfo().progress }}</text>
          <text class="active-time">Started: {{ formatDateTime(getActiveSimulationInfo().startTime) }}</text>
        </view>
        
        <button class="btn btn-danger mt-10" @click="stopSimulation">
          Stop Simulation
        </button>
      </view>
      
      <view v-else class="simulation-form">
        <view class="form-item">
          <text class="form-label">Route</text>
          <picker
            :range="routeNames"
            @change="onRouteChange"
          >
            <view class="picker-value">
              {{ selectedRouteName || 'Select a route' }}
            </view>
          </picker>
        </view>
        
        <view class="form-item">
          <text class="form-label">Interval (seconds): {{ simulationStore.simulationSettings.interval }}</text>
          <slider
            :min="5"
            :max="30"
            :step="5"
            :value="simulationStore.simulationSettings.interval"
            show-value
            @change="onIntervalChange"
          />
        </view>
        
        <view class="form-item checkbox">
          <text class="form-label">Auto Clock-In</text>
          <switch
            :checked="simulationStore.simulationSettings.autoClockIn"
            @change="onAutoClockInChange"
          />
        </view>
        
        <view class="form-item checkbox">
          <text class="form-label">Auto Clock-Out</text>
          <switch
            :checked="simulationStore.simulationSettings.autoClockOut"
            @change="onAutoClockOutChange"
          />
        </view>
        
        <button 
          class="btn btn-primary" 
          :disabled="!selectedRouteName"
          @click="startSimulation"
        >
          Start Simulation
        </button>
      </view>
    </view>
    
    <!-- Route Preview -->
    <view class="card">
      <view class="section-title">Route Preview</view>
      
      <view class="map-container">
        <map
          id="route-map"
          class="map"
          :latitude="mapCenter.latitude"
          :longitude="mapCenter.longitude"
          :markers="routeMarkers"
          :polyline="routePolyline"
          scale="14"
        ></map>
      </view>
      
      <view v-if="selectedRoute" class="route-details">
        <view class="info-row">
          <text class="info-label">Start:</text>
          <text class="info-value">{{ formatCoordinates(selectedRoute.points[0]) }}</text>
        </view>
        <view class="info-row">
          <text class="info-label">End:</text>
          <text class="info-value">{{ formatCoordinates(selectedRoute.points[selectedRoute.points.length - 1]) }}</text>
        </view>
        <view class="info-row">
          <text class="info-label">Points:</text>
          <text class="info-value">{{ selectedRoute.points.length }}</text>
        </view>
      </view>
      <view v-else class="route-details empty">
        <text>Select a route to see details</text>
      </view>
    </view>
    
    <!-- Create Custom Route -->
    <view class="card">
      <view class="section-title">Create Custom Route</view>
      
      <view class="form-item">
        <text class="form-label">Route Name</text>
        <input
          class="form-input"
          v-model="newRoute.name"
          placeholder="Enter route name"
        />
      </view>
      
      <view class="form-item">
        <text class="form-label">Start Point</text>
        <view class="coordinate-inputs">
          <input
            class="form-input"
            v-model="newRoute.startLat"
            placeholder="Latitude"
            type="digit"
          />
          <input
            class="form-input"
            v-model="newRoute.startLng"
            placeholder="Longitude"
            type="digit"
          />
        </view>
      </view>
      
      <view class="form-item">
        <text class="form-label">End Point</text>
        <view class="coordinate-inputs">
          <input
            class="form-input"
            v-model="newRoute.endLat"
            placeholder="Latitude"
            type="digit"
          />
          <input
            class="form-input"
            v-model="newRoute.endLng"
            placeholder="Longitude"
            type="digit"
          />
        </view>
      </view>
      
      <view class="form-item">
        <text class="form-label">Number of Points: {{ newRoute.pointCount }}</text>
        <slider
          :min="2"
          :max="20"
          :value="newRoute.pointCount"
          show-value
          @change="onPointCountChange"
        />
      </view>
      
      <view class="form-actions">
        <button class="btn btn-secondary" @click="createRoute">
          Create Route
        </button>
        <button class="btn btn-primary" @click="useCurrentLocation">
          Use Current Location
        </button>
      </view>
    </view>
    
    <!-- Active Simulations -->
    <view class="card">
      <view class="section-title">Active Simulations</view>
      
      <view v-if="simulationStore.activeSimulations.length === 0" class="empty-state">
        <text>No active simulations</text>
      </view>
      
      <view v-else class="active-simulations">
        <view 
          v-for="(sim, index) in simulationStore.activeSimulations" 
          :key="index"
          class="simulation-item"
        >
          <view class="sim-info">
            <text class="sim-user">User ID: {{ sim.userId }}</text>
            <text class="sim-route">Route: {{ sim.routeName }}</text>
            <text class="sim-progress">Progress: {{ sim.currentPointIndex }} / {{ sim.totalPoints }}</text>
            <text class="sim-time">Started: {{ formatDateTime(sim.startTime) }}</text>
          </view>
          
          <button 
            v-if="sim.userId === userStore.id"
            class="btn btn-danger btn-small"
            @click="stopSimulation"
          >
            Stop
          </button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useUserStore, useLocationStore, useSimulationStore } from '../../store';
import { getCurrentLocation, generateRoutePoints, formatCoordinates as formatCoords } from '../../utils/location';

// Stores
const userStore = useUserStore();
const locationStore = useLocationStore();
const simulationStore = useSimulationStore();

// State
const selectedRouteName = ref('');
const selectedRoute = ref(null);
const mapCenter = ref({
  latitude: 37.7749,
  longitude: -122.4194
});

const newRoute = ref({
  name: '',
  startLat: '',
  startLng: '',
  endLat: '',
  endLng: '',
  pointCount: 5
});

// Refresh interval
let refreshInterval = null;

// Computed properties
const routeNames = computed(() => {
  return simulationStore.routes.map(route => route.name);
});

const routeMarkers = computed(() => {
  if (!selectedRoute.value) return [];
  
  const points = selectedRoute.value.points;
  if (!points || points.length < 2) return [];
  
  return [
    {
      id: 0,
      latitude: points[0].latitude,
      longitude: points[0].longitude,
      title: 'Start',
      iconPath: '/static/images/marker-start.png',
      width: 32,
      height: 32
    },
    {
      id: 1,
      latitude: points[points.length - 1].latitude,
      longitude: points[points.length - 1].longitude,
      title: 'End',
      iconPath: '/static/images/marker-end.png',
      width: 32,
      height: 32
    }
  ];
});

const routePolyline = computed(() => {
  if (!selectedRoute.value || !selectedRoute.value.points) return [];
  
  return [{
    points: selectedRoute.value.points.map(point => ({
      latitude: point.latitude,
      longitude: point.longitude
    })),
    color: '#007AFF',
    width: 4
  }];
});

// Lifecycle hooks
onMounted(() => {
  // Load initial data
  loadData();
  
  // Set up refresh interval
  refreshInterval = setInterval(() => {
    checkActiveSimulations();
  }, 5000); // Check every 5 seconds
});

onUnmounted(() => {
  // Clear interval when component is unmounted
  if (refreshInterval) {
    clearInterval(refreshInterval);
  }
});

// Methods
async function loadData() {
  try {
    // Load routes
    await simulationStore.fetchRoutes();
    
    // Check active simulations
    await checkActiveSimulations();
  } catch (error) {
    console.error('Error loading data:', error);
    uni.showToast({
      title: 'Failed to load data',
      icon: 'none'
    });
  }
}

async function checkActiveSimulations() {
  try {
    await simulationStore.fetchActiveSimulations();
  } catch (error) {
    console.error('Error checking active simulations:', error);
  }
}

async function onRouteChange(e) {
  const index = e.detail.value;
  if (index >= 0 && index < routeNames.value.length) {
    selectedRouteName.value = routeNames.value[index];
    await loadRouteDetails(selectedRouteName.value);
  }
}

async function loadRouteDetails(routeName) {
  try {
    const routeData = await simulationStore.fetchRouteDetails(routeName);
    selectedRoute.value = routeData;
    
    // Center map on route
    if (routeData && routeData.points && routeData.points.length > 0) {
      // Calculate center of route
      const points = routeData.points;
      const latSum = points.reduce((sum, point) => sum + point.latitude, 0);
      const lngSum = points.reduce((sum, point) => sum + point.longitude, 0);
      
      mapCenter.value = {
        latitude: latSum / points.length,
        longitude: lngSum / points.length
      };
    }
  } catch (error) {
    console.error('Error loading route details:', error);
    uni.showToast({
      title: 'Failed to load route details',
      icon: 'none'
    });
  }
}

function onIntervalChange(e) {
  simulationStore.updateSimulationSettings({
    interval: e.detail.value
  });
}

function onAutoClockInChange(e) {
  simulationStore.updateSimulationSettings({
    autoClockIn: e.detail.value
  });
}

function onAutoClockOutChange(e) {
  simulationStore.updateSimulationSettings({
    autoClockOut: e.detail.value
  });
}

function onPointCountChange(e) {
  newRoute.value.pointCount = e.detail.value;
}

async function startSimulation() {
  if (!selectedRouteName.value) {
    uni.showToast({
      title: 'Please select a route',
      icon: 'none'
    });
    return;
  }
  
  try {
    await simulationStore.startSimulation(selectedRouteName.value);
    uni.showToast({
      title: 'Simulation started',
      icon: 'success'
    });
  } catch (error) {
    console.error('Error starting simulation:', error);
    uni.showToast({
      title: 'Failed to start simulation',
      icon: 'none'
    });
  }
}

async function stopSimulation() {
  try {
    await simulationStore.stopSimulation();
    uni.showToast({
      title: 'Simulation stopped',
      icon: 'success'
    });
  } catch (error) {
    console.error('Error stopping simulation:', error);
    uni.showToast({
      title: 'Failed to stop simulation',
      icon: 'none'
    });
  }
}

async function createRoute() {
  // Validate inputs
  if (!newRoute.value.name) {
    uni.showToast({
      title: 'Please enter a route name',
      icon: 'none'
    });
    return;
  }
  
  if (!newRoute.value.startLat || !newRoute.value.startLng || !newRoute.value.endLat || !newRoute.value.endLng) {
    uni.showToast({
      title: 'Please enter start and end coordinates',
      icon: 'none'
    });
    return;
  }
  
  try {
    // Parse coordinates
    const startLat = parseFloat(newRoute.value.startLat);
    const startLng = parseFloat(newRoute.value.startLng);
    const endLat = parseFloat(newRoute.value.endLat);
    const endLng = parseFloat(newRoute.value.endLng);
    
    // Generate route points
    const points = generateRoutePoints(
      startLat,
      startLng,
      endLat,
      endLng,
      newRoute.value.pointCount
    );
    
    // Create route
    await simulationStore.createRoute(newRoute.value.name, points);
    
    // Reset form
    newRoute.value = {
      name: '',
      startLat: '',
      startLng: '',
      endLat: '',
      endLng: '',
      pointCount: 5
    };
    
    uni.showToast({
      title: 'Route created',
      icon: 'success'
    });
  } catch (error) {
    console.error('Error creating route:', error);
    uni.showToast({
      title: 'Failed to create route',
      icon: 'none'
    });
  }
}

async function useCurrentLocation() {
  try {
    const location = await getCurrentLocation();
    
    // Set start point to current location
    newRoute.value.startLat = location.latitude.toString();
    newRoute.value.startLng = location.longitude.toString();
    
    uni.showToast({
      title: 'Current location set',
      icon: 'success'
    });
  } catch (error) {
    console.error('Error getting current location:', error);
    uni.showToast({
      title: 'Failed to get location',
      icon: 'none'
    });
  }
}

// Helper functions
function getActiveSimulationInfo() {
  const userSim = simulationStore.activeSimulations.find(sim => sim.userId === userStore.id);
  
  if (!userSim) {
    return {
      routeName: '',
      progress: '',
      startTime: ''
    };
  }
  
  return {
    routeName: userSim.routeName,
    progress: `${userSim.currentPointIndex} / ${userSim.totalPoints}`,
    startTime: userSim.startTime
  };
}

function formatDateTime(dateString) {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  return date.toLocaleString();
}

function formatCoordinates(point) {
  if (!point) return '';
  return formatCoords(point.latitude, point.longitude);
}
</script>

<style lang="scss">
.container {
  padding: 20px;
}

.simulation-active {
  .active-info {
    background-color: #f0f8ff;
    padding: 15px;
    border-radius: 8px;
    border-left: 4px solid #007AFF;
    margin-bottom: 15px;
    
    .active-label {
      font-weight: 500;
      margin-bottom: 5px;
      display: block;
    }
    
    .active-route, .active-progress, .active-time {
      display: block;
      margin-bottom: 5px;
      font-size: 14px;
    }
  }
}

.picker-value {
  height: 40px;
  line-height: 40px;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 0 10px;
  background-color: #fff;
}

.map-container {
  width: 100%;
  height: 250px;
  margin-bottom: 15px;
  border-radius: 8px;
  overflow: hidden;
}

.map {
  width: 100%;
  height: 100%;
}

.route-details {
  .info-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 5px;
    
    .info-label {
      color: #666;
    }
    
    .info-value {
      font-weight: 500;
    }
  }
  
  &.empty {
    text-align: center;
    color: #999;
    padding: 10px 0;
  }
}

.coordinate-inputs {
  display: flex;
  gap: 10px;
  
  .form-input {
    flex: 1;
  }
}

.form-actions {
  display: flex;
  gap: 10px;
  
  .btn {
    flex: 1;
  }
}

.checkbox {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.empty-state {
  text-align: center;
  color: #999;
  padding: 20px 0;
}

.active-simulations {
  .simulation-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 0;
    border-bottom: 1px solid #f0f0f0;
    
    &:last-child {
      border-bottom: none;
    }
    
    .sim-info {
      flex: 1;
      
      .sim-user, .sim-route, .sim-progress, .sim-time {
        display: block;
        margin-bottom: 3px;
        font-size: 14px;
      }
      
      .sim-user {
        font-weight: 500;
      }
    }
    
    .btn-small {
      padding: 5px 10px;
      font-size: 12px;
      height: auto;
      line-height: 1.5;
    }
  }
}
</style>
