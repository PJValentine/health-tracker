import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogIn, UserPlus, Mail, Lock, AlertCircle, ArrowLeft } from 'lucide-react';

export default function LoginPage() {
  const [mode, setMode] = useState('login'); // 'login' | 'signup' | 'forgot'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const { signIn, signUp, resetPassword } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (mode === 'login') {
        // Login
        console.log('Attempting login for:', email);
        const { error } = await signIn(email, password);
        if (error) throw error;
        console.log('Login successful, navigating to home');
        navigate('/');
      } else if (mode === 'signup') {
        // Sign up
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match');
        }
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters');
        }
        console.log('Attempting signup for:', email, 'with name:', name);
        const { data, error } = await signUp(email, password, { name });
        if (error) throw error;

        console.log('Signup response:', data);

        // Show success message
        setSuccess('Account created! Please check your email to verify your account, or sign in if email verification is disabled.');
        setTimeout(() => setMode('login'), 2000);
      } else if (mode === 'forgot') {
        // Forgot password
        console.log('Requesting password reset for:', email);
        const { error } = await resetPassword(email);
        if (error) throw error;

        setSuccess('Password reset email sent! Please check your inbox.');
        setTimeout(() => setMode('login'), 3000);
      }
    } catch (err) {
      console.error('Auth error:', err);
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    if (mode === 'login') return 'Welcome Back';
    if (mode === 'signup') return 'Create Account';
    return 'Reset Password';
  };

  const getSubtitle = () => {
    if (mode === 'login') return 'Sign in to continue tracking your health';
    if (mode === 'signup') return 'Start your health tracking journey';
    return 'Enter your email to receive a password reset link';
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          {mode === 'forgot' && (
            <button
              type="button"
              className="back-button"
              onClick={() => {
                setMode('login');
                setError('');
                setSuccess('');
              }}
            >
              <ArrowLeft size={20} />
              Back to login
            </button>
          )}
          <h1 className="login-title">{getTitle()}</h1>
          <p className="login-subtitle">{getSubtitle()}</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && (
            <div className="error-message">
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="success-message">
              <Mail size={20} />
              <span>{success}</span>
            </div>
          )}

          {mode === 'signup' && (
            <div className="form-group">
              <label className="form-label">Name</label>
              <div className="input-with-icon">
                <input
                  type="text"
                  className="form-input"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email</label>
            <div className="input-with-icon">
              <Mail className="input-icon" size={20} />
              <input
                type="email"
                className="form-input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          {mode !== 'forgot' && (
            <div className="form-group">
              <div className="form-label-row">
                <label className="form-label">Password</label>
                {mode === 'login' && (
                  <button
                    type="button"
                    className="forgot-password-link"
                    onClick={() => {
                      setMode('forgot');
                      setError('');
                    }}
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="input-with-icon">
                <Lock className="input-icon" size={20} />
                <input
                  type="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          {mode === 'signup' && (
            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <div className="input-with-icon">
                <Lock className="input-icon" size={20} />
                <input
                  type="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={loading}
          >
            {loading ? (
              'Processing...'
            ) : mode === 'login' ? (
              <>
                <LogIn size={20} />
                Sign In
              </>
            ) : mode === 'signup' ? (
              <>
                <UserPlus size={20} />
                Create Account
              </>
            ) : (
              <>
                <Mail size={20} />
                Send Reset Link
              </>
            )}
          </button>
        </form>

        {mode !== 'forgot' && (
          <div className="login-footer">
            <button
              type="button"
              className="toggle-auth-mode"
              onClick={() => {
                setMode(mode === 'login' ? 'signup' : 'login');
                setError('');
                setSuccess('');
              }}
            >
              {mode === 'login'
                ? "Don't have an account? Sign up"
                : 'Already have an account? Sign in'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
