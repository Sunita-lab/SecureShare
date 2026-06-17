import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Har request mein token automatically lagao
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
};

export const fileAPI = {
  upload: (formData) => API.post('/files/upload', formData),
  generateShareLink: (fileId, data) => API.post(`/files/share/${fileId}`, data),
  download: (token, data) => API.post(`/files/download/${token}`, data, { responseType: 'blob', headers: { 'Content-Type': 'application/json'} } ),
  getMyFiles: () => API.get('/files/myfiles'),
  getStats: () => API.get('/files/stats'),
  deleteFile: (fileId) => API.delete(`/files/delete/${fileId}`),
  revokeLink: (fileId) => API.patch(`/files/revoke/${fileId}`),
};

export default API;