import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5173/api',
});

// Agregar token automáticamente a cada request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Si el token expira, redirigir al login
api.interceptors.response.use(
  res => res,
  err => {
    const isLoginRoute = err.config?.url?.includes('/auth/login');
    if (err.response?.status === 401 && !isLoginRoute) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// Auth
export const login = (email, password) => api.post('/auth/login', { email, password });
export const getMe  = () => api.get('/auth/me');

// Miembros
export const getMembers    = () => api.get('/members');
export const createMember  = (data) => api.post('/members', data);
export const updateMember  = (id, data) => api.put(`/members/${id}`, data);
export const deleteMember  = (id) => api.delete(`/members/${id}`);

// Grupos
export const getGroups    = () => api.get('/groups');
export const createGroup  = (data) => api.post('/groups', data);
export const updateGroup  = (id, data) => api.put(`/groups/${id}`, data);
export const deleteGroup  = (id) => api.delete(`/groups/${id}`);

// Semanas
export const getWeeks              = () => api.get('/weeks');
export const getWeekById           = (id) => api.get(`/weeks/${id}`);
export const importWeek            = (docId) => api.post('/weeks/import', { docId });
export const generateAssignments   = (id) => api.post(`/weeks/${id}/generate`);
export const deleteWeek            = (id) => api.delete(`/weeks/${id}`);
export const updateAssignmentMember = (assignmentId, memberId) =>
  api.patch(`/weeks/assignments/${assignmentId}/member`, { memberId });
export const updateAssignmentType  = (assignmentId, assignmentTypeId, customName) =>
  api.patch(`/weeks/assignments/${assignmentId}/type`, { assignmentTypeId, customName });

// Tipos de asignación
export const getAssignmentTypes = () => api.get('/assignment-types');

// Feedback
export const sendFeedback = (type, message) => api.post('/feedback', { type, message });

// Congregaciones (superadmin)
export const getCongregations     = () => api.get('/congregations');
export const createCongregation   = (data) => api.post('/congregations', data);
export const toggleCongregation   = (id) => api.patch(`/congregations/${id}/toggle`);

export const changePassword = (userId, newPassword) =>
  api.patch('/congregations/change-password', { userId, newPassword });
export const getFeedback = () => api.get('/feedback');