// Service Layer for API communication
const API_ROOT = window.totemSettings?.root || '';
const NONCE = window.totemSettings?.nonce || '';

// Mock data for development if not in WP environment
const isDev = !window.totemSettings;

const mockData = {
  projects: [
    { id: 1, name: 'Summer Campaign', status: 'active', deadline: '2023-12-01' },
    { id: 2, name: 'Website Redesign', status: 'pending', deadline: '2024-01-15' },
  ],
  finance: {
    income: 50000,
    expenses: 15000,
    tips: [
      "Client X has high revenue but low margin (<10%). Renegotiate fees."
    ]
  },
  options: {
    logo_url: '',
    primary_color: '#6366f1',
    secondary_color: '#ec4899',
    font_family: 'Inter'
  }
};

const headers = {
  'Content-Type': 'application/json',
  'X-WP-Nonce': NONCE,
};

// Helper for error handling
const handleResponse = async (response) => {
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API Error ${response.status}: ${errorText}`);
  }
  return response.json();
};

export const api = {
  getProjects: async () => {
    if (isDev) return mockData.projects;
    try {
      const res = await fetch(`${API_ROOT}totem/v1/projects`, { headers });
      return handleResponse(res);
    } catch (e) {
      console.error("Fetch Projects Failed:", e);
      throw e;
    }
  },

  updateProjectStatus: async (projectId, status) => {
    if (isDev) {
      console.log(`Mock update project ${projectId} to ${status}`);
      return { success: true };
    }
    try {
      const res = await fetch(`${API_ROOT}totem/v1/projects/${projectId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ status })
      });
      return handleResponse(res);
    } catch (e) {
      console.error("Update Project Failed:", e);
      throw e;
    }
  },

  getFinanceStats: async () => {
    if (isDev) return mockData.finance;
    try {
      const res = await fetch(`${API_ROOT}totem/v1/finance/stats`, { headers });
      return handleResponse(res);
    } catch (e) {
      console.error("Fetch Finance Stats Failed:", e);
      throw e;
    }
  },

  submitExpense: async (data) => {
    if (isDev) {
      console.log("Mock submit expense:", data);
      return { success: true };
    }
    try {
      const res = await fetch(`${API_ROOT}totem/v1/pocket/submit`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data)
      });
      return handleResponse(res);
    } catch (e) {
      console.error("Submit Expense Failed:", e);
      throw e;
    }
  },

  getSettings: async () => {
    if (isDev) return mockData.options;
    try {
      const res = await fetch(`${API_ROOT}totem/v1/settings`, { headers });
      return handleResponse(res);
    } catch (e) {
      console.error("Fetch Settings Failed:", e);
      throw e;
    }
  },

  saveSettings: async (settings) => {
    if (isDev) {
      console.log("Mock save settings:", settings);
      return { success: true };
    }
    try {
      const res = await fetch(`${API_ROOT}totem/v1/settings`, {
        method: 'POST',
        headers,
        body: JSON.stringify(settings)
      });
      return handleResponse(res);
    } catch (e) {
      console.error("Save Settings Failed:", e);
      throw e;
    }
  }
};
