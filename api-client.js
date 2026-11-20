/**
 * AyuDiet Frontend API Client
 * ----------------------------
 * Connects the AyuDiet frontend to the MERN MongoDB/Express backend.
 * Features automatic fallback to local JSON database if the backend server is offline.
 */

const API_BASE_URL = 'http://localhost:5000/api';

export const AyuDietAPI = {
  // Check if MongoDB backend is online
  async checkHealth() {
    try {
      const res = await fetch(`${API_BASE_URL}/health`);
      return res.ok;
    } catch {
      return false;
    }
  },

  // 1. FOOD ENDPOINTS
  async getFoods(params = {}) {
    try {
      const query = new URLSearchParams(params).toString();
      const res = await fetch(`${API_BASE_URL}/foods${query ? '?' + query : ''}`);
      if (!res.ok) throw new Error('API request failed');
      const json = await res.json();
      return json.data;
    } catch (err) {
      console.warn('Backend unavailable, falling back to local JSON database.', err);
      // Fallback to local static JSON
      const fallback = await fetch('api/food-database.json').then(r => r.json());
      return fallback.foods;
    }
  },

  async getCategories() {
    const res = await fetch(`${API_BASE_URL}/foods/categories/summary`);
    const json = await res.json();
    return json.data;
  },

  async getFoodsByDosha(dosha) {
    const res = await fetch(`${API_BASE_URL}/foods/dosha/${dosha}`);
    const json = await res.json();
    return json.data;
  },

  // 2. PATIENT ENDPOINTS
  async getPatients() {
    const res = await fetch(`${API_BASE_URL}/patients`);
    const json = await res.json();
    return json.data;
  },

  async getPatient(id) {
    const res = await fetch(`${API_BASE_URL}/patients/${id}`);
    const json = await res.json();
    return json.data;
  },

  async createPatient(patientData) {
    const res = await fetch(`${API_BASE_URL}/patients`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patientData)
    });
    return res.json();
  },

  async addFollowUp(patientId, followUpData) {
    const res = await fetch(`${API_BASE_URL}/patients/${patientId}/follow-ups`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(followUpData)
    });
    return res.json();
  },

  // 3. DIET PLAN ENDPOINTS
  async getPlanForPatient(patientId) {
    const res = await fetch(`${API_BASE_URL}/plans/patient/${patientId}`);
    const json = await res.json();
    return json.data;
  },

  async savePlan(planData) {
    const res = await fetch(`${API_BASE_URL}/plans`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(planData)
    });
    return res.json();
  },

  async approvePlan(planId, approvedBy = 'Ayurvedic Dietitian') {
    const res = await fetch(`${API_BASE_URL}/plans/${planId}/approve`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ approvedBy })
    });
    return res.json();
  }
};
