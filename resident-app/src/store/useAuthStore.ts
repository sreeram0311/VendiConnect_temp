import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ResidentProfile } from '../types';
import { residentService } from '../services/residentService';

interface AuthState {
  token: string | null;
  phoneNumber: string | null;
  email: string | null;
  profile: ResidentProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  loginWithPhone: (payload: {
    phone: string;
    name?: string;
    address?: string;
    latitude?: number;
    longitude?: number;
  }) => Promise<boolean>;

  loginWithEmail: (payload: {
    email: string;
    name?: string;
    address?: string;
    latitude?: number;
    longitude?: number;
  }) => Promise<boolean>;

  logout: () => Promise<void>;
  restoreSession: () => Promise<void>;
  updateProfile: (data: Partial<ResidentProfile>) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: null,
  phoneNumber: null,
  email: null,
  profile: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  loginWithPhone: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const cleaned = payload.phone.replace(/\D/g, '');
      if (cleaned.length < 10) {
        throw new Error('Please enter a valid 10-digit mobile number.');
      }

      const res = await residentService.loginWithPhone({
        phone: cleaned,
        name: payload.name?.trim() || 'Resident Member',
        address: payload.address?.trim() || 'Chennai',
        latitude: payload.latitude ?? 13.0418,
        longitude: payload.longitude ?? 80.2341,
      });

      if (!res.success || !res.token) {
        throw new Error(res as any || 'Authentication failed. Please check your network.');
      }

      await AsyncStorage.setItem('vendiconnect_resident_token', res.token);
      await AsyncStorage.setItem('vendiconnect_resident_phone', cleaned);

      set({
        token: res.token,
        phoneNumber: cleaned,
        profile: res.resident,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      return true;
    } catch (err: any) {
      set({ isLoading: false, error: err.message || 'Login failed' });
      return false;
    }
  },

  loginWithEmail: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      if (!payload.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email.trim())) {
        throw new Error('Please enter a valid email address.');
      }

      // Use phone login fallback or sync with email
      const phoneDigits = payload.email.replace(/\D/g, '').padEnd(10, '0').slice(0, 10);
      const res = await residentService.loginWithPhone({
        phone: phoneDigits.length === 10 ? phoneDigits : '9000000000',
        name: payload.name?.trim() || payload.email.split('@')[0],
        address: payload.address?.trim() || 'Chennai',
        latitude: payload.latitude ?? 13.0418,
        longitude: payload.longitude ?? 80.2341,
      });

      if (!res.success || !res.token) {
        throw new Error('Authentication failed.');
      }

      await AsyncStorage.setItem('vendiconnect_resident_token', res.token);
      await AsyncStorage.setItem('vendiconnect_resident_email', payload.email);

      set({
        token: res.token,
        email: payload.email,
        profile: res.resident,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      return true;
    } catch (err: any) {
      set({ isLoading: false, error: err.message || 'Login failed' });
      return false;
    }
  },

  logout: async () => {
    try {
      await AsyncStorage.removeItem('vendiconnect_resident_token');
      await AsyncStorage.removeItem('vendiconnect_resident_phone');
      await AsyncStorage.removeItem('vendiconnect_resident_email');
    } catch {
      // ignore
    }
    set({
      token: null,
      phoneNumber: null,
      email: null,
      profile: null,
      isAuthenticated: false,
      error: null,
    });
  },

  restoreSession: async () => {
    set({ isLoading: true });
    try {
      const token = await AsyncStorage.getItem('vendiconnect_resident_token');
      if (!token) {
        set({ isAuthenticated: false, isLoading: false });
        return;
      }

      const res = await residentService.getMyProfile();
      if (res.success && res.data) {
        const phone = await AsyncStorage.getItem('vendiconnect_resident_phone');
        const email = await AsyncStorage.getItem('vendiconnect_resident_email');

        set({
          token,
          phoneNumber: phone,
          email,
          profile: res.data,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        await AsyncStorage.removeItem('vendiconnect_resident_token');
        set({ isAuthenticated: false, isLoading: false });
      }
    } catch {
      await AsyncStorage.removeItem('vendiconnect_resident_token');
      set({ isAuthenticated: false, isLoading: false });
    }
  },

  updateProfile: async (data: Partial<ResidentProfile>) => {
    const current = get().profile;
    if (!current) return;

    try {
      await residentService.updateMyProfile({
        name: data.Name,
        address: data.Address,
        latitude: data.Latitude ?? undefined,
        longitude: data.Longitude ?? undefined,
        notificationRadius: data.NotificationRadius,
      });

      set({
        profile: {
          ...current,
          ...data,
        },
      });
    } catch {
      set({
        profile: {
          ...current,
          ...data,
        },
      });
    }
  },
}));
