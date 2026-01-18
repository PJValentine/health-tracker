import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useHealthStore } from '../store/useHealthStore';
import { supabase } from '../lib/supabase';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const { loadFromSupabase } = useHealthStore();
  const [dataLoading, setDataLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [loadingTimeout, setLoadingTimeout] = useState(false);

  // Timeout for loading state (10 seconds)
  useEffect(() => {
    if (loading || dataLoading) {
      const timer = setTimeout(() => {
        setLoadingTimeout(true);
        console.error('Loading timeout - continuing anyway');
      }, 10000);

      return () => clearTimeout(timer);
    } else {
      setLoadingTimeout(false);
    }
  }, [loading, dataLoading]);

  // Load data from Supabase when user is authenticated
  useEffect(() => {
    if (user && supabase && !dataLoaded && !dataLoading) {
      setDataLoading(true);
      loadFromSupabase()
        .then((success) => {
          if (success) {
            console.log('Successfully loaded data from Supabase');
          }
          setDataLoaded(true);
        })
        .catch((error) => {
          console.error('Error loading from Supabase:', error);
          setDataLoaded(true); // Continue anyway with local data
        })
        .finally(() => {
          setDataLoading(false);
        });
    }
  }, [user, dataLoaded, dataLoading, loadFromSupabase]);

  if ((loading || dataLoading) && !loadingTimeout) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>{loading ? 'Loading...' : 'Syncing data...'}</p>
      </div>
    );
  }

  if (loadingTimeout) {
    console.warn('Loading timed out - proceeding without auth');
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
