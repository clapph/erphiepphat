export enum RequestStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export interface FuelPrice {
  id: string;
  date: string; // YYYY-MM-DD
  pricePerLiter: number;
}

export interface GasStation {
  id: string;
  name: string;
  address: string;
}

export interface FuelRequest {
  id: string;
  driverName: string;
  licensePlate: string;
  requestDate: string; // YYYY-MM-DD
  status: RequestStatus;
  notes?: string;
  
  // Admin filled fields
  approvedAmount?: number;
  approvedLiters?: number;
  stationId?: string;
  approvalDate?: string;
  isFullTank?: boolean; // New field
}

export interface AdvanceType {
  id: string;
  name: string;
}

export interface AdvanceRequest {
  id: string;
  driverName: string;
  requestDate: string;
  amount: number;
  typeId: string;
  status: RequestStatus;
  notes?: string;
  approvalDate?: string;
}

export interface DriverAssignment {
  id: string;
  driverName: string;
  licensePlate: string;
  startDate: string; // YYYY-MM-DD
}

export interface Driver {
  id: string;
  fullName: string;
  phoneNumber: string;
  licenseNumber: string; // GPLX
  issueDate: string; // Ngay cap
  expiryDate: string; // Ngay het han
}

export interface VehicleType {
  id: string;
  name: string;
}

export interface Vehicle {
  id: string;
  licensePlate: string;
  vehicleType: string; // Stores the name or ID
  inspectionDate: string; // Ngay dang kiem
  inspectionExpiryDate: string; // Ngay het han dang kiem
}

export type UserRole = 'DRIVER' | 'ADMIN';
export type AdminTab = 'DASHBOARD' | 'FUEL' | 'ADVANCES' | 'OPERATION' | 'VEHICLES' | 'REPORTS';