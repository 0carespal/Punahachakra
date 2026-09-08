import { api } from './api';
import { tokenStorage, StoredUser } from './tokenStorage';

export interface RegisterPayload {
  email: string;
  password: string;
  role: 'ADMIN' | 'COMPANY' | 'KABADIWALA';
  full_name?: string;
  company_name?: string;
  location?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface UserProfileResponse {
  id: string;
  email: string;
  role: 'ADMIN' | 'COMPANY' | 'KABADIWALA';
  is_active: boolean;
  created_at: string;
  updated_at: string;
  kabadiwala_profile?: {
    id: string;
    user_id: string;
    full_name: string;
    location: string;
    average_rating: number;
    visibility_score: number;
  };
  company_profile?: {
    id: string;
    user_id: string;
    company_name: string;
    location: string;
  };
}

export const authService = {
  login: async (credentials: LoginPayload) => {
    const res = await api.post('/auth/login/json', credentials);
    const data = res.data?.data || res.data;
    const accessToken = data.access_token;
    const refreshToken = data.refresh_token;

    tokenStorage.setTokens(accessToken, refreshToken);

    // Fetch user details immediately to store user context
    const meRes = await authService.getMe();
    const user: StoredUser = {
      id: meRes.id,
      email: meRes.email,
      role: meRes.role,
      full_name: meRes.kabadiwala_profile?.full_name,
      company_name: meRes.company_profile?.company_name,
      location: meRes.role === 'COMPANY' ? meRes.company_profile?.location : meRes.kabadiwala_profile?.location,
      kabadiwala_profile: meRes.kabadiwala_profile,
      company_profile: meRes.company_profile,
    };
    tokenStorage.setUser(user);
    return { token: data, user };
  },

  register: async (payload: RegisterPayload) => {
    const res = await api.post('/auth/register', payload);
    return res.data?.data || res.data;
  },

  getMe: async (): Promise<UserProfileResponse> => {
    const res = await api.get('/users/me');
    return res.data?.data || res.data;
  },

  updateKabadiwalaProfile: async (data: { full_name?: string; location?: string }) => {
    const res = await api.put('/users/me/profile/kabadiwala', data);
    return res.data?.data || res.data;
  },

  updateCompanyProfile: async (data: { company_name?: string; location?: string }) => {
    const res = await api.put('/users/me/profile/company', data);
    return res.data?.data || res.data;
  },

  logout: () => {
    tokenStorage.clear();
  },
};
