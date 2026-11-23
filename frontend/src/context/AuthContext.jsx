import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi, setTokens, clearTokens } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState('ml'); // Default Malayalam as requested

  useEffect(() => {
    const initAuth = async () => {
      const access = localStorage.getItem('agrorise_access_token');
      if (access) {
        try {
          const profileData = await authApi.getProfile();
          if (profileData && profileData.id) {
            setUser(profileData);
            localStorage.setItem('agrorise_user', JSON.stringify(profileData));
            if (profileData.profile?.preferred_language) {
              setLanguage(profileData.profile.preferred_language);
            }
          } else {
            clearTokens();
            setUser(null);
          }
        } catch (err) {
          clearTokens();
          setUser(null);
        }
      } else {
        clearTokens();
        setUser(null);
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const setSessionData = (tokens, userData) => {
    if (tokens?.access) {
      setTokens(tokens.access, tokens.refresh);
    }
    if (userData) {
      setUser(userData);
      localStorage.setItem('agrorise_user', JSON.stringify(userData));
      if (userData.profile?.preferred_language) {
        setLanguage(userData.profile.preferred_language);
      }
    }
  };

  const login = async (username, password) => {
    const res = await authApi.login({ username, password });
    if (res?.tokens) {
      setTokens(res.tokens.access, res.tokens.refresh);
    } else if (res?.access) {
      setTokens(res.access, res.refresh);
    }
    if (res?.user) {
      setUser(res.user);
      localStorage.setItem('agrorise_user', JSON.stringify(res.user));
      if (res.user?.profile?.preferred_language) {
        setLanguage(res.user.profile.preferred_language);
      }
    }
    return res;
  };

  const register = async (registrationPayload) => {
    const res = await authApi.register(registrationPayload);
    if (res?.tokens) {
      setTokens(res.tokens.access, res.tokens.refresh);
    }
    if (res?.user) {
      setUser(res.user);
      localStorage.setItem('agrorise_user', JSON.stringify(res.user));
      if (res.user?.profile?.preferred_language) {
        setLanguage(res.user.profile.preferred_language);
      }
    }
    return res;
  };

  const logout = async () => {
    await authApi.logout();
    setUser(null);
    clearTokens();
  };

  const updateProfile = async (partialProfile) => {
    const res = await authApi.updateProfile(partialProfile);
    if (res?.user) {
      setUser(res.user);
      localStorage.setItem('agrorise_user', JSON.stringify(res.user));
    }
    return res;
  };

  const toggleLanguage = () => {
    const nextLang = language === 'ml' ? 'en' : 'ml';
    setLanguage(nextLang);
    if (user) {
      updateProfile({ preferred_language: nextLang });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        language,
        setLanguage,
        toggleLanguage,
        login,
        register,
        logout,
        updateProfile,
        setSessionData
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
