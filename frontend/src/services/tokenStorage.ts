export const TOKEN_KEYS = {
  ACCESS_TOKEN: 'kabadiwala_access_token',
  REFRESH_TOKEN: 'kabadiwala_refresh_token',
  USER_DATA: 'kabadiwala_user_data',
};

export interface StoredUser {
  id: string;
  email: string;
  role: 'ADMIN' | 'COMPANY' | 'KABADIWALA';
  full_name?: string;
  company_name?: string;
  location?: string;
  kabadiwala_profile?: any;
  company_profile?: any;
}

export const tokenStorage = {
  getAccessToken: (): string | null => {
    return localStorage.getItem(TOKEN_KEYS.ACCESS_TOKEN);
  },

  getRefreshToken: (): string | null => {
    return localStorage.getItem(TOKEN_KEYS.REFRESH_TOKEN);
  },

  getUser: (): StoredUser | null => {
    const raw = localStorage.getItem(TOKEN_KEYS.USER_DATA);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  setTokens: (accessToken: string, refreshToken?: string) => {
    localStorage.setItem(TOKEN_KEYS.ACCESS_TOKEN, accessToken);
    if (refreshToken) {
      localStorage.setItem(TOKEN_KEYS.REFRESH_TOKEN, refreshToken);
    }
  },

  setUser: (user: StoredUser) => {
    localStorage.setItem(TOKEN_KEYS.USER_DATA, JSON.stringify(user));
  },

  clear: () => {
    localStorage.removeItem(TOKEN_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(TOKEN_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(TOKEN_KEYS.USER_DATA);
  },
};
