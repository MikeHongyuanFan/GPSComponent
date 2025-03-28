<template>
  <view class="container">
    <!-- Filter Controls -->
    <view class="card">
      <view class="filter-controls">
        <view class="form-item">
          <text class="form-label">Date</text>
          <picker
            mode="date"
            :value="selectedDate"
            @change="onDateChange"
          >
            <view class="picker-value">
              {{ selectedDate || 'Select date' }}
            </view>
          </picker>
        </view>
        
        <button class="btn btn-primary" @click="loadLocationHistory">
          Filter
        </button>
      </view>
    </view>
    
    <!-- Map Container -->
    <view class="map-container">
      <map-component
        mapId="history-map"
        :latitude="mapCenter.latitude"
        :longitude="mapCenter.longitude"
        :markers="historyMarkers"
        :polyline="historyPolyline"
        :scale="14"
        @markertap="onMarkerTap"
      />
    </view>
    
    <!-- History List -->
    <view class="card">
      <view class="section-title">Location History</view>
      <view v-if="locationStore.isLoading" class="loading">
        <text>Loading history...</text>
      </view>
      <view v-else-if="locationStore.locationHistory.length === 0" class="empty-state">
        <text>No location history found for the selected date</text>
      </view>
      <view v-else class="history-list">
        <view 
          v-for="(item, index) in locationStore.locationHistory" 
          :key="index"
          class="history-item"
          @click="centerMapOnPoint(item)"
        >
          <view class="history-item-header">
            <text :class="['tracking-type', getTrackingTypeClass(item.trackingType)]">
              {{ formatTrackingType(item.trackingType) }}
            </text>
            <text class="timestamp">{{ formatTime(item.timestamp) }}</text>
          </view>
          <view class="history-item-body">
            <text class="coordinates">
              {{ item.latitude.toFixed(6) }}, {{ item.longitude.toFixed(6) }}
            </text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { useLocationStore } from '../../store';
import MapComponent from '../../components/MapComponent.vue';

export default {
  components: {
    MapComponent
  },
  setup() {
    return {
      locationStore: useLocationStore()
    };
  },
  data() {
    return {
      selectedDate: '',
      mapCenter: {
        latitude: 37.7749,
        longitude: -122.4194
      }
    };
  },
  computed: {
    historyMarkers() {
      if (!this.locationStore.locationHistory.length) return [];
      
      return this.locationStore.locationHistory.map((point, index) => {
        let iconPath = '/static/images/marker-tracking.png';
        
        if (point.trackingType === 'CLOCK_IN_OFFICE') {
          iconPath = '/static/images/marker-clock-in-office.png';
        } else if (point.trackingType === 'CLOCK_IN_REMOTE') {
          iconPath = '/static/images/marker-clock-in-remote.png';
        } else if (point.trackingType === 'CLOCK_OUT') {
          iconPath = '/static/images/marker-clock-out.png';
        }
        
        return {
          id: index,
          latitude: point.latitude,
          longitude: point.longitude,
          title: this.formatTrackingType(point.trackingType),
          iconPath,
          width: 32,
          height: 32
        };
      });
    },
    historyPolyline() {
      if (!this.locationStore.locationHistory.length) return [];
      
      return [{
        points: this.locationStore.locationHistory.map(point => ({
          latitude: point.latitude,
          longitude: point.longitude
        })),
        color: '#007AFF',
        width: 4
      }];
    }
  },
  mounted() {
    console.log('History page mounted');
    // Set today's date as default
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    this.selectedDate = `${year}-${month}-${day}`;
    
    // Load initial data
    this.loadLocationHistory();
  },
  methods: {
    async loadLocationHistory() {
      try {
        console.log('Loading location history for date:', this.selectedDate);
        await this.locationStore.fetchLocationHistory(this.selectedDate);
        
        // Center map on first point if available
        if (this.locationStore.locationHistory.length > 0) {
          const firstPoint = this.locationStore.locationHistory[0];
          this.mapCenter = {
            latitude: firstPoint.latitude,
            longitude: firstPoint.longitude
          };
        }
      } catch (error) {
        console.error('Error loading location history:', error);
        uni.showToast({
          title: 'Failed to load history',
          icon: 'none'
        });
      }
    },
    onDateChange(e) {
      this.selectedDate = e.detail.value;
    },
    centerMapOnPoint(point) {
      // Update map center
      this.mapCenter = {
        latitude: point.latitude,
        longitude: point.longitude
      };
      
      // For native platforms
      // #ifndef H5
      const mapContext = uni.createMapContext('history-map');
      mapContext.moveToLocation({
        latitude: point.latitude,
        longitude: point.longitude
      });
      // #endif
    },
    onMarkerTap(e) {
      const markerId = e.markerId || e.detail.markerId;
      if (markerId !== undefined && this.locationStore.locationHistory[markerId]) {
        const point = this.locationStore.locationHistory[markerId];
        uni.showToast({
          title: `${this.formatTrackingType(point.trackingType)} at ${this.formatTime(point.timestamp)}`,
          icon: 'none'
        });
      }
    },
    // Helper functions
    formatTrackingType(type) {
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
    },
    getTrackingTypeClass(type) {
      switch (type) {
        case 'CLOCK_IN_OFFICE':
          return 'type-clock-in-office';
        case 'CLOCK_IN_REMOTE':
          return 'type-clock-in-remote';
        case 'CLOCK_OUT':
          return 'type-clock-out';
        default:
          return 'type-tracking';
      }
    },
    formatTime(timestamp) {
      if (!timestamp) return '';
      
      const date = new Date(timestamp);
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      
      return `${hours}:${minutes}`;
    }
  }
}
</script>

<style>
.container {
  padding: 20px;
}

.filter-controls {
  display: flex;
  flex-direction: row;
  align-items: flex-end;
}

.filter-controls .form-item {
  flex: 1;
  margin-right: 10px;
  margin-bottom: 0;
}

.filter-controls .btn {
  height: 40px;
  line-height: 40px;
  padding: 0 20px;
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
  height: 300px;
  margin: 15px 0;
  border-radius: 8px;
  overflow: hidden;
}

.loading, .empty-state {
  padding: 20px 0;
  text-align: center;
  color: #999;
}

.history-list .history-item {
  padding: 10px 0;
  border-bottom: 1px solid #f0f0f0;
}

.history-list .history-item:last-child {
  border-bottom: none;
}

.history-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
}

.tracking-type {
  font-weight: 500;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 12px;
}

.tracking-type.type-clock-in-office {
  background-color: #34C759;
  color: white;
}

.tracking-type.type-clock-in-remote {
  background-color: #5AC8FA;
  color: white;
}

.tracking-type.type-clock-out {
  background-color: #FF3B30;
  color: white;
}

.tracking-type.type-tracking {
  background-color: #E5E5EA;
  color: #8E8E93;
}

.timestamp {
  color: #8E8E93;
  font-size: 12px;
}

.coordinates {
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
</style>
