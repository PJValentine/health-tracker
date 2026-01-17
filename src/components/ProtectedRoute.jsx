import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  // If Supabase is not configured, allow access (development mode)
  if (!supabase) {
    console.warn('Running without authentication - Supabase not configured');
    return children;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
