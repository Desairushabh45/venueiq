import React, { createContext, useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { auth, provider } from '../firebase';
import {
  signInWithRedirect,
  getRedirectResult,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from 'firebase/auth';

const AuthContext = createContext(null);

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || '';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      setAuthLoading(false);
      return;
    }

    getRedirectResult(auth).then((result) => {
      if (result?.user) setUser(result.user);
    }).catch(() => {});

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async () => {
    if (!auth) {
      console.warn('Firebase Auth is not initialized.');
      return;
    }
    try {
      await signInWithRedirect(auth, provider);
    } catch (error) {
      console.error('[VenueIQ Auth] Sign-in error:', error.code, error.message);
    }
  };

  const signOut = async () => {
    if (!auth) return;
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('[VenueIQ Auth] Sign-out error:', error.message);
    }
  };

  const isAdmin = Boolean(user && ADMIN_EMAIL && user.email === ADMIN_EMAIL);

  const value = { user, isAdmin, authLoading, signIn, signOut };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
