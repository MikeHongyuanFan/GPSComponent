# GPS Tracking Check-In System

This project implements a GPS tracking component for employee check-in/check-out functionality across multiple platforms using Vue.js 2.6.x with uni-app framework.

## Project Structure

```
/
├── frontend/           # Vue.js with uni-app frontend application
│   ├── src/            # Source code
│   │   ├── components/ # Vue components
│   │   ├── pages/      # Application pages
│   │   ├── store/      # Vuex store
│   │   ├── utils/      # Utility functions
│   │   └── App.vue     # Main app component
│   └── ...
├── mock-api/           # Mock API server to simulate backend
│   ├── server.js       # Express server
│   ├── routes/         # API routes
│   └── data/           # Mock data
└── README.md           # Project documentation
```

## Setup Instructions

### Mock API Server

1. Navigate to the mock-api directory:
   ```
   cd mock-api
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the mock API server:
   ```
   npm start
   ```

The mock API will be available at http://localhost:3000

### Frontend Application

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm run dev
   ```

## API Endpoints

The mock API server provides the following endpoints:

- `POST /api/tracking/location` - Submit location data
- `GET /api/tracking/history/:userId` - Get location history for a user
- `GET /api/tracking/current/:userId` - Get current location for a user
- `POST /api/user/status` - Update user status
- `GET /api/user/status/:userId` - Get user status
- `GET /api/company/locations` - Get company locations

### Simulation API Endpoints

For development and testing purposes, the mock API also provides simulation endpoints:

- `POST /api/simulation/start` - Start a GPS movement simulation
- `POST /api/simulation/stop` - Stop an active simulation
- `GET /api/simulation/active` - Get all active simulations
- `POST /api/simulation/route` - Add a custom route
- `GET /api/simulation/routes` - Get all available routes
- `GET /api/simulation/route/:routeName` - Get specific route details

## Google Maps Integration

The project includes Google Maps integration for the web version (H5). To use Google Maps:

1. Get a Google Maps API key from the [Google Cloud Console](https://console.cloud.google.com/)
2. Replace the placeholder API key in `frontend/src/components/SimulationControl.vue` with your actual API key
3. The map will automatically use Google Maps when running in H5 mode

## Technologies Used

- Frontend: Vue.js 2.6.x with uni-app
- Mock API: Node.js with Express
- Maps: Native map component (mobile) and Google Maps (web)
