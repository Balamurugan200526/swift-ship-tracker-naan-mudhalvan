export interface User {
  id: string;
  _id?: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'DELIVERY_AGENT' | 'CUSTOMER' | 'SUPPORT';
  phone?: string;
  isActive: boolean;
  createdAt: string;
}

export interface Sender {
  _id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  createdAt: string;
}

export interface Receiver {
  _id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  createdAt: string;
}

export type ParcelStatus = 'Booked' | 'In Transit' | 'Out for Delivery' | 'Delivered' | 'Delayed' | 'Cancelled';

export interface Parcel {
  _id: string;
  parcelId: string;
  status: ParcelStatus;
  weight: number;
  description?: string;
  estimatedDeliveryDate: string;
  senderId: Sender | string;
  receiverId: Receiver | string;
  deliveryId?: Delivery | string;
  customerId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Delivery {
  _id: string;
  deliveryId: string;
  parcelId: Parcel | string;
  deliveryAgentId?: User | string;
  currentLocation: string;
  latitude: number;
  longitude: number;
  estimatedDeliveryDate: string;
  status: string;
  lastUpdated: string;
  deliveryNotes?: string;
}

export interface TrackingHistory {
  _id: string;
  parcelId: string;
  status: string;
  location: string;
  latitude?: number;
  longitude?: number;
  description?: string;
  updatedBy?: string;
  timestamp: string;
}

export interface Notification {
  _id: string;
  userId: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  parcelId?: string;
  createdAt: string;
}

export interface AuditLog {
  _id: string;
  actor?: string;
  actorName?: string;
  action: string;
  entityType: string;
  entityId?: string;
  oldValue?: any;
  newValue?: any;
  timestamp: string;
}

export interface DashboardStats {
  totalParcels: number;
  booked: number;
  inTransit: number;
  outForDelivery: number;
  delivered: number;
  delayed: number;
  cancelled: number;
  totalCustomers: number;
  totalAgents: number;
  deliverySuccessRate: number;
  dailyShipments: Array<{ _id: string; count: number }>;
  statusDistribution: Array<{ status: string; count: number }>;
  recentParcels: Parcel[];
}
