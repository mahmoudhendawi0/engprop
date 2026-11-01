const API_BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
const TOKEN_KEY = 'engprop_auth_token';

function getAuthHeaders(extraHeaders = {}) {
  const token = localStorage.getItem(TOKEN_KEY);
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extraHeaders
  };
}

async function request(endpoint, options = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers
    }
  });

  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json') ? await response.json() : await response.text();

  if (!response.ok) {
    const message = typeof payload === 'string' ? payload : payload.message || 'Request failed';
    throw new Error(message);
  }

  return payload;
}

export function saveToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  }
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY) || '';
}

export async function loginUser({ email, password }) {
  const response = await request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });

  saveToken(response.token);
  return response.user;
}

export async function registerUser({ name, email, password, role }) {
  const response = await request('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password, role })
  });

  saveToken(response.token);
  return response.user;
}

export async function getCurrentUser() {
  const token = getStoredToken();
  if (!token) {
    return null;
  }

  try {
    const response = await request('/api/auth/me');
    return response.user;
  } catch {
    clearToken();
    return null;
  }
}

export async function getProperties() {
  try {
    const response = await request('/api/properties');
    return Array.isArray(response) ? response : response.items || [];
  } catch {
    return [];
  }
}

export async function createProperty(property) {
  const response = await request('/api/properties', {
    method: 'POST',
    body: JSON.stringify(property)
  });
  return response.property;
}

export async function createAgency(agency) {
  return request('/api/v1/admin/agencies', {
    method: 'POST',
    body: JSON.stringify(agency)
  });
}

export async function createAdminResource(type, payload) {
  return request(`/api/v1/admin/resources/${type}`, {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export async function getAdminModerationProperties() {
  return request('/api/v1/admin/properties/moderation');
}

export async function moderateAdminProperty(id, action) {
  return request(`/api/v1/admin/properties/${encodeURIComponent(id)}/moderate`, {
    method: 'POST',
    body: JSON.stringify({ action })
  });
}

export async function deleteAgencyProperty(id) {
  return request(`/api/v1/agency/properties/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

export const getAgencyStaff = () => request('/api/v1/agency/staff');
export const getAgencyOverview = () => request('/api/v1/agency/overview');
export const inviteAgencyStaff = (staff) => request('/api/v1/agency/staff', { method: 'POST', body: JSON.stringify(staff) });
export const getAgencyLeads = () => request('/api/v1/agency/leads');
export const createAgencyLead = (lead) => request('/api/v1/agency/leads', { method: 'POST', body: JSON.stringify(lead) });
export const updateAgencyLead = (id, stage) => request(`/api/v1/agency/leads/${id}`, { method: 'PATCH', body: JSON.stringify({ stage }) });
export const getAgencyAppointments = () => request('/api/v1/agency/appointments');
export const getAgencyRentals = () => request('/api/v1/agency/rentals');
export const createAgencyAppointment = (appointment) => request('/api/v1/agency/appointments', { method: 'POST', body: JSON.stringify(appointment) });
export const updateAgencyAppointment = (id, status) => request(`/api/v1/agency/appointments/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) });
export const updateAgencyRental = (id, data) => request(`/api/v1/agency/rentals/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
export const renewAgencyRental = (id, data) => request(`/api/v1/agency/rentals/${id}/renew`, { method: 'POST', body: JSON.stringify(data) });
export const getExpiringAgencyRentals = (days = 45) => request(`/api/v1/agency/rentals/expiring?days=${days}`);
export const updateAgencySettings = (settings) => request('/api/v1/agency/settings', { method: 'PATCH', body: JSON.stringify(settings) });
export const getFavorites = () => request('/api/v1/user/favorites');
export const setFavorite = (propertyId, enabled) => request(`/api/v1/user/favorites/${encodeURIComponent(propertyId)}`, { method: 'PUT', body: JSON.stringify({ enabled }) });
