import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Lock, AlertCircle, CheckCircle } from 'lucide-react';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validatingToken, setValidatingToken] = useState(true);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Validate token from URL and establish session
  useEffect(() => {
    const validateResetToken = async () => {
      if (!supabase) {
        setError('Authentication is not configured');
        setValidatingToken(false);
        return;
      }

      try {
        // Get token from URL parameters
        const token = searchParams.get('token');
        const type = searchParams.get('type');

        console.log('Reset token validation:', { token: token ? 'present' : 'missing', type });

        // If no token in URL, check if session already exists
        if (!token) {
          const { data: { session } } = await supabase.auth.getSession();
          if (!session) {
            setError('No reset token found. Please click the reset link from your email.');
          } else {
            console.log('Existing session found');
          }
          setValidatingToken(false);
          return;
        }

        // Exchange token for session (for older Supabase versions)
        // Modern Supabase should auto-exchange, but we'll verify
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error('Session error:', sessionError);
          setError('Failed to validate reset token. Please try requesting a new password reset.');
        } else if (!session) {
          // Try to refresh the session in case it wasn't auto-established
          const { error: refreshError } = await supabase.auth.refreshSession();
          if (refreshError) {
            console.error('Refresh error:', refreshError);
            setError('Invalid or expired reset link. Please request a new password reset.');
          }
        } else {
          console.log('Session validated successfully');
        }
      } catch (err) {
        console.error('Token validation error:', err);
        setError('An error occurred validating your reset link. Please try again.');
      } finally {
        setValidatingToken(false);
      }
    };

    validateResetToken();
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!supabase) {
        throw new Error('Authentication is not configured');
      }

      if (password !== confirmPassword) {
        throw new Error('Passwords do not match');
      }

      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }

      console.log('Attempting to update password...');

      // Update the user's password
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) {
        console.error('Password update error:', updateError);
        throw updateError;
      }

      console.log('Password updated successfully');
      setSuccess(true);

      // Sign out after password reset for security
      await supabase.auth.signOut();

      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      console.error('Reset password error:', err);
      setError(err.message || 'An error occurred while resetting your password');
    } finally {
      setLoading(false);
    }
  };

  // Loading state while validating token
  if (validatingToken) {
    return (
      <div className="login-container">
        <div className="login-card">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <h1 className="login-title">Validating Reset Link...</h1>
            <p className="login-subtitle">Please wait</p>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="login-container">
        <div className="login-card">
          <div className="success-state">
            <CheckCircle size={64} className="success-icon" />
            <h1 className="login-title">Password Reset!</h1>
            <p className="login-subtitle">
              Your password has been successfully reset. Redirecting to login...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1 className="login-title">Set New Password</h1>
          <p className="login-subtitle">
            Enter your new password below
          </p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && (
            <div className="error-message">
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">New Password</label>
            <div className="input-with-icon">
              <Lock className="input-icon" size={20} />
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                disabled={!!error}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Confirm New Password</label>
            <div className="input-with-icon">
              <Lock className="input-icon" size={20} />
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                disabled={!!error}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={loading || !!error}
          >
            {loading ? 'Updating Password...' : 'Reset Password'}
          </button>

          {error && (
            <div className="form-helper">
              <p>If this link has expired, please request a new password reset from the login page.</p>
            </div>
          )}
        </form>

        <div className="login-footer">
          <button
            type="button"
            className="toggle-auth-mode"
            onClick={() => navigate('/login')}
          >
            Back to login
          </button>
        </div>
      </div>
    </div>
  );
}
