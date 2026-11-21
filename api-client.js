/**
 * AyuDiet Frontend API Client
 * ----------------------------
 * Connects the AyuDiet frontend to the MERN MongoDB/Express backend.
 * Features automatic fallback to local JSON database if the backend server is offline.
 * Enforces practitioner authentication headers for database mutations and plan approvals.
 */

const API_BASE_URL = 'http://localhost:5000/api';

const AyuDietAPI = {
  // Configured practitioner key (for backend practitioner portal / admin actions)
  practitionerKey: localStorage.getItem('ayudiet-practitioner-key') || 'ayudiet_practitioner_2026',

  setPractitionerKey(key) {
    this.practitionerKey = key;
    localStorage.setItem('ayudiet-practitioner-key', key);
  },

  getHeaders(isProtected = false) {
    const headers = { 'Content-Type': 'application/json' };
    if (isProtected && this.practitionerKey) {
      headers['x-practitioner-key'] = this.practitionerKey;
    }
    return headers;
  },

  // Check if MongoDB backend is online
  async checkHealth() {
    try {
      const res = await fetch(`${API_BASE_URL}/health`);
      return res.ok;
    } catch {
      return false;
    }
  },

  // 1. FOOD ENDPOINTS (Read-only for public clients)
  async getFoods(params = {}) {
    try {
      const query = new URLSearchParams(params).toString();
      const res = await fetch(`${API_BASE_URL}/foods${query ? '?' + query : ''}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      return json.data;
    } catch (err) {
      console.warn('Backend unavailable, falling back to local food-database.json:', err.message);
      // Fallback to local static JSON
      try {
        const fallback = await fetch('food-database.json').then((r) => r.json());
        return fallback.foods;
      } catch {
        return null;
      }
    }
  },

  async getCategories() {
    try {
      const res = await fetch(`${API_BASE_URL}/foods/categories/summary`);
      const json = await res.json();
      return json.data;
    } catch {
      return null;
    }
  },

  async getFoodsByDosha(dosha) {
    const res = await fetch(`${API_BASE_URL}/foods/dosha/${dosha}`);
    const json = await res.json();
    return json.data;
  },

  // PROTECTED: Add food to MongoDB (Backend practitioner/admin only)
  async createFood(foodData) {
    const res = await fetch(`${API_BASE_URL}/foods`, {
      method: 'POST',
      headers: this.getHeaders(true),
      body: JSON.stringify(foodData)
    });
    return res.json();
  },

  // 2. PATIENT ENDPOINTS
  async getPatients() {
    try {
      const res = await fetch(`${API_BASE_URL}/patients`);
      const json = await res.json();
      return json.data;
    } catch {
      return null;
    }
  },

  async getPatient(id) {
    const res = await fetch(`${API_BASE_URL}/patients/${id}`);
    const json = await res.json();
    return json.data;
  },

  async createPatient(patientData) {
    const res = await fetch(`${API_BASE_URL}/patients`, {
      method: 'POST',
      headers: this.getHeaders(false),
      body: JSON.stringify(patientData)
    });
    return res.json();
  },

  async addFollowUp(patientId, followUpData) {
    const res = await fetch(`${API_BASE_URL}/patients/${patientId}/follow-ups`, {
      method: 'POST',
      headers: this.getHeaders(false),
      body: JSON.stringify(followUpData)
    });
    return res.json();
  },

  // 3. DIET PLAN ENDPOINTS
  async getPlanForPatient(patientId) {
    try {
      const res = await fetch(`${API_BASE_URL}/plans/patient/${patientId}`);
      const json = await res.json();
      return json.data;
    } catch {
      return null;
    }
  },

  // Save meal draft (Clients can save draft meal plans)
  async savePlan(planData) {
    const res = await fetch(`${API_BASE_URL}/plans`, {
      method: 'POST',
      headers: this.getHeaders(false),
      body: JSON.stringify(planData)
    });
    return res.json();
  },

  // PROTECTED: Approve plan (ONLY authorized practitioner can sign off)
  async approvePlan(planId, approvedBy = 'Ayurvedic Dietitian') {
    const res = await fetch(`${API_BASE_URL}/plans/${planId}/approve`, {
      method: 'PUT',
      headers: this.getHeaders(true), // requires x-practitioner-key
      body: JSON.stringify({ approvedBy })
    });
    return res.json();
  }
};

// Expose globally for browser and modular environments
if (typeof window !== 'undefined') window.AyuDietAPI = AyuDietAPI;
export default AyuDietAPI;
export { AyuDietAPI };
