import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000/api' : '/api');

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const res = await axios.post(`${API_BASE}/auth/refresh-token`, {}, { withCredentials: true });
        const { accessToken } = res.data.data;
        localStorage.setItem('accessToken', accessToken);
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export const clientAPI = {
  getOverview: () => api.get('/client/overview'),
  getProject: () => api.get('/client/project'),
  getMeetings: () => api.get('/client/meetings'),
  requestMeeting: (data: any) => api.post('/client/meetings/request', data),
  summarizeMeeting: (id: string) => api.post(`/client/meetings/${id}/summarize`),
  getReports: () => api.get('/client/reports'),
  getReportDetails: (id: string) => api.get(`/client/reports/${id}`),
  downloadReport: (id: string) => api.get(`/client/reports/${id}/download`, { responseType: 'blob' }),
  getSharedSummaries: () => api.get('/client/shared-summaries'),
  getDemands: () => api.get('/client/demands'),
  submitDemand: (data: any) => api.post('/client/demands', data),
  getNotifications: () => api.get('/client/notifications'),
  markNotificationRead: (id: string) => api.patch(`/client/notifications/${id}`),
};
