# Health Tracker

A personal health, fitness, and nutrition tracker web app that connects to Apple Health data, tracks weight progress against health metrics, and manages nutritional goals.

## Features

- **Dashboard**: Overview of your health metrics including current weight, daily calories, and Apple Health sync status
- **Weight Tracker**: Log and track your weight over time with notes
- **Nutrition Logger**: Track meals and macronutrients (calories, protein, carbs, fat) by meal type
- **Apple Health Integration**: Connect to Apple Health to sync your health data automatically

## Tech Stack

### Frontend
- React 18.2 with Vite
- Modern CSS with CSS variables
- Running on port 5173

### Backend
- Express.js server
- RESTful API
- CORS enabled
- Running on port 3001

## Project Structure

```
health-tracker/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # Reusable React components
│   │   │   ├── Layout.jsx
│   │   │   └── Navigation.jsx
│   │   ├── pages/         # Main page components
│   │   │   ├── Dashboard.jsx
│   │   │   ├── WeightTracker.jsx
│   │   │   ├── NutritionLogger.jsx
│   │   │   └── AppleHealthConnect.jsx
│   │   ├── services/      # API service layer
│   │   │   └── api.js
│   │   ├── styles/        # CSS stylesheets
│   │   │   ├── index.css
│   │   │   └── App.css
│   │   ├── App.jsx        # Main App component
│   │   └── main.jsx       # React entry point
│   └── index.html         # HTML template
├── server/                # Backend Express application
│   ├── routes/           # API route handlers
│   │   ├── health.js     # Health summary endpoints
│   │   ├── weight.js     # Weight tracking endpoints
│   │   ├── nutrition.js  # Nutrition logging endpoints
│   │   └── appleHealth.js # Apple Health integration endpoints
│   └── index.js          # Express server setup
├── shared/               # Shared utilities
│   └── utils/
├── .env.example          # Environment variables template
├── vite.config.js        # Vite configuration
└── package.json          # Project dependencies

```

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. Update the `.env` file with your configuration

### Running the Application

Start both frontend and backend concurrently:
```bash
npm run dev
```

This will start:
- Frontend: http://localhost:5173
- Backend: http://localhost:3001

### Development Commands

- `npm run dev` - Start both frontend and backend in development mode
- `npm run dev:server` - Start only the backend server
- `npm run dev:client` - Start only the frontend client
- `npm run build` - Build frontend for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm test` - Run tests

## API Endpoints

### Health Summary
- `GET /api/health/summary` - Get dashboard health summary

### Weight Tracking
- `GET /api/weight` - Get all weight entries
- `POST /api/weight` - Add new weight entry
- `DELETE /api/weight/:id` - Delete weight entry

### Nutrition Logging
- `GET /api/nutrition?date=YYYY-MM-DD` - Get nutrition entries (optionally filtered by date)
- `POST /api/nutrition` - Add new nutrition entry
- `DELETE /api/nutrition/:id` - Delete nutrition entry

### Apple Health Integration
- `GET /api/apple-health/status` - Get connection status
- `POST /api/apple-health/connect` - Connect to Apple Health
- `POST /api/apple-health/disconnect` - Disconnect from Apple Health
- `POST /api/apple-health/sync` - Sync data from Apple Health

## Environment Variables

See `.env.example` for all available configuration options:
- `PORT` - Backend server port (default: 3001)
- `NODE_ENV` - Environment (development/production)
- `CORS_ORIGIN` - Allowed CORS origin (default: http://localhost:5173)
- Apple Health API credentials
- Database configuration
- JWT settings

## Current Implementation

This is currently a demo implementation with in-memory storage. The data will reset when the server restarts. In a production environment, you would:
- Add a database (PostgreSQL, MongoDB, etc.)
- Implement real Apple Health OAuth integration
- Add user authentication and authorization
- Add data persistence and migration strategies
- Implement proper error handling and logging

## License

MIT
