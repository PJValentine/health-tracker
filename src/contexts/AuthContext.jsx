import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { clearLocalStorage } from '../store/useHealthStore';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      console.warn('Supabase client not initialized. Auth will not work.');
      setLoading(false);
      return;
    }

    // Check active session
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        setUser(session?.user ?? null);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error getting session:', error);
        setUser(null);
        setLoading(false);
      });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);

      // Clear localStorage when user signs out
      if (event === 'SIGNED_OUT' || !session) {
        console.log('User signed out - clearing localStorage');
        clearLocalStorage();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email, password, metadata = {}) => {
    if (!supabase) {
      console.error('SignUp failed: Supabase client not initialized');
      return { data: null, error: new Error('Supabase client not initialized') };
    }
    console.log('SignUp: Calling Supabase auth.signUp');
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    });
    if (error) {
      console.error('SignUp error from Supabase:', error);
    } else {
      console.log('SignUp success:', data);
    }
    return { data, error };
  };

  const signIn = async (email, password) => {
    if (!supabase) {
      return { data: null, error: new Error('Supabase client not initialized') };
    }
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  };

  const signOut = async () => {
    if (!supabase) {
      return { error: new Error('Supabase client not initialized') };
    }

    // Clear localStorage before signing out to prevent data leakage
    clearLocalStorage();

    const { error } = await supabase.auth.signOut();
    return { error };
  };

  const resetPassword = async (email) => {
    if (!supabase) {
      return { data: null, error: new Error('Supabase client not initialized') };
    }
    const { data, error } = await supabase.auth.resetPasswordForEmail(email);
    return { data, error };
  };

  const updateProfile = async (updates) => {
    if (!supabase) {
      return { data: null, error: new Error('Supabase client not initialized') };
    }
    const { data, error } = await supabase.auth.updateUser({
      data: updates,
    });
    return { data, error };
  };

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
