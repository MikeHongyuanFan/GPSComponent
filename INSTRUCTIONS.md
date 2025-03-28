# GPS Tracking Component Integration Guide

## 组件概述 (Component Overview)

GPS跟踪签到组件是一个跨平台的员工位置跟踪解决方案，可以轻松集成到现有的企业应用中。该组件提供签到/签退功能、位置历史记录和GPS模拟功能，支持Web、iOS和Android平台。

The GPS Tracking Check-In component is a cross-platform employee location tracking solution that can be easily integrated into existing enterprise applications. This component provides check-in/check-out functionality, location history, and GPS simulation features, supporting Web, iOS, and Android platforms.

## 集成指南 (Integration Guide)

### 1. 前置条件 (Prerequisites)

- Node.js 14.0+
- npm 6.0+ 或 yarn 1.22+
- Vue.js 项目 (推荐Vue 3，但也支持Vue 2.6+)
- uni-app 项目 (如果需要跨平台支持)
- Google Maps API密钥 (用于Web版本)

### 2. 安装步骤 (Installation Steps)

#### 2.1 添加组件到项目 (Add Component to Project)

**选项1: 作为子模块添加 (Option 1: Add as Submodule)**

```bash
# 在项目根目录下
# In your project root directory
git submodule add <repository-url> components/gps-tracking
```

**选项2: 复制组件文件 (Option 2: Copy Component Files)**

将以下目录复制到您的项目中:
Copy the following directories to your project:

```
frontend-new/
├── src/
│   ├── components/MapComponent.vue
│   ├── pages/
│   │   ├── index/index.vue
│   │   ├── history/history.vue
│   │   └── simulation/simulation.vue
│   ├── store/index.js
│   └── utils/
│       ├── api.js
│       └── location.js
```

#### 2.2 安装依赖 (Install Dependencies)

```bash
npm install pinia axios
# 或者 (or)
yarn add pinia axios
```

#### 2.3 配置Google Maps (Configure Google Maps)

在您的HTML模板中添加Google Maps脚本:
Add the Google Maps script to your HTML template:

```html
<!-- 在index.html的head部分 -->
<!-- In the head section of index.html -->
<script src="https://maps.googleapis.com/maps/api/js?key=MY_GOOGLE_API_KEY"></script>
```

### 3. 组件集成 (Component Integration)

#### 3.1 集成到Vue路由 (Integrate with Vue Router)

```javascript
// router.js
import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  // 您现有的路由
  // Your existing routes
  
  // GPS跟踪组件路由
  // GPS tracking component routes
  {
    path: '/check-in',
    name: 'CheckIn',
    component: () => import('./components/gps-tracking/pages/index/index.vue')
  },
  {
    path: '/location-history',
    name: 'LocationHistory',
    component: () => import('./components/gps-tracking/pages/history/history.vue')
  },
  {
    path: '/simulation',
    name: 'Simulation',
    component: () => import('./components/gps-tracking/pages/simulation/simulation.vue')
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
```

#### 3.2 集成Pinia存储 (Integrate Pinia Store)

```javascript
// main.js
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';

// 导入GPS跟踪组件的存储
// Import GPS tracking component stores
import { useUserStore, useLocationStore, useSimulationStore } from './components/gps-tracking/store';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);
app.mount('#app');

// 初始化存储
// Initialize stores
const userStore = useUserStore();
const locationStore = useLocationStore();
```

#### 3.3 配置API端点 (Configure API Endpoints)

修改`components/gps-tracking/utils/api.js`文件，更新API基础URL:
Modify the `components/gps-tracking/utils/api.js` file to update the API base URL:

```javascript
// api.js
import axios from 'axios';

// 更改为您的API端点
// Change to your API endpoint
const API_BASE_URL = 'https://your-api-server.com/api';

// 其余代码保持不变
// Rest of the code remains unchanged
```

### 4. 后端集成 (Backend Integration)

#### 4.1 API端点实现 (API Endpoint Implementation)

您需要在后端实现以下API端点:
You need to implement the following API endpoints in your backend:

**用户状态 (User Status)**
- `GET /api/user/status/:userId`
- `POST /api/user/status`

**位置跟踪 (Location Tracking)**
- `POST /api/tracking/location`
- `GET /api/tracking/history/:userId`
- `GET /api/tracking/current/:userId`
- `GET /api/company/locations`

**模拟功能 (Simulation Features)**
- `POST /api/simulation/start`
- `POST /api/simulation/stop`
- `GET /api/simulation/active`
- `POST /api/simulation/route`
- `GET /api/simulation/routes`
- `GET /api/simulation/route/:routeName`

#### 4.2 数据模型 (Data Models)

**用户状态模型 (User Status Model)**
```javascript
{
  userId: Number,
  status: String, // 'WORKING_OFFICE', 'WORKING_REMOTE', 'NOT_WORKING'
  startTime: String // ISO日期时间格式
}
```

**位置数据模型 (Location Data Model)**
```javascript
{
  userId: Number,
  trackingType: String, // 'CLOCK_IN_OFFICE', 'CLOCK_IN_REMOTE', 'CLOCK_OUT', 'TRACKING_POINT'
  latitude: Number,
  longitude: Number,
  accuracy: Number,
  timestamp: String, // ISO日期时间格式
  batteryLevel: Number,
  networkType: String
}
```

**公司位置模型 (Company Location Model)**
```javascript
{
  id: Number,
  name: String,
  address: String,
  latitude: Number,
  longitude: Number,
  radius: Number // 以米为单位的地理围栏半径
}
```

### 5. 自定义与扩展 (Customization and Extension)

#### 5.1 自定义UI (Customize UI)

您可以通过修改组件的样式来匹配您的应用设计:
You can customize the component's style to match your application design:

```css
/* 在您的全局CSS文件中 */
/* In your global CSS file */
:root {
  --gps-primary-color: #your-primary-color;
  --gps-secondary-color: #your-secondary-color;
  --gps-danger-color: #your-danger-color;
  --gps-card-border-radius: 8px;
  /* 更多自定义变量 */
  /* More custom variables */
}
```

#### 5.2 扩展功能 (Extend Functionality)

**添加地理围栏功能 (Add Geofencing)**

在`utils/location.js`中添加:
Add to `utils/location.js`:

```javascript
// 检查用户是否在公司位置范围内
// Check if user is within company location radius
export const isUserAtCompanyLocation = (userLat, userLng, companyLocations) => {
  for (const location of companyLocations) {
    if (isWithinRadius(userLat, userLng, location.latitude, location.longitude, location.radius)) {
      return location;
    }
  }
  return null;
};
```

**添加自动签到提醒 (Add Auto Check-in Reminders)**

创建新组件`components/CheckInReminder.vue`:
Create a new component `components/CheckInReminder.vue`:

```vue
<template>
  <div class="reminder" v-if="showReminder">
    <p>您似乎已到达办公室。是否要签到？</p>
    <button @click="checkIn">签到</button>
    <button @click="dismiss">稍后</button>
  </div>
</template>

<script>
import { useUserStore, useLocationStore } from '../store';
import { getCurrentLocation, isUserAtCompanyLocation } from '../utils/location';

export default {
  // 实现组件逻辑
  // Implement component logic
}
</script>
```

### 6. 在团队项目中使用 (Using in Team Projects)

#### 6.1 代码管理 (Code Management)

- 使用Git子模块保持组件更新
- 为团队成员创建集成文档
- 在代码审查中包含组件变更

#### 6.2 协作开发 (Collaborative Development)

- 前端开发人员负责UI集成和自定义
- 后端开发人员实现API端点
- 移动开发人员测试原生平台兼容性

#### 6.3 测试策略 (Testing Strategy)

- 单元测试: 测试位置计算和存储逻辑
- 集成测试: 测试API交互
- 端到端测试: 测试完整的签到流程
- 模拟测试: 使用GPS模拟功能测试不同场景

### 7. 部署注意事项 (Deployment Considerations)

#### 7.1 Web部署 (Web Deployment)

- 确保Google Maps API密钥有正确的域名限制
- 配置HTTPS以获取准确的地理位置
- 优化地图资源加载

#### 7.2 移动应用部署 (Mobile App Deployment)

- 请求适当的位置权限
- 处理后台位置跟踪
- 优化电池使用

#### 7.3 安全考虑 (Security Considerations)

- 实现用户认证和授权
- 加密敏感位置数据
- 限制位置历史访问权限

## 故障排除 (Troubleshooting)

### 常见问题 (Common Issues)

1. **地图不显示 (Map Not Displaying)**
   - 检查Google Maps API密钥
   - 确保正确加载地图脚本
   - 检查地图容器是否有高度

2. **位置不准确 (Inaccurate Location)**
   - 确保设备GPS已启用
   - 检查位置权限
   - 在开阔区域测试

3. **API连接错误 (API Connection Errors)**
   - 验证API端点URL
   - 检查网络连接
   - 查看CORS设置

### 调试技巧 (Debugging Tips)

- 使用浏览器控制台检查错误
- 启用详细日志记录
- 使用模拟功能测试不同场景

## 联系与支持 (Contact and Support)

如有任何集成问题或需要进一步支持，请联系项目维护者。

For any integration issues or further support, please contact the project maintainer.

---

祝您成功集成GPS跟踪组件！

Good luck with your GPS tracking component integration!
