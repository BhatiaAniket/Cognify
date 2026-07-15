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

export const employeeAPI = {
  getOverviewStats: () => api.get('/employee/overview/stats'),
  getUpcomingDeadlines: () => api.get('/employee/overview/deadlines'),
  getUpcomingMeetings: () => api.get('/employee/overview/meetings'),

  getTasks: () => api.get('/employee/tasks'),
  updateTaskStatus: (id: string, status: string) => api.patch(`/employee/tasks/${id}/status`, { status }),

  getDailyReports: () => api.get('/employee/reports'),
  submitDailyReport: (data: any) => api.post('/employee/reports', data, {
    headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {},
  }),

  getMeetings: () => api.get('/meetings'),
  summarizeMeeting: (id: string) => api.post(`/meetings/${id}/summarize`),
  // Sockets & Chat
  getConversations: () => api.get('/chat/conversations'),
  getMeetingRequests: () => api.get('/employee/meetings/requests'),
  requestMeeting: (data: any) => api.post('/employee/meetings/request', data),

  // Performance — returns unified score /1000, breakdown, weeklyData, recentRatings
  getPerformance: () => api.get('/employee/performance'),
  // AI report (rate-limited: once per day, cached)
  getPerformanceAIReport: () => api.get('/employee/performance/ai-report'),

  getColleagues: () => api.get('/employee/colleagues'),

  getNotifications: () => api.get('/employee/notifications'),
  markNotificationRead: (id: string) => api.patch(`/employee/notifications/${id}/read`),
  markAllNotificationsRead: () => api.put('/employee/notifications/read-all'),
  getUnreadCount: () => api.get('/employee/notifications/unread-count'),
  deleteNotification: (id: string) => api.delete(`/notifications/${id}`),
};
