import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { AuthContext } from './AuthContextProvider';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.exp > Date.now() / 1000) {
          setUser({
            id: payload.userId,
            email: payload.email,
            name: payload.name,
            role: payload.role,
          });
        } else {
          localStorage.removeItem('token');
          toast.error('Session expired. Please login again.');
        }
      } catch {
        localStorage.removeItem('token');
        toast.error('Invalid session. Please login again.');
      }
    }
    setLoading(false);
  }, []);

  const login = (token) => {
    localStorage.setItem('token', token);
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setUser({
        id: payload.userId,
        email: payload.email,
        name: payload.name,
        role: payload.role,
      });
      toast.success('Login successful!');
      return true;
    } catch {
      localStorage.removeItem('token');
      toast.error('Invalid token received. Please try again.');
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    toast.success('Logged out successfully!');
  };

  const value = {
    user,
    login,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
