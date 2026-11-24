/**
 * AgroRise AI Authentication & User Profile API Client
 *
 * Implements endpoints:
 * - POST /api/register/
 * - POST /api/login/
 * - POST /api/token/refresh/
 * - GET  /api/profile/
 * - PUT  /api/profile/
 * - PUT  /api/change-password/
 * - POST /api/logout/
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Token Storage Helpers
export const getAccessToken = () => localStorage.getItem('agrorise_access_token');
export const getRefreshToken = () => localStorage.getItem('agrorise_refresh_token');

export const setTokens = (access, refresh) => {
  if (access) localStorage.setItem('agrorise_access_token', access);
  if (refresh) localStorage.setItem('agrorise_refresh_token', refresh);
};

export const clearTokens = () => {
  localStorage.removeItem('agrorise_access_token');
  localStorage.removeItem('agrorise_refresh_token');
  localStorage.removeItem('agrorise_user');
};

// Generic API Request Wrapper
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getAccessToken();

  const isFormData = options.body instanceof FormData;

  const headers = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // Handle 401 Unauthorized with token refresh attempt
  if (response.status === 401 && getRefreshToken() && endpoint !== '/api/token/refresh/') {
    const refreshed = await authApi.refreshToken();
    if (refreshed?.access) {
      headers['Authorization'] = `Bearer ${refreshed.access}`;
      const retryResponse = await fetch(url, { ...options, headers });
      if (retryResponse.ok) return await retryResponse.json();
    }
  }

  if (!response.ok) {
    let errorDetail = `HTTP ${response.status}: ${response.statusText}`;
    try {
      const errJson = await response.json();
      if (errJson.detail) errorDetail = errJson.detail;
      else if (errJson.message) errorDetail = errJson.message;
      else errorDetail = JSON.stringify(errJson);
    } catch {}
    throw new Error(errorDetail);
  }

  return await response.json();
}

// -------------------------------------------------------------
// Authentication & Profile API
// -------------------------------------------------------------
export const authApi = {
  // 1. Register: POST /api/register/
  async register(data) {
    return apiRequest('/api/register/', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  // 2. Login: POST /api/login/
  async login(credentials) {
    return apiRequest('/api/login/', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
  },

  // 3. Refresh Token: POST /api/token/refresh/
  async refreshToken() {
    const refresh = getRefreshToken();
    if (!refresh) return null;
    try {
      const res = await fetch(`${API_BASE_URL}/api/token/refresh/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.access) {
          localStorage.setItem('agrorise_access_token', data.access);
        }
        return data;
      }
    } catch (e) {
      console.error('Failed to refresh token', e);
    }
    return null;
  },

  // 4. Get Profile: GET /api/profile/
  async getProfile() {
    return apiRequest('/api/profile/', {
      method: 'GET'
    });
  },

  // 5. Update Profile: PUT /api/profile/
  async updateProfile(profileData) {
    return apiRequest('/api/profile/', {
      method: 'PUT',
      body: JSON.stringify({ profile: profileData })
    });
  },

  // 6. Change Password: PUT /api/change-password/
  async changePassword(old_password, new_password) {
    return apiRequest('/api/change-password/', {
      method: 'PUT',
      body: JSON.stringify({ old_password, new_password })
    });
  },

  // 7. Logout: POST /api/logout/
  async logout() {
    const refresh = getRefreshToken();
    try {
      if (refresh) {
        await apiRequest('/api/logout/', {
          method: 'POST',
          body: JSON.stringify({ refresh })
        });
      }
    } catch (e) {
      console.warn('Logout API warning:', e);
    } finally {
      clearTokens();
    }
  },

  // 8. Get Land & User Details: GET /api/profile/land-details/
  async getLandDetails() {
    return apiRequest('/api/profile/land-details/', {
      method: 'GET'
    });
  }
};

// Farmer / Document Upload Helper via PUT /api/profile/
export const farmerApi = {
  async updateDetails(formData) {
    return apiRequest('/api/profile/', {
      method: 'PUT',
      body: formData
    });
  }
};

// OTP Verification API (Supports Email & Mobile)
export const otpApi = {
  async sendOtp(target) {
    const isEmail = target.includes('@');
    const payload = isEmail ? { email: target } : { phone_number: target };
    return apiRequest('/api/auth/otp/send/', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  async verifyOtp(target, otp) {
    const isEmail = target.includes('@');
    const payload = {
      ...(isEmail ? { email: target } : { phone_number: target }),
      otp
    };
    return apiRequest('/api/auth/otp/verify/', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }
};

// Public & Visitor Agriculture Data API
export const agricultureApi = {
  async getFarmersAgricultureData(params = {}) {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/api/farmers/agriculture-data/${query ? '?' + query : ''}`, {
      method: 'GET'
    });
  },

  async getMarketplaceProducts(params = {}) {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/api/marketplace/products/${query ? '?' + query : ''}`, {
      method: 'GET'
    });
  }
};

// Password Reset with Email OTP API
export const passwordResetApi = {
  async sendOtp(email) {
    return apiRequest('/api/auth/password-reset/send-otp/', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
  },

  async confirmReset(email, otp, newPassword) {
    return apiRequest('/api/auth/password-reset/confirm/', {
      method: 'POST',
      body: JSON.stringify({ email, otp, new_password: newPassword })
    });
  }
};

// Module 2: Smart Land Analyzer API
export const smartLandAnalyzerApi = {
  async analyze(data) {
    return apiRequest('/api/smart-land-analyzer/analyze/', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async getMetadata() {
    return apiRequest('/api/smart-land-analyzer/metadata/', {
      method: 'GET'
    });
  },

  async getLocationProfile(district) {
    return apiRequest(`/api/smart-land-analyzer/location-profile/?district=${encodeURIComponent(district)}`, {
      method: 'GET'
    });
  },

  async getNearbyFacilities(district, lat, lng) {
    const params = new URLSearchParams({ district });
    if (lat) params.append('lat', lat);
    if (lng) params.append('lng', lng);
    return apiRequest(`/api/smart-land-analyzer/nearby-facilities/?${params.toString()}`, {
      method: 'GET'
    });
  }
};


// Module 4: Crop Profit Estimator API
export const cropProfitEstimatorApi = {
  async calculateProfit(data) {
    return apiRequest('/api/crop-profit-estimator/calculate/', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async getCrops() {
    return apiRequest('/api/crop-profit-estimator/crops/', {
      method: 'GET'
    });
  }
};

// Module: AI Agricultural News Analyzer API
export const newsApi = {
  async getLatestNews(params = {}) {
    const query = new URLSearchParams();
    if (params.category) query.append('category', params.category);
    if (params.impact) query.append('impact', params.impact);
    if (params.crop) query.append('crop', params.crop);
    if (params.refresh) query.append('refresh', 'true');
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return apiRequest(`/api/news/latest/${queryString}`, {
      method: 'GET'
    });
  },

  async refreshNews() {
    return apiRequest('/api/news/refresh/', {
      method: 'POST'
    });
  }
};

// Module: Gemini AI Agricultural Chatbot API
export const chatApi = {
  async sendMessage(message, history = [], language = 'en') {
    return apiRequest('/api/chat/', {
      method: 'POST',
      body: JSON.stringify({ message, history, language })
    });
  },

  async getSuggestions(language = 'en') {
    return apiRequest(`/api/chat/suggestions/?language=${encodeURIComponent(language)}`, {
      method: 'GET'
    });
  }
};





