import { request } from './apiClient';
import {
  Category,
  ResidentProfile,
  NearbyVendor,
  ActiveVendorSummary,
  RatingResult,
  ResidentAlert,
} from '../types';

export const residentService = {
  // Public Category Discovery
  async getCategories(): Promise<{ success: boolean; data: Category[] }> {
    return request<{ success: boolean; data: Category[] }>('public/categories');
  },

  // Native Phone Login (Authenticates with real MongoDB Atlas record and returns JWT)
  async loginWithPhone(payload: {
    phone: string;
    name?: string;
    address?: string;
    latitude?: number;
    longitude?: number;
  }): Promise<{ success: boolean; token: string; resident: ResidentProfile }> {
    return request<{ success: boolean; token: string; resident: ResidentProfile }>('residents/auth/phone-login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // Public Active Vendors
  async getActiveVendors(): Promise<{ success: boolean; count: number; data: ActiveVendorSummary[] }> {
    return request<{ success: boolean; count: number; data: ActiveVendorSummary[] }>('vendors/active-vendors');
  },

  // Nearby Vendors by Coordinates
  async getNearbyVendors(params: {
    lat: number;
    lng: number;
    radius?: number;
    category?: string;
    minRating?: number;
  }): Promise<{
    success: boolean;
    count: number;
    radiusMeters: number;
    notificationRadiusMeters?: number;
    data: NearbyVendor[];
  }> {
    const query = new URLSearchParams();
    query.set('lat', String(params.lat));
    query.set('lng', String(params.lng));
    if (params.radius) query.set('radius', String(params.radius));
    if (params.category) query.set('category', params.category);
    if (params.minRating !== undefined) query.set('minRating', String(params.minRating));

    return request(`vendors/nearby?${query.toString()}`);
  },

  // Nearby Vendors for Authenticated Resident's Saved Location
  async getNearbyVendorsForMe(params: {
    radius?: number;
    category?: string;
    minRating?: number;
  } = {}): Promise<{
    success: boolean;
    count: number;
    radiusMeters: number;
    notificationRadiusMeters?: number;
    data: NearbyVendor[];
  }> {
    const query = new URLSearchParams();
    if (params.radius) query.set('radius', String(params.radius));
    if (params.category) query.set('category', params.category);
    if (params.minRating !== undefined) query.set('minRating', String(params.minRating));

    return request(`vendors/nearby/me?${query.toString()}`);
  },

  // Resident Profile Management
  async syncResident(payload: {
    name?: string;
    address?: string;
    latitude?: number;
    longitude?: number;
  }): Promise<{ success: boolean; message: string; data: ResidentProfile }> {
    return request<{ success: boolean; message: string; data: ResidentProfile }>('residents/auth/sync', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async getMyProfile(): Promise<{ success: boolean; data: ResidentProfile }> {
    return request<{ success: boolean; data: ResidentProfile }>('residents/auth/me');
  },

  async updateMyProfile(payload: {
    name?: string;
    address?: string;
    latitude?: number;
    longitude?: number;
    notificationRadius?: number;
  }): Promise<{ success: boolean; message: string; data: ResidentProfile }> {
    return request<{ success: boolean; message: string; data: ResidentProfile }>('residents/auth/me', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  async updateFcmToken(fcmToken: string): Promise<{ success: boolean; message: string }> {
    return request<{ success: boolean; message: string }>('residents/auth/fcm-token', {
      method: 'PATCH',
      body: JSON.stringify({ fcmToken }),
    });
  },

  // Category Preferences
  async getPreferences(residentId: string): Promise<{ success: boolean; data: Category[] }> {
    return request<{ success: boolean; data: Category[] }>(`residents/${residentId}/preferences`);
  },

  async setPreferences(
    residentId: string,
    categoryIds: string[]
  ): Promise<{ success: boolean; message: string; data: { Resident_ID: string; categoryIds: string[] } }> {
    return request<{ success: boolean; message: string; data: { Resident_ID: string; categoryIds: string[] } }>(
      `residents/${residentId}/preferences`,
      {
        method: 'PUT',
        body: JSON.stringify({ categoryIds }),
      }
    );
  },

  // Ratings Submission
  async createRating(
    vendorId: string,
    ratingValue: number,
    review?: string
  ): Promise<{ success: boolean; message: string; data: RatingResult }> {
    return request<{ success: boolean; message: string; data: RatingResult }>('ratings', {
      method: 'POST',
      body: JSON.stringify({ vendorId, ratingValue, review: review || '' }),
    });
  },

  // In-App Proximity Alerts
  async getAlerts(params: { page?: number; limit?: number } = {}): Promise<{
    success: boolean;
    data: ResidentAlert[];
    total: number;
    unreadCount: number;
  }> {
    const query = new URLSearchParams();
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));
    const endpoint = `residents/alerts${query.toString() ? `?${query.toString()}` : ''}`;
    return request(endpoint);
  },

  async markAlertRead(alertId: string): Promise<{ success: boolean; message: string }> {
    return request<{ success: boolean; message: string }>(`residents/alerts/${alertId}/read`, {
      method: 'PATCH',
    });
  },

  async markAllAlertsRead(): Promise<{ success: boolean; message: string }> {
    return request<{ success: boolean; message: string }>('residents/alerts/read-all', {
      method: 'PATCH',
    });
  },
};
