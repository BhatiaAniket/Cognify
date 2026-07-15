import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000/api' : '/api');

const api = axios.create({
  baseURL: `${API_URL}/superadmin`,
  withCredentials: true,
});

// Interceptor for Auth token
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
        const res = await axios.post(`${API_URL}/auth/refresh-token`, {}, { withCredentials: true });
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

export const superAdminService = {
  getOverview: () => api.get('/overview'),
  getCompanies: () => api.get('/companies'),
  getCompanyDetail: (id: string) => api.get(`/companies/${id}`),
  suspendCompany: (id: string) => api.patch(`/companies/${id}/suspend`),
  activateCompany: (id: string) => api.patch(`/companies/${id}/activate`),
  deleteCompany: (id: string) => api.delete(`/companies/${id}`),
  getSubscriptions: () => api.get('/subscriptions'),
  updateSubscription: (id: string, data: any) => api.patch(`/subscriptions/${id}`, data),
  getPlans: () => api.get('/plans'),
  createPlan: (data: any) => api.post('/plans', data),
  updatePlan: (id: string, data: any) => api.patch(`/plans/${id}`, data),
  getAnalytics: () => api.get('/analytics'),
};
