// src/contexts/AuthContext.ts
import { createContext, useState, useEffect, useMemo, type ReactNode } from 'react';

interface AuthContextType {
  token: string | null;
  vendorName: string | null;
  vendorId: string | null;
  login: (token: string, vendorId: string, vendorName: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

const AuthProvider = ({ children }: AuthProviderProps) => {
  const [token, setToken] = useState<string | null>(null);
  const [vendorName, setVendorName] = useState<string | null>(null);
  const [vendorId, setVendorId] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedVendorId = localStorage.getItem('vendorId');
    const storedVendorName = localStorage.getItem('vendorName');

    if (storedToken && storedVendorId && storedVendorName) {
      setToken(storedToken);
      setVendorId(storedVendorId);
      setVendorName(storedVendorName);
    }
  }, []);

  const login = (token: string, vendorId: string, vendorName: string) => {
    localStorage.setItem('token', token);
    localStorage.setItem('vendorId', vendorId);
    localStorage.setItem('vendorName', vendorName);
    setToken(token);
    setVendorId(vendorId);
    setVendorName(vendorName);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('vendorId');
    localStorage.removeItem('vendorName');
    setToken(null);
    setVendorId(null);
    setVendorName(null);
  };

  const value = useMemo(
    () => ({ token, vendorId, vendorName, login, logout }),
    [token, vendorId, vendorName]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export { AuthContext, AuthProvider };
