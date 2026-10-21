export interface Category {
  _id: string;
  Name: string;
  Icon: string;
  __v?: number;
}

export interface ResidentProfile {
  Resident_ID: string;
  Email?: string;
  Name: string;
  Address: string;
  Latitude: number | null;
  Longitude: number | null;
  NotificationRadius: number;
  hasLocation: boolean;
}

export interface NearbyVendor {
  Vendor_ID: string;
  VendorName: string;
  Vehicle: string;
  AvgRating: number;
  Category_ID: string;
  approximateLocation: {
    latitude: number;
    longitude: number;
  };
  distanceKm: number;
  etaMinutes: number;
  status: 'APPROACHING' | 'NEARBY' | 'IN_ZONE' | 'PASSING' | 'STALE' | 'OFFLINE';
  lastUpdated: string;
}

export interface ActiveVendorSummary {
  VendorName: string;
  Category_ID: string;
  AvgRating: number;
  geo?: {
    coordinates: [number, number];
  } | null;
  status: string;
}

export interface ResidentAlert {
  id: string;
  vendorId: string;
  vendorName: string;
  vehicle?: string;
  categoryName?: string;
  categoryId?: string;
  etaMinutes: number;
  distanceMeters: number;
  timestamp: string;
  read?: boolean;
  type?: string;
  deliveryStatus?: string;
  canRate?: boolean;
  vendorCoordinates?: {
    latitude: number;
    longitude: number;
  } | null;
}

export interface RatingResult {
  rating: {
    _id: string;
    Vendor_ID: string;
    Resident_ID: string;
    Rating: number;
    Review: string;
    RatingDate: string;
  };
  vendorAvgRating: number;
  vendorRatingCount: number;
}
