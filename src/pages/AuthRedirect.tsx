// src/pages/AuthRedirect.tsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export function AuthRedirect() {
  const { token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      navigate('/dashboard');
    } else {
      navigate('/');
    }
  }, [token, navigate]);

  return null; // or a loading spinner if you like
}
