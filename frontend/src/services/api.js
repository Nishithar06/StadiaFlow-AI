import axios from 'axios';

// Get base URL from Vite env variables
const API_URL = import.meta.env.VITE_API_URL || 'https://stadiaflow-ai.onrender.com/api';

const getBaseOrigin = (url) => {
  try {
    return new URL(url).origin;
  } catch {
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

  // Interactive Stadium Navigation (Feature 3)
  getNavigation: () => axios.get(`${BASE_ORIGIN}/api/navigation`).then(res => res.data),

  // Smart Operations Dashboard (Feature 2)
  getDashboard: () => axios.get(`${BASE_ORIGIN}/api/dashboard`).then(res => res.data),

  // Modular AI Assistant endpoint (Feature 1)
  postChat: (message) => axios.post(`${BASE_ORIGIN}/api/chat`, { message }).then(res => res.data),

  // AI Assistant Chat (V1 legacy)
  postChatMessage: (message, sessionId = 'web-session') => 
    axios.post(`${BASE_ORIGIN}/api/v1/gemini/chat`, { message, session_id: sessionId }).then(res => res.data),

  // Stadium static locations
  getLocations: () => axios.get(`${BASE_ORIGIN}/api/v1/stadium/locations`).then(res => res.data),

  // Live crowd telemetries
  getCrowdStatus: () => axios.get(`${BASE_ORIGIN}/api/v1/crowd/status`).then(res => res.data),

  // Incident log retrieval
  getEmergencyReports: () => axios.get(`${BASE_ORIGIN}/api/v1/emergency/reports`).then(res => res.data),

  // Incident report submission
  postEmergencyReport: (incidentData) => 
    axios.post(`${BASE_ORIGIN}/api/v1/emergency/reports`, incidentData).then(res => res.data),
};

export default apiClient;
