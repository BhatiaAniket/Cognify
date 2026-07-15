import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000/api' : '/api'),
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const filesAPI = {
  getRecipients: () => api.get('/files/recipients'),
  getReceivedFiles: () => api.get('/files/received'),
  getSentFiles: () => api.get('/files/sent'),
  getUserFiles: (params?: any) => api.get('/files', { params }),
  uploadFile: (data: FormData) => api.post('/files/upload', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteFile: (id: string) => api.delete(`/files/${id}`),
  markAsRead: (id: string) => api.patch(`/files/${id}/read`),
};
