import axios from 'axios';
import { API_BASE_URL } from './api-config';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  register: async (data: {
    name: string;
    email: string;
    password: string;
    role: string;
    companyId?: string;
  }) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },
  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },
};

// Dashboard API
export const dashboardAPI = {
  getDashboard: async (companyId: string) => {
    const response = await api.get('/analytics/dashboard', {
      params: { companyId },
    });
    return response.data;
  },
  getQualityPerformance: async (companyId: string, days: number = 7) => {
    const response = await api.get('/quality/performance', {
      params: { companyId, days },
    });
    return response.data;
  },
};

// Batches API
export const batchesAPI = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    companyId?: string;
    status?: string;
  }) => {
    const response = await api.get('/batches', { params });
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get(`/batches/${id}`);
    return response.data;
  },
  getSummary: async (companyId: string) => {
    const response = await api.get('/batches/summary', {
      params: { companyId },
    });
    return response.data;
  },
};

// Recommendations API
export const recommendationsAPI = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    priority?: string;
    batchId?: string;
    recommendationType?: string;
    companyId?: string;
  }) => {
    const response = await api.get('/recommendations', { params });
    return response.data;
  },
  getByPriority: async (priority: string, companyId?: string) => {
    const response = await api.get(`/recommendations/priority/${priority}`, {
      params: companyId ? { companyId } : undefined,
    });
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get(`/recommendations/${id}`);
    return response.data;
  },
  update: async (id: string, data: {
    explanation?: string;
    priority?: 'INFO' | 'WARNING' | 'CRITICAL';
  }) => {
    const response = await api.patch(`/recommendations/${id}`, data);
    return response.data;
  },
};

// Actions API
export const actionsAPI = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    companyId?: string;
  }) => {
    const response = await api.get('/actions', { params });
    return response.data;
  },
  getStats: async (companyId: string, days: number = 30) => {
    const response = await api.get('/actions/stats', {
      params: { companyId, days },
    });
    return response.data;
  },
  create: async (data: {
    recommendationId: string;
    userId: string;
    actionTaken: string;
    notes?: string;
  }) => {
    const response = await api.post('/actions', data);
    return response.data;
  },
};

// Feedback API
export const feedbackAPI = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    batchId?: string;
    feedbackType?: string;
  }) => {
    const response = await api.get('/feedback', { params });
    return response.data;
  },
  create: async (data: {
    batchId: string;
    feedbackType: string;
    message: string;
  }) => {
    const response = await api.post('/feedback', data);
    return response.data;
  },
};

// Commodities API
export const commoditiesAPI = {
  getAll: async () => {
    const response = await api.get('/commodities');
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get(`/commodities/${id}`);
    return response.data;
  },
};

// Retail API
export const retailAPI = {
  getInventory: async (params?: {
    storeId?: string;
    page?: number;
    limit?: number;
  }) => {
    const response = await api.get('/retail/inventory', { params });
    return response.data;
  },
  getLowStock: async (storeId?: string) => {
    const response = await api.get('/retail/inventory/low-stock', {
      params: { storeId },
    });
    return response.data;
  },
};

// Quality API
export const qualityAPI = {
  getLatestScore: async (batchId: string) => {
    const response = await api.get(`/quality/batches/${batchId}/scores/latest`);
    return response.data;
  },
  getScoreHistory: async (batchId: string) => {
    const response = await api.get(`/quality/batches/${batchId}/scores/history`);
    return response.data;
  },
  getLatestPrediction: async (batchId: string) => {
    const response = await api.get(`/quality/batches/${batchId}/predictions/latest`);
    return response.data;
  },
  getPredictionHistory: async (batchId: string) => {
    const response = await api.get(`/quality/batches/${batchId}/predictions/history`);
    return response.data;
  },
  getPerformance: async (params?: {
    companyId?: string;
    days?: number;
  }) => {
    const response = await api.get('/quality/performance', { params });
    return response.data;
  },
};

// Sensors API
export const sensorsAPI = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    batchId?: string;
  }) => {
    const response = await api.get('/sensors', { params });
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get(`/sensors/${id}`);
    return response.data;
  },
  getReadings: async (batchId: string) => {
    const response = await api.get(`/sensors/batches/${batchId}/readings`);
    return response.data;
  },
};

// Logistics API
export const logisticsAPI = {
  getRoutes: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
  }) => {
    const response = await api.get('/logistics/routes', { params });
    return response.data;
  },
  getRouteById: async (id: string) => {
    const response = await api.get(`/logistics/routes/${id}`);
    return response.data;
  },
  getBatchRoutes: async (batchId: string) => {
    const response = await api.get(`/logistics/batches/${batchId}/routes`);
    return response.data;
  },
  getActiveRoutes: async () => {
    const response = await api.get('/logistics/active');
    return response.data;
  },
};

// Outcomes API
export const outcomesAPI = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    batchId?: string;
  }) => {
    const response = await api.get('/outcomes', { params });
    return response.data;
  },
  getStats: async (params?: {
    companyId?: string;
    days?: number;
  }) => {
    const response = await api.get('/outcomes/stats', { params });
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get(`/outcomes/${id}`);
    return response.data;
  },
};

// Analytics API
export const analyticsAPI = {
  getWeeklyMetrics: async (params?: {
    page?: number;
    limit?: number;
    companyId?: string;
  }) => {
    const response = await api.get('/analytics/weekly-metrics', { params });
    return response.data;
  },
};

export default api;

