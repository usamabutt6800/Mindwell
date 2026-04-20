// The base URL for the backend API
// During development it defaults to http://localhost:5000/api unless overridden in .env
// In production, you would set REACT_APP_API_URL in your hosting platform
export const API_BASE_URL = process.env.REACT_APP_API_URL || 
  (process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:5000/api');

// For some places that only need the domain without the /api suffix:
export const API_DOMAIN = API_BASE_URL.replace('/api', '');
