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
  isFullTank?: boolean;
  isPaid?: boolean; // New field for payment status
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
  isSettled?: boolean; // Trạng thái hoàn ứng
  settlementDate?: string; // Ngày hoàn ứng
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

export interface SalaryRecord {
  id: string;
  transportDate: string; // NGÀY VC
  driverName: string; // TÀI XẾ
  cargoType: string; // LOẠI HÀNG
  pickupWarehouse: string; // KHO ĐÓNG NHẬP
  deliveryWarehouse: string; // ĐỊA ĐIỂM ĐÓNG NHẬP
  depotPickup: string; // DEPOT LẤY RỖNG/FULL
  depotReturn: string; // HẠ CONT/TRẢ RỖNG
  containerNo: string; // SỐ CONT/DO
  qtyPalletTon: number; // SL PALLET/TẤN
  qty20: number; // SL CONT20
  qty40: number; // SL CONT40
  outOfPocketLRHR: number; // CHI HỘ LR/HR
  outOfPocketSC: number; // CHI HỘ CƯỢC SC
  tripSalary: number; // LƯƠNG CHUYẾN
  handlingFee: number; // TIỀN LÀM HÀNG
}

export interface User {
  id: string;
  username: string;
  password?: string;
  fullName: string;
  role: UserRole;
}

export type UserRole = 'DRIVER' | 'ADMIN';
export type AdminTab = 'DASHBOARD' | 'APPROVE_FUEL' | 'APPROVE_ADVANCE' | 'SALARY' | 'ADVANCE_SETTINGS' | 'OPERATION' | 'REPORTS' | 'REPORTS_FUEL' | 'REPORTS_ADVANCE' | 'USERS' | 'FUEL_SETTINGS';