import axios from 'axios';

const apiBaseUrl = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api` 
  : '/api';

const api = axios.create({
  baseURL: apiBaseUrl,
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('swiftship_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('swiftship_token');
      localStorage.removeItem('swiftship_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

export const authAPI = {
  login: (data: any) => api.post('/auth/login', data),
  register: (data: any) => api.post('/auth/register', data),
  me: () => api.get('/auth/me')
};

export const parcelAPI = {
  getAll: (params?: any) => api.get('/parcels', { params }),
  getById: (id: string) => api.get(`/parcels/${id}`),
  track: (parcelId: string) => api.get(`/parcels/track/${parcelId}`),
  create: (data: any) => api.post('/parcels', data),
  update: (id: string, data: any) => api.put(`/parcels/${id}`, data),
  updateStatus: (id: string, data: any) => api.patch(`/parcels/${id}/status`, data),
  delete: (id: string) => api.delete(`/parcels/${id}`)
};

export const senderAPI = {
  getAll: (params?: any) => api.get('/senders', { params }),
  create: (data: any) => api.post('/senders', data),
  update: (id: string, data: any) => api.put(`/senders/${id}`, data),
  delete: (id: string) => api.delete(`/senders/${id}`),
  getParcels: (id: string) => api.get(`/senders/${id}/parcels`)
};

export const receiverAPI = {
  getAll: (params?: any) => api.get('/receivers', { params }),
  create: (data: any) => api.post('/receivers', data),
  update: (id: string, data: any) => api.put(`/receivers/${id}`, data),
  delete: (id: string) => api.delete(`/receivers/${id}`),
  getParcels: (id: string) => api.get(`/receivers/${id}/parcels`)
};

export const deliveryAPI = {
  getAll: () => api.get('/deliveries'),
  getById: (id: string) => api.get(`/deliveries/${id}`),
  create: (data: any) => api.post('/deliveries', data),
  update: (id: string, data: any) => api.put(`/deliveries/${id}`, data),
  updateLocation: (id: string, data: any) => api.patch(`/deliveries/${id}/location`, data),
  assignAgent: (id: string, data: any) => api.patch(`/deliveries/${id}/assign`, data)
};

export const notificationAPI = {
  getAll: () => api.get('/notifications'),
  markRead: (id: string) => api.patch(`/notifications/${id}/read`)
};

export const reportAPI = {
  overview: () => api.get('/reports/overview'),
  parcels: (params?: any) => api.get('/reports/parcels', { params }),
  deliveries: (params?: any) => api.get('/reports/deliveries', { params }),
  agents: () => api.get('/reports/agents')
};

export const aiAPI = {
  chat: (message: string) => api.post('/ai/chat', { message })
};

export const userAPI = {
  getAll: (params?: any) => api.get('/users', { params }),
  getById: (id: string) => api.get(`/users/${id}`),
  update: (id: string, data: any) => api.put(`/users/${id}`, data),
  toggleStatus: (id: string) => api.patch(`/users/${id}/toggle`),
  delete: (id: string) => api.delete(`/users/${id}`)
};

export const auditAPI = {
  getLogs: (params?: any) => api.get('/audit', { params })
};
