import axios from 'axios';

// Get base URL from Vite env variables
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

const getBaseOrigin = (url) => {
  try {
    return new URL(url).origin;
  } catch (e) {
    return 'http://localhost:8000';
  }
};
const BASE_ORIGIN = getBaseOrigin(API_URL);

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Axios response interceptor for easy error handling
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('API call error:', error.response || error.message);
    return Promise.reject(error.response?.data || error.message);
  }
);

export const api = {
  // System Health
  getHealth: () => axios.get(`${BASE_ORIGIN}/api/health`).then(res => res.data),

  // Modular AI Assistant endpoint (Feature 1)
  postChat: (message) => axios.post(`${BASE_ORIGIN}/api/chat`, { message }).then(res => res.data),

  // AI Assistant Chat (V1 legacy)
  postChatMessage: (message, sessionId = 'web-session') => 
    apiClient.post('/gemini/chat', { message, session_id: sessionId }),

  // Stadium static locations
  getLocations: () => apiClient.get('/stadium/locations'),

  // Live crowd telemetries
  getCrowdStatus: () => apiClient.get('/crowd/status'),

  // Incident log retrieval
  getEmergencyReports: () => apiClient.get('/emergency/reports'),

  // Incident report submission
  postEmergencyReport: (incidentData) => 
    apiClient.post('/emergency/reports', incidentData),
};

export default apiClient;
