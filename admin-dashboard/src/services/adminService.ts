import { request } from './apiClient';
import {
  AdminLoginResponse,
  AdminUser,
  DashboardMetrics,
  PilotReport,
  Vendor,
  VendorDetail,
  Resident,
  Category,
  AlertItem,
  RatingItem,
  ActivityItem,
  PaginationMeta,
  HealthStatus,
} from '../types';

export const adminService = {
  // Authentication
  async login(email: string, password: string): Promise<AdminLoginResponse> {
    return request<AdminLoginResponse>('admin/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  async getMe(): Promise<{ success: boolean; data: AdminUser }> {
    return request<{ success: boolean; data: AdminUser }>('admin/me');
  },

  // Overview & Analytics
  async getDashboard(): Promise<{ success: boolean; data: DashboardMetrics }> {
    return request<{ success: boolean; data: DashboardMetrics }>('admin/dashboard');
  },

  async getPilotReport(windowDays: number = 30): Promise<{ success: boolean; data: PilotReport }> {
    return request<{ success: boolean; data: PilotReport }>(`admin/pilot-report?windowDays=${windowDays}`);
  },

  async getHealth(): Promise<HealthStatus> {
    return request<HealthStatus>('health');
  },

  // Vendors
  async getVendors(params: {
    page?: number;
    limit?: number;
    status?: string;
    category?: string;
    q?: string;
  } = {}): Promise<{ success: boolean; data: Vendor[]; meta: PaginationMeta }> {
    const query = new URLSearchParams();
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));
    if (params.status) query.set('status', params.status);
    if (params.category) query.set('category', params.category);
    if (params.q) query.set('q', params.q);

    return request<{ success: boolean; data: Vendor[]; meta: PaginationMeta }>(
      `admin/vendors?${query.toString()}`
    );
  },

  async getVendorDetail(vendorId: string): Promise<{ success: boolean; data: VendorDetail }> {
    return request<{ success: boolean; data: VendorDetail }>(`admin/vendors/${vendorId}`);
  },

  async updateVendorStatus(
    vendorId: string,
    status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'
  ): Promise<{ success: boolean; message: string; data: { vendorId: string; status: string } }> {
    return request<{ success: boolean; message: string; data: { vendorId: string; status: string } }>(
      `admin/vendors/${vendorId}/status`,
      {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }
    );
  },

  // Residents
  async getResidents(params: {
    page?: number;
    limit?: number;
  } = {}): Promise<{ success: boolean; data: Resident[]; meta: PaginationMeta }> {
    const query = new URLSearchParams();
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));

    return request<{ success: boolean; data: Resident[]; meta: PaginationMeta }>(
      `admin/residents?${query.toString()}`
    );
  },

  async getResidentDetail(residentId: string): Promise<{
    success: boolean;
    data: {
      resident: Resident;
      preferences: Array<{ _id: string; Name: string; Icon: string }>;
      recentAlerts: AlertItem[];
    };
  }> {
    return request(`admin/residents/${residentId}`);
  },

  // Categories
  async getCategories(): Promise<{ success: boolean; data: Category[] }> {
    return request<{ success: boolean; data: Category[] }>('admin/categories');
  },

  async createCategory(
    name: string,
    icon: string
  ): Promise<{ success: boolean; message: string; data: Category }> {
    return request<{ success: boolean; message: string; data: Category }>('admin/categories', {
      method: 'POST',
      body: JSON.stringify({ name, icon }),
    });
  },

  async updateCategory(
    categoryId: string,
    payload: { name?: string; icon?: string }
  ): Promise<{ success: boolean; message: string; data: Category }> {
    return request<{ success: boolean; message: string; data: Category }>(
      `admin/categories/${categoryId}`,
      {
        method: 'PATCH',
        body: JSON.stringify(payload),
      }
    );
  },

  async deleteCategory(
    categoryId: string
  ): Promise<{ success: boolean; message: string }> {
    return request<{ success: boolean; message: string }>(
      `admin/categories/${categoryId}`,
      {
        method: 'DELETE',
      }
    );
  },

  // Alerts
  async getAlerts(params: {
    page?: number;
    limit?: number;
    vendorId?: string;
    residentId?: string;
  } = {}): Promise<{ success: boolean; data: AlertItem[]; meta: PaginationMeta }> {
    const query = new URLSearchParams();
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));
    if (params.vendorId) query.set('vendorId', params.vendorId);
    if (params.residentId) query.set('residentId', params.residentId);

    return request<{ success: boolean; data: AlertItem[]; meta: PaginationMeta }>(
      `admin/alerts?${query.toString()}`
    );
  },

  // Ratings
  async getRatings(params: {
    page?: number;
    limit?: number;
    vendorId?: string;
  } = {}): Promise<{ success: boolean; data: RatingItem[]; meta: PaginationMeta }> {
    const query = new URLSearchParams();
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));
    if (params.vendorId) query.set('vendorId', params.vendorId);

    return request<{ success: boolean; data: RatingItem[]; meta: PaginationMeta }>(
      `admin/ratings?${query.toString()}`
    );
  },

  // Activity Logs
  async getActivity(params: {
    page?: number;
    limit?: number;
    vendorId?: string;
  } = {}): Promise<{ success: boolean; data: ActivityItem[]; meta: PaginationMeta }> {
    const query = new URLSearchParams();
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));
    if (params.vendorId) query.set('vendorId', params.vendorId);

    return request<{ success: boolean; data: ActivityItem[]; meta: PaginationMeta }>(
      `admin/activity?${query.toString()}`
    );
  },
};
