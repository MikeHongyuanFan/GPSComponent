<template>
  <view class="container">
    <!-- Map Container -->
    <view class="map-container">
      <map-component
        mapId="main-map"
        :latitude="currentLocation?.latitude || defaultLocation.latitude"
        :longitude="currentLocation?.longitude || defaultLocation.longitude"
        :markers="mapMarkers"
        :scale="14"
        :show-location="true"
        @markertap="onMarkerTap"
      />
    </view>
    
    <!-- Current Location Info -->
    <view class="card">
      <view class="section-title">Current Location</view>
      <view v-if="currentLocation" class="location-info">
        <view class="info-row">
          <text class="info-label">Latitude:</text>
          <text class="info-value">{{ currentLocation.latitude.toFixed(6) }}</text>
        </view>
        <view class="info-row">
          <text class="info-label">Longitude:</text>
          <text class="info-value">{{ currentLocation.longitude.toFixed(6) }}</text>
        </view>
        <view class="info-row">
          <text class="info-label">Last Updated:</text>
          <text class="info-value">{{ formatDateTime(currentLocation.timestamp) }}</text>
        </view>
      </view>
      <view v-else class="location-info">
        <text>Loading location data...</text>
      </view>
    </view>
    
    <!-- Check-In Actions -->
    <view class="card">
      <view class="section-title">Check-In Actions</view>
      <view class="user-status">
        <text class="status-label">Current Status:</text>
        <text :class="['status-value', { 'status-working': userStore.isWorking }]">
          {{ userStore.formattedStatus }}
        </text>
      </view>
      
      <view class="action-buttons">
        <button 
          class="btn btn-primary" 
          :disabled="userStore.isWorking" 
          :class="{ 'btn-disabled': userStore.isWorking }"
          @click="clockIn('CLOCK_IN_OFFICE')"
        >
          Clock In (Office)
        </button>
        
        <button 
          class="btn btn-secondary mt-10" 
          :disabled="userStore.isWorking" 
          :class="{ 'btn-disabled': userStore.isWorking }"
          @click="clockIn('CLOCK_IN_REMOTE')"
        >
          Clock In (Remote)
        </button>
        
        <button 
          class="btn btn-danger mt-10" 
          :disabled="!userStore.isWorking" 
          :class="{ 'btn-disabled': !userStore.isWorking }"
          @click="clockOut"
        >
          Clock Out
        </button>
      </view>
    </view>
    
    <!-- Company Locations -->
    <view class="card">
      <view class="section-title">Company Locations</view>
      <view v-if="locationStore.companyLocations.length > 0" class="company-locations">
        <view 
          v-for="(location, index) in locationStore.companyLocations" 
          :key="index"
          class="company-location"
          @click="centerMapOnLocation(location)"
        >
          <text class="location-name">{{ location.name }}</text>
          <text class="location-address">{{ location.address }}</text>
        </view>
      </view>
      <view v-else class="company-locations">
        <text>No company locations available</text>
      </view>
    </view>
  </view>
</template>

<script>
import { useUserStore, useLocationStore } from '../../store';
import { getCurrentLocation } from '../../utils/location';
import MapComponent from '../../components/MapComponent.vue';

export default {
  components: {
    MapComponent
  },
  setup() {
    return {
      userStore: useUserStore(),
      locationStore: useLocationStore()
    };
  },
  data() {
    return {
      defaultLocation: {
        latitude: 37.7749,
        longitude: -122.4194
      },
      refreshInterval: null
    };
  },
  computed: {
    currentLocation() {
      return this.locationStore.currentLocation;
    },
    mapMarkers() {
      const markers = [];
      
      // Current location marker
      if (this.currentLocation) {
        markers.push({
          id: 0,
          latitude: this.currentLocation.latitude,
          longitude: this.currentLocation.longitude,
          title: 'Current Location',
          iconPath: '/static/images/marker-current.png',
          width: 32,
          height: 32
        });
      }
      
      // Company location markers
      this.locationStore.companyLocations.forEach((location, index) => {
        markers.push({
          id: index + 1,
          latitude: location.latitude,
          longitude: location.longitude,
          title: location.name,
          iconPath: '/static/images/marker-company.png',
          width: 32,
          height: 32
        });
      });
      
      return markers;
    }
  },
  mounted() {
    console.log('Index page mounted');
    // Initial data load
    this.loadData();
    
    // Set up refresh interval
    this.refreshInterval = setInterval(() => {
      this.refreshLocation();
    }, 30000); // Refresh every 30 seconds
  },
  beforeDestroy() {
    // Clear interval when component is unmounted
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  },
  methods: {
    async loadData() {
      try {
        console.log('Loading data...');
        // Load user status
        await this.userStore.fetchUserStatus();
        
        // Load company locations
        await this.locationStore.fetchCompanyLocations();
        
        // Get current location
        await this.refreshLocation();
      } catch (error) {
        console.error('Error loading data:', error);
        uni.showToast({
          title: 'Failed to load data',
          icon: 'none'
        });
      }
    },
    async refreshLocation() {
      try {
        // Get device location
        const location = await getCurrentLocation();
        console.log('Current location:', location);
        
        // Update store
        await this.locationStore.fetchCurrentLocation();
      } catch (error) {
        console.error('Error refreshing location:', error);
      }
    },
    async clockIn(type) {
      try {
        // Get current location
        const location = await getCurrentLocation();
        
        // Submit location
        await this.locationStore.submitLocation(type, location);
        
        // Update user status
        const status = type === 'CLOCK_IN_OFFICE' ? 'WORKING_OFFICE' : 'WORKING_REMOTE';
        await this.userStore.updateUserStatus(status);
        
        uni.showToast({
          title: 'Successfully clocked in',
          icon: 'success'
        });
      } catch (error) {
        console.error('Error clocking in:', error);
        uni.showToast({
          title: 'Failed to clock in',
          icon: 'none'
        });
      }
    },
    async clockOut() {
      try {
        // Get current location
        const location = await getCurrentLocation();
        
        // Submit location
        await this.locationStore.submitLocation('CLOCK_OUT', location);
        
        // Update user status
        await this.userStore.updateUserStatus('NOT_WORKING');
        
        uni.showToast({
          title: 'Successfully clocked out',
          icon: 'success'
        });
      } catch (error) {
        console.error('Error clocking out:', error);
        uni.showToast({
          title: 'Failed to clock out',
          icon: 'none'
        });
      }
    },
    centerMapOnLocation(location) {
      // For native platforms
      // #ifndef H5
      // Get map context
      const mapContext = uni.createMapContext('main-map');
      
      // Move to location
      mapContext.moveToLocation({
        latitude: location.latitude,
        longitude: location.longitude,
        success: () => {
          console.log('Moved to location:', location.name);
        },
        fail: (error) => {
          console.error('Failed to move to location:', error);
        }
      });
      // #endif
    },
    onMarkerTap(e) {
      const markerId = e.markerId || e.detail.markerId;
      
      // Handle marker tap
      if (markerId === 0) {
        // Current location marker
        uni.showToast({
          title: 'Current Location',
          icon: 'none'
        });
      } else {
        // Company location marker
        const location = this.locationStore.companyLocations[markerId - 1];
        if (location) {
          uni.showToast({
            title: location.name,
            icon: 'none'
          });
        }
      }
    },
    // Helper function to format date/time
    formatDateTime(dateString) {
      if (!dateString) return '';
      
      const date = new Date(dateString);
      return date.toLocaleString();
    }
  }
}
</script>

<style>
.container {
  padding: 20px;
}

.map-container {
  width: 100%;
  height: 300px;
  margin-bottom: 15px;
  border-radius: 8px;
  overflow: hidden;
}

.location-info .info-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
}

.location-info .info-row .info-label {
  color: #666;
}

.location-info .info-row .info-value {
  font-weight: 500;
}

.user-status {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #f0f0f0;
}

.user-status .status-label {
  color: #666;
}

.user-status .status-value {
  font-weight: 500;
  color: #FF3B30;
}

.user-status .status-value.status-working {
  color: #34C759;
}

.action-buttons {
  display: flex;
  flex-direction: column;
}

.company-locations .company-location {
  padding: 10px;
  border-bottom: 1px solid #f0f0f0;
}

.company-locations .company-location:last-child {
  border-bottom: none;
}

.company-locations .company-location .location-name {
  font-weight: 500;
  margin-bottom: 5px;
}

.company-locations .company-location .location-address {
  font-size: 12px;
  color: #666;
}

.card {
  background-color: #fff;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 15px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.section-title {
  font-size: 18px;
  font-weight: 500;
  margin-bottom: 15px;
  color: #333;
}

.btn {
  height: 40px;
  line-height: 40px;
  text-align: center;
  border-radius: 4px;
  font-size: 16px;
  font-weight: 500;
}

.btn-primary {
  background-color: #007AFF;
  color: #fff;
}

.btn-secondary {
  background-color: #5AC8FA;
  color: #fff;
}

.btn-danger {
  background-color: #FF3B30;
  color: #fff;
}

.btn-disabled {
  background-color: #ccc;
  color: #fff;
}

.mt-10 {
  margin-top: 10px;
}
</style>
