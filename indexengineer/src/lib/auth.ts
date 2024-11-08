// src/lib/auth.ts
export const MASTER_PASSWORD = "idx"; // Replace with "idxengfrevr"
export const AUTH_KEY = "auth_token";

export const authenticate = (password: string): boolean => {
  if (password === MASTER_PASSWORD) {
    // Only run in browser environment
    if (typeof window !== 'undefined') {
      const token = generateAuthToken();
      localStorage.setItem(AUTH_KEY, token);
      document.cookie = `auth_token=${token}; path=/; max-age=86400`; // 24 hours
    }
    return true;
  }
  return false;
};

export const isAuthenticated = (): boolean => {
  // Check if we're in a browser environment
  if (typeof window === 'undefined') {
    return false;
  }

  // Check both localStorage and cookies
  const localToken = localStorage.getItem(AUTH_KEY);
  const cookieToken = document.cookie
    .split('; ')
    .find(row => row.startsWith('auth_token='))
    ?.split('=')[1];
    
  return !!(localToken && cookieToken);
};

export const logout = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(AUTH_KEY);
    document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
  }
};

const generateAuthToken = () => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};