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

export const managerAPI = {
  // Overview stats
  getOverviewStats: () => api.get('/manager/overview/stats'),
  getRecentActivity: () => api.get('/manager/overview/activity'),
  
  // Projects
  getProjectsProgress: () => api.get('/manager/projects/progress'),
  updateProject: (id: string, data: any) => api.patch(`/manager/projects/${id}`, data),
  
  // Tasks
  getTasks: () => api.get('/manager/tasks'),
  getMeetingDetails: (id: string) => api.get(`/meetings/${id}`),
  summarizeMeeting: (id: string) => api.post(`/meetings/${id}/summarize`),
  updateMeeting: (id: string, data: any) => api.put(`/meetings/${id}`, data),
  createTask: (data: any) => api.post('/manager/tasks', data),
  updateTask: (id: string, data: any) => api.patch(`/manager/tasks/${id}`, data),
  getTasksStatusSummary: () => api.get('/manager/tasks/status-summary'),
  getUnassignedTasks: () => api.get('/manager/tasks/unassigned'),
  assignTask: (id: string, employeeId: string) => api.patch(`/manager/tasks/${id}/assign`, { employeeId }),
  
  // Employees & Team
  getEmployees: () => api.get('/manager/employees'),
  rateEmployee: (empId: string, rating: number) => api.post('/manager/rate-employee', { employeeId: empId, rating }),
  
  // Performance
  getPerformanceMe: () => api.get('/manager/performance/me'),
  getPerformanceTeam: () => api.get('/manager/performance/team'),
  getManagerAIReport: () => api.get('/manager/performance/ai-report'),
  
  // Daily Reports
  getReports: () => api.get('/manager/reports'),
  updateReportStatus: (id: string, data: any) => api.patch(`/manager/reports/${id}/status`, data),
  
  // Meetings
  getMeetingRequests: () => api.get('/manager/meetings/requests'),
  handleMeetingRequest: (data: any) => api.post('/manager/meetings/handle-request', data),

  // Clients & Demands
  getClients: () => api.get('/manager/clients'),
  getClientDemands: (params = {}) => api.get('/manager/demands', { params }),
  updateDemandStatus: (id: string, data: any) => api.patch(`/manager/demands/${id}/status`, data),

  // Sharing
  toggleReportSharing: (id: string) => api.patch(`/manager/reports/${id}/share`),
  toggleMeetingSharing: (id: string) => api.patch(`/manager/meetings/${id}/share`),
  shareMeetingSummary: (id: string, data: { clientIds: string[] }) => api.post(`/manager/meetings/${id}/share-summary`, data),
};
