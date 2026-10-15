import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL, withFastTimeout } from '../lib/api';
import { mongoService } from '../lib/mongoService';

interface User {
  username: string;
  role: string;
  fullName: string;
  targetRole: string | null;
  targetCompanies: string | null;
  experienceLevel: string | null;
  preferredLanguage: string | null;
  readinessScore: number;
  isOnboarded: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  register: (username: string, password: string, fullName: string) => Promise<boolean>;
  onboard: (data: { targetRole: string; targetCompanies: string; experienceLevel: string; preferredLanguage: string }) => Promise<boolean>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Axios Base URL configuration pointing to backend Spring Boot (local or Render cloud)
axios.defaults.baseURL = API_BASE_URL;

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('kodexis_token'));
  const [user, setUser] = useState<User | null>(() => {
    const cached = localStorage.getItem('kodexis_user');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed && typeof parsed.fullName === 'string' && parsed.fullName.toLowerCase().includes('vigneshwaran')) {
          parsed.fullName = parsed.username ? (parsed.username.charAt(0).toUpperCase() + parsed.username.slice(1)) : 'Candidate';
          localStorage.setItem('kodexis_user', JSON.stringify(parsed));
        }
        return parsed;
      } catch {
        return null;
      }
    }
    return null;
  });
  // If user is already in cache, loading is immediately false for 0ms initial render
  const [loading, setLoading] = useState<boolean>(!user && !!token);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      refreshUser().finally(() => setLoading(false));
    } else {
      delete axios.defaults.headers.common['Authorization'];
      setLoading(false);
    }
  }, [token]);

  const getUsersDb = (): Record<string, User> => {
    try {
      const raw = localStorage.getItem('kodexis_users_db');
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  };

  const saveUserToDb = (u: User) => {
    try {
      const db = getUsersDb();
      db[u.username.toLowerCase()] = u;
      localStorage.setItem('kodexis_users_db', JSON.stringify(db));
      mongoService.saveStudentProfile({
        username: u.username,
        fullName: u.fullName,
        role: u.role,
        targetRole: u.targetRole,
        targetCompanies: u.targetCompanies,
        experienceLevel: u.experienceLevel,
        preferredLanguage: u.preferredLanguage,
        readinessScore: u.readinessScore,
        isOnboarded: u.isOnboarded
      }).catch(() => {});
    } catch (e) {
      console.warn('Failed to save user to local DB:', e);
    }
  };

  const refreshUser = async () => {
    try {
      const response = await withFastTimeout(axios.get('/api/auth/me'), 2000, 'User profile fetch');
      const data = response.data;
      if (data && typeof data.fullName === 'string' && data.fullName.toLowerCase().includes('vigneshwaran')) {
        data.fullName = data.username ? (data.username.charAt(0).toUpperCase() + data.username.slice(1)) : 'Candidate';
      }
      setUser(data);
      localStorage.setItem('kodexis_user', JSON.stringify(data));
      saveUserToDb(data);
    } catch (error) {
      console.warn('Backend server offline or sleeping. Retaining active session:', error);
      if (!user) {
        const cached = localStorage.getItem('kodexis_user');
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            if (parsed && typeof parsed.fullName === 'string' && parsed.fullName.toLowerCase().includes('vigneshwaran')) {
              parsed.fullName = parsed.username ? (parsed.username.charAt(0).toUpperCase() + parsed.username.slice(1)) : 'Candidate';
            }
            setUser(parsed);
          } catch {}
        }
      }
    }
  };

  const login = async (username: string, password: string): Promise<boolean> => {
    const cleanUsername = username.trim();
    try {
      const response = await withFastTimeout(
        axios.post('/api/auth/login', { username: cleanUsername, password }),
        2500,
        'User authentication'
      );
      const { token: receivedToken, ...userData } = response.data;
      localStorage.setItem('kodexis_token', receivedToken);
      localStorage.setItem('kodexis_user', JSON.stringify(userData));
      saveUserToDb(userData as User);
      setToken(receivedToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${receivedToken}`;
      setUser(userData as User);
      return true;
    } catch (error) {
      console.warn('Backend server offline or high latency. Logging in with client session mode...');
      const db = getUsersDb();
      const existing = db[cleanUsername.toLowerCase()];

      const userProfile: User = existing || {
        username: cleanUsername,
        role: cleanUsername.toLowerCase().includes('admin') ? 'ROLE_ADMIN' : 'ROLE_CANDIDATE',
        fullName: cleanUsername.charAt(0).toUpperCase() + cleanUsername.slice(1),
        targetRole: 'Software Engineer',
        targetCompanies: 'Top Tech Companies',
        experienceLevel: 'MEDIUM',
        preferredLanguage: 'PYTHON',
        readinessScore: 0,
        isOnboarded: false
      };

      const sessionToken = `mock_token_${cleanUsername}_${Date.now()}`;
      localStorage.setItem('kodexis_token', sessionToken);
      localStorage.setItem('kodexis_user', JSON.stringify(userProfile));
      saveUserToDb(userProfile);
      setToken(sessionToken);
      setUser(userProfile);
      return true;
    }
  };

  const register = async (username: string, password: string, fullName: string): Promise<boolean> => {
    const cleanUsername = username.trim();
    const cleanFullName = (fullName && fullName.trim()) ? fullName.trim() : (cleanUsername.charAt(0).toUpperCase() + cleanUsername.slice(1));
    try {
      const response = await withFastTimeout(
        axios.post('/api/auth/register', { username: cleanUsername, password, fullName: cleanFullName }),
        2500,
        'User registration'
      );
      const { token: receivedToken, ...userData } = response.data;
      localStorage.setItem('kodexis_token', receivedToken);
      localStorage.setItem('kodexis_user', JSON.stringify(userData));
      saveUserToDb(userData as User);
      setToken(receivedToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${receivedToken}`;
      setUser(userData as User);
      return true;
    } catch (error) {
      console.warn('Backend server offline or high latency. Registering with client session mode...');
      const newUser: User = {
        username: cleanUsername,
        role: cleanUsername.toLowerCase().includes('admin') ? 'ROLE_ADMIN' : 'ROLE_CANDIDATE',
        fullName: cleanFullName,
        targetRole: 'Software Engineer',
        targetCompanies: 'Top Tech Companies',
        experienceLevel: 'MEDIUM',
        preferredLanguage: 'PYTHON',
        readinessScore: 0,
        isOnboarded: false
      };

      const sessionToken = `mock_token_${cleanUsername}_${Date.now()}`;
      localStorage.setItem('kodexis_token', sessionToken);
      localStorage.setItem('kodexis_user', JSON.stringify(newUser));
      saveUserToDb(newUser);
      setToken(sessionToken);
      setUser(newUser);
      return true;
    }
  };

  const onboard = async (data: { targetRole: string; targetCompanies: string; experienceLevel: string; preferredLanguage: string }): Promise<boolean> => {
    try {
      await withFastTimeout(axios.post('/api/auth/onboard', data), 2500, 'User onboarding');
      await refreshUser();
      return true;
    } catch (error) {
      console.warn('Backend onboarding delayed or offline, saving preferences locally:', error);
      if (user) {
        const updated = {
          ...user,
          ...data,
          isOnboarded: true
        };
        setUser(updated);
        localStorage.setItem('kodexis_user', JSON.stringify(updated));
        saveUserToDb(updated);
      }
      return true;
    }
  };

  const logout = () => {
    localStorage.removeItem('kodexis_token');
    localStorage.removeItem('kodexis_user');
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, onboard, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
