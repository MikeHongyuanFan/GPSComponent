<template>
  <view class="map-container">
    <!-- H5 Platform: Google Maps -->
    <div v-if="isH5" :id="mapId" class="map"></div>
    
    <!-- Other Platforms: Native Map Component -->
    <map
      v-else
      :id="mapId"
      class="map"
      :latitude="latitude"
      :longitude="longitude"
      :markers="markers"
      :polyline="polyline"
      :scale="scale"
      :show-location="showLocation"
      @markertap="onMarkerTap"
    ></map>
  </view>
</template>

<script>
export default {
  name: 'MapComponent',
  props: {
    mapId: {
      type: String,
      default: 'map'
    },
    latitude: {
      type: Number,
      default: 37.7749
    },
    longitude: {
      type: Number,
      default: -122.4194
    },
    markers: {
      type: Array,
      default: () => []
    },
    polyline: {
      type: Array,
      default: () => []
    },
    scale: {
      type: Number,
      default: 14
    },
    showLocation: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      isH5: false,
      googleMap: null,
      googleMapMarkers: [],
      googleMapPolylines: []
    };
  },
  mounted() {
    console.log('MapComponent mounted, mapId:', this.mapId);
    
    // Check if running in H5 mode
    // #ifdef H5
    this.isH5 = true;
    console.log('Running in H5 mode');
    this.$nextTick(() => {
      console.log('Initializing Google Map');
      this.initGoogleMap();
    });
    // #endif
    
    // #ifndef H5
    console.log('Running in native mode');
    // #endif
  },
  watch: {
    latitude() {
      this.updateGoogleMapCenter();
    },
    longitude() {
      this.updateGoogleMapCenter();
    },
    markers: {
      handler() {
        this.updateGoogleMapMarkers();
      },
      deep: true
    },
    polyline: {
      handler() {
        this.updateGoogleMapPolylines();
      },
      deep: true
    }
  },
  beforeDestroy() {
    // Clean up Google Maps resources
    if (this.isH5) {
      this.googleMapMarkers.forEach(marker => {
        marker.setMap(null);
      });
      this.googleMapPolylines.forEach(polyline => {
        polyline.setMap(null);
      });
    }
  },
  methods: {
    initGoogleMap() {
      if (!this.isH5) return;
      
      setTimeout(() => {
        const mapElement = document.getElementById(this.mapId);
        if (mapElement && window.google && window.google.maps) {
          console.log('Initializing Google Map:', this.mapId);
          this.googleMap = new google.maps.Map(mapElement, {
            center: { lat: this.latitude, lng: this.longitude },
            zoom: this.scale,
            mapTypeControl: true,
            streetViewControl: false
          });
          
          this.updateGoogleMapMarkers();
          this.updateGoogleMapPolylines();
        } else {
          console.error('Failed to initialize Google Map:', 
            !mapElement ? 'No map element' : 
            !window.google ? 'Google Maps API not loaded' : 
            !window.google.maps ? 'Maps API not available' : 
            'Unknown error');
        }
      }, 500);
    },
    updateGoogleMapCenter() {
      if (this.isH5 && this.googleMap) {
        this.googleMap.setCenter({ lat: this.latitude, lng: this.longitude });
      }
    },
    updateGoogleMapMarkers() {
      if (!this.isH5 || !this.googleMap) return;
      
      // Clear existing markers
      this.googleMapMarkers.forEach(marker => {
        marker.setMap(null);
      });
      this.googleMapMarkers = [];
      
      // Add new markers
      this.markers.forEach(markerData => {
        const marker = new google.maps.Marker({
          position: { lat: markerData.latitude, lng: markerData.longitude },
          map: this.googleMap,
          title: markerData.title || '',
          icon: markerData.iconPath ? {
            url: markerData.iconPath,
            scaledSize: new google.maps.Size(markerData.width || 32, markerData.height || 32)
          } : undefined
        });
        
        marker.addListener('click', () => {
          this.$emit('markertap', { markerId: markerData.id });
        });
        
        this.googleMapMarkers.push(marker);
      });
    },
    updateGoogleMapPolylines() {
      if (!this.isH5 || !this.googleMap) return;
      
      // Clear existing polylines
      this.googleMapPolylines.forEach(polyline => {
        polyline.setMap(null);
      });
      this.googleMapPolylines = [];
      
      // Add new polylines
      this.polyline.forEach(polylineData => {
        const path = polylineData.points.map(point => ({
          lat: point.latitude,
          lng: point.longitude
        }));
        
        const polyline = new google.maps.Polyline({
          path,
          geodesic: true,
          strokeColor: polylineData.color || '#007AFF',
          strokeOpacity: 1.0,
          strokeWeight: polylineData.width || 3,
          map: this.googleMap
        });
        
        this.googleMapPolylines.push(polyline);
      });
    },
    onMarkerTap(e) {
      this.$emit('markertap', e);
    }
  }
}
</script>

<style>
.map-container {
  width: 100%;
  height: 100%;
  position: relative;
  border: 1px solid #ccc; /* Helps visualize the container */
}

.map {
  width: 100%;
  height: 100%;
}
</style>
