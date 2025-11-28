import { User, AuthResponse } from '../types';
import { USE_REAL_BACKEND, API_URL } from './config';

const USERS_STORAGE_KEY = 'doodle_journal_users';
const TOKEN_KEY = 'doodle_journal_token';
const CURRENT_USER_KEY = 'doodle_journal_current_user';

// Mock Implementation helpers
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const mockAuth = {
  register: async (username: string, email: string, password: string): Promise<AuthResponse> => {
    await delay(800);
    const usersRaw = localStorage.getItem(USERS_STORAGE_KEY);
    const users: any[] = usersRaw ? JSON.parse(usersRaw) : [];

    if (users.find((u: any) => u.email === email)) {
      throw new Error('此 Email 已經被註冊過了！');
    }

    const newUser = {
      id: crypto.randomUUID(),
      username,
      email,
      password,
    };

    users.push(newUser);
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));

    const token = `mock-jwt-token-${newUser.id}-${Date.now()}`;
    const userToReturn = { id: newUser.id, username: newUser.username, email: newUser.email };
    
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userToReturn));

    return { user: userToReturn, token };
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    await delay(800);
    const usersRaw = localStorage.getItem(USERS_STORAGE_KEY);
    const users: any[] = usersRaw ? JSON.parse(usersRaw) : [];

    const user = users.find((u: any) => u.email === email && u.password === password);
    if (!user) throw new Error('帳號或密碼錯誤');

    const token = `mock-jwt-token-${user.id}-${Date.now()}`;
    const userToReturn = { id: user.id, username: user.username, email: user.email };

    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userToReturn));

    return { user: userToReturn, token };
  },
  
  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(CURRENT_USER_KEY);
  }
};

// Real API Implementation
const apiAuth = {
  register: async (username: string, email: string, password: string): Promise<AuthResponse> => {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || '註冊失敗');
    
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(data.user));
    return data;
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || '登入失敗');

    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(data.user));
    return data;
  },

  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(CURRENT_USER_KEY);
  }
};

export const authService = {
  register: async (u: string, e: string, p: string) => {
    return USE_REAL_BACKEND ? apiAuth.register(u, e, p) : mockAuth.register(u, e, p);
  },
  login: async (e: string, p: string) => {
    return USE_REAL_BACKEND ? apiAuth.login(e, p) : mockAuth.login(e, p);
  },
  logout: () => {
    return USE_REAL_BACKEND ? apiAuth.logout() : mockAuth.logout();
  },
  getCurrentUser: (): User | null => {
    const userStr = localStorage.getItem(CURRENT_USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  },
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem(TOKEN_KEY);
  }
};