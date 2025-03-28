import { createPinia } from 'pinia';
import { defineStore } from 'pinia';
import api from '../utils/api';

// Create pinia instance
export const pinia = createPinia();

// User store
export const useUserStore = defineStore('user', {
  state: () => ({
    id: 1, // Default user ID
    name: 'John Doe',
    status: 'NOT_WORKING',
    lastStatusUpdate: null,
  }),
  
  getters: {
    isWorking: (state) => state.status === 'WORKING_OFFICE' || state.status === 'WORKING_REMOTE',
    formattedStatus: (state) => {
      switch (state.status) {
        case 'WORKING_OFFICE':
          return 'Working (Office)';
        case 'WORKING_REMOTE':
          return 'Working (Remote)';
        case 'NOT_WORKING':
          return 'Not Working';
        default:
          return state.status;
      }
    }
  },
  
  actions: {
    async fetchUserStatus() {
      try {
        const response = await api.user.getStatus(this.id);
        this.status = response.data.status;
        this.lastStatusUpdate = response.data.startTime;
        return response.data;
      } catch (error) {
        console.error('Error fetching user status:', error);
        throw error;
      }
    },
    
    async updateUserStatus(status) {
      try {
        const data = {
          userId: this.id,
          status,
          startTime: new Date().toISOString()
        };
        
        const response = await api.user.updateStatus(data);
        this.status = status;
        this.lastStatusUpdate = data.startTime;
        return response.data;
      } catch (error) {
        console.error('Error updating user status:', error);
        throw error;
      }
    }
  }
});

// Location store
export const useLocationStore = defineStore('location', {
  state: () => ({
    currentLocation: null,
    locationHistory: [],
    companyLocations: [],
    isLoading: false,
    error: null
  }),
  
  actions: {
    async fetchCurrentLocation() {
      try {
        this.isLoading = true;
        const response = await api.tracking.getCurrentLocation(useUserStore().id);
        this.currentLocation = response.data;
        this.isLoading = false;
        return response.data;
      } catch (error) {
        console.error('Error fetching current location:', error);
        this.error = error.message;
        this.isLoading = false;
        throw error;
      }
    },
    
    async fetchLocationHistory(date = null) {
      try {
        this.isLoading = true;
        const response = await api.tracking.getHistory(useUserStore().id, date);
        this.locationHistory = response.data;
        this.isLoading = false;
        return response.data;
      } catch (error) {
        console.error('Error fetching location history:', error);
        this.error = error.message;
        this.isLoading = false;
        throw error;
      }
    },
    
    async fetchCompanyLocations() {
      try {
        this.isLoading = true;
        const response = await api.company.getLocations();
        this.companyLocations = response.data;
        this.isLoading = false;
        return response.data;
      } catch (error) {
        console.error('Error fetching company locations:', error);
        this.error = error.message;
        this.isLoading = false;
        throw error;
      }
    },
    
    async submitLocation(trackingType, location) {
      try {
        const data = {
          userId: useUserStore().id,
          trackingType,
          latitude: location.latitude,
          longitude: location.longitude,
          accuracy: location.accuracy || 10,
          timestamp: location.timestamp || new Date().toISOString(),
          batteryLevel: location.batteryLevel || 100,
          networkType: location.networkType || 'WIFI'
        };
        
        const response = await api.tracking.submitLocation(data);
        return response.data;
      } catch (error) {
        console.error('Error submitting location:', error);
        this.error = error.message;
        throw error;
      }
    }
  }
});

// Simulation store
export const useSimulationStore = defineStore('simulation', {
  state: () => ({
    routes: [],
    activeSimulations: [],
    selectedRoute: null,
    simulationActive: false,
    simulationSettings: {
      interval: 10,
      autoClockIn: true,
      autoClockOut: true
    },
    isLoading: false,
    error: null
  }),
  
  actions: {
    async fetchRoutes() {
      try {
        this.isLoading = true;
        const response = await api.simulation.getRoutes();
        this.routes = response.data;
        this.isLoading = false;
        return response.data;
      } catch (error) {
        console.error('Error fetching routes:', error);
        this.error = error.message;
        this.isLoading = false;
        throw error;
      }
    },
    
    async fetchRouteDetails(routeName) {
      try {
        this.isLoading = true;
        const response = await api.simulation.getRoute(routeName);
        this.selectedRoute = response.data;
        this.isLoading = false;
        return response.data;
      } catch (error) {
        console.error('Error fetching route details:', error);
        this.error = error.message;
        this.isLoading = false;
        throw error;
      }
    },
    
    async fetchActiveSimulations() {
      try {
        this.isLoading = true;
        const response = await api.simulation.getActive();
        this.activeSimulations = response.data;
        
        // Check if current user has an active simulation
        const userSim = response.data.find(sim => sim.userId === useUserStore().id);
        this.simulationActive = !!userSim;
        
        this.isLoading = false;
        return response.data;
      } catch (error) {
        console.error('Error fetching active simulations:', error);
        this.error = error.message;
        this.isLoading = false;
        throw error;
      }
    },
    
    async startSimulation(routeName) {
      try {
        const data = {
          userId: useUserStore().id,
          routeName,
          options: {
            interval: this.simulationSettings.interval,
            autoClockIn: this.simulationSettings.autoClockIn,
            autoClockOut: this.simulationSettings.autoClockOut
          }
        };
        
        const response = await api.simulation.start(data);
        this.simulationActive = true;
        await this.fetchActiveSimulations();
        return response.data;
      } catch (error) {
        console.error('Error starting simulation:', error);
        this.error = error.message;
        throw error;
      }
    },
    
    async stopSimulation() {
      try {
        const data = {
          userId: useUserStore().id
        };
        
        const response = await api.simulation.stop(data);
        this.simulationActive = false;
        await this.fetchActiveSimulations();
        return response.data;
      } catch (error) {
        console.error('Error stopping simulation:', error);
        this.error = error.message;
        throw error;
      }
    },
    
    async createRoute(routeName, points) {
      try {
        const data = {
          routeName,
          points
        };
        
        const response = await api.simulation.addRoute(data);
        await this.fetchRoutes();
        return response.data;
      } catch (error) {
        console.error('Error creating route:', error);
        this.error = error.message;
        throw error;
      }
    },
    
    updateSimulationSettings(settings) {
      this.simulationSettings = {
        ...this.simulationSettings,
        ...settings
      };
    }
  }
});
