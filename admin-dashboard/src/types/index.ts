export type AdminRole = 'SUPER_ADMIN' | 'OPERATIONS' | 'SUPPORT';

export interface AdminUser {
  email: string;
  role: AdminRole;
  createdAt?: string;
}

export interface AdminLoginResponse {
  success: boolean;
  message?: string;
  data: {
    token: string;
    expiresIn: string;
    admin: AdminUser;
  };
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface Category {
  _id: string;
  Name: string;
  Icon: string;
  vendorCount?: number;
  __v?: number;
}

export interface Vendor {
  Vendor_ID: string;
  VendorName: string;
  Vehicle: string;
  Status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  Language?: string;
  RegisteredVia?: string;
  LocationConsent?: boolean;
  ConsentTimestamp?: string | null;
  Category: {
    Category_ID: string;
    Name: string;
  } | null;
  AvgRating: number;
  RatingCount: number;
  RegisteredAt: string;
  LastLocationUpdate: string | null;
  ConsentStatus: string;
  geo?: {
    type: string;
    coordinates: [number, number];
  };
}

export interface VendorDetail {
  vendor: {
    _id: string;
    Name: string;
    Vehicle: string;
    Status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
    Language?: string;
    RegisteredVia?: string;
    LocationConsent?: boolean;
    ConsentTimestamp?: string | null;
    Category_ID: { _id: string; Name: string };
    AvgRating: number;
    RatingCount: number;
    createdAt: string;
  };
  location: {
    geo: { coordinates: [number, number] };
    UpdatedAt: string;
    ExpiresAt: string;
  } | null;
  session: {
    Status: string;
    Consent: boolean;
    LastActive: string;
  } | null;
  recentActivity: Array<{
    _id: string;
    Event: string;
    EventTime: string;
    Description: string;
  }>;
  recentRatings: Array<{
    _id: string;
    Rating: number;
    Review: string;
    RatingDate: string;
  }>;
}

export interface Resident {
  _id: string;
  Name: string;
  Email?: string;
  Address?: string;
  Latitude: number | null;
  Longitude: number | null;
  NotificationRadius?: number;
  createdAt?: string;
}

export interface AlertItem {
  Alert_ID: string;
  VendorName: string;
  ResidentName: string;
  EtaMinutes: number;
  DistanceAt: number;
  Timestamp: string;
}

export interface RatingItem {
  Rating_ID: string;
  VendorName: string;
  Vendor_ID: string;
  Resident_ID: string;
  Rating: number;
  Review: string;
  RatingDate: string;
}

export interface ActivityItem {
  Log_ID: string;
  VendorName: string;
  Vendor_ID: string;
  Event: string;
  Description: string;
  EventTime: string;
}

export interface DashboardMetrics {
  totalActiveVendors: number;
  totalResidents: number;
  recentAlerts: Array<{
    alertId: string;
    vendorName: string;
    residentName: string;
    etaMinutes: number;
    distanceAtKm: number;
    timestamp: string;
  }>;
  generatedAt: string;
}

export interface PilotReport {
  period: {
    from: string;
    to: string;
  };
  totalVendorsRegistered: number;
  totalAlertsDispatched: number;
  activeVendorHours: {
    totalActiveHours: number;
    avgActiveHoursPerVendorDay: number;
    distinctActiveVendors: number;
  };
  avgRatingPerCategory: Array<{
    categoryId: string;
    categoryName: string;
    avgRating: number;
    ratingCount: number;
  }>;
  interactionDensity: {
    totalAlertedVendorResidentPairs: number;
    interactedVendorResidentPairs: number;
    notificationToInteractionDensity: number;
  };
  generatedAt: string;
}

export interface HealthStatus {
  success: boolean;
  status: string;
  timestamp: string;
  uptimeSeconds: number;
  database: {
    connected: boolean;
    pingSucceeded: boolean;
    state: string;
    pingMs: number;
  };
  slaTargets: {
    WEBHOOK_PROCESSING_LATENCY_MS: number;
    GEOSPATIAL_QUERY_LATENCY_MS: number;
  };
  memory: {
    rss: string;
    heapUsed: string;
    heapTotal: string;
  };
  env: string;
}
