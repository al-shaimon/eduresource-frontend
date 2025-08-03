// API Base URL
const API_BASE_URL = import.meta.env.VITE_API_URL;

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Network error' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }
  return response.json();
};

export const api = {
  // Auth endpoints
  signup: async (userData) => {
    const response = await fetch(`${API_BASE_URL}/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    return handleResponse(response);
  },

  login: async (credentials) => {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    return handleResponse(response);
  },

  // Resources endpoints
  getResources: async () => {
    const response = await fetch(`${API_BASE_URL}/resources`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  createResource: async (resourceData) => {
    const response = await fetch(`${API_BASE_URL}/resources`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(resourceData),
    });
    return handleResponse(response);
  },

  updateResource: async (id, resourceData) => {
    const response = await fetch(`${API_BASE_URL}/resources/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(resourceData),
    });
    return handleResponse(response);
  },

  deleteResource: async (id) => {
    const response = await fetch(`${API_BASE_URL}/resources/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Requests endpoints
  getRequests: async () => {
    const response = await fetch(`${API_BASE_URL}/requests`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  createRequest: async (requestData) => {
    const response = await fetch(`${API_BASE_URL}/requests`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(requestData),
    });
    return handleResponse(response);
  },

  updateRequest: async (id, updateData) => {
    const response = await fetch(`${API_BASE_URL}/requests/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updateData),
    });
    return handleResponse(response);
  },

  // Notifications endpoints
  getNotifications: async () => {
    const response = await fetch(`${API_BASE_URL}/notifications`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  markNotificationRead: async (id) => {
    const response = await fetch(`${API_BASE_URL}/notifications/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ read: true }),
    });
    return handleResponse(response);
  },

  markAllNotificationsRead: async () => {
    const response = await fetch(`${API_BASE_URL}/notifications`, {
      method: 'PUT',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Users endpoints
  getUsers: async () => {
    const response = await fetch(`${API_BASE_URL}/users`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Overdue and Due Returns endpoints
  getOverdueReturns: async () => {
    const response = await fetch(`${API_BASE_URL}/overdue-returns`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getDueReturns: async () => {
    const response = await fetch(`${API_BASE_URL}/due-returns`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  checkOverdue: async () => {
    const response = await fetch(`${API_BASE_URL}/check-overdue`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Stakeholder Policy endpoints
  getStakeholderPolicies: async () => {
    const response = await fetch(`${API_BASE_URL}/stakeholder-policies`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  updateStakeholderPolicies: async (policies) => {
    const response = await fetch(`${API_BASE_URL}/stakeholder-policies`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(policies),
    });
    return handleResponse(response);
  },

  getStakeholderAnalytics: async () => {
    const response = await fetch(`${API_BASE_URL}/stakeholder-analytics`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};
