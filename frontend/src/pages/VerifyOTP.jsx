import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Message from '../components/common/Message';
import '../components/auth/Auth.css';

const VerifyOTP = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const inputRefs = useRef([]);
  const navigate = useNavigate();
  const location = useLocation();
  const { verifyOTP, resendOTP, isAuthenticated, pendingAuth
  } = useAuth();

  // Get auth data from location state or pendingAuth context
  const stateData = location.state || {};
  const userId = stateData.userId || pendingAuth?.userId;
  const email = stateData.email || pendingAuth?.email;
  const isRegistration = stateData.isRegistration || pendingAuth?.isRegistration;

  // Redirect if no email/userId or already authenticated
  useEffect(() => {
    // For registration, we need email; for login, we need userId
    if (!email && !userId) {
      navigate('/login');
    }
    if (isAuthenticated) {
      navigate('/recipes');
    }
  }, [email, userId, isAuthenticated, navigate]);

  // Cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleChange = (index, value) => {
    // Only allow digits
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace - move to previous input
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = pastedData.split('');
    while (newOtp.length < 6) newOtp.push('');
    setOtp(newOtp);

    // Focus last filled input or first empty
    const lastIndex = Math.min(pastedData.length - 1, 5);
    inputRefs.current[lastIndex].focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpString = otp.join('');

    if (otpString.length !== 6) {
      setMessage({ type: 'error', text: 'Please enter all 6 digits' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // For registration: send email, for login: send userId
      await verifyOTP({
        userId: isRegistration ? null : userId,
        email: isRegistration ? email : null,
        otp: otpString,
      });

      const successMessage = isRegistration
        ? 'Registration successful! Welcome to Recipe Finder!'
        : 'Login successful! Redirecting...';
      setMessage({ type: 'success', text: successMessage });
      setTimeout(() => navigate('/recipes'), 1000);
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || 'Invalid OTP. Please try again.';
      const attemptsRemaining = error.response?.data?.attemptsRemaining;

      let displayMessage = errorMessage;
      if (attemptsRemaining !== undefined) {
        displayMessage += ` (${attemptsRemaining} attempts remaining)`;
      }

      setMessage({ type: 'error', text: displayMessage });
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0].focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;

    try {
      // For registration: send email, for login: send userId
      await resendOTP({
        userId: isRegistration ? null : userId,
        email: isRegistration ? email : null,
      });
      setMessage({ type: 'success', text: 'New verification code sent to your email!' });
      setResendCooldown(60);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0].focus();
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to resend OTP',
      });
    }
  };

  if (!email && !userId) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">
          {isRegistration ? 'Verify Your Email' : 'Enter Verification Code'}
        </h2>
        <p className="auth-subtitle">
          Enter the 6-digit code sent to <strong>{email || 'your email'}</strong>
        </p>

        {message.text && (
          <Message
            type={message.type}
            message={message.text}
            onClose={() => setMessage({ type: '', text: '' })}
          />
        )}

        <form onSubmit={handleSubmit} className="otp-form">
          <div className="otp-inputs">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                className="otp-input"
                autoFocus={index === 0}
                disabled={loading}
              />
            ))}
          </div>

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? 'Verifying...' : (isRegistration ? 'Complete Registration' : 'Verify OTP')}
          </button>
        </form>

        <div className="resend-section">
          <p>Didn't receive the code?</p>
          <button
            onClick={handleResend}
            disabled={resendCooldown > 0}
            className="resend-btn"
          >
            {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend OTP'}
          </button>
        </div>

        <p className="auth-footer">
          <button
            onClick={() => navigate(isRegistration ? '/register' : '/login')}
            className="back-to-login-btn"
          >
            {isRegistration ? 'Back to Register' : 'Back to Login'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default VerifyOTP;
