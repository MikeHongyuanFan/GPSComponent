# GPS Tracking Check-In System - Frontend

This is the frontend application for the GPS Tracking Check-In System, built with Vue 3 and uni-app framework.

## Features

- Employee check-in/check-out functionality
- GPS location tracking
- Location history viewing
- GPS movement simulation
- Cross-platform support (H5, iOS, Android)
- Google Maps integration for web version

## Project Structure

```
/
├── src/                # Source code
│   ├── components/     # Vue components
│   ├── pages/          # Application pages
│   │   ├── index/      # Check-in page
│   │   ├── history/    # History page
│   │   └── simulation/ # Simulation page
│   ├── store/          # Pinia store
│   ├── utils/          # Utility functions
│   └── App.vue         # Main app component
├── static/             # Static assets
└── ...
```

## Setup Instructions

1. Install dependencies:
   ```
   npm install
   ```

2. Start the development server:
   ```
   npm run dev:h5
   ```

   For other platforms:
   ```
   npm run dev:mp-weixin     # WeChat Mini Program
   npm run dev:app-plus      # Native App (iOS/Android)
   ```

3. Build for production:
   ```
   npm run build:h5
   ```

## API Integration

The application connects to the mock API server running at http://localhost:3000. Make sure the mock API server is running before starting the frontend application.

## Google Maps Integration

For the web version (H5), the application uses Google Maps for displaying maps. The Google Maps API key is configured in the `index.html` file.

## Mobile Features

On mobile platforms, the application uses the native map component provided by uni-app. It also accesses device features like:

- GPS location
- Battery status
- Network information

## Simulation Mode

The simulation mode allows testing the GPS tracking functionality without physically moving. It simulates movement along predefined or custom routes.

## Technologies Used

- Vue 3
- uni-app framework
- Pinia for state management
- Google Maps API (web version)
- Native map components (mobile)
