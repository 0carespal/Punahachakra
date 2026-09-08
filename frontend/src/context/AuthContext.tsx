import React, { createContext, useContext, useState, useEffect } from 'react';
import { tokenStorage, StoredUser } from '../services/tokenStorage';
import { authService, LoginPayload, RegisterPayload } from '../services/auth.service';

interface AuthContextType {
  user: StoredUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<StoredUser | null>(() => tokenStorage.getUser());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = tokenStorage.getAccessToken();
      if (token) {
        try {
          const profile = await authService.getMe();
          const updatedUser: StoredUser = {
            id: profile.id,
            email: profile.email,
            role: profile.role,
            full_name: profile.kabadiwala_profile?.full_name,
            company_name: profile.company_profile?.company_name,
            location: profile.role === 'COMPANY' ? profile.company_profile?.location : profile.kabadiwala_profile?.location,
            kabadiwala_profile: profile.kabadiwala_profile,
            company_profile: profile.company_profile,
          };
          tokenStorage.setUser(updatedUser);
          setUser(updatedUser);
        } catch {
          tokenStorage.clear();
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials: LoginPayload) => {
    const { user: loggedInUser } = await authService.login(credentials);
    setUser(loggedInUser);
  };

  const register = async (payload: RegisterPayload) => {
    await authService.register(payload);
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const profile = await authService.getMe();
      const updatedUser: StoredUser = {
        id: profile.id,
        email: profile.email,
        role: profile.role,
        full_name: profile.kabadiwala_profile?.full_name,
        company_name: profile.company_profile?.company_name,
        location: profile.role === 'COMPANY' ? profile.company_profile?.location : profile.kabadiwala_profile?.location,
        kabadiwala_profile: profile.kabadiwala_profile,
        company_profile: profile.company_profile,
      };
      tokenStorage.setUser(updatedUser);
      setUser(updatedUser);
    } catch {
      // ignore refresh errors
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user && !!tokenStorage.getAccessToken(),
        isLoading,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
