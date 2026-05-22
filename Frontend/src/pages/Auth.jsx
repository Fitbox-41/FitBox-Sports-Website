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
  const { currentUser, signup, login, loginWithGoogle, requestOtpForRegister, requestOtpForLogin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) {
      navigate('/account');
    }
  }, [currentUser, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!showOtpInput) {
        // Step 1: Request OTP
        if (isLogin) {
          await requestOtpForLogin(email, password);
        } else {
          await requestOtpForRegister(email, password);
        }
        setShowOtpInput(true);
      } else {
        // Step 2: Verify OTP and Login/Signup
        const otpString = otpArray.join('');
        if (otpString.length !== 6) {
          setError('Please enter all 6 digits of the verification code.');
          setLoading(false);
          return;
        }

        if (isLogin) {
          await login(email, password, otpString);
        } else {
          await signup(email, password, otpString);
        }
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
            {isLogin ? 'Welcome Back' : 'Create an Account'}
          </h1>
          <p className="auth-subtitle">
            {isLogin 
              ? 'Log in to access your saved items and track orders.' 
              : 'Join FitBox Sports for an exclusive premium experience.'}
          </p>

          {error && <div className="auth-error">{error}</div>}

          <form className="auth-form" onSubmit={handleSubmit}>
            {!showOtpInput ? (
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
                
                <div className="form-group">
                  <label htmlFor="password">Password</label>
                  <input
                    type="password"
                    id="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter 6+ characters"
                    minLength="6"
                  />
                </div>
              </>
            ) : (
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
                    setShowOtpInput(false);
                    setOtpArray(['', '', '', '', '', '']);
                  }}
                >
                  Change Email
                </button>
              </div>
            )}

            <button disabled={loading} className="auth-submit-btn" type="submit">
              {loading 
                ? 'Please wait...' 
                : (showOtpInput 
                    ? 'Verify & Continue' 
                    : (isLogin ? 'Log In' : 'Sign Up')
                  )
              }
            </button>
          </form>

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



          <div className="auth-toggle">
            <p>
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button 
                type="button" 
                className="auth-toggle-btn"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setShowOtpInput(false);
                  setOtpArray(['', '', '', '', '', '']);
                  setError('');
                }}
              >
                {isLogin ? 'Sign up' : 'Log in'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
