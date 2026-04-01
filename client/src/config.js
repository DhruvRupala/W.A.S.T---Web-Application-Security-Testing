// Centralized API configuration
// This reads from the VITE_API_URL environment variable set in .env
// For local development: http://localhost:5000
// For production: https://wast-backend.onrender.com (or your Render URL)

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
