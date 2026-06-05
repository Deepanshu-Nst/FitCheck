import * as SecureStore from 'expo-secure-store';
import { apiClient } from './apiClient';
import type { AuthResponse, LoginInput, SignupInput, User } from '@fitcheck/shared';

const TOKEN_KEY = 'fitcheck_auth_token';

export const authService = {
  async signup(data: SignupInput): Promise<AuthResponse['data']> {
    const res = await apiClient.post<AuthResponse>('/auth/signup', data);
    await SecureStore.setItemAsync(TOKEN_KEY, res.data.token);
    return res.data;
  },

  async login(data: LoginInput): Promise<AuthResponse['data']> {
    const res = await apiClient.post<AuthResponse>('/auth/login', data);
    await SecureStore.setItemAsync(TOKEN_KEY, res.data.token);
    return res.data;
  },

  async getStoredToken(): Promise<string | null> {
    return SecureStore.getItemAsync(TOKEN_KEY);
  },

  async logout(): Promise<void> {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  },

  async getProfile(token: string): Promise<User> {
    const res = await apiClient.get<{ success: boolean; data: { user: User } }>(
      '/users/profile',
      token
    );
    return res.data.user;
  },
};
