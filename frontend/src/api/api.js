import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
});

// Miembros
export const getMembers = () => api.get('/members');
export const createMember = (data) => api.post('/members', data);
export const updateMember = (id, data) => api.put(`/members/${id}`, data);
export const deleteMember = (id) => api.delete(`/members/${id}`);

// Grupos
export const getGroups = () => api.get('/groups');
export const createGroup = (data) => api.post('/groups', data);
export const updateGroup = (id, data) => api.put(`/groups/${id}`, data);
export const deleteGroup = (id) => api.delete(`/groups/${id}`);

// Semanas
export const getWeeks = () => api.get('/weeks');
export const getWeekById = (id) => api.get(`/weeks/${id}`);
export const importWeek = (docId) => api.post('/weeks/import', { docId });
export const generateAssignments = (id) => api.post(`/weeks/${id}/generate`);
export const deleteWeek = (id) => api.delete(`/weeks/${id}`);

// Tipos de asignación
export const getAssignmentTypes = () => api.get('/assignment-types');