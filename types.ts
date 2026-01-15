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

export type CargoType = 'CONT' | 'PALLET' | 'TRANSFER' | 'GLASS';

export interface SalaryRecord {
  id: string;
  driverName: string;
  transportDate: string; // Ngày VC
  cargoType: CargoType; // Loại hàng
  
  // Locations
  pickupWarehouse: string; // Kho Đóng / Nhập
  pickupLocation: string; // Địa điểm Kho Đóng / Nhập
  depotLocation: string; // Depot Lấy rỗng / Full
  dropoffLocation: string; // Hạ Cont / Trả rỗng
  
  // Money
  tripSalary: number; // Lương chuyến
  handlingFee: number; // Tiền làm hàng
  
  // Dynamic Quantities
  quantityCont20?: number;
  quantityCont40?: number;
  quantityPallet?: number;
  quantityTons?: number; // Miểng chai (Tấn)
  
  notes?: string;
}

export type UserRole = 'DRIVER' | 'ADMIN';
// Added SALARY tab
export type AdminTab = 'DASHBOARD' | 'FUEL' | 'ADVANCES' | 'OPERATION' | 'VEHICLES' | 'SALARY' | 'REPORTS';