import { create } from 'zustand';
import { Category, NearbyVendor, ActiveVendorSummary, ResidentAlert } from '../types';
import { residentService } from '../services/residentService';
import { useAuthStore } from './useAuthStore';

interface ResidentState {
  categories: Category[];
  selectedCategoryIds: string[];
  nearbyVendors: NearbyVendor[];
  activeVendors: ActiveVendorSummary[];
  alerts: ResidentAlert[];
  unreadAlertCount: number;

  homeCoordinates: {
    latitude: number;
    longitude: number;
    address: string;
  };
  notificationRadius: number; // 200, 300, 500, 1000

  isLoading: boolean;
  isLoadingVendors: boolean;
  isLoadingAlerts: boolean;
  error: string | null;

  loadInitialData: () => Promise<void>;
  fetchNearbyVendors: (params?: { radius?: number; category?: string; minRating?: number }) => Promise<void>;
  fetchAlerts: () => Promise<void>;
  markAlertRead: (alertId: string) => Promise<void>;
  markAllAlertsRead: () => Promise<void>;
  toggleCategory: (categoryId: string) => Promise<void>;
  setRadius: (radius: number) => Promise<void>;
  setHomeLocation: (lat: number, lng: number, address: string) => Promise<void>;
  addAlert: (alert: ResidentAlert) => void;
}

export const useResidentStore = create<ResidentState>((set, get) => ({
  categories: [],
  selectedCategoryIds: [],
  nearbyVendors: [],
  activeVendors: [],
  alerts: [],
  unreadAlertCount: 0,

  homeCoordinates: {
    latitude: 13.0418,
    longitude: 80.2341,
    address: '42, Venkatanarayana Road, T. Nagar, Chennai',
  },
  notificationRadius: 300,

  isLoading: false,
  isLoadingVendors: false,
  isLoadingAlerts: false,
  error: null,

  loadInitialData: async () => {
    set({ isLoading: true });
    try {
      const [catRes, activeRes] = await Promise.all([
        residentService.getCategories(),
        residentService.getActiveVendors(),
      ]);

      const categories = catRes.success ? catRes.data : [];
      const activeVendors = activeRes.success ? activeRes.data : [];

      set({
        categories,
        activeVendors,
        isLoading: false,
      });

      // Also trigger initial nearby vendors and alerts
      get().fetchNearbyVendors();
      get().fetchAlerts();
    } catch (err: any) {
      set({ isLoading: false, error: err.message });
    }
  },

  fetchAlerts: async () => {
    const token = useAuthStore.getState().token;
    if (!token) return;

    set({ isLoadingAlerts: true });
    try {
      const res = await residentService.getAlerts();
      if (res.success) {
        set({
          alerts: res.data || [],
          unreadAlertCount: res.unreadCount || 0,
          isLoadingAlerts: false,
        });
      } else {
        set({ isLoadingAlerts: false });
      }
    } catch {
      set({ isLoadingAlerts: false });
    }
  },

  markAlertRead: async (alertId: string) => {
    try {
      await residentService.markAlertRead(alertId);
      set((state) => ({
        alerts: state.alerts.map((a) => (a.id === alertId ? { ...a, read: true } : a)),
        unreadAlertCount: Math.max(state.unreadAlertCount - 1, 0),
      }));
    } catch {
      // ignore
    }
  },

  markAllAlertsRead: async () => {
    try {
      await residentService.markAllAlertsRead();
      set((state) => ({
        alerts: state.alerts.map((a) => ({ ...a, read: true })),
        unreadAlertCount: 0,
      }));
    } catch {
      // ignore
    }
  },

  fetchNearbyVendors: async (params = {}) => {
    set({ isLoadingVendors: true });
    const { homeCoordinates, notificationRadius } = get();

    try {
      const res = await residentService.getNearbyVendors({
        lat: homeCoordinates.latitude,
        lng: homeCoordinates.longitude,
        radius: params.radius || notificationRadius || 1000,
        category: params.category,
        minRating: params.minRating,
      });

      if (res.success) {
        set({ nearbyVendors: res.data || [], isLoadingVendors: false, error: null });
      } else {
        set({ nearbyVendors: [], isLoadingVendors: false });
      }
    } catch (err: any) {
      set({
        nearbyVendors: [],
        isLoadingVendors: false,
        error: err.message || 'Failed to fetch nearby vendors',
      });
    }
  },

  toggleCategory: async (categoryId: string) => {
    const current = get().selectedCategoryIds;
    const exists = current.includes(categoryId);
    const updated = exists
      ? current.filter((id) => id !== categoryId)
      : [...current, categoryId];

    set({ selectedCategoryIds: updated });

    const profile = useAuthStore.getState().profile;
    if (profile?.Resident_ID) {
      try {
        await residentService.setPreferences(profile.Resident_ID, updated);
      } catch {
        // preference save
      }
    }
  },

  setRadius: async (radius: number) => {
    set({ notificationRadius: radius });
    const { updateProfile } = useAuthStore.getState();
    await updateProfile({ NotificationRadius: radius });
    get().fetchNearbyVendors({ radius });
  },

  setHomeLocation: async (lat: number, lng: number, address: string) => {
    set({
      homeCoordinates: { latitude: lat, longitude: lng, address },
    });
    const { updateProfile } = useAuthStore.getState();
    await updateProfile({
      Latitude: lat,
      Longitude: lng,
      Address: address,
    });
    get().fetchNearbyVendors();
  },

  addAlert: (alert: ResidentAlert) => {
    set((state) => ({
      alerts: [alert, ...state.alerts.filter((a) => a.id !== alert.id)],
      unreadAlertCount: state.unreadAlertCount + 1,
    }));
  },
}));
