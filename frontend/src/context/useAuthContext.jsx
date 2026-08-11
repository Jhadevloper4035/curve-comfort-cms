import { deleteCookie, getCookie, setCookie } from 'cookies-next';
import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '@/helpers/httpClient';

const AuthContext = createContext(undefined);

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}

const authSessionKey = '_REBACK_AUTH_KEY_';

export function AuthProvider({ children }) {
  const navigate = useNavigate();

  const getSession = () => {
    const raw = getCookie(authSessionKey)?.toString();
    if (!raw) return undefined;
    try { return JSON.parse(raw); } catch { return undefined; }
  };

  const [user, setUser] = useState(getSession);
  const [loading, setLoading] = useState(true);

  // Verify the backend JWT cookie is still valid on every mount / page refresh.
  // If it is, refresh user data from the server (name, accessType may have changed).
  // If it is not, wipe the local session so the router redirects to sign-in.
  useEffect(() => {
    apiFetch('/api/auth/me')
      .then((res) => {
        if (res.success && res.data?.user) {
          setCookie(authSessionKey, JSON.stringify(res.data.user));
          setUser(res.data.user);
        }
      })
      .catch(() => {
        deleteCookie(authSessionKey);
        setUser(undefined);
      })
      .finally(() => setLoading(false));
  }, []);

  const saveSession = (userData) => {
    setCookie(authSessionKey, JSON.stringify(userData));
    setUser(userData);
  };

  const removeSession = async () => {
    try {
      await apiFetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // ignore — clear local session regardless
    }
    deleteCookie(authSessionKey);
    setUser(undefined);
    navigate('/auth/sign-in');
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      loading,
      saveSession,
      removeSession,
    }}>
      {children}
    </AuthContext.Provider>
  );
}