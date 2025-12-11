import React, { createContext, useState, useContext, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pendingAuth, setPendingAuth] = useState(null); // For OTP flow

  useEffect(() => {
    // Check for existing token on mount
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // Step 1: Validate credentials and send OTP (login)
  const login = async (email, password) => {
    const response = await authService.login(email, password);

    if (response.otpSent) {
      // Store pending auth data for OTP verification
      setPendingAuth({
        userId: response.userId,
        email: response.email,
        isRegistration: false,
      });
      return response; // Return for navigation to OTP page
    }

    // Fallback for non-MFA login (shouldn't happen with new flow)
    completeLogin(response);
    return response;
  };

  // Step 2: Verify OTP and complete login/registration
  const verifyOTP = async ({ userId, email, otp }) => {
    const response = await authService.verifyOTP({ userId, email, otp });
    completeLogin(response);
    setPendingAuth(null);
    return response;
  };

  // Resend OTP - supports both login (userId) and registration (email)
  const resendOTP = async ({ userId, email }) => {
    return authService.resendOTP({ userId, email });
  };

  // Complete login by storing token and user
  const completeLogin = (response) => {
    const { token: newToken, user: newUser } = response;

    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));

    setToken(newToken);
    setUser(newUser);
  };

  // Register - sends OTP, user is NOT created until OTP verified
  const register = async (name, email, password) => {
    const response = await authService.register(name, email, password);

    if (response.otpSent) {
      // Store pending auth data for OTP verification
      // Note: userId is null for registration since user doesn't exist yet
      setPendingAuth({
        userId: null,
        email: response.email,
        isRegistration: true,
      });
      return response; // Return for navigation to OTP page
    }

    // Fallback for direct registration (shouldn't happen with MFA)
    if (response.token) {
      completeLogin(response);
    }

    return response;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setPendingAuth(null);
  };

  // Helper functions for role checking
  const isAdmin = () => user?.role === 'admin';
  const hasRole = (role) => user?.role === role;

  const value = {
    user,
    token,
    loading,
    pendingAuth,
    setPendingAuth,
    login,
    verifyOTP,
    resendOTP,
    register,
    logout,
    isAuthenticated: !!token,
    isAdmin,
    hasRole,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
