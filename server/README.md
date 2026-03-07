# Fish Cart - Server

Backend API server for Fish Cart application.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key_here
# Optional: comma-separated allowed frontend origins for CORS (default: http://localhost:5173)
# For production frontend on Vercel, set to your frontend URL, e.g.:
# FRONTEND_URL=https://fishcart.vercel.app
```

3. Start server:
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## API Documentation

See main README.md for API endpoint documentation.
