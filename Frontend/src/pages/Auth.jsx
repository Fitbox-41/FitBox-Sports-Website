import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import './Auth.css';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otpArray, setOtpArray] = useState(['', '', '', '', '', '']);
  const otpInputRefs = useRef([]);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [forgotPasswordStep, setForgotPasswordStep] = useState(1);
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const { currentUser, signup, login, loginWithGoogle, requestOtpForRegister, requestOtpForLogin, requestForgotPasswordOtp, verifyResetOtp, updatePassword, triggerLoginSuccessRibbon } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser && !isForgotPassword) {
      navigate('/account');
    }
  }, [currentUser, isForgotPassword, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (isForgotPassword) {
        if (forgotPasswordStep === 1) {
          // Step 1: Request OTP for password reset
          await requestForgotPasswordOtp(email);
          setForgotPasswordStep(2);
        } else if (forgotPasswordStep === 2) {
          // Step 2: Verify OTP
          const otpString = otpArray.join('');
          if (otpString.length !== 6) {
            setError('Please enter all 6 digits of the verification code.');
            setLoading(false);
            return;
          }
          await verifyResetOtp(email, otpString);
          setForgotPasswordStep(3);
          setSuccessMsg('Email verified! You can now set a new password.');
        } else if (forgotPasswordStep === 3) {
          // Step 3: Set new password
          await updatePassword(newPassword);
          triggerLoginSuccessRibbon();
          navigate('/account');
        }
      } else if (!showOtpInput) {
        if (isLogin) {
          // Direct login without OTP
          await login(email, password);
          navigate('/account');
        } else {
          // Step 1: Request OTP for register
          await requestOtpForRegister(email, password);
          setShowOtpInput(true);
        }
      } else {
        // Step 2: Verify OTP and Signup
        const otpString = otpArray.join('');
        if (otpString.length !== 6) {
          setError('Please enter all 6 digits of the verification code.');
          setLoading(false);
          return;
        }

        await signup(email, password, otpString);
        navigate('/account');
      }
    } catch (err) {
      setError(err.message || 'Failed to authenticate');
    }

    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await loginWithGoogle();
      navigate('/account');
    } catch (err) {
      setError(err.message || 'Failed to authenticate with Google');
    }
    setLoading(false);
  };


  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return;
    const newOtp = [...otpArray];
    newOtp[index] = value.substring(value.length - 1);
    setOtpArray(newOtp);

    if (value !== '' && index < 5) {
      otpInputRefs.current[index + 1].focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpArray[index] && index > 0) {
      otpInputRefs.current[index - 1].focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6).split('');
    if (pastedData.length === 0) return;
    
    const newOtp = [...otpArray];
    pastedData.forEach((char, i) => {
      if (i < 6) newOtp[i] = char;
    });
    setOtpArray(newOtp);
    const focusIndex = Math.min(pastedData.length, 5);
    otpInputRefs.current[focusIndex]?.focus();
  };



  return (
    <div className="auth-page">
      <Header hideSubHeader={true} hideSaleRibbon={true} />
      <div className="header-spacer" style={{ height: '70px' }} />

      <div className="auth-container">
        <div className="auth-card">
          <h1 className="auth-title">
            {isForgotPassword 
              ? (forgotPasswordStep === 3 ? 'Set New Password' : 'Reset Password') 
              : (isLogin ? 'Welcome Back' : 'Create an Account')}
          </h1>
          <p className="auth-subtitle">
            {isForgotPassword 
              ? (forgotPasswordStep === 3 ? 'Choose a new password for your account.' : 'Enter your email to receive a password reset code.')
              : (isLogin ? 'Log in to access your saved items and track orders.' : 'Join FitBox Sports for an exclusive premium experience.')}
          </p>

          {error && <div className="auth-error">{error}</div>}
          {successMsg && <div className="auth-success" style={{background: '#e8f5e9', color: '#2e7d32', padding: '12px', borderRadius: '8px', marginBottom: '24px', textAlign: 'center', border: '1px solid #c8e6c9'}}>{successMsg}</div>}

          <form className="auth-form" onSubmit={handleSubmit}>
            {(!isForgotPassword && !showOtpInput) || (isForgotPassword && forgotPasswordStep === 1) ? (
              <>
                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                  />
                </div>
                
                {!isForgotPassword && (
                  <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <div style={{ position: 'relative', width: '100%' }}>
                      <input
                        type={showPassword ? "text" : "password"}
                        id="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter 6+ characters"
                        minLength="6"
                        style={{ width: '100%', paddingRight: '40px' }}
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowPassword(!showPassword)}
                        style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: '0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        {showPassword ? (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                            <line x1="1" y1="1" x2="23" y2="23"></line>
                          </svg>
                        ) : (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {isLogin && !isForgotPassword && (
                  <div style={{ textAlign: 'right', marginTop: '-10px' }}>
                    <button type="button" className="auth-toggle-btn" onClick={() => {
                      setIsForgotPassword(true);
                      setForgotPasswordStep(1);
                    }}>
                      Forgot Password?
                    </button>
                  </div>
                )}
              </>
            ) : null}

            {(!isForgotPassword && showOtpInput) || (isForgotPassword && forgotPasswordStep === 2) ? (
              <div className="form-group" style={{ alignItems: 'center' }}>
                <label htmlFor="otp">Verification Code</label>
                <div className="otp-container" onPaste={handleOtpPaste}>
                  {otpArray.map((digit, index) => (
                    <input
                      key={index}
                      type="text"
                      className="otp-box"
                      maxLength="2"
                      ref={(el) => (otpInputRefs.current[index] = el)}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      autoFocus={index === 0}
                    />
                  ))}
                </div>

                <button 
                  type="button" 
                  className="auth-toggle-btn"
                  style={{ marginTop: '15px', fontSize: '13px' }}
                  onClick={() => {
                    if (isForgotPassword) setForgotPasswordStep(1);
                    else setShowOtpInput(false);
                    setOtpArray(['', '', '', '', '', '']);
                  }}
                >
                  Change Email
                </button>
              </div>
            ) : null}

            {isForgotPassword && forgotPasswordStep === 3 && (
              <div className="form-group" style={{ width: '100%', alignItems: 'flex-start' }}>
                <label htmlFor="newPassword">New Password</label>
                <div style={{ position: 'relative', width: '100%' }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="newPassword"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new 6+ character password"
                    minLength="6"
                    style={{ width: '100%', paddingRight: '40px' }}
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: '0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    {showPassword ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                        <line x1="1" y1="1" x2="23" y2="23"></line>
                      </svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    )}
                  </button>
                </div>
                <button 
                  type="button" 
                  className="auth-toggle-btn"
                  style={{ marginTop: '10px', fontSize: '13px' }}
                  onClick={() => {
                    triggerLoginSuccessRibbon();
                    navigate('/account');
                  }}
                >
                  Skip for now
                </button>
              </div>
            )}

            <button disabled={loading} className="auth-submit-btn" type="submit">
              {loading 
                ? 'Please wait...' 
                : (isForgotPassword
                    ? (forgotPasswordStep === 1 ? 'Send Reset Code' : (forgotPasswordStep === 2 ? 'Verify Code' : 'Save New Password'))
                    : (showOtpInput ? 'Verify & Continue' : (isLogin ? 'Log In' : 'Sign Up'))
                  )
              }
            </button>
          </form>

          {!isForgotPassword && (
            <>
              <div className="auth-divider">
                <span>or</span>
              </div>

              <button 
                type="button" 
                className="auth-google-btn" 
                onClick={handleGoogleLogin}
                disabled={loading}
              >
                <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </button>


            </>
          )}

          <div className="auth-toggle">
            <p>
              {isForgotPassword ? (
                <button 
                  type="button" 
                  className="auth-toggle-btn"
                  onClick={() => {
                    setIsForgotPassword(false);
                    setForgotPasswordStep(1);
                    setShowOtpInput(false);
                    setOtpArray(['', '', '', '', '', '']);
                    setError('');
                    setSuccessMsg('');
                  }}
                >
                  Back to Login
                </button>
              ) : (
                <>
                  {isLogin ? "Don't have an account? " : "Already have an account? "}
                  <button 
                    type="button" 
                    className="auth-toggle-btn"
                    onClick={() => {
                      setIsLogin(!isLogin);
                      setShowOtpInput(false);
                      setOtpArray(['', '', '', '', '', '']);
                      setError('');
                      setSuccessMsg('');
                    }}
                  >
                    {isLogin ? 'Sign up' : 'Log in'}
                  </button>
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
