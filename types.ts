export enum RequestStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export interface FuelPrice {
  id: string;
  date: string; // YYYY-MM-DDTHH:mm
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
  endDate?: string;  // YYYY-MM-DD (Optional)
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

export type VehicleStatus = 'OPERATING' | 'INACTIVE';

export interface Vehicle {
  id: string;
  licensePlate: string;
  vehicleType: string; // Stores the name or ID
  inspectionDate: string; // Ngay dang kiem
  inspectionExpiryDate: string; // Ngay het han dang kiem
  status: VehicleStatus;
}

export type CargoType = 'CONT' | 'PALLET' | 'TRANSFER' | 'GLASS';

export interface SalaryRecord {
  id: string;
  transportDate: string; // Ngày VC
  driverName: string; // Tài xế
  cargoType: CargoType; // Loại hàng
  
  // Ref numbers
  refNumber: string; // Số CONT / DO

  // Quantities
  quantity20: number; // SL Cont 20
  quantity40: number; // SL Cont 40
  quantityOther: number; // SL Pallet / Tấn

  // Locations
  pickupWarehouse: string; // Kho Đóng
  deliveryWarehouse: string; // Kho Nhập
  
  // Optional locations (Only for CONT)
  depotLocation?: string; // Depot Lấy Rỗng/Full
  returnLocation?: string; // Hạ Cont/Trả Rỗng

  // Financials
  salary: number; // Lương
  handlingFee: number; // Làm hàng
  
  notes?: string; // Ghi chú
}

export type UserRole = 'DRIVER' | 'ADMIN';
// Removed VEHICLES tab, merged into OPERATION
export type AdminTab = 'DASHBOARD' | 'FUEL' | 'ADVANCES' | 'OPERATION' | 'REPORTS' | 'SALARY';