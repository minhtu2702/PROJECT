import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:9999',
  headers: { 'Content-Type': 'application/json' },
});

// Room API
export const roomAPI = {
  getRooms: (params) => api.get('/rooms', { params }),
  getRoomById: (id) => api.get(`/rooms/${id}`),
  createRoom: (data) => api.post('/rooms', data),
  updateRoom: (id, data) => api.put(`/rooms/${id}`, data),
  deleteRoom: (id) => api.delete(`/rooms/${id}`),
};

// Tenant API
export const tenantAPI = {
  getTenants: (params) => api.get('/tenants', { params }),
  getTenantById: (id) => api.get(`/tenants/${id}`),
  createTenant: (data) => api.post('/tenants', data),
  updateTenant: (id, data) => api.put(`/tenants/${id}`, data),
  deleteTenant: (id) => api.delete(`/tenants/${id}`),
};

// Contract API
export const contractAPI = {
  getContracts: (params) => api.get('/contracts', { params }),
  getContractById: (id) => api.get(`/contracts/${id}`),
  createContract: (data) => api.post('/contracts', data),
  updateContract: (id, data) => api.put(`/contracts/${id}`, data),
  deleteContract: (id) => api.delete(`/contracts/${id}`),
};

// Invoice API
export const invoiceAPI = {
  getInvoices: (params) => api.get('/invoices', { params }),
  getInvoiceById: (id) => api.get(`/invoices/${id}`),
  createInvoice: (data) => api.post('/invoices', data),
  updateInvoice: (id, data) => api.put(`/invoices/${id}`, data),
  deleteInvoice: (id) => api.delete(`/invoices/${id}`),
};

// Service API
export const serviceAPI = {
  getServices: (params) => api.get('/services', { params }),
  createService: (data) => api.post('/services', data),
  updateService: (id, data) => api.put(`/services/${id}`, data),
  deleteService: (id) => api.delete(`/services/${id}`),
};

// User / Auth API
export const userAPI = {
  login: (username, password) => api.get('/users', { params: { username, password } }),
  getUsers: () => api.get('/users'),
  getUserById: (id) => api.get(`/users/${id}`),
};

export default api;
