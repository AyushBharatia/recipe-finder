import api from './api';

const authService = {
  async register(name, email, password) {
    const response = await api.post('/auth/register', { name, email, password });
    return response.data;
  },

  async login(email, password) {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  // verifyOTP supports both login (userId) and registration (email)
  async verifyOTP({ userId, email, otp }) {
    const payload = { otp };
    if (userId) payload.userId = userId;
    if (email) payload.email = email;
    const response = await api.post('/auth/verify-otp', payload);
    return response.data;
  },

  // resendOTP supports both login (userId) and registration (email)
  async resendOTP({ userId, email }) {
    const payload = {};
    if (userId) payload.userId = userId;
    if (email) payload.email = email;
    const response = await api.post('/auth/resend-otp', payload);
    return response.data;
  },
};

export default authService;
