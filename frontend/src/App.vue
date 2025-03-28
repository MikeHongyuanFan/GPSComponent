<script setup>
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app';
import { useUserStore, useLocationStore } from './store';

onLaunch(() => {
  console.log('App Launch');
  initializeApp();
});

onShow(() => {
  console.log('App Show');
});

onHide(() => {
  console.log('App Hide');
});

// Initialize app data
async function initializeApp() {
  try {
    const userStore = useUserStore();
    const locationStore = useLocationStore();
    
    // Load user status
    await userStore.fetchUserStatus();
    
    // Load company locations
    await locationStore.fetchCompanyLocations();
    
    // Get current location
    await locationStore.fetchCurrentLocation();
  } catch (error) {
    console.error('Error initializing app:', error);
  }
}
</script>

<style lang="scss">
/* Global styles */
page {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  background-color: #f8f8f8;
  font-size: 14px;
  color: #333;
}

/* Common styles */
.container {
  padding: 20px;
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

.form-item {
  margin-bottom: 15px;
}

.form-label {
  font-size: 14px;
  color: #666;
  margin-bottom: 5px;
}

.form-input {
  height: 40px;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 0 10px;
  font-size: 14px;
  width: 100%;
}

.map-container {
  width: 100%;
  height: 300px;
  margin-bottom: 15px;
  border-radius: 8px;
  overflow: hidden;
}

.flex-row {
  display: flex;
  flex-direction: row;
}

.flex-column {
  display: flex;
  flex-direction: column;
}

.space-between {
  justify-content: space-between;
}

.align-center {
  align-items: center;
}

.text-center {
  text-align: center;
}

.mt-10 {
  margin-top: 10px;
}

.mb-10 {
  margin-bottom: 10px;
}

.ml-10 {
  margin-left: 10px;
}

.mr-10 {
  margin-right: 10px;
}
</style>
