
import React, { useState, useEffect, useMemo } from 'react';
import { 
  FuelRequest, 
  FuelPrice, 
  GasStation, 
  RequestStatus, 
  UserRole,
  DriverAssignment,
  Driver,
  Vehicle,
  AdminTab,
  VehicleType,
  AdvanceType,
  AdvanceRequest,
  VehicleStatus,
  User,
  SalaryRecord
} from './types';
import { 
  IconGasPump, 
  IconTrendingUp, 
  IconCheckCircle, 
  IconXCircle, 
  IconPlus, 
  IconUser, 
  IconTruck, 
  IconUsers, 
  IconHome, 
  IconEdit, 
  IconTrash, 
  IconAlert, 
  IconChartBar, 
  IconDocument, 
  IconCopy, 
  IconCheck, 
  IconWallet, 
  IconCurrency,
  IconSparkles,
  IconFunnel
} from './components/Icons';
// Import the AI analysis service
import { analyzeFuelData } from './services/geminiService';

// --- Custom Icons ---
const IconKey = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
  </svg>
);

const IconCalendar = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z" />
  </svg>
);

const IconCloudArrowUp = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
  </svg>
);

const IconArrowDownTray = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M7.5 12l4.5 4.5m0 0l4.5-4.5M12 3v13.5" />
  </svg>
);

const IconEye = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.43 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
  </svg>
);

// --- Constants & Mock Data ---
const BG_COLOR = '#f5f7fa'; 
const PRIMARY_BLUE = '#2c4aa0';

const MOCK_STATIONS: GasStation[] = [
  { id: '1', name: 'Petrolimex 01', address: '123 Lê Lợi, Q1' },
  { id: '2', name: 'Petrolimex 15', address: '456 Xa Lộ Hà Nội' },
  { id: '3', name: 'PVOIL Thủ Đức', address: '789 Nguyễn Văn Linh' },
];

const MOCK_PRICES: FuelPrice[] = [
  { id: 'p1', date: '2023-10-20T00:00', pricePerLiter: 23500 },
  { id: 'p2', date: '2023-10-10T08:00', pricePerLiter: 24100 },
  { id: 'p3', date: '2023-10-01T15:00', pricePerLiter: 23900 },
];

const MOCK_DRIVERS: Driver[] = [
  { id: 'd1', fullName: 'Nguyễn Văn A', phoneNumber: '0909123456', licenseNumber: '790123456789', issueDate: '2020-05-15', expiryDate: '2025-05-15' },
  { id: 'd2', fullName: 'Trần Văn B', phoneNumber: '0918123456', licenseNumber: '790987654321', issueDate: '2019-10-20', expiryDate: '2024-10-20' },
];

const MOCK_VEHICLE_TYPES: VehicleType[] = [
  { id: 'vt1', name: 'Xe Tải 5 Tấn' },
  { id: 'vt2', name: 'Xe Container' },
  { id: 'vt3', name: 'Xe Bán Tải' },
];

const MOCK_VEHICLES: Vehicle[] = [
  { id: 'v1', licensePlate: '51C-123.45', vehicleType: 'Xe Tải 5 Tấn', inspectionDate: '2023-01-10', inspectionExpiryDate: '2024-01-10', status: 'OPERATING' },
  { id: 'v2', licensePlate: '59D-987.65', vehicleType: 'Xe Container', inspectionDate: '2023-06-15', inspectionExpiryDate: '2024-06-15', status: 'OPERATING' },
];

const MOCK_ASSIGNMENTS: DriverAssignment[] = [
  { id: 'a1', driverName: 'Nguyễn Văn A', licensePlate: '51C-123.45', startDate: '2023-01-01' },
  { id: 'a2', driverName: 'Trần Văn B', licensePlate: '59D-987.65', startDate: '2023-01-01' },
];

const MOCK_REQUESTS: FuelRequest[] = [
  { id: 'r1', driverName: 'Nguyễn Văn A', licensePlate: '51C-123.45', requestDate: '2023-10-25', status: RequestStatus.APPROVED, approvedAmount: 1500000, approvedLiters: 63.8, stationId: '1', approvalDate: '2023-10-25', isFullTank: false, isPaid: false },
  { id: 'r2', driverName: 'Trần Văn B', licensePlate: '59D-987.65', requestDate: '2023-10-24', status: RequestStatus.APPROVED, approvedAmount: 1175000, approvedLiters: 50, stationId: '1', approvalDate: '2023-10-24', isFullTank: false, isPaid: true },
];

const MOCK_ADVANCE_TYPES: AdvanceType[] = [
    { id: 'at1', name: 'Chi phí đi đường' },
    { id: 'at2', name: 'Sửa chữa nhỏ' },
    { id: 'at3', name: 'Ăn uống' },
];

const MOCK_ADVANCE_REQUESTS: AdvanceRequest[] = [
    { id: 'ar1', driverName: 'Nguyễn Văn A', requestDate: '2023-10-26', amount: 500000, typeId: 'at1', status: RequestStatus.APPROVED, approvalDate: '2023-10-26', isSettled: false },
    { id: 'ar2', driverName: 'Trần Văn B', requestDate: '2023-10-20', amount: 200000, typeId: 'at3', status: RequestStatus.APPROVED, approvalDate: '2023-10-20', isSettled: true, settlementDate: '2023-10-25' },
];

const MOCK_USERS: User[] = [
  { id: 'u1', username: 'admin', password: '123', fullName: 'Quản trị viên HP', role: 'ADMIN' },
  { id: 'u2', username: 'driverA', password: '123', fullName: 'Nguyễn Văn A', role: 'DRIVER' },
];

const MOCK_SALARY_RECORDS: SalaryRecord[] = [
  {
    id: 's1',
    transportDate: '2023-10-25',
    driverName: 'Nguyễn Văn A',
    cargoType: 'Hàng Cont',
    pickupWarehouse: 'Kho Hiệp Phát',
    deliveryWarehouse: 'Cảng Cát Lái',
    depotPickup: 'Depot 6',
    depotReturn: 'Hạ bãi',
    containerNo: 'TCLU1234567',
    qtyPalletTon: 0,
    qty20: 1,
    qty40: 0,
    tripSalary: 850000,
    handlingFee: 100000
  },
  {
    id: 's2',
    transportDate: '2023-10-25',
    driverName: 'Nguyễn Văn A',
    cargoType: 'Hàng Cont',
    pickupWarehouse: 'Kho ICD',
    deliveryWarehouse: 'Kho HP',
    depotPickup: 'Depot 6',
    depotReturn: 'Hạ bãi',
    containerNo: 'TCLU8888888',
    qtyPalletTon: 0,
    qty20: 1,
    qty40: 0,
    tripSalary: 850000,
    handlingFee: 100000
  }
];

// --- Helper Functions ---
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('vi-VN');
};

const formatDateTime = (dateStr: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

const getPriceForTime = (targetTimeStr: string, prices: FuelPrice[]): number | null => {
  if (prices.length === 0) return null;
  const sortedPrices = [...prices].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const targetTimestamp = new Date(targetTimeStr).getTime();
  const applicablePrice = sortedPrices.find(p => new Date(p.date).getTime() <= targetTimestamp);
  return applicablePrice ? applicablePrice.pricePerLiter : sortedPrices[0].pricePerLiter;
};

const checkInspectionExpiry = (expiryDateStr: string): boolean => {
  if (!expiryDateStr) return false;
  const expiry = new Date(expiryDateStr).getTime();
  const now = new Date().getTime();
  const diffTime = expiry - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays <= 10;
};

const getAssignedVehicle = (driverName: string, date: string, assignments: DriverAssignment[]): string | null => {
  if (!driverName || !date || !assignments) return null;
  const targetTime = new Date(date).getTime();
  const applicableAssignments = assignments
    .filter(a => {
      const start = new Date(a.startDate).getTime();
      const end = a.endDate ? new Date(a.endDate).getTime() : Infinity;
      return a.driverName === driverName && targetTime >= start && targetTime <= end;
    })
    .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
  
  return applicableAssignments.length > 0 ? applicableAssignments[0].licensePlate : null;
};

// --- UI Components ---

const Button = ({ children, onClick, variant = 'primary', className = '', disabled = false, type = 'button' }: any) => {
  const baseStyle = "px-4 py-2 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 text-sm active:scale-[0.97]";
  const variants: any = {
    primary: `bg-[#2c4aa0] text-white hover:bg-[#1e3475] shadow-sm hover:shadow-md disabled:opacity-50`,
    secondary: `bg-white text-[#2c4aa0] border border-blue-200 hover:border-[#2c4aa0] hover:bg-blue-50`,
    danger: `bg-red-50 text-red-600 border border-red-100 hover:bg-red-600 hover:text-white`,
    ghost: `bg-transparent text-gray-500 hover:text-[#2c4aa0] hover:bg-gray-100`,
    success: `bg-green-600 text-white hover:bg-green-700 shadow-sm`
  };
  return (
    <button type={type} onClick={onClick} className={`${baseStyle} ${variants[variant]} ${className}`} disabled={disabled}>
      {children}
    </button>
  );
};

const Card = ({ children, className = '', onClick }: any) => (
  <div onClick={onClick} className={`bg-white rounded-2xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border border-white/40 p-6 ${className}`}>
    {children}
  </div>
);

const Badge = ({ status }: { status: RequestStatus }) => {
  const styles = {
    [RequestStatus.PENDING]: 'bg-amber-100 text-amber-700 border-amber-200',
    [RequestStatus.APPROVED]: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    [RequestStatus.REJECTED]: 'bg-rose-100 text-rose-700 border-rose-200',
  };
  const labels = {
    [RequestStatus.PENDING]: 'Chờ duyệt',
    [RequestStatus.APPROVED]: 'Đã duyệt',
    [RequestStatus.REJECTED]: 'Từ chối',
  };
  return (
    <span className={`px-3 py-1 rounded-full text-[11px] font-bold border ${styles[status]}`}>
      {labels[status]}
    </span>
  );
};

const VehicleStatusBadge = ({ status }: { status: VehicleStatus }) => {
  const styles = {
    'OPERATING': 'bg-emerald-100 text-emerald-700',
    'INACTIVE': 'bg-slate-100 text-slate-500',
  };
  const labels = {
    'OPERATING': 'Đang vận hành',
    'INACTIVE': 'Ngừng vận hành',
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${styles[status]}`}>
      {labels[status]}
    </span>
  );
};

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<AdminTab>('DASHBOARD');
  
  // Data State
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [requests, setRequests] = useState<FuelRequest[]>(MOCK_REQUESTS);
  const [prices, setPrices] = useState<FuelPrice[]>(MOCK_PRICES);
  const [stations, setStations] = useState<GasStation[]>(MOCK_STATIONS);
  const [assignments, setAssignments] = useState<DriverAssignment[]>(MOCK_ASSIGNMENTS);
  const [drivers, setDrivers] = useState<Driver[]>(MOCK_DRIVERS);
  const [vehicles, setVehicles] = useState<Vehicle[]>(MOCK_VEHICLES);
  const [vehicleTypes, setVehicleTypes] = useState<VehicleType[]>(MOCK_VEHICLE_TYPES);
  const [advanceTypes, setAdvanceTypes] = useState<AdvanceType[]>(MOCK_ADVANCE_TYPES);
  const [advanceRequests, setAdvanceRequests] = useState<AdvanceRequest[]>(MOCK_ADVANCE_REQUESTS);
  const [salaryRecords, setSalaryRecords] = useState<SalaryRecord[]>(MOCK_SALARY_RECORDS);
  
  // Salary Import Preview State
  const [previewSalaryRecords, setPreviewSalaryRecords] = useState<SalaryRecord[]>([]);
  const [isImportPreviewing, setIsImportPreviewing] = useState(false);

  // UI State
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [editingFuelPrice, setEditingFuelPrice] = useState<FuelPrice | null>(null);
  const [editingAssignment, setEditingAssignment] = useState<DriverAssignment | null>(null);
  const [editingStation, setEditingStation] = useState<GasStation | null>(null);
  const [editingAdvanceType, setEditingAdvanceType] = useState<AdvanceType | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<FuelRequest | null>(null);
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [copyMessage, setCopyMessage] = useState('');
  
  const [adminAmount, setAdminAmount] = useState<string>('');
  const [adminStation, setAdminStation] = useState<string>('');
  const [isAdminFullTank, setIsAdminFullTank] = useState(false);
  
  const [adminNewDriver, setAdminNewDriver] = useState('');
  const [adminNewDate, setAdminNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [adminNewAmount, setAdminNewAmount] = useState('');
  const [adminNewStation, setAdminNewStation] = useState('');
  const [adminNewNote, setAdminNewNote] = useState('');
  const [adminNewFullTank, setAdminNewFullTank] = useState(false);

  const [driverTab, setDriverTab] = useState<'FUEL' | 'ADVANCE' | 'REPORTS'>('FUEL');

  const [newRequestDate, setNewRequestDate] = useState(new Date().toISOString().split('T')[0]);
  const [newRequestNote, setNewRequestNote] = useState('');

  // Password State
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [userToChangePassword, setUserToChangePassword] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState('');

  // Advance state for admin
  const [adminAdvDriver, setAdminAdvDriver] = useState('');
  const [adminAdvDate, setAdminAdvDate] = useState(new Date().toISOString().split('T')[0]);
  const [adminAdvAmount, setAdminAdvAmount] = useState('');
  const [adminAdvType, setAdminAdvType] = useState('');
  const [adminAdvNote, setAdminAdvNote] = useState('');

  // Salary Management State
  const [salaryStartDate, setSalaryStartDate] = useState('');
  const [salaryEndDate, setSalaryEndDate] = useState('');
  const [salaryDriverFilter, setSalaryDriverFilter] = useState('');
  const [salaryCargoFilter, setSalaryCargoFilter] = useState('');
  const [showSalaryImport, setShowSalaryImport] = useState(false);
  const [importText, setImportText] = useState('');

  // Login State
  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginError, setLoginError] = useState('');

  // Report Filters
  const [reportStartDate, setReportStartDate] = useState('');
  const [reportEndDate, setReportEndDate] = useState('');
  const [reportPaymentStatus, setReportPaymentStatus] = useState<'ALL' | 'PAID' | 'UNPAID'>('ALL');
  const [reportAdvanceStatus, setReportAdvanceStatus] = useState<'ALL' | 'SETTLED' | 'UNSETTLED'>('ALL');
  const [reportSalaryDriver, setReportSalaryDriver] = useState('');
  const [reportSalaryCargo, setReportSalaryCargo] = useState('');

  // AI Analysis State
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Derived State
  const autoAssignedVehicle = useMemo(() => {
    return getAssignedVehicle(currentUser?.fullName || '', newRequestDate, assignments);
  }, [newRequestDate, assignments, currentUser]);

  const adminAutoVehicle = useMemo(() => {
    if (!adminNewDriver) return null;
    return getAssignedVehicle(adminNewDriver, adminNewDate, assignments);
  }, [adminNewDriver, adminNewDate, assignments]);

  // FIXED FILTER LOGIC FOR SALARY MANAGEMENT
  const filteredSalaries = useMemo(() => {
    return salaryRecords.filter(s => {
      // Date Filter
      const start = salaryStartDate || '0000-00-00';
      const end = salaryEndDate || '9999-99-99';
      const dateMatch = s.transportDate >= start && s.transportDate <= end;
      
      // Driver Filter
      const driverMatch = !salaryDriverFilter || s.driverName === salaryDriverFilter;
      
      // Cargo Type Filter (Safe check for null/undefined)
      const cargoText = s.cargoType || '';
      const cargoMatch = !salaryCargoFilter || cargoText.toLowerCase().includes(salaryCargoFilter.toLowerCase().trim());
      
      return driverMatch && cargoMatch && dateMatch;
    }).sort((a, b) => new Date(a.transportDate).getTime() - new Date(b.transportDate).getTime());
  }, [salaryRecords, salaryStartDate, salaryEndDate, salaryDriverFilter, salaryCargoFilter]);

  const clearSalaryFilters = () => {
    setSalaryStartDate('');
    setSalaryEndDate('');
    setSalaryDriverFilter('');
    setSalaryCargoFilter('');
  };

  // --- Auth Handlers ---
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = users.find(u => u.username === loginUser && u.password === loginPass);
    if (user) {
      setCurrentUser(user);
      setLoginError('');
      if (user.role === 'ADMIN') setActiveTab('DASHBOARD');
      else setDriverTab('FUEL');
    } else {
      setLoginError('Tài khoản hoặc mật khẩu không chính xác.');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setLoginUser('');
    setLoginPass('');
  };

  const handleUpdatePassword = () => {
    if (!userToChangePassword || !newPassword) return;
    setUsers(users.map(u => u.id === userToChangePassword.id ? { ...u, password: newPassword } : u));
    if (currentUser?.id === userToChangePassword.id) {
        setCurrentUser({ ...currentUser, password: newPassword });
    }
    setIsPasswordModalOpen(false);
    setUserToChangePassword(null);
    setNewPassword('');
    alert("Đã cập nhật mật khẩu thành công!");
  };

  // --- Trip Salary Actions ---
  const handlePreviewSalary = () => {
    if (!importText.trim()) return;
    const lines = importText.trim().split('\n');
    const newRecords: SalaryRecord[] = [];
    
    // Attempting to parse 13 Tab-Separated Values (copy-paste from Google Sheets)
    // Structure: 0:NGÀY VC | 1:TÀI XẾ | 2:LOẠI HÀNG | 3:KHO | 4:ĐỊA ĐIỂM | 5:DEPOT LẤY | 6:HẠ/TRẢ | 7:SỐ CONT | 8:SL PALLET | 9:C20 | 10:C40 | 11:LƯƠNG | 12:LÀM HÀNG
    lines.forEach(line => {
      const parts = line.split('\t');
      if (parts.length >= 13) {
        newRecords.push({
          id: Math.random().toString(36).substr(2, 9),
          transportDate: parts[0]?.trim(),
          driverName: parts[1]?.trim(),
          cargoType: parts[2]?.trim(),
          pickupWarehouse: parts[3]?.trim(),
          deliveryWarehouse: parts[4]?.trim(),
          depotPickup: parts[5]?.trim(),
          depotReturn: parts[6]?.trim(),
          containerNo: parts[7]?.trim(),
          qtyPalletTon: parseFloat(parts[8]?.replace(/,/g, '') || '0') || 0,
          qty20: parseInt(parts[9] || '0') || 0,
          qty40: parseInt(parts[10] || '0') || 0,
          tripSalary: parseFloat(parts[11]?.replace(/,/g, '') || '0') || 0,
          handlingFee: parseFloat(parts[12]?.replace(/,/g, '') || '0') || 0
        });
      }
    });

    if (newRecords.length > 0) {
      setPreviewSalaryRecords(newRecords);
      setIsImportPreviewing(true);
    } else {
      alert("Định dạng dữ liệu không hợp lệ. Vui lòng kiểm tra lại copy từ Google Sheets (Yêu cầu ít nhất 13 cột tab-separated).");
    }
  };

  const handleConfirmImportSalary = () => {
    if (previewSalaryRecords.length === 0) return;
    setSalaryRecords([...previewSalaryRecords, ...salaryRecords]);
    setImportText('');
    setPreviewSalaryRecords([]);
    setIsImportPreviewing(false);
    setShowSalaryImport(false);
    alert(`Đã import thành công ${previewSalaryRecords.length} chuyến hàng.`);
  };

  const handleDeleteSalary = (id: string) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa bản ghi lương chuyến này?")) {
      setSalaryRecords(salaryRecords.filter(s => s.id !== id));
    }
  };

  // --- CRUD Actions ---

  const handleSaveDriver = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const fullName = formData.get('fullName') as string;
    const phoneNumber = formData.get('phoneNumber') as string;
    const licenseNumber = formData.get('licenseNumber') as string;
    const issueDate = formData.get('issueDate') as string;
    const expiryDate = formData.get('expiryDate') as string;

    if (editingDriver) {
        setDrivers(drivers.map(d => d.id === editingDriver.id ? { ...editingDriver, fullName, phoneNumber, licenseNumber, issueDate, expiryDate } : d));
        setEditingDriver(null);
    } else {
        setDrivers([...drivers, { id: Math.random().toString(), fullName, phoneNumber, licenseNumber, issueDate, expiryDate }]);
    }
    (e.target as HTMLFormElement).reset();
  };

  const handleEditDriver = (driver: Driver) => setEditingDriver(driver);
  const handleDeleteDriver = (id: string) => {
      if (window.confirm("Bạn có chắc chắn muốn xóa tài xế này?")) setDrivers(drivers.filter(d => d.id !== id));
  };

  const handleSaveVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const licensePlate = formData.get('licensePlate') as string;
    const vehicleType = formData.get('vehicleType') as string;
    const inspectionExpiryDate = formData.get('inspectionExpiryDate') as string;

    if (editingVehicle) {
        setVehicles(vehicles.map(v => v.id === editingVehicle.id ? { ...editingVehicle, licensePlate: licensePlate.toUpperCase(), vehicleType, inspectionExpiryDate } : v));
        setEditingVehicle(null);
    } else {
        setVehicles([...vehicles, { id: Math.random().toString(), licensePlate: licensePlate.toUpperCase(), vehicleType, inspectionExpiryDate, status: 'OPERATING', inspectionDate: new Date().toISOString().split('T')[0] }]);
    }
    (e.target as HTMLFormElement).reset();
  };

  const handleEditVehicle = (vehicle: Vehicle) => setEditingVehicle(vehicle);
  const handleDeleteVehicle = (id: string) => {
      if (window.confirm("Bạn có chắc chắn muốn xóa xe này?")) setVehicles(vehicles.filter(v => v.id !== id));
  };

  const toggleVehicleStatus = (id: string) => {
    setVehicles(vehicles.map(v => v.id === id ? { ...v, status: v.status === 'OPERATING' ? 'INACTIVE' : 'OPERATING' } : v));
  };

  const handleSaveFuelPrice = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const date = formData.get('date') as string;
    const time = formData.get('time') as string;
    const price = formData.get('price') as string;
    
    if (date && time && price) {
      const fullDateTime = `${date}T${time}`;
      if (editingFuelPrice) {
          setPrices(prices.map(p => p.id === editingFuelPrice.id ? { ...p, date: fullDateTime, pricePerLiter: Number(price) } : p));
          setEditingFuelPrice(null);
      } else {
          setPrices([...prices, { id: Math.random().toString(), date: fullDateTime, pricePerLiter: Number(price) }]);
      }
      (e.target as HTMLFormElement).reset();
    }
  };

  const handleDeletePrice = (id: string) => {
      if (window.confirm("Xóa mốc giá dầu này?")) setPrices(prices.filter(p => p.id !== id));
  };

  const handleSaveAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const driverName = formData.get('driverName') as string;
    const licensePlate = (formData.get('licensePlate') as string).toUpperCase();
    const startDate = formData.get('startDate') as string;
    const endDate = formData.get('endDate') as string;
    
    if (driverName && licensePlate && startDate) {
      if (editingAssignment) {
          setAssignments(assignments.map(a => a.id === editingAssignment.id ? { ...a, driverName, licensePlate, startDate, endDate: endDate || undefined } : a));
          setEditingAssignment(null);
      } else {
          setAssignments([...assignments, { id: Math.random().toString(), driverName, licensePlate, startDate, endDate: endDate || undefined }]);
      }
      (e.target as HTMLFormElement).reset();
    }
  };

  const handleEditAssignment = (a: DriverAssignment) => setEditingAssignment(a);
  const handleDeleteAssignment = (id: string) => {
      if (window.confirm("Xóa phân công này?")) setAssignments(assignments.filter(a => a.id !== id));
  };

  const handleSaveStation = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const name = formData.get('name') as string;
    const address = formData.get('address') as string;
    if (name) {
      if (editingStation) {
        setStations(stations.map(s => s.id === editingStation.id ? { ...s, name, address } : s));
        setEditingStation(null);
      } else {
        setStations([...stations, { id: Math.random().toString(), name, address }]);
      }
      (e.target as HTMLFormElement).reset();
    }
  };

  const handleDeleteStation = (id: string) => {
    if (window.confirm("Xóa cây xăng này?")) setStations(stations.filter(s => s.id !== id));
  };

  const handleSaveAdvanceType = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const name = formData.get('name') as string;
    if (name) {
      if (editingAdvanceType) {
        setAdvanceTypes(advanceTypes.map(t => t.id === editingAdvanceType.id ? { ...t, name } : t));
        setEditingAdvanceType(null);
      } else {
        setAdvanceTypes([...advanceTypes, { id: Math.random().toString(), name }]);
      }
      (e.target as HTMLFormElement).reset();
    }
  };

  const handleDeleteAdvanceType = (id: string) => {
    if (window.confirm("Xóa loại tạm ứng này?")) setAdvanceTypes(advanceTypes.filter(t => t.id !== id));
  };

  const handleDriverSubmit = () => {
    if (!autoAssignedVehicle) {
      alert('Bạn chưa được phân công xe cho ngày này. Vui lòng liên hệ Admin.');
      return;
    }
    const newReq: FuelRequest = {
      id: Math.random().toString(36).substr(2, 9),
      driverName: currentUser?.fullName || '',
      licensePlate: autoAssignedVehicle,
      requestDate: newRequestDate,
      status: RequestStatus.PENDING,
      notes: newRequestNote,
      isPaid: false
    };
    setRequests([newReq, ...requests]);
    const formattedMsg = `YÊU CẦU DUYỆT DẦU\nBiển số xe: ${newReq.licensePlate}\nNgày dự kiến: ${formatDate(newReq.requestDate)}\nTài xế: ${newReq.driverName}${newReq.notes ? `\nGhi chú: ${newReq.notes}` : ''}`;
    setCopyMessage(formattedMsg);
    setShowCopyModal(true);
    setNewRequestNote('');
  };

  const handleAdminCreateRequest = () => {
    if (!adminNewDriver || (!adminNewAmount && !adminNewFullTank) || !adminNewStation || !adminAutoVehicle) {
      alert("Vui lòng nhập đầy đủ thông tin.");
      return;
    }
    const now = new Date();
    const lookupTime = adminNewDate === now.toISOString().split('T')[0] ? now.toISOString() : `${adminNewDate}T23:59:59`;
    const price = getPriceForTime(lookupTime, prices);
    if (!price) { alert(`Thiếu giá dầu!`); return; }
    const finalAmount = adminNewFullTank ? 0 : (parseFloat(adminNewAmount) * 1000000);
    const liters = adminNewFullTank ? 0 : finalAmount / price;
    const newReq: FuelRequest = {
      id: Math.random().toString(36).substr(2, 9),
      driverName: adminNewDriver,
      licensePlate: adminAutoVehicle,
      requestDate: adminNewDate,
      status: RequestStatus.APPROVED,
      notes: adminNewNote,
      approvedAmount: finalAmount,
      approvedLiters: parseFloat(liters.toFixed(2)),
      stationId: adminNewStation,
      approvalDate: now.toISOString(),
      isFullTank: adminNewFullTank,
      isPaid: false
    };
    setRequests([newReq, ...requests]);
    setAdminNewDriver('');
    setAdminNewAmount('');
    setAdminNewNote('');
    setAdminNewFullTank(false);
    const amountText = adminNewFullTank ? "Đầy bình" : formatCurrency(finalAmount);
    setCopyMessage(`DUYỆT CẤP DẦU\nXe: ${newReq.licensePlate}\nNgày: ${formatDate(newReq.requestDate)}\nDuyệt: ${amountText}`);
    setShowCopyModal(true);
  };

  const handleApprove = () => {
    if (!selectedRequest || (!adminAmount && !isAdminFullTank) || !adminStation) return;
    const now = new Date();
    const price = getPriceForTime(now.toISOString(), prices);
    if (!price) { alert("Thiếu giá dầu!"); return; }
    const finalAmount = isAdminFullTank ? 0 : (parseFloat(adminAmount) * 1000000);
    const liters = isAdminFullTank ? 0 : finalAmount / price;
    const updatedReq: FuelRequest = {
      ...selectedRequest,
      status: RequestStatus.APPROVED,
      approvedAmount: finalAmount,
      approvedLiters: parseFloat(liters.toFixed(2)),
      stationId: adminStation,
      approvalDate: now.toISOString(),
      isFullTank: isAdminFullTank,
      isPaid: false
    };
    setRequests(requests.map(r => r.id === updatedReq.id ? updatedReq : r));
    setIsModalOpen(false);
    setSelectedRequest(null);
    const amountText = isAdminFullTank ? "Đầy bình" : formatCurrency(finalAmount);
    setCopyMessage(`DUYỆT CẤP DẦU\nXe: ${updatedReq.licensePlate}\nNgày: ${formatDate(updatedReq.requestDate)}\nDuyệt: ${amountText}`);
    setShowCopyModal(true);
  };

  const handleReject = () => {
    if (!selectedRequest) return;
    setRequests(requests.map(r => r.id === selectedRequest.id ? { ...r, status: RequestStatus.REJECTED } : r));
    setIsModalOpen(false);
    setSelectedRequest(null);
  };

  const handleMarkAsPaid = (id: string) => {
    if (window.confirm("Xác nhận đã thanh toán phiếu này cho cây xăng?")) {
      setRequests(requests.map(r => r.id === id ? { ...r, isPaid: true } : r));
    }
  };

  const handleMarkAdvanceSettled = (id: string) => {
    if (window.confirm("Xác nhận tài xế đã hoàn ứng cho phiếu này?")) {
      setAdvanceRequests(advanceRequests.map(r => r.id === id ? { ...r, isSettled: true, settlementDate: new Date().toISOString().split('T')[0] } : r));
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(copyMessage);
    setShowCopyModal(false);
  };

  const handleAdminCreateAdvance = () => {
    if (!adminAdvAmount || !adminAdvType || (!adminAdvDriver && currentUser?.role === 'ADMIN')) {
      alert("Vui lòng nhập đầy đủ thông tin tạm ứng.");
      return;
    }
    const newReq: AdvanceRequest = {
      id: Math.random().toString(36).substr(2, 9),
      driverName: currentUser?.role === 'ADMIN' ? adminAdvDriver : currentUser?.fullName || '',
      requestDate: adminAdvDate,
      amount: parseFloat(adminAdvAmount),
      typeId: adminAdvType,
      status: RequestStatus.APPROVED,
      notes: adminAdvNote,
      approvalDate: new Date().toISOString(),
      isSettled: false
    };
    setAdvanceRequests([newReq, ...advanceRequests]);
    setAdminAdvAmount('');
    setAdminAdvNote('');
    alert("Đã tạo và duyệt phiếu tạm ứng!");
  };

  // AI analysis handler
  const handleRunAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const result = await analyzeFuelData(requests, prices);
      setAiAnalysis(result);
    } catch (error) {
      console.error("Analysis failed", error);
      setAiAnalysis("Không thể thực hiện phân tích thông minh lúc này. Vui lòng thử lại sau.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // --- Views as internal functions ---

  const renderDashboard = () => (
    <div className="space-y-8 animate-fade-in">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="relative overflow-hidden group cursor-pointer hover:border-[#2c4aa0]/30 transition-all" onClick={() => setActiveTab('APPROVE_FUEL')}>
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-bl-full -mr-8 -mt-8 group-hover:bg-amber-500/20 transition-all duration-500"></div>
            <div className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-1">Cần xử lý</div>
            <div className="text-sm font-medium text-gray-400 mb-2">Dầu chờ duyệt</div>
            <div className="text-4xl font-black text-gray-800">{requests.filter(r=>r.status==='PENDING').length} <span className="text-sm font-normal text-gray-400">phiếu</span></div>
          </Card>
          <Card className="relative overflow-hidden group cursor-pointer hover:border-[#2c4aa0]/30 transition-all" onClick={() => setActiveTab('APPROVE_ADVANCE')}>
            <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/10 rounded-bl-full -mr-8 -mt-8 group-hover:bg-orange-500/20 transition-all duration-500"></div>
            <div className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-1">Tài chính</div>
            <div className="text-sm font-medium text-gray-400 mb-2">Tạm ứng chờ duyệt</div>
            <div className="text-4xl font-black text-gray-800">{advanceRequests.filter(r=>r.status==='PENDING').length} <span className="text-sm font-normal text-gray-400">yêu cầu</span></div>
          </Card>
          <Card className="relative overflow-hidden group border-l-4 border-[#2c4aa0] cursor-pointer hover:border-blue-200 transition-all" onClick={() => setActiveTab('SALARY')}>
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-bl-full -mr-8 -mt-8 group-hover:bg-blue-500/20 transition-all duration-500"></div>
            <div className="text-xs font-bold text-[#2c4aa0] uppercase tracking-widest mb-1">Doanh thu</div>
            <div className="text-sm font-medium text-gray-400 mb-2">Sản lượng kỳ này</div>
            <div className="text-4xl font-black text-gray-800">{salaryRecords.length} <span className="text-sm font-normal text-gray-400">chuyến</span></div>
          </Card>
        </div>

        {/* AI Analysis Section */}
        <Card className="border-t-4 border-[#2c4aa0] bg-blue-50/20">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <IconSparkles className="w-5 h-5 text-amber-500" /> Phân tích thông minh (AI Insights)
                </h3>
                <Button 
                  variant="primary" 
                  onClick={handleRunAnalysis} 
                  disabled={isAnalyzing}
                  className="text-xs py-1.5 px-4 rounded-xl"
                >
                  {isAnalyzing ? (
                    <>
                      <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Đang phân tích...
                    </>
                  ) : 'Cập nhật phân tích'}
                </Button>
            </div>
            {aiAnalysis ? (
                <div className="text-sm text-gray-700 leading-relaxed bg-white p-5 rounded-2xl border border-blue-100 shadow-sm animate-fade-in">
                    {aiAnalysis}
                </div>
            ) : (
                <div className="text-sm text-gray-400 italic text-center py-6 bg-white/50 rounded-2xl border border-dashed border-gray-200">
                    Nhấn "Cập nhật phân tích" để AI xem xét dữ liệu vận hành gần đây của bạn.
                </div>
            )}
        </Card>
    </div>
  );

  const renderApproveAdvance = () => (
    <div className="space-y-6 animate-fade-in">
      <Card className="border-[#2c4aa0] border-2">
          <h2 className="text-lg font-bold text-[#2c4aa0] mb-4 flex items-center gap-2">
              <IconPlus className="w-5 h-5" /> Tạo & Duyệt nhanh phiếu Tạm ứng
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                  <label className="text-xs font-semibold text-gray-600">Tài xế</label>
                  <select className="w-full p-2 text-sm border rounded" value={adminAdvDriver} onChange={e => setAdminAdvDriver(e.target.value)}>
                      <option value="">-- Chọn tài xế --</option>
                      {drivers.map(d => <option key={d.id} value={d.fullName}>{d.fullName}</option>)}
                  </select>
              </div>
              <div>
                  <label className="text-xs font-semibold text-gray-600">Ngày</label>
                  <input type="date" className="w-full p-2 text-sm border rounded" value={adminAdvDate} onChange={e => setAdminAdvDate(e.target.value)} />
              </div>
              <div>
                  <label className="text-xs font-semibold text-gray-600">Số tiền (VNĐ)</label>
                  <input 
                    type="number" 
                    className="w-full p-2 text-sm border rounded" 
                    value={adminAdvAmount} 
                    onChange={e => setAdminAdvAmount(e.target.value)} 
                  />
              </div>
              <div>
                  <label className="text-xs font-semibold text-gray-600">Loại chi</label>
                  <select className="w-full p-2 text-sm border rounded" value={adminAdvType} onChange={e => setAdminAdvType(e.target.value)}>
                      <option value="">-- Chọn loại --</option>
                      {advanceTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
              </div>
              <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-gray-600">Ghi chú</label>
                  <input type="text" className="w-full p-2 text-sm border rounded" value={adminAdvNote} onChange={e => setAdminAdvNote(e.target.value)} placeholder="Chi tiết..." />
              </div>
          </div>
          <Button className="w-full mt-4" onClick={handleAdminCreateAdvance}>Phê duyệt & Phát hành</Button>
      </Card>

      <Card>
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <IconCheckCircle className="w-6 h-6 text-[#2c4aa0]" /> Quản lý danh sách Tạm ứng
          </h2>
          <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600">
                  <thead className="bg-gray-50 text-gray-900 font-semibold border-b">
                      <tr>
                          <th className="p-3">Ngày</th>
                          <th className="p-3">Tài xế</th>
                          <th className="p-3">Số tiền</th>
                          <th className="p-3 text-center">Hoàn ứng</th>
                          <th className="p-3 text-center">Trạng thái</th>
                          <th className="p-3 text-center">Tác vụ</th>
                      </tr>
                  </thead>
                  <tbody>
                      {advanceRequests.sort((a,b) => new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime()).map(req => (
                          <tr key={req.id} className="border-b hover:bg-gray-50">
                              <td className="p-3">{formatDate(req.requestDate)}</td>
                              <td className="p-3 font-medium text-gray-800">{req.driverName}</td>
                              <td className="p-3 font-bold text-[#2c4aa0]">{formatCurrency(req.amount)}</td>
                              <td className="p-3 text-center">
                                {req.isSettled ? (
                                    <span className="text-emerald-600 font-bold text-xs bg-emerald-50 px-2 py-1 rounded-full">Đã hoàn ({formatDate(req.settlementDate!)})</span>
                                ) : req.status === RequestStatus.APPROVED ? (
                                    <button onClick={() => handleMarkAdvanceSettled(req.id)} className="text-[10px] bg-slate-100 hover:bg-emerald-100 hover:text-emerald-600 px-2 py-1 rounded font-black transition-colors uppercase">Xác nhận hoàn</button>
                                ) : '-'}
                              </td>
                              <td className="p-3 text-center"><Badge status={req.status} /></td>
                              <td className="p-3 text-center">
                                  <div className="flex justify-center gap-2">
                                    <button onClick={() => { if(window.confirm("Xóa phiếu tạm ứng này?")) setAdvanceRequests(advanceRequests.filter(x => x.id !== req.id)); }} className="text-gray-400 hover:text-red-500 p-1" title="Xóa">
                                        <IconTrash className="w-4 h-4" />
                                    </button>
                                  </div>
                              </td>
                          </tr>
                      ))}
                  </tbody>
              </table>
          </div>
      </Card>
    </div>
  );

  const renderAdvanceSettings = () => (
    <div className="space-y-6 animate-fade-in">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="lg:col-span-1 border-l-4 border-[#2c4aa0]">
                <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <IconPlus className="w-5 h-5 text-[#2c4aa0]" /> {editingAdvanceType ? 'Sửa loại chi phí' : 'Thêm loại chi phí'}
                </h2>
                <form onSubmit={handleSaveAdvanceType} className="space-y-4">
                    <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">Tên loại chi phí</label>
                        <input name="name" placeholder="VD: Chi phí sửa xe" required defaultValue={editingAdvanceType?.name} className="w-full p-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-100" />
                    </div>
                    <div className="flex gap-2">
                      {editingAdvanceType && <Button variant="ghost" onClick={() => setEditingAdvanceType(null)} className="flex-1">Hủy</Button>}
                      <Button type="submit" className="flex-1">{editingAdvanceType ? 'Cập nhật' : 'Thêm mới'}</Button>
                    </div>
                </form>
            </Card>

            <Card className="lg:col-span-2">
                <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <IconWallet className="w-6 h-6 text-[#2c4aa0]" /> Danh mục chi phí tạm ứng
                </h2>
                <div className="overflow-x-auto rounded-xl border border-gray-100">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="p-4">Tên loại chi phí</th>
                                <th className="p-4 text-right">Tác vụ</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {advanceTypes.map(t => (
                                <tr key={t.id} className="hover:bg-slate-50 group">
                                    <td className="p-4 font-semibold text-slate-700">{t.name}</td>
                                    <td className="p-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => setEditingAdvanceType(t)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-xl transition-all"><IconEdit className="w-4 h-4"/></button>
                                            <button onClick={() => handleDeleteAdvanceType(t.id)} className="p-2 text-rose-400 hover:bg-rose-50 rounded-xl transition-all"><IconTrash className="w-4 h-4"/></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {advanceTypes.length === 0 && (
                                <tr><td colSpan={2} className="p-8 text-center text-slate-400 italic">Chưa có loại chi phí nào</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    </div>
  );

  const renderSalaryManagement = () => {
    // Calculate Summary Stats for the filtered selection
    const totalSalaryInView = filteredSalaries.reduce((sum, s) => sum + s.tripSalary, 0);
    const totalHandlingInView = filteredSalaries.reduce((sum, s) => sum + s.handlingFee, 0);
    
    // NEW TRIP LOGIC: 1 Chuyến = Unique combo of Date + Cargo Type + Driver
    const totalTripsInView = useMemo(() => {
        const uniqueTrips = new Set(filteredSalaries.map(s => `${s.driverName}|${s.transportDate}|${s.cargoType}`));
        return uniqueTrips.size;
    }, [filteredSalaries]);

    return (
      <div className="space-y-6 animate-fade-in">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
              <div>
                  <h2 className="text-2xl font-black text-gray-800 flex items-center gap-3">
                      <IconCurrency className="w-8 h-8 text-[#2c4aa0]"/> Quản lý Lương chuyến
                  </h2>
                  <p className="text-sm text-gray-400 font-bold uppercase tracking-widest mt-1">Hệ thống hạch toán chi phí & doanh thu vận tải</p>
              </div>
              <div className="flex gap-3">
                  <Button variant="secondary" className="px-6 py-3 bg-slate-50 border-slate-200" onClick={() => {/* Future: Export CSV */}}>
                      <IconArrowDownTray className="w-5 h-5" /> Xuất Excel
                  </Button>
                  <Button variant="primary" className="px-6 py-3 shadow-lg shadow-blue-200" onClick={() => setShowSalaryImport(true)}>
                      <IconCloudArrowUp className="w-5 h-5" /> Import Dữ liệu
                  </Button>
              </div>
          </div>

          {/* Quick Stats Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-l-4 border-[#2c4aa0] py-4">
                  <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center">
                          <IconCurrency className="w-6 h-6 text-[#2c4aa0]" />
                      </div>
                      <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tổng lương chuyến</p>
                          <h4 className="text-xl font-black text-slate-800">{formatCurrency(totalSalaryInView)}</h4>
                      </div>
                  </div>
              </Card>
              <Card className="border-l-4 border-amber-400 py-4">
                  <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center">
                          <IconWallet className="w-6 h-6 text-amber-500" />
                      </div>
                      <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tổng phí làm hàng</p>
                          <h4 className="text-xl font-black text-slate-800">{formatCurrency(totalHandlingInView)}</h4>
                      </div>
                  </div>
              </Card>
              <Card className="border-l-4 border-emerald-500 py-4">
                  <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center">
                          <IconTruck className="w-6 h-6 text-emerald-600" />
                      </div>
                      <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Số chuyến hoàn thành</p>
                          <h4 className="text-xl font-black text-slate-800">{totalTripsInView} <span className="text-xs font-normal text-slate-400">chuyến</span></h4>
                      </div>
                  </div>
              </Card>
          </div>

          {/* Improved Filters Toolbar */}
          <Card className="p-4 border-none shadow-sm">
              <div className="flex flex-wrap items-end gap-4">
                  <div className="flex-1 min-w-[200px]">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block px-1">Tài xế</label>
                      <select 
                          value={salaryDriverFilter} 
                          onChange={e => setSalaryDriverFilter(e.target.value)} 
                          className="w-full p-2.5 border border-slate-100 bg-slate-50 rounded-2xl outline-none focus:ring-4 focus:ring-blue-50 focus:bg-white transition-all text-sm font-semibold text-slate-700"
                      >
                          <option value="">Tất cả tài xế</option>
                          {drivers.map(d => <option key={d.id} value={d.fullName}>{d.fullName}</option>)}
                      </select>
                  </div>
                  <div className="flex-1 min-w-[200px]">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block px-1">Tìm loại hàng</label>
                      <input 
                          value={salaryCargoFilter} 
                          onChange={e => setSalaryCargoFilter(e.target.value)} 
                          placeholder="VD: Cont, Pallet..." 
                          className="w-full p-2.5 border border-slate-100 bg-slate-50 rounded-2xl outline-none focus:ring-4 focus:ring-blue-50 focus:bg-white transition-all text-sm font-semibold" 
                      />
                  </div>
                  <div className="w-40">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block px-1">Từ ngày</label>
                      <input 
                          type="date" 
                          value={salaryStartDate} 
                          onChange={e => setSalaryStartDate(e.target.value)} 
                          className="w-full p-2.5 border border-slate-100 bg-slate-50 rounded-2xl outline-none focus:ring-4 focus:ring-blue-50 text-xs font-bold" 
                      />
                  </div>
                  <div className="w-40">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block px-1">Đến ngày</label>
                      <input 
                          type="date" 
                          value={salaryEndDate} 
                          onChange={e => setSalaryEndDate(e.target.value)} 
                          className="w-full p-2.5 border border-slate-100 bg-slate-50 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 text-xs font-bold" 
                      />
                  </div>
                  {(salaryStartDate || salaryEndDate || salaryDriverFilter || salaryCargoFilter) && (
                      <button onClick={clearSalaryFilters} className="h-[42px] px-4 text-xs font-black text-rose-500 hover:bg-rose-50 rounded-2xl transition-all uppercase tracking-tighter">
                          Xóa lọc
                      </button>
                  )}
              </div>
          </Card>

          {/* Main Table Content - Full 13 Columns */}
          <Card className="p-0 overflow-hidden border-none shadow-xl">
              <div className="overflow-x-auto max-h-[600px] scrollbar-thin scrollbar-thumb-slate-200">
                  <table className="w-full text-left text-[11px] border-collapse min-w-[1800px]">
                      <thead className="bg-[#2c4aa0] text-white font-bold uppercase tracking-tighter sticky top-0 z-10">
                          <tr>
                              <th className="p-4 border-r border-white/10">1. NGÀY VC</th>
                              <th className="p-4 border-r border-white/10">2. TÀI XẾ</th>
                              <th className="p-4 border-r border-white/10">3. LOẠI HÀNG</th>
                              <th className="p-4 border-r border-white/10">4. KHO ĐÓNG NHẬP</th>
                              <th className="p-4 border-r border-white/10">5. ĐỊA ĐIỂM ĐÓNG NHẬP</th>
                              <th className="p-4 border-r border-white/10">6. DEPOT LẤY RỖNG/FULL</th>
                              <th className="p-4 border-r border-white/10">7. HẠ CONT/TRẢ RỖNG</th>
                              <th className="p-4 border-r border-white/10">8. SỐ CONT/DO</th>
                              <th className="p-4 text-center border-r border-white/10">9. SL PALLET/TẤN</th>
                              <th className="p-4 text-center border-r border-white/10">10. SL CONT20</th>
                              <th className="p-4 text-center border-r border-white/10">11. SL CONT40</th>
                              <th className="p-4 text-right border-r border-white/10">12. LƯƠNG CHUYẾN</th>
                              <th className="p-4 text-right border-r border-white/10">13. TIỀN LÀM HÀNG</th>
                              <th className="p-4 text-center">TÁC VỤ</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                          {filteredSalaries.map(s => (
                              <tr key={s.id} className="hover:bg-blue-50 transition-colors group">
                                  <td className="p-4 font-medium text-slate-500 whitespace-nowrap">{s.transportDate}</td>
                                  <td className="p-4 font-black text-slate-800">{s.driverName}</td>
                                  <td className="p-4">
                                      <span className={`px-2 py-0.5 rounded font-black uppercase text-[9px] ${s.cargoType?.toLowerCase().includes('cont') ? 'bg-indigo-100 text-indigo-700' : 'bg-amber-100 text-amber-700'}`}>
                                          {s.cargoType}
                                      </span>
                                  </td>
                                  <td className="p-4 text-slate-600 truncate max-w-[150px]">{s.pickupWarehouse}</td>
                                  <td className="p-4 text-slate-600 truncate max-w-[150px]">{s.deliveryWarehouse}</td>
                                  <td className="p-4 text-slate-400 italic">{s.depotPickup || '-'}</td>
                                  <td className="p-4 text-slate-400 italic">{s.depotReturn || '-'}</td>
                                  <td className="p-4 font-mono font-bold text-gray-700">{s.containerNo}</td>
                                  <td className="p-4 text-center font-bold text-slate-500">{s.qtyPalletTon || 0}</td>
                                  <td className="p-4 text-center font-black text-slate-700">{s.qty20 || 0}</td>
                                  <td className="p-4 text-center font-black text-slate-700">{s.qty40 || 0}</td>
                                  <td className="p-4 text-right font-black text-[#2c4aa0]">{formatCurrency(s.tripSalary)}</td>
                                  <td className="p-4 text-right font-black text-amber-600">{formatCurrency(s.handlingFee)}</td>
                                  <td className="p-4 text-center">
                                      <button 
                                          onClick={() => handleDeleteSalary(s.id)}
                                          className="p-2 text-rose-300 hover:bg-rose-50 hover:text-rose-500 rounded-xl transition-all"
                                      >
                                          <IconTrash className="w-4 h-4" />
                                      </button>
                                  </td>
                              </tr>
                          ))}
                          {filteredSalaries.length === 0 && (
                              <tr>
                                  <td colSpan={14} className="p-16 text-center">
                                      <div className="flex flex-col items-center gap-3 opacity-30">
                                          <IconDocument className="w-12 h-12" />
                                          <p className="font-bold uppercase tracking-widest text-sm italic">Không tìm thấy dữ liệu lương chuyến</p>
                                      </div>
                                  </td>
                              </tr>
                          )}
                      </tbody>
                      {filteredSalaries.length > 0 && (
                          <tfoot className="bg-slate-50 border-t-2 border-slate-200 sticky bottom-0 z-10">
                              <tr className="font-black text-slate-800 text-[12px]">
                                  <td colSpan={11} className="p-5 text-right uppercase tracking-widest text-slate-400">Tổng hạch toán kỳ này:</td>
                                  <td className="p-5 text-right text-[#2c4aa0] bg-blue-50/50 text-sm">{formatCurrency(totalSalaryInView)}</td>
                                  <td className="p-5 text-right text-amber-600 bg-amber-50/50 text-sm">{formatCurrency(totalHandlingInView)}</td>
                                  <td className="bg-slate-900 text-white text-center text-[10px] p-5">HP ERP</td>
                              </tr>
                          </tfoot>
                      )}
                  </table>
              </div>
          </Card>

          {/* Import Modal with Preview Feature */}
          {showSalaryImport && (
              <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in overflow-y-auto">
                  <Card className={`w-full p-8 space-y-6 shadow-2xl scale-in border-none overflow-hidden relative transition-all duration-500 ${isImportPreviewing ? 'max-w-6xl' : 'max-w-2xl'}`}>
                      <div className="absolute top-0 left-0 w-full h-1.5 bg-[#2c4aa0]"></div>
                      <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                          <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                              <IconCloudArrowUp className="w-6 h-6 text-[#2c4aa0]"/> 
                              {isImportPreviewing ? 'Xem trước dữ liệu Import' : 'Import Lương chuyến'}
                          </h3>
                          <button onClick={() => { setShowSalaryImport(false); setIsImportPreviewing(false); setPreviewSalaryRecords([]); }} className="p-2 hover:bg-rose-50 rounded-full transition-colors group">
                              <IconXCircle className="w-6 h-6 text-slate-300 group-hover:text-rose-500"/>
                          </button>
                      </div>

                      {!isImportPreviewing ? (
                        <div className="space-y-4">
                            <div className="p-5 bg-blue-50 rounded-2xl border border-blue-100 flex gap-4">
                                <IconAlert className="w-10 h-10 text-[#2c4aa0] shrink-0" />
                                <div className="text-[11px] text-blue-700 leading-relaxed font-bold">
                                    Hệ thống hỗ trợ copy dữ liệu trực tiếp từ Google Sheets. 
                                    <br/><span className="text-[#2c4aa0] underline uppercase">Yêu cầu 13 cột chuẩn:</span> 
                                    <ol className="list-decimal ml-4 mt-2 grid grid-cols-2 gap-x-4">
                                        <li>Ngày VC</li><li>Tài xế</li><li>Loại hàng</li><li>Kho đóng nhập</li>
                                        <li>Địa điểm đóng</li><li>Depot lấy</li><li>Hạ cont/Trả rỗng</li><li>Số Cont/DO</li>
                                        <li>SL Pallet/Tấn</li><li>Số lượng 20</li><li>Số lượng 40</li><li>Lương chuyến</li>
                                        <li>Tiền làm hàng</li>
                                    </ol>
                                </div>
                            </div>
                            <textarea 
                                value={importText}
                                onChange={e => setImportText(e.target.value)}
                                placeholder="Dán nội dung 13 cột (Tab-separated) từ Google Sheets tại đây..."
                                className="w-full h-48 p-5 border border-slate-200 rounded-3xl outline-none focus:ring-4 focus:ring-blue-100 font-mono text-[10px] bg-slate-50/50"
                            />
                            <div className="flex gap-4 pt-4">
                                <Button variant="ghost" className="flex-1 py-4 text-slate-400 font-black uppercase tracking-widest" onClick={() => { setShowSalaryImport(false); setImportText(''); }}>Hủy bỏ</Button>
                                <Button className="flex-[2] py-4 text-base font-black uppercase tracking-widest shadow-xl shadow-blue-200" onClick={handlePreviewSalary} disabled={!importText.trim()}>
                                    <IconEye className="w-5 h-5" /> Xem trước dữ liệu
                                </Button>
                            </div>
                        </div>
                      ) : (
                        <div className="space-y-6">
                            <div className="overflow-x-auto max-h-[400px] border rounded-2xl">
                                <table className="w-full text-[10px] text-left border-collapse min-w-[1500px]">
                                    <thead className="bg-slate-100 font-black uppercase sticky top-0">
                                        <tr>
                                            <th className="p-2 border">Ngày VC</th>
                                            <th className="p-2 border">Tài xế</th>
                                            <th className="p-2 border">Loại hàng</th>
                                            <th className="p-2 border">Kho</th>
                                            <th className="p-2 border">Địa điểm</th>
                                            <th className="p-2 border">Depot Lấy</th>
                                            <th className="p-2 border">Hạ/Trả</th>
                                            <th className="p-2 border">Số Cont</th>
                                            <th className="p-2 border">Pallet/Tấn</th>
                                            <th className="p-2 border">C20</th>
                                            <th className="p-2 border">C40</th>
                                            <th className="p-2 border text-right">Lương</th>
                                            <th className="p-2 border text-right">Làm hàng</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y bg-white">
                                        {previewSalaryRecords.map((r, i) => (
                                            <tr key={i} className="hover:bg-blue-50">
                                                <td className="p-2 border">{r.transportDate}</td>
                                                <td className="p-2 border font-bold">{r.driverName}</td>
                                                <td className="p-2 border">{r.cargoType}</td>
                                                <td className="p-2 border truncate max-w-[100px]">{r.pickupWarehouse}</td>
                                                <td className="p-2 border truncate max-w-[100px]">{r.deliveryWarehouse}</td>
                                                <td className="p-2 border italic text-slate-400">{r.depotPickup}</td>
                                                <td className="p-2 border italic text-slate-400">{r.depotReturn}</td>
                                                <td className="p-2 border font-mono">{r.containerNo}</td>
                                                <td className="p-2 border text-center">{r.qtyPalletTon}</td>
                                                <td className="p-2 border text-center font-bold">{r.qty20}</td>
                                                <td className="p-2 border text-center font-bold">{r.qty40}</td>
                                                <td className="p-2 border text-right font-bold text-[#2c4aa0]">{formatCurrency(r.tripSalary)}</td>
                                                <td className="p-2 border text-right font-bold text-amber-600">{formatCurrency(r.handlingFee)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl">
                                <div className="text-sm font-black text-slate-700 uppercase tracking-widest">
                                    Tổng cộng: <span className="text-[#2c4aa0]">{previewSalaryRecords.length} chuyến hàng</span>
                                </div>
                                <div className="flex gap-3">
                                    <Button variant="ghost" className="px-6" onClick={() => setIsImportPreviewing(false)}>
                                        Quay lại sửa
                                    </Button>
                                    <Button className="px-8 shadow-lg shadow-blue-200" onClick={handleConfirmImportSalary}>
                                        <IconCheck className="w-5 h-5" /> Xác nhận Import vào hệ thống
                                    </Button>
                                </div>
                            </div>
                        </div>
                      )}
                  </Card>
              </div>
          )}
      </div>
    );
  };

  const renderOperationManagement = () => (
    <div className="space-y-12 animate-fade-in">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
                <h3 className="text-lg font-bold text-[#2c4aa0] mb-6 flex items-center gap-2 border-b border-gray-100 pb-3"><IconUsers className="w-5 h-5" /> Nhân sự Tài xế</h3>
                <div className="space-y-6">
                    <form onSubmit={handleSaveDriver} className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                        <div className="md:col-span-2">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">Họ và tên</label>
                          <input name="fullName" placeholder="VD: Nguyễn Văn A" required defaultValue={editingDriver?.fullName} className="w-full p-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2c4aa0]/20 outline-none" />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">Số điện thoại</label>
                          <input name="phoneNumber" placeholder="09xxxxxxx" defaultValue={editingDriver?.phoneNumber} className="w-full p-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2c4aa0]/20 outline-none" />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">Hết hạn GPLX</label>
                          <input name="expiryDate" type="date" required defaultValue={editingDriver?.expiryDate} className="w-full p-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2c4aa0]/20 outline-none" />
                        </div>
                        <div className="md:col-span-2 flex gap-2 pt-2">
                            {editingDriver && <Button variant="ghost" onClick={() => setEditingDriver(null)} className="flex-1 text-xs">Hủy</Button>}
                            <Button type="submit" variant="primary" className="flex-1 text-xs">{editingDriver ? 'Cập nhật' : 'Thêm tài xế'}</Button>
                        </div>
                    </form>
                    <div className="max-h-[300px] overflow-auto rounded-xl border border-gray-100">
                        <table className="w-full text-xs text-left">
                          <thead className="bg-gray-50 text-gray-400 font-bold uppercase tracking-wider"><tr className="border-b"><th className="p-3">Họ tên</th><th className="p-3 text-right">Thao tác</th></tr></thead>
                          <tbody className="divide-y divide-gray-50">{drivers.map(d => (<tr key={d.id} className="hover:bg-gray-50"><td className="p-3 font-semibold text-gray-700">{d.fullName}</td><td className="p-3 flex justify-end gap-2"><button onClick={() => handleEditDriver(d)} className="p-1 text-blue-500 hover:bg-blue-50 rounded"><IconEdit className="w-4 h-4" /></button><button onClick={() => handleDeleteDriver(d.id)} className="p-1 text-red-400 hover:bg-red-100 rounded"><IconTrash className="w-4 h-4" /></button></td></tr>))}</tbody>
                        </table>
                    </div>
                </div>
            </Card>

            <Card>
                <h3 className="text-lg font-bold text-[#2c4aa0] mb-6 flex items-center gap-2 border-b border-gray-100 pb-3"><IconTruck className="w-5 h-5" /> Quản lý Xe</h3>
                <div className="space-y-6">
                    <form onSubmit={handleSaveVehicle} className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                        <div>
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">Biển số</label>
                          <input name="licensePlate" placeholder="VD: 51C-xxx.xx" required defaultValue={editingVehicle?.licensePlate} className="w-full p-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2c4aa0]/20 outline-none uppercase" />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">Loại xe</label>
                          <select name="vehicleType" required defaultValue={editingVehicle?.vehicleType} className="w-full p-2 text-sm border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-[#2c4aa0]/20 outline-none">{vehicleTypes.map(vt => <option key={vt.id} value={vt.name}>{vt.name}</option>)}</select>
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">Hạn đăng kiểm</label>
                          <input name="inspectionExpiryDate" type="date" required defaultValue={editingVehicle?.inspectionExpiryDate} className="w-full p-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2c4aa0]/20 outline-none" />
                        </div>
                        <div className="flex items-end">
                            <Button type="submit" variant="primary" className="w-full text-xs h-[38px]">{editingVehicle ? 'Cập nhật' : 'Thêm xe'}</Button>
                        </div>
                    </form>
                    <div className="max-h-[300px] overflow-auto rounded-xl border border-gray-100">
                        <table className="w-full text-xs text-left">
                          <thead className="bg-gray-50 text-gray-400 font-bold uppercase tracking-wider"><tr className="border-b border-gray-100"><th className="p-3">Biển số</th><th className="p-3">Trạng thái</th><th className="p-3 text-right">Tác vụ</th></tr></thead>
                          <tbody className="divide-y divide-gray-50">{vehicles.map(v => {
                            const isNearExpiry = checkInspectionExpiry(v.inspectionExpiryDate);
                            return (
                              <tr key={v.id} className="hover:bg-gray-50">
                                <td className="p-3">
                                  <div className="font-bold text-gray-800">{v.licensePlate}</div>
                                  <div className={`text-[10px] ${isNearExpiry ? 'text-red-500 font-bold' : 'text-gray-400'}`}>ĐK: {formatDate(v.inspectionExpiryDate)}</div>
                                </td>
                                <td className="p-3"><VehicleStatusBadge status={v.status} /></td>
                                <td className="p-3 flex justify-end gap-2">
                                  <button onClick={() => toggleVehicleStatus(v.id)} className="p-1 text-emerald-500 hover:bg-emerald-50 rounded" title="Đổi trạng thái"><IconCheckCircle className="w-4 h-4" /></button>
                                  <button onClick={() => handleEditVehicle(v)} className="p-1 text-blue-500 hover:bg-blue-50 rounded"><IconEdit className="w-4 h-4" /></button>
                                  <button onClick={() => handleDeleteVehicle(v.id)} className="p-1 text-rose-400 hover:bg-rose-100 rounded"><IconTrash className="w-4 h-4" /></button>
                                </td>
                              </tr>
                            )})}
                          </tbody>
                        </table>
                    </div>
                </div>
            </Card>
        </div>

        <Card className="border-t-4 border-[#2c4aa0]">
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2"><IconCalendar className="w-6 h-6 text-[#2c4aa0]"/> Quản lý vận hành xe (Phân công)</h3>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-4">
                    <form onSubmit={handleSaveAssignment} className="space-y-4 bg-gray-50 p-5 rounded-2xl border border-gray-100">
                        <h4 className="text-sm font-bold text-[#2c4aa0] uppercase tracking-wider mb-2">{editingAssignment ? 'Sửa phân công' : 'Phân công mới'}</h4>
                        <div>
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">Chọn Tài xế</label>
                          <select name="driverName" required defaultValue={editingAssignment?.driverName} className="w-full p-2.5 text-sm border rounded-xl bg-white focus:ring-4 focus:ring-blue-100 outline-none">
                              <option value="">-- Tài xế --</option>
                              {drivers.map(d => <option key={d.id} value={d.fullName}>{d.fullName}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">Chọn Xe</label>
                          <select name="licensePlate" required defaultValue={editingAssignment?.licensePlate} className="w-full p-2.5 text-sm border rounded-xl bg-white focus:ring-4 focus:ring-blue-100 outline-none">
                              <option value="">-- Biển số --</option>
                              {vehicles.filter(v => v.status === 'OPERATING').map(v => <option key={v.id} value={v.licensePlate}>{v.licensePlate}</option>)}
                          </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">Từ ngày</label>
                                <input name="startDate" type="date" required defaultValue={editingAssignment?.startDate} className="w-full p-2.5 text-xs border rounded-xl focus:ring-4 focus:ring-blue-100 outline-none" />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">Đến ngày</label>
                                <input name="endDate" type="date" defaultValue={editingAssignment?.endDate} placeholder="Vô thời hạn" className="w-full p-2.5 text-xs border rounded-xl focus:ring-4 focus:ring-blue-100 outline-none" />
                                <span className="text-[9px] text-slate-400 mt-1 block">* Trống = Chạy vô thời hạn</span>
                            </div>
                        </div>
                        <div className="flex gap-2 pt-2">
                            {editingAssignment && <Button variant="ghost" onClick={() => setEditingAssignment(null)} className="flex-1">Hủy</Button>}
                            <Button type="submit" className="flex-[2]">{editingAssignment ? 'Cập nhật' : 'Xác nhận phân công'}</Button>
                        </div>
                    </form>
                </div>
                <div className="lg:col-span-2">
                    <div className="overflow-x-auto rounded-2xl border border-gray-100 shadow-sm">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px]">
                                <tr>
                                    <th className="p-4">Tài xế</th>
                                    <th className="p-4">Biển số</th>
                                    <th className="p-4">Thời gian vận hành</th>
                                    <th className="p-4 text-right">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {assignments.sort((a,b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()).map(a => (
                                    <tr key={a.id} className="hover:bg-blue-50/30 transition-colors">
                                        <td className="p-4 font-bold text-slate-700">{a.driverName}</td>
                                        <td className="p-4 font-mono font-bold text-[#2c4aa0]">{a.licensePlate}</td>
                                        <td className="p-4 text-xs">
                                            <div className="flex items-center gap-2">
                                                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-md font-bold">{formatDate(a.startDate)}</span>
                                                <span className="text-slate-300">→</span>
                                                {a.endDate ? (
                                                    <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md font-bold">{formatDate(a.endDate)}</span>
                                                ) : (
                                                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-md font-black uppercase tracking-tighter">Vô thời hạn</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => handleEditAssignment(a)} className="p-1.5 text-blue-500 hover:bg-blue-100 rounded-lg"><IconEdit className="w-4 h-4"/></button>
                                                <button onClick={() => handleDeleteAssignment(a.id)} className="p-1.5 text-rose-400 hover:bg-rose-100 rounded-lg"><IconTrash className="w-4 h-4"/></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {assignments.length === 0 && (
                                    <tr><td colSpan={4} className="p-12 text-center text-slate-400 italic font-medium">Chưa có lịch sử phân công vận hành nào</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </Card>
    </div>
  );

  const renderApproveFuel = () => (
    <div className="space-y-8 animate-fade-in">
        <Card className="border border-blue-100 bg-white shadow-xl overflow-hidden">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#2c4aa0] rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
                  <IconPlus className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-gray-800 tracking-tight">Tạo phiếu cấp dầu nhanh</h2>
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-widest">Hệ thống phê duyệt nhiên liệu ERP</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-1 mb-8">
                <div className="space-y-2 group">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2 px-1">
                    <IconUser className="w-3.5 h-3.5" /> Tài xế & Nhân sự
                  </label>
                  <select 
                    className="w-full p-3.5 text-sm border border-slate-200 rounded-2xl bg-slate-50/50 outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all font-semibold text-slate-700 cursor-pointer"
                    value={adminNewDriver} 
                    onChange={e => setAdminNewDriver(e.target.value)}
                  >
                    <option value="">Chọn người lái xe</option>
                    {drivers.map(d => <option key={d.id} value={d.fullName}>{d.fullName}</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2 px-1">
                    <IconHome className="w-3.5 h-3.5" /> Ngày hạch toán
                  </label>
                  <input 
                    type="date" 
                    className="w-full p-3.5 text-sm border border-slate-200 rounded-2xl bg-slate-50/50 outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all font-semibold text-slate-700"
                    value={adminNewDate} 
                    onChange={e => setAdminNewDate(e.target.value)} 
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2 px-1">
                    <IconGasPump className="w-3.5 h-3.5" /> Trạm xăng dầu
                  </label>
                  <select 
                    className="w-full p-3.5 text-sm border border-slate-200 rounded-2xl bg-slate-50/50 outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all font-semibold text-slate-700 cursor-pointer"
                    value={adminNewStation} 
                    onChange={e => setAdminNewStation(e.target.value)}
                  >
                    <option value="">Chọn đối tác cung ứng</option>
                    {stations.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
            </div>

            <div className="space-y-4 mb-8">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2 px-1">
                <IconCurrency className="w-3.5 h-3.5" /> Định mức cấp (Chọn phương thức)
              </label>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Option 1: Amount */}
                <div 
                  onClick={() => setIsAdminFullTank(false)}
                  className={`relative p-5 rounded-3xl border-2 transition-all cursor-pointer group ${!isAdminFullTank ? 'border-[#2c4aa0] bg-blue-50/30' : 'border-slate-100 bg-slate-50/50 hover:border-slate-200'}`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${!isAdminFullTank ? 'bg-[#2c4aa0] text-white' : 'bg-slate-200 text-slate-500'}`}>
                        <IconCurrency className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-sm font-black text-slate-800">Cấp theo số tiền</span>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Nhập giá trị triệu VNĐ</p>
                      </div>
                    </div>
                    {!isAdminFullTank && <IconCheckCircle className="w-6 h-6 text-[#2c4aa0]" />}
                  </div>
                  
                  {!isAdminFullTank && (
                    <div className="animate-fade-in">
                      <div className="relative">
                        <input 
                          type="number" 
                          step="0.1" 
                          placeholder="0.0" 
                          className="w-full bg-white p-4 pr-12 text-2xl font-black text-[#2c4aa0] border border-blue-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 transition-all placeholder:text-blue-100" 
                          value={adminNewAmount} 
                          onChange={e => setAdminNewAmount(e.target.value)} 
                          autoFocus
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 font-black text-blue-300 text-sm">Triệu VNĐ</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Option 2: Full Tank */}
                <div 
                  onClick={() => setIsAdminFullTank(true)}
                  className={`relative p-5 rounded-3xl border-2 transition-all cursor-pointer group ${isAdminFullTank ? 'border-[#2c4aa0] bg-blue-50/30' : 'border-slate-100 bg-slate-50/50 hover:border-slate-200'}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isAdminFullTank ? 'bg-[#2c4aa0] text-white' : 'bg-slate-200 text-slate-500'}`}>
                        <IconGasPump className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-sm font-black text-slate-800">Cấp đầy bình</span>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Không giới hạn định mức</p>
                      </div>
                    </div>
                    {isAdminFullTank && <IconCheckCircle className="w-6 h-6 text-[#2c4aa0]" />}
                  </div>
                  {isAdminFullTank && (
                    <div className="mt-4 p-3 bg-white/60 rounded-xl border border-blue-100 animate-fade-in text-center">
                      <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Hệ thống sẽ ghi nhận: ĐẦY BÌNH</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {adminNewDriver && (
              <div className="flex flex-col md:flex-row gap-4 mb-10">
                <div className={`flex-1 p-5 rounded-3xl border flex items-start gap-4 transition-all duration-500 ${
                  adminAutoVehicle 
                  ? 'bg-emerald-50/80 border-emerald-100 text-emerald-900 shadow-sm' 
                  : 'bg-rose-50 border-rose-100 text-rose-900'
                }`}>
                  <div className={`p-2.5 rounded-2xl ${adminAutoVehicle ? 'bg-emerald-200/50 text-emerald-700' : 'bg-rose-200/50 text-rose-700'}`}>
                    {adminAutoVehicle ? <IconTruck className="w-6 h-6" /> : <IconAlert className="w-6 h-6" />}
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Xác minh vận hành</h4>
                    <p className="text-sm font-bold leading-tight">
                      {adminAutoVehicle 
                        ? `Nhận diện phương tiện: ${adminAutoVehicle}` 
                        : `Cảnh báo: Tài xế chưa được phân công xe vào ngày ${formatDate(adminNewDate)}`
                      }
                    </p>
                  </div>
                </div>

                <div className="flex-1 p-5 bg-slate-50 border border-slate-100 rounded-3xl flex items-start gap-4">
                  <div className="p-2.5 bg-slate-200/50 rounded-2xl text-slate-500">
                    <IconDocument className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Ghi chú nghiệp vụ</h4>
                    <input 
                      placeholder="Nhập ghi chú hoặc mã KM..." 
                      className="w-full bg-transparent text-sm font-bold text-slate-700 outline-none border-b border-transparent focus:border-slate-300 pb-1"
                      value={adminNewNote}
                      onChange={e => setAdminNewNote(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-4">
              <Button 
                variant="ghost" 
                className="px-8 py-4 text-xs uppercase font-black tracking-widest text-slate-400 hover:text-rose-50 hover:bg-rose-50 rounded-2xl"
                onClick={() => {
                  setAdminNewDriver(''); setAdminNewAmount(''); setAdminNewNote(''); setAdminNewFullTank(false);
                }}
              >
                Làm mới biểu mẫu
              </Button>
              <Button 
                className="flex-1 py-5 text-base font-black uppercase tracking-widest shadow-2xl shadow-blue-600/30 rounded-2xl bg-[#2c4aa0] hover:bg-blue-800 active:bg-blue-900 transition-all scale-hover" 
                onClick={handleAdminCreateRequest}
              >
                <IconCheckCircle className="w-6 h-6" /> Phê duyệt & Phát hành phiếu
              </Button>
            </div>
        </Card>

        <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2"><IconDocument className="w-5 h-5 text-gray-400" /> Nhật ký giao dịch dầu (Chưa thanh toán)</h2>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <table className="w-full text-left text-sm text-gray-600 border-collapse">
                <thead className="bg-gray-50/80 text-gray-400 font-bold uppercase tracking-wider text-[10px] border-b border-gray-100">
                  <tr><th className="p-4">Ngày giao dịch</th><th className="p-4">Tài xế / Biển số</th><th className="p-4 text-right">Giá trị duyệt</th><th className="p-4 text-center">Trạm</th><th className="p-4 text-center">Tác vụ</th></tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {requests.filter(r => r.status === RequestStatus.APPROVED && !r.isPaid).map(req => (
                    <tr key={req.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="p-4 whitespace-nowrap text-gray-500 font-medium">{formatDate(req.requestDate)}</td>
                      <td className="p-4">
                        <div className="font-bold text-gray-800">{req.driverName}</div>
                        <div className="font-mono text-[10px] text-blue-500 bg-blue-50 inline-block px-1.5 rounded">{req.licensePlate}</div>
                      </td>
                      <td className="p-4 text-right font-bold text-slate-700">
                        {req.isFullTank ? <span className="text-[#2c4aa0] bg-[#2c4aa0]/5 px-2 py-0.5 rounded">Đầy bình</span> : formatCurrency(req.approvedAmount || 0)}
                      </td>
                      <td className="p-4 text-center text-xs font-semibold">{stations.find(s => s.id === req.stationId)?.name || '-'}</td>
                      <td className="p-4 text-center">
                        <div className="flex justify-center gap-2">
                          <button onClick={() => handleMarkAsPaid(req.id)} className="p-1.5 text-emerald-500 hover:bg-emerald-50 rounded-lg transition-all" title="Đánh dấu đã thanh toán"><IconCheckCircle className="w-4 h-4"/></button>
                          <button onClick={() => {
                            setCopyMessage(`PHIEU CAP DAU\nXe: ${req.licensePlate}\nTai xe: ${req.driverName}\nNgay: ${formatDate(req.requestDate)}\nDuyet: ${req.isFullTank ? 'Đầy bình' : formatCurrency(req.approvedAmount || 0)}`);
                            setShowCopyModal(true);
                          }} className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all" title="Copy thông tin"><IconCopy className="w-4 h-4"/></button>
                          <button onClick={() => {if(window.confirm("Xóa giao dịch này khỏi nhật ký?")) setRequests(requests.filter(x=>x.id!==req.id));}} className="p-1.5 text-rose-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"><IconTrash className="w-4 h-4"/></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {requests.filter(r => r.status === RequestStatus.APPROVED && !r.isPaid).length === 0 && (
                    <tr><td colSpan={5} className="p-8 text-center text-slate-400 italic">Không có giao dịch dầu chưa thanh toán</td></tr>
                  )}
                </tbody>
              </table>
            </div>
        </div>
    </div>
  );

  const renderFuelSettings = () => (
    <div className="space-y-8 animate-fade-in">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="border-l-4 border-amber-400">
                <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2"><IconTrendingUp className="w-5 h-5 text-amber-500" /> Biến động giá dầu</h2>
                <form onSubmit={handleSaveFuelPrice} className="space-y-4 mb-6 bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                    <div className="grid grid-cols-2 gap-4 items-end">
                        <div className="col-span-1">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">Ngày & Giờ</label>
                          <div className="flex gap-2">
                            <input name="date" type="date" required className="w-full p-2 text-xs border border-gray-200 rounded-lg outline-none" />
                            <input name="time" type="time" required className="w-full p-2 text-xs border border-gray-200 rounded-lg outline-none" />
                          </div>
                        </div>
                        <div className="col-span-1">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">Giá (VNĐ/Lít)</label>
                          <input name="price" type="number" required placeholder="VD: 23500" className="w-full p-2 text-xs border border-gray-200 rounded-lg outline-none" />
                        </div>
                    </div>
                    <Button type="submit" variant="primary" className="w-full text-xs">Cập nhật bảng giá</Button>
                </form>
                <div className="max-h-48 overflow-auto space-y-2 rounded-xl">
                  {prices.sort((a,b)=>new Date(b.date).getTime()-new Date(a.date).getTime()).map(p => (
                    <div key={p.id} className="flex justify-between items-center text-xs p-3 bg-white border border-gray-100 rounded-xl hover:shadow-sm transition-all group">
                      <div className="text-gray-500 font-medium">{formatDateTime(p.date)}</div>
                      <div className="flex items-center gap-4">
                        <span className="font-bold text-[#2c4aa0] bg-blue-50 px-2 py-1 rounded-lg">{formatCurrency(p.pricePerLiter)}/L</span>
                        <button onClick={() => handleDeletePrice(p.id)} className="opacity-0 group-hover:opacity-100 p-1 text-rose-300 hover:text-rose-500 transition-all"><IconTrash className="w-3 h-3"/></button>
                      </div>
                    </div>
                  ))}
                </div>
            </Card>

            <Card className="border-l-4 border-[#2c4aa0]">
                <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2"><IconGasPump className="w-5 h-5 text-[#2c4aa0]" /> Hệ thống Cây xăng</h2>
                <form onSubmit={handleSaveStation} className="space-y-4 mb-6 bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">Tên trạm</label>
                      <input name="name" placeholder="VD: Petrolimex Số 1" required className="w-full p-2 text-xs border border-gray-200 rounded-lg outline-none" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">Địa chỉ</label>
                      <input name="address" placeholder="Quận/Huyện..." className="w-full p-2 text-xs border border-gray-200 rounded-lg outline-none" />
                    </div>
                  </div>
                  <Button type="submit" variant="primary" className="w-full text-xs">Thêm đối tác mới</Button>
                </form>
                <div className="max-h-48 overflow-auto space-y-2 rounded-xl">
                  {stations.map(s => (
                    <div key={s.id} className="flex justify-between items-center p-3 bg-white border border-gray-100 rounded-xl hover:shadow-sm transition-all group">
                      <div>
                        <div className="font-bold text-gray-700">{s.name}</div>
                        <div className="text-[10px] text-gray-400">{s.address || 'Chưa cập nhật địa chỉ'}</div>
                      </div>
                      <button onClick={() => handleDeleteStation(s.id)} className="opacity-0 group-hover:opacity-100 p-1 text-rose-300 hover:text-rose-500 transition-all"><IconTrash className="w-3 h-3"/></button>
                    </div>
                  ))}
                </div>
            </Card>
        </div>
    </div>
  );

  const renderReports = () => {
    // 1. Calculations and Data Aggregation
    const start = reportStartDate || '0000-00-00';
    const end = reportEndDate || '9999-99-99';

    // Filtered data based on date range
    const fAdvances = advanceRequests.filter(a => a.requestDate >= start && a.requestDate <= end && a.status === RequestStatus.APPROVED);
    const fFuel = requests.filter(r => r.requestDate >= start && r.requestDate <= end && r.status === RequestStatus.APPROVED);
    const fSalaries = salaryRecords.filter(s => s.transportDate >= start && s.transportDate <= end);

    // Total calculations
    const totalFuel = fFuel.reduce((s, r) => s + (r.approvedAmount || 0), 0);
    const totalUnsettledAdv = fAdvances.filter(a => !a.isSettled).reduce((s, a) => s + a.amount, 0);
    const totalSalary = fSalaries.reduce((s, r) => s + r.tripSalary, 0);
    const totalHandling = fSalaries.reduce((s, r) => s + r.handlingFee, 0);

    // Aggregate everything by Driver for the master table
    const byDriver: any = {};
    drivers.forEach(d => {
        byDriver[d.fullName] = { fuel: 0, unsettledAdv: 0, salary: 0, handling: 0, total: 0 };
    });

    fFuel.forEach(r => { if(byDriver[r.driverName]) byDriver[r.driverName].fuel += (r.approvedAmount || 0); });
    fAdvances.forEach(a => { if(!a.isSettled && byDriver[a.driverName]) byDriver[a.driverName].unsettledAdv += a.amount; });
    fSalaries.forEach(s => { 
        if(byDriver[s.driverName]) {
            byDriver[s.driverName].salary += s.tripSalary;
            byDriver[s.driverName].handling += s.handlingFee;
        }
    });
    
    Object.keys(byDriver).forEach(name => {
        byDriver[name].total = byDriver[name].fuel + byDriver[name].salary + byDriver[name].handling + byDriver[name].unsettledAdv;
    });

    const totalOverall = totalFuel + totalSalary + totalHandling + totalUnsettledAdv;

    return (
      <div className="space-y-8 animate-fade-in">
          {/* Dashboard Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                  <h2 className="text-2xl font-black text-gray-800 flex items-center gap-3">
                      <IconChartBar className="w-8 h-8 text-[#2c4aa0]"/> Báo cáo Tổng hợp (Full Insight)
                  </h2>
                  <p className="text-sm text-gray-400 font-bold uppercase tracking-widest mt-1">Toàn cảnh dữ liệu vận hành Hiệp Phát</p>
              </div>
              <div className="bg-white p-3 rounded-2xl border border-slate-200 flex flex-wrap gap-4 items-end shadow-sm">
                  <div className="flex flex-col">
                      <label className="text-[9px] font-black text-slate-400 uppercase mb-1">Từ ngày</label>
                      <input type="date" value={reportStartDate} onChange={e => setReportStartDate(e.target.value)} className="p-1.5 border rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-blue-100" />
                  </div>
                  <div className="flex flex-col">
                      <label className="text-[9px] font-black text-slate-400 uppercase mb-1">Đến ngày</label>
                      <input type="date" value={reportEndDate} onChange={e => setReportEndDate(e.target.value)} className="p-1.5 border rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-blue-100" />
                  </div>
                  <Button variant="ghost" className="text-[10px] h-8 font-black uppercase px-2" onClick={() => { setReportStartDate(''); setReportEndDate(''); }}>Xóa lọc</Button>
              </div>
          </div>

          {/* Master Breakdown Table */}
          <Card className="p-0 overflow-hidden border-none shadow-xl bg-white">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                      <IconUsers className="w-5 h-5 text-[#2c4aa0]"/> Chi tiết phân bổ theo tài xế
                  </h3>
                  <span className="text-[10px] font-black bg-blue-50 text-[#2c4aa0] px-3 py-1 rounded-full uppercase">Đơn vị: VNĐ</span>
              </div>
              <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse min-w-[1000px]">
                      <thead className="bg-slate-50 text-slate-400 font-black uppercase tracking-tighter text-[10px] border-b">
                          <tr>
                              <th className="p-4">Họ tên Tài xế</th>
                              <th className="p-4 text-right">Lương chuyến</th>
                              <th className="p-4 text-right">Làm hàng</th>
                              <th className="p-4 text-right">Nhiên liệu</th>
                              <th className="p-4 text-right text-rose-500">Nợ Tạm ứng</th>
                              <th className="p-4 text-right bg-slate-100 text-slate-800">Tổng hạch toán</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                          {Object.entries(byDriver).sort(([,a]:any,[,b]:any) => b.total - a.total).map(([name, data]: any) => (
                              <tr key={name} className="hover:bg-slate-50 transition-colors group">
                                  <td className="p-4">
                                      <div className="font-black text-slate-700">{name}</div>
                                  </td>
                                  <td className="p-4 text-right font-bold text-slate-500">{formatCurrency(data.salary)}</td>
                                  <td className="p-4 text-right font-bold text-emerald-600">{formatCurrency(data.handling)}</td>
                                  <td className="p-4 text-right font-bold text-amber-600">{formatCurrency(data.fuel)}</td>
                                  <td className="p-4 text-right font-black text-rose-400">{formatCurrency(data.unsettledAdv)}</td>
                                  <td className="p-4 text-right bg-slate-50/50 group-hover:bg-blue-50/50 transition-colors">
                                      <div className="font-black text-[#2c4aa0] text-sm">{formatCurrency(data.total)}</div>
                                      <div className="text-[9px] font-bold text-slate-300 mt-0.5">{(totalOverall > 0 ? (data.total/totalOverall)*100 : 0).toFixed(1)}% tỉ trọng</div>
                                  </td>
                              </tr>
                          ))}
                      </tbody>
                      <tfoot className="bg-slate-900 text-white">
                          <tr className="font-black">
                              <td className="p-4 uppercase tracking-widest text-[10px]">Tổng cộng toàn kỳ:</td>
                              <td className="p-4 text-right">{formatCurrency(totalSalary)}</td>
                              <td className="p-4 text-right">{formatCurrency(totalHandling)}</td>
                              <td className="p-4 text-right">{formatCurrency(totalFuel)}</td>
                              <td className="p-4 text-right text-rose-300">{formatCurrency(totalUnsettledAdv)}</td>
                              <td className="p-4 text-right bg-[#2c4aa0] text-xl">{formatCurrency(totalOverall)}</td>
                          </tr>
                      </tfoot>
                  </table>
              </div>
          </Card>
      </div>
    );
  };

  const renderFuelReports = () => {
    // Helper to filter data by date and payment status
    const filterFuelData = (req: FuelRequest) => {
      const dateMatch = (!reportStartDate || req.requestDate >= reportStartDate) && 
                        (!reportEndDate || req.requestDate <= reportEndDate);
      const paymentMatch = reportPaymentStatus === 'ALL' || 
                          (reportPaymentStatus === 'PAID' && req.isPaid) || 
                          (reportPaymentStatus === 'UNPAID' && !req.isPaid);
      return dateMatch && paymentMatch && req.status === RequestStatus.APPROVED;
    };

    const filteredFuel = requests.filter(filterFuelData);
    
    const fuelByVehicle = filteredFuel.reduce((acc: any, curr) => {
      if (!acc[curr.licensePlate]) acc[curr.licensePlate] = { amount: 0, liters: 0, count: 0, paid: 0, unpaid: 0 };
      acc[curr.licensePlate].amount += (curr.approvedAmount || 0);
      acc[curr.licensePlate].liters += (curr.approvedLiters || 0);
      acc[curr.licensePlate].count += 1;
      if (curr.isPaid) acc[curr.licensePlate].paid += (curr.approvedAmount || 0);
      else acc[curr.licensePlate].unpaid += (curr.approvedAmount || 0);
      return acc;
    }, {});

    const totalFuelAmount = filteredFuel.reduce((s, r) => s + (r.approvedAmount || 0), 0);
    const totalUnpaidFuel = filteredFuel.filter(r => !r.isPaid).reduce((s, r) => s + (r.approvedAmount || 0), 0);

    return (
      <div className="space-y-6 animate-fade-in">
          <Card className="border-t-4 border-[#2c4aa0]">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-gray-800"><IconGasPump className="w-6 h-6 text-[#2c4aa0]"/> Báo cáo Nhiên liệu & Công nợ</h2>
              
              <div className="bg-slate-100 p-6 rounded-3xl border border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div>
                    <div className="text-[10px] font-bold uppercase text-slate-500 mb-1 tracking-widest">Tổng tiền duyệt cấp</div>
                    <div className="text-3xl font-black text-slate-800">{formatCurrency(totalFuelAmount)}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase text-rose-500 mb-1 tracking-widest">Còn nợ cây xăng</div>
                    <div className="text-3xl font-black text-rose-600">{formatCurrency(totalUnpaidFuel)}</div>
                  </div>
              </div>

              <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-400 font-bold uppercase">
                    <tr><th className="p-4">Biển số</th><th className="p-4 text-center">Đã thanh toán</th><th className="p-4 text-right">Chưa thanh toán</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {Object.entries(fuelByVehicle).map(([plate, data]: any) => (
                      <tr key={plate} className="hover:bg-slate-50 transition-colors">
                        <td className="p-4 font-black text-slate-700">{plate}</td>
                        <td className="p-4 text-center font-bold text-emerald-600">{formatCurrency(data.paid)}</td>
                        <td className="p-4 text-right font-black text-rose-500">{formatCurrency(data.unpaid)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
          </Card>
      </div>
    );
  };

  const renderAdvanceReports = () => {
    const filterAdvanceData = (adv: AdvanceRequest) => {
      const dateMatch = (!reportStartDate || adv.requestDate >= reportStartDate) && 
                        (!reportEndDate || adv.requestDate <= reportEndDate);
      const statusMatch = reportAdvanceStatus === 'ALL' || 
                          (reportAdvanceStatus === 'SETTLED' && adv.isSettled) || 
                          (reportAdvanceStatus === 'UNSETTLED' && !adv.isSettled);
      return dateMatch && statusMatch && adv.status === RequestStatus.APPROVED;
    };

    const filteredAdvances = advanceRequests.filter(filterAdvanceData);
    const totalUnsettled = filteredAdvances.filter(a => !a.isSettled).reduce((s, a) => s + a.amount, 0);

    return (
      <div className="space-y-6 animate-fade-in">
          <Card className="border-t-4 border-amber-500">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-gray-800"><IconWallet className="w-6 h-6 text-amber-500"/> Báo cáo Tạm ứng nội bộ</h2>
              
              <div className="bg-amber-500 p-6 rounded-3xl border border-amber-600 mb-8">
                <div className="text-[11px] font-black uppercase text-white mb-1 tracking-widest">Dư nợ tạm ứng hiện tại</div>
                <div className="text-3xl font-black text-white">{formatCurrency(totalUnsettled)}</div>
              </div>

              <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-400 font-bold uppercase text-[10px]">
                    <tr><th className="p-4">Tài xế</th><th className="p-4 text-right">Đã hoàn</th><th className="p-4 text-right">Còn nợ</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {drivers.map(d => {
                      const dAdv = filteredAdvances.filter(a => a.driverName === d.fullName);
                      const settled = dAdv.filter(a => a.isSettled).reduce((s, a) => s + a.amount, 0);
                      const unsettled = dAdv.filter(a => !a.isSettled).reduce((s, a) => s + a.amount, 0);
                      if (settled === 0 && unsettled === 0) return null;
                      return (
                        <tr key={d.id} className="hover:bg-slate-50 transition-colors">
                          <td className="p-4 font-black text-slate-700">{d.fullName}</td>
                          <td className="p-4 text-right font-bold text-emerald-600">{formatCurrency(settled)}</td>
                          <td className="p-4 text-right font-black text-rose-500">{formatCurrency(unsettled)}</td>
                        </tr>
                      )})}
                  </tbody>
                </table>
              </div>
          </Card>
      </div>
    );
  };

  const renderSalaryReports = () => {
    const start = reportStartDate || '0000-00-00';
    const end = reportEndDate || '9999-99-99';
    
    // Applying enhanced report filters
    const filteredRecords = salaryRecords.filter(s => {
      const dateMatch = s.transportDate >= start && s.transportDate <= end;
      const driverMatch = !reportSalaryDriver || s.driverName === reportSalaryDriver;
      const cargoMatch = !reportSalaryCargo || (s.cargoType || '').toLowerCase().includes(reportSalaryCargo.toLowerCase().trim());
      return dateMatch && driverMatch && cargoMatch;
    });
    
    const totalSalary = filteredRecords.reduce((sum, r) => sum + r.tripSalary, 0);
    const totalHandling = filteredRecords.reduce((sum, r) => sum + r.handlingFee, 0);
    const total20 = filteredRecords.reduce((sum, r) => sum + r.qty20, 0);
    const total40 = filteredRecords.reduce((sum, r) => sum + r.qty40, 0);

    // Aggregating by Cargo Type
    const statsByCargo = filteredRecords.reduce((acc: any, curr) => {
      const type = curr.cargoType || 'Khác';
      if (!acc[type]) acc[type] = { count: 0, salary: 0, handling: 0, c20: 0, c40: 0, pallet: 0, trips: new Set() };
      acc[type].salary += curr.tripSalary;
      acc[type].handling += curr.handlingFee;
      acc[type].c20 += curr.qty20;
      acc[type].c40 += curr.qty40;
      acc[type].pallet += (curr.qtyPalletTon || 0);
      acc[type].trips.add(`${curr.driverName}|${curr.transportDate}|${curr.cargoType}`);
      return acc;
    }, {});

    const cargoData = Object.entries(statsByCargo).map(([type, data]: any) => ({
      type,
      count: data.trips.size,
      salary: data.salary,
      handling: data.handling,
      c20: data.c20,
      c40: data.c40,
      pallet: data.pallet,
    })).sort((a, b) => (b.salary + b.handling) - (a.salary + a.handling));

    // Aggregating by Driver
    const statsByDriver = drivers.map(d => {
      const records = filteredRecords.filter(r => r.driverName === d.fullName);
      const uniqueTrips = new Set(records.map(r => `${r.transportDate}|${r.cargoType}`)).size;
      return {
        name: d.fullName,
        count: uniqueTrips,
        salary: records.reduce((sum, r) => sum + r.tripSalary, 0),
        handling: records.reduce((sum, r) => sum + r.handlingFee, 0),
      };
    }).filter(s => s.count > 0).sort((a, b) => (b.salary + b.handling) - (a.salary + a.handling));

    const totalTrips = cargoData.reduce((sum, s) => sum + s.count, 0);

    const renderVolume = (c: any) => {
      const typeLower = c.type.toLowerCase();
      
      // Mappings based on type name
      if (typeLower.includes('cont20') || typeLower.includes('cont 20')) {
        return <span className="px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded border border-blue-100 font-bold">{c.c20} x20'</span>;
      }
      if (typeLower.includes('cont40') || typeLower.includes('cont 40')) {
        return <span className="px-1.5 py-0.5 bg-indigo-50 text-indigo-600 rounded border border-indigo-100 font-bold">{c.c40} x40'</span>;
      }
      if (typeLower.includes('miểng chai')) {
        return <span className="px-1.5 py-0.5 bg-amber-50 text-amber-600 rounded border border-amber-100 font-bold">{c.pallet} tấn</span>;
      }
      if (typeLower.includes('pallet') || typeLower.includes('chuyển kho')) {
        return <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-600 rounded border border-emerald-100 font-bold">{c.pallet} pallet</span>;
      }
      
      // Fallback
      return (
        <div className="flex flex-wrap gap-1 justify-center">
          {c.pallet > 0 && <span className="px-1.5 py-0.5 bg-amber-50 text-amber-600 rounded border border-amber-100 font-bold">{c.pallet} p/t</span>}
          {c.c20 > 0 && <span className="px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded border border-blue-100 font-bold">{c.c20} c20</span>}
          {c.c40 > 0 && <span className="px-1.5 py-0.5 bg-indigo-50 text-indigo-600 rounded border border-indigo-100 font-bold">{c.c40} c40</span>}
          {c.pallet === 0 && c.c20 === 0 && c.c40 === 0 && <span className="text-slate-300 italic">-</span>}
        </div>
      );
    };

    return (
      <div className="space-y-8 animate-fade-in">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h2 className="text-2xl font-black text-gray-800 flex items-center gap-3">
              <IconCurrency className="w-8 h-8 text-[#2c4aa0]"/> Báo cáo Sản lượng & Lương chuyến
            </h2>
            <p className="text-sm text-gray-400 font-bold uppercase tracking-widest mt-1">Phân tích chuyên sâu về doanh thu & hiệu suất vận chuyển</p>
          </div>
          
          <div className="bg-white p-4 rounded-3xl border border-slate-200 flex flex-wrap gap-4 items-end shadow-sm w-full md:w-auto">
            <div className="flex-1 md:flex-none">
              <label className="text-[9px] font-black text-slate-400 uppercase mb-1 block">Tài xế</label>
              <select 
                value={reportSalaryDriver} 
                onChange={e => setReportSalaryDriver(e.target.value)} 
                className="w-full p-2 border rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-blue-100"
              >
                <option value="">Tất cả tài xế</option>
                {drivers.map(d => <option key={d.id} value={d.fullName}>{d.fullName}</option>)}
              </select>
            </div>
            <div className="flex-1 md:flex-none">
              <label className="text-[9px] font-black text-slate-400 uppercase mb-1 block">Loại hàng</label>
              <input 
                value={reportSalaryCargo} 
                onChange={e => setReportSalaryCargo(e.target.value)} 
                placeholder="VD: Cont..." 
                className="w-full p-2 border rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-blue-100" 
              />
            </div>
            <div className="flex gap-2">
              <div className="flex flex-col">
                <label className="text-[9px] font-black text-slate-400 uppercase mb-1">Từ</label>
                <input type="date" value={reportStartDate} onChange={e => setReportStartDate(e.target.value)} className="p-1.5 border rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-blue-100" />
              </div>
              <div className="flex flex-col">
                <label className="text-[9px] font-black text-slate-400 uppercase mb-1">Đến</label>
                <input type="date" value={reportEndDate} onChange={e => setReportEndDate(e.target.value)} className="p-1.5 border rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-blue-100" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-l-4 border-[#2c4aa0] bg-blue-50/20">
            <p className="text-[10px] font-black uppercase text-blue-400 mb-1 tracking-widest">Lương chuyến</p>
            <div className="text-xl font-black text-[#2c4aa0]">{formatCurrency(totalSalary)}</div>
          </Card>
          <Card className="border-l-4 border-amber-400 bg-amber-50/20">
            <p className="text-[10px] font-black uppercase text-amber-500 mb-1 tracking-widest">Tiền làm hàng</p>
            <div className="text-xl font-black text-amber-600">{formatCurrency(totalHandling)}</div>
          </Card>
          <Card className="border-l-4 border-indigo-500 bg-indigo-50/20">
            <p className="text-[10px] font-black uppercase text-indigo-400 mb-1 tracking-widest">Sản lượng Cont</p>
            <div className="text-xl font-black text-indigo-700">{total20}x20' | {total40}x40'</div>
          </Card>
          <Card className="border-l-4 border-emerald-500 bg-emerald-50/20">
            <p className="text-[10px] font-black uppercase text-emerald-500 mb-1 tracking-widest">Tổng lượt chuyến</p>
            <div className="text-xl font-black text-emerald-700">{totalTrips} chuyến</div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="p-0 overflow-hidden border-none shadow-xl">
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                <IconFunnel className="w-4 h-4 text-amber-400"/> Sản lượng theo Loại hàng
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[11px]">
                <thead className="bg-slate-50 text-slate-400 font-black uppercase border-b">
                  <tr>
                    <th className="p-4">Loại hàng</th>
                    <th className="p-4 text-center">Số chuyến</th>
                    <th className="p-4 text-center">Tổng Sản lượng</th>
                    <th className="p-4 text-right">Tổng Lương</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {cargoData.map(c => (
                    <tr key={c.type} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4">
                        <span className="font-black text-slate-700 uppercase">{c.type}</span>
                      </td>
                      <td className="p-4 text-center">
                        <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full font-black">{c.count}</span>
                      </td>
                      <td className="p-4 text-center">
                        {renderVolume(c)}
                      </td>
                      <td className="p-4 text-right">
                        <div className="font-black text-[#2c4aa0]">{formatCurrency(c.salary + c.handling)}</div>
                        <div className="text-[9px] text-slate-400 font-bold uppercase">Lương + Làm hàng</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card className="p-0 overflow-hidden border-none shadow-xl">
            <div className="p-5 bg-[#2c4aa0] text-white flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                <IconUsers className="w-4 h-4 text-white/50"/> Sản lượng theo Tài xế
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[11px]">
                <thead className="bg-slate-50 text-slate-400 font-black uppercase border-b">
                  <tr>
                    <th className="p-4">Tên Tài xế</th>
                    <th className="p-4 text-center">Chuyến</th>
                    <th className="p-4 text-right">Doanh thu</th>
                    <th className="p-4 text-right">Tỉ trọng</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {statsByDriver.map(s => {
                    const rev = s.salary + s.handling;
                    const percent = totalSalary + totalHandling > 0 ? (rev / (totalSalary + totalHandling)) * 100 : 0;
                    return (
                      <tr key={s.name} className="hover:bg-slate-50 transition-colors">
                        <td className="p-4 font-black text-slate-700">{s.name}</td>
                        <td className="p-4 text-center font-bold text-slate-500">{s.count}</td>
                        <td className="p-4 text-right font-black text-[#2c4aa0]">{formatCurrency(rev)}</td>
                        <td className="p-4 text-right">
                          <div className="flex flex-col items-end">
                            <span className="font-bold text-emerald-600">{percent.toFixed(1)}%</span>
                            <div className="w-16 h-1 bg-slate-100 rounded-full mt-1 overflow-hidden">
                              <div className="h-full bg-emerald-500" style={{ width: `${percent}%` }}></div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    );
  };

  const renderUserManagement = () => (
    <div className="space-y-8 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-1 border-t-4 border-[#2c4aa0]">
          <h2 className="text-xl font-bold text-[#2c4aa0] mb-6 flex items-center gap-2">
            <IconPlus className="w-5 h-5" /> Thêm người dùng
          </h2>
          <form className="space-y-4" onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            const newUser: User = {
              id: Math.random().toString(36).substr(2, 9),
              username: fd.get('username') as string,
              password: fd.get('password') as string,
              fullName: fd.get('fullName') as string,
              role: fd.get('role') as UserRole
            };
            setUsers([...users, newUser]);
            e.currentTarget.reset();
          }}>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Tên hiển thị</label>
              <input name="fullName" required className="w-full p-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-blue-100" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Tên đăng nhập</label>
              <input name="username" required className="w-full p-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-blue-100" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Mật khẩu</label>
              <input name="password" type="password" required className="w-full p-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-blue-100" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Vai trò</label>
              <select name="role" required className="w-full p-2.5 border rounded-xl bg-white outline-none focus:ring-2 focus:ring-blue-100">
                <option value="DRIVER">Tài xế</option>
                <option value="ADMIN">Quản trị viên</option>
              </select>
            </div>
            <Button type="submit" className="w-full py-3 mt-4">Tạo người dùng mới</Button>
          </form>
        </Card>
        
        <Card className="lg:col-span-2">
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <IconUsers className="w-6 h-6 text-[#2c4aa0]" /> Danh sách người dùng
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="p-3">Họ và tên</th>
                  <th className="p-3">Tài khoản</th>
                  <th className="p-3 text-center">Vai trò</th>
                  <th className="p-3 text-right">Tác vụ</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-bold text-gray-800">{u.fullName}</td>
                    <td className="p-3 text-gray-500 font-mono">{u.username}</td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black ${u.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => {
                          setUserToChangePassword(u);
                          setIsPasswordModalOpen(true);
                        }} className="p-1 text-[#2c4aa0] hover:bg-blue-50 rounded" title="Đổi mật khẩu">
                          <IconKey className="w-4 h-4" />
                        </button>
                        <button onClick={() => {
                          if(u.username === 'admin') return alert('Không thể xóa admin mặc định');
                          if(window.confirm('Xóa người dùng này?')) setUsers(users.filter(x=>x.id!==u.id));
                        }} className="p-1 text-rose-400 hover:bg-rose-50 rounded">
                          <IconTrash className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );

  const AdminView = () => (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="w-full lg:w-64 flex-shrink-0">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-3 sticky top-24 space-y-1">
            <h3 className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-[2px]">Menu chính</h3>
            <button onClick={() => setActiveTab('DASHBOARD')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all group ${activeTab === 'DASHBOARD' ? 'bg-[#2c4aa0] text-white shadow-lg shadow-[#2c4aa0]/20' : 'text-slate-600 hover:bg-slate-50 hover:text-[#2c4aa0]'}`}>
              <IconHome className={`w-5 h-5 ${activeTab === 'DASHBOARD' ? 'text-white' : 'text-slate-400 group-hover:text-[#2c4aa0]'}`} /> 
              <span>Tổng quan</span>
            </button>
            <button onClick={() => setActiveTab('APPROVE_FUEL')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all group ${activeTab === 'APPROVE_FUEL' ? 'bg-[#2c4aa0] text-white shadow-lg shadow-[#2c4aa0]/20' : 'text-slate-600 hover:bg-slate-50 hover:text-[#2c4aa0]'}`}>
              <IconGasPump className={`w-5 h-5 ${activeTab === 'APPROVE_FUEL' ? 'text-white' : 'text-slate-400 group-hover:text-[#2c4aa0]'}`} /> 
              <span>Duyệt cấp dầu</span>
            </button>
            <button onClick={() => setActiveTab('APPROVE_ADVANCE')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all group ${activeTab === 'APPROVE_ADVANCE' ? 'bg-[#2c4aa0] text-white shadow-lg shadow-[#2c4aa0]/20' : 'text-slate-600 hover:bg-slate-50 hover:text-[#2c4aa0]'}`}>
              <IconWallet className={`w-5 h-5 ${activeTab === 'APPROVE_ADVANCE' ? 'text-white' : 'text-slate-400 group-hover:text-[#2c4aa0]'}`} /> 
              <span>Duyệt tạm ứng</span>
            </button>
            <button onClick={() => setActiveTab('SALARY')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all group ${activeTab === 'SALARY' ? 'bg-[#2c4aa0] text-white shadow-lg shadow-[#2c4aa0]/20' : 'text-slate-600 hover:bg-slate-50 hover:text-[#2c4aa0]'}`}>
              <IconCurrency className={`w-5 h-5 ${activeTab === 'SALARY' ? 'text-white' : 'text-slate-400 group-hover:text-[#2c4aa0]'}`} /> 
              <span>Lương chuyến</span>
            </button>
            
            <h3 className="px-3 py-2 mt-4 text-[10px] font-bold text-gray-400 uppercase tracking-[2px]">BÁO CÁO</h3>
            <button onClick={() => setActiveTab('REPORTS')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all group ${activeTab === 'REPORTS' ? 'bg-[#2c4aa0] text-white shadow-lg shadow-[#2c4aa0]/20' : 'text-slate-600 hover:bg-slate-50 hover:text-[#2c4aa0]'}`}>
              <IconChartBar className={`w-5 h-5 ${activeTab === 'REPORTS' ? 'text-white' : 'text-slate-400 group-hover:text-[#2c4aa0]'}`} /> 
              <span>Báo cáo tổng hợp</span>
            </button>
            <button onClick={() => setActiveTab('REPORTS_SALARY')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all group ${activeTab === 'REPORTS_SALARY' ? 'bg-[#2c4aa0] text-white shadow-lg shadow-[#2c4aa0]/20' : 'text-slate-600 hover:bg-slate-50 hover:text-[#2c4aa0]'}`}>
              <IconCurrency className={`w-5 h-5 ${activeTab === 'REPORTS_SALARY' ? 'text-white' : 'text-slate-400 group-hover:text-[#2c4aa0]'}`} /> 
              <span>Báo cáo lương</span>
            </button>
            <button onClick={() => setActiveTab('REPORTS_FUEL')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all group ${activeTab === 'REPORTS_FUEL' ? 'bg-[#2c4aa0] text-white shadow-lg shadow-[#2c4aa0]/20' : 'text-slate-600 hover:bg-slate-50 hover:text-[#2c4aa0]'}`}>
              <IconGasPump className={`w-5 h-5 ${activeTab === 'REPORTS_FUEL' ? 'text-white' : 'text-slate-400 group-hover:text-[#2c4aa0]'}`} /> 
              <span>Báo cáo nhiên liệu</span>
            </button>
            <button onClick={() => setActiveTab('REPORTS_ADVANCE')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all group ${activeTab === 'REPORTS_ADVANCE' ? 'bg-[#2c4aa0] text-white shadow-lg shadow-[#2c4aa0]/20' : 'text-slate-600 hover:bg-slate-50 hover:text-[#2c4aa0]'}`}>
              <IconWallet className={`w-5 h-5 ${activeTab === 'REPORTS_ADVANCE' ? 'text-white' : 'text-slate-400 group-hover:text-[#2c4aa0]'}`} /> 
              <span>Báo cáo tạm ứng</span>
            </button>

            <h3 className="px-3 py-2 mt-4 text-[10px] font-bold text-gray-400 uppercase tracking-[2px]">Hệ thống</h3>
            <button onClick={() => setActiveTab('OPERATION')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all group ${activeTab === 'OPERATION' ? 'bg-[#2c4aa0] text-white shadow-lg shadow-[#2c4aa0]/20' : 'text-slate-600 hover:bg-slate-50 hover:text-[#2c4aa0]'}`}>
              <IconUsers className={`w-5 h-5 ${activeTab === 'OPERATION' ? 'text-white' : 'text-slate-400 group-hover:text-[#2c4aa0]'}`} /> 
              <span>Vận hành</span>
            </button>
            <button onClick={() => setActiveTab('FUEL_SETTINGS')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all group ${activeTab === 'FUEL_SETTINGS' ? 'bg-[#2c4aa0] text-white shadow-lg shadow-[#2c4aa0]/20' : 'text-slate-600 hover:bg-slate-50 hover:text-[#2c4aa0]'}`}>
              <IconGasPump className={`w-5 h-5 ${activeTab === 'FUEL_SETTINGS' ? 'text-white' : 'text-slate-400 group-hover:text-[#2c4aa0]'}`} /> 
              <span>Nhiên liệu</span>
            </button>
            <button onClick={() => setActiveTab('ADVANCE_SETTINGS')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all group ${activeTab === 'ADVANCE_SETTINGS' ? 'bg-[#2c4aa0] text-white shadow-lg shadow-[#2c4aa0]/20' : 'text-slate-600 hover:bg-slate-50 hover:text-[#2c4aa0]'}`}>
              <IconWallet className={`w-5 h-5 ${activeTab === 'ADVANCE_SETTINGS' ? 'text-white' : 'text-slate-400 group-hover:text-[#2c4aa0]'}`} /> 
              <span>Tạm ứng</span>
            </button>
            <button onClick={() => setActiveTab('USERS')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all group ${activeTab === 'USERS' ? 'bg-[#2c4aa0] text-white shadow-lg shadow-[#2c4aa0]/20' : 'text-slate-600 hover:bg-slate-50 hover:text-[#2c4aa0]'}`}>
              <IconUser className={`w-5 h-5 ${activeTab === 'USERS' ? 'text-white' : 'text-slate-400 group-hover:text-[#2c4aa0]'}`} /> 
              <span>Người dùng</span>
            </button>
        </div>
      </div>

      <div className="flex-1 space-y-8">
        {activeTab === 'DASHBOARD' && renderDashboard()}
        {activeTab === 'APPROVE_FUEL' && renderApproveFuel()}
        {activeTab === 'APPROVE_ADVANCE' && renderApproveAdvance()}
        {activeTab === 'SALARY' && renderSalaryManagement()}
        {activeTab === 'OPERATION' && renderOperationManagement()}
        {activeTab === 'ADVANCE_SETTINGS' && renderAdvanceSettings()}
        {activeTab === 'FUEL_SETTINGS' && renderFuelSettings()}
        {activeTab === 'USERS' && renderUserManagement()}
        {activeTab === 'REPORTS' && renderReports()}
        {activeTab === 'REPORTS_FUEL' && renderFuelReports()}
        {activeTab === 'REPORTS_ADVANCE' && renderAdvanceReports()}
        {activeTab === 'REPORTS_SALARY' && renderSalaryReports()}
      </div>
    </div>
  );

  const renderLogin = () => (
    <div className="fixed inset-0 flex items-center justify-center bg-[#f5f7fa] z-[100] animate-fade-in px-4">
      <Card className="max-w-md w-full p-8 space-y-8 shadow-2xl border-none">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-[#2c4aa0] rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-blue-200 mb-4">
            <IconGasPump className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-black text-[#2c4aa0] tracking-tighter">HIEPPHAT ERP</h1>
          <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">Hệ thống quản trị doanh nghiệp</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Tên đăng nhập</label>
            <div className="relative">
              <IconUser className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
              <input 
                value={loginUser}
                onChange={e => setLoginUser(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all font-semibold" 
                placeholder="Nhập tài khoản..."
              />
            </div>
          </div>
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Mật khẩu</label>
            <div className="relative">
              <IconCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
              <input 
                type="password"
                value={loginPass}
                onChange={e => setLoginPass(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all font-semibold" 
                placeholder="••••••••"
              />
            </div>
          </div>
          
          {loginError && (
            <div className="p-3 bg-rose-50 text-rose-600 text-xs font-bold rounded-xl flex items-center gap-2 border border-rose-100 animate-pulse">
              <IconAlert className="w-4 h-4" /> {loginError}
            </div>
          )}

          <Button type="submit" className="w-full py-4 text-base font-black uppercase tracking-widest shadow-xl shadow-blue-200">
            Đăng nhập hệ thống
          </Button>
        </form>

        <div className="text-center pt-4">
          <p className="text-[10px] text-slate-300 font-bold uppercase tracking-tighter">Phiên bản 2.0. © 2024 Hiệp Phát ERP</p>
        </div>
      </Card>
    </div>
  );

  if (!currentUser) return renderLogin();

  const DriverView = () => (
    <div className="max-w-xl mx-auto space-y-8 animate-fade-in">
        <div className="bg-white rounded-2xl p-1.5 border border-gray-100 shadow-sm flex sticky top-20 z-10 backdrop-blur-md bg-white/90">
            <button onClick={() => setDriverTab('FUEL')} className={`flex-1 flex flex-col items-center justify-center py-3 rounded-xl transition-all ${driverTab === 'FUEL' ? 'bg-[#2c4aa0] text-white shadow-lg shadow-blue-200' : 'text-slate-400'}`}>
              <IconGasPump className="w-6 h-6 mb-1" /><span className="text-[10px] font-bold uppercase">Đổ dầu</span>
            </button>
            <button onClick={() => setDriverTab('ADVANCE')} className={`flex-1 flex flex-col items-center justify-center py-3 rounded-xl transition-all ${driverTab === 'ADVANCE' ? 'bg-[#2c4aa0] text-white shadow-lg shadow-blue-200' : 'text-slate-400'}`}>
              <IconWallet className="w-6 h-6 mb-1" /><span className="text-[10px] font-bold uppercase">Tạm ứng</span>
            </button>
        </div>

        {driverTab === 'FUEL' && (
            <Card className="border-t-4 border-[#2c4aa0]">
              <h2 className="text-xl font-black text-[#2c4aa0] mb-6 flex items-center gap-2">Gửi yêu cầu cấp dầu</h2>
              <div className="space-y-5">
                <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">Ngày dự kiến đổ</label>
                    <input type="date" value={newRequestDate} onChange={e=>setNewRequestDate(e.target.value)} className="w-full p-3 border border-gray-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 transition-all font-medium" />
                </div>
                <div className="p-4 bg-blue-50/50 rounded-2xl text-[#2c4aa0] border border-blue-100/50">
                    <div className="text-[10px] font-bold uppercase opacity-60 mb-1">Xe đang sử dụng</div>
                    <div className="text-xl font-black flex items-center gap-2">
                        <IconTruck className="w-6 h-6" /> {autoAssignedVehicle || 'CHƯA PHÂN CÔNG'}
                    </div>
                </div>
                <Button onClick={handleDriverSubmit} className="w-full py-4 text-base shadow-xl" disabled={!autoAssignedVehicle}>Gửi yêu cầu duyệt ngay</Button>
              </div>
            </Card>
        )}
    </div>
  );

  return (
    <div className="min-h-screen pb-12" style={{ backgroundColor: BG_COLOR }}>
      <header className="bg-white/80 backdrop-blur-lg shadow-sm border-b border-gray-100 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3 py-4">
            <div className="w-10 h-10 bg-[#2c4aa0] rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
              <IconGasPump className="w-6 h-6 text-white" />
            </div>
            <div className="hidden sm:block">
              <span className="text-[#2c4aa0] font-black text-xl tracking-tighter">HIEPPHAT</span>
              <span className="text-gray-300 font-bold text-xs ml-1 tracking-widest uppercase">ERP v2.0</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <button 
                onClick={() => { setUserToChangePassword(currentUser); setIsPasswordModalOpen(true); }}
                className="p-2 text-slate-400 hover:text-[#2c4aa0] transition-colors" 
                title="Đổi mật khẩu"
              >
                <IconKey className="w-5 h-5" />
              </button>
              <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-rose-50 transition-colors" title="Đăng xuất">
                <IconXCircle className="w-6 h-6" />
              </button>
            </div>
            <div className="h-8 w-[1px] bg-slate-200 hidden sm:block mx-1"></div>
            <div className="flex items-center gap-3 pl-2 group">
              <div className="text-right hidden sm:block">
                <div className="text-xs font-black text-slate-700">{currentUser.fullName}</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                   {currentUser.role === 'ADMIN' ? 'Ban điều hành' : 'Tài xế Hiệp Phát'}
                </div>
              </div>
              <div className="w-10 h-10 bg-blue-50 rounded-full border-2 border-white flex items-center justify-center group-hover:bg-blue-100 transition-colors overflow-hidden">
                <IconUser className="w-6 h-6 text-[#2c4aa0]" />
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        {currentUser.role === 'DRIVER' ? <DriverView /> : <AdminView />}
      </main>

      {/* Modals and other UI components from existing Status */}
      {isModalOpen && selectedRequest && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <Card className="max-w-md w-full p-8 space-y-6 shadow-2xl scale-in border-none">
            <div className="flex justify-between items-center border-b border-gray-100 pb-4">
              <h3 className="text-xl font-black text-slate-800">Duyệt cấp dầu</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-slate-100 rounded-full transition-colors"><IconXCircle className="w-6 h-6 text-slate-300 hover:text-rose-500"/></button>
            </div>
            <div className="space-y-5">
              <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                <div className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1">Yêu cầu từ</div>
                <div className="font-bold text-blue-900">{selectedRequest.driverName} - {selectedRequest.licensePlate}</div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Chọn trạm cung ứng</label>
                <select className="w-full p-3 border border-gray-200 rounded-2xl bg-white outline-none focus:ring-4 focus:ring-blue-100 transition-all font-medium text-sm" value={adminStation} onChange={e=>setAdminStation(e.target.value)}><option value="">-- Chọn trạm --</option>{stations.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl space-y-4 border border-slate-100">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input type="checkbox" checked={isAdminFullTank} onChange={e=>setIsAdminFullTank(e.target.checked)} className="w-5 h-5 rounded border-gray-300 text-[#2c4aa0] focus:ring-[#2c4aa0]" />
                  <span className="text-sm font-black text-slate-700 group-hover:text-[#2c4aa0] transition-colors">Duyệt Đầy bình</span>
                </label>
                {!isAdminFullTank && (
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase mb-1.5 block">Số tiền duyệt (Triệu đồng)</label>
                    <input type="number" step="0.1" className="w-full p-3 border border-gray-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 transition-all font-bold text-lg" placeholder="VD: 1.5" value={adminAmount} onChange={e=>setAdminAmount(e.target.value)} />
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <Button variant="ghost" className="flex-1" onClick={handleReject}>Từ chối</Button>
              <Button className="flex-[2] py-4" onClick={handleApprove}>Xác nhận cấp dầu</Button>
            </div>
          </Card>
        </div>
      )}

      {/* Password Change Modal */}
      {isPasswordModalOpen && userToChangePassword && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[60] animate-fade-in">
          <Card className="max-w-md w-full p-8 space-y-6 shadow-2xl scale-in border-none">
            <div className="flex justify-between items-center border-b border-gray-100 pb-4">
              <h3 className="text-xl font-black text-slate-800">Đổi mật khẩu</h3>
              <button onClick={() => setIsPasswordModalOpen(false)} className="p-1 hover:bg-slate-100 rounded-full transition-colors"><IconXCircle className="w-6 h-6 text-slate-300 hover:text-rose-500"/></button>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Tài khoản</div>
                <div className="font-bold text-slate-700">{userToChangePassword.fullName} (@{userToChangePassword.username})</div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Mật khẩu mới</label>
                <input 
                  type="password"
                  className="w-full p-3 border border-gray-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 transition-all font-semibold" 
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <Button variant="ghost" className="flex-1" onClick={() => setIsPasswordModalOpen(false)}>Hủy</Button>
              <Button className="flex-[2] py-4" onClick={handleUpdatePassword} disabled={!newPassword}>Cập nhật mật khẩu</Button>
            </div>
          </Card>
        </div>
      )}

      {showCopyModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-8 text-center scale-in border-none">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
              <IconCheck className="w-8 h-8"/>
            </div>
            <h3 className="text-2xl font-black mb-2 text-slate-800 tracking-tight">Thành công!</h3>
            <p className="text-sm text-slate-500 mb-6">Thông tin đã được hệ thống ghi nhận và sẵn sàng gửi đi.</p>
            <div className="bg-slate-50 p-4 rounded-2xl text-left text-[11px] font-mono mb-8 whitespace-pre-line border border-slate-100 leading-relaxed text-slate-600">
              {copyMessage}
            </div>
            <Button onClick={handleCopy} className="w-full py-4 text-base shadow-lg shadow-emerald-200 bg-emerald-600 hover:bg-emerald-700">Copy & Đóng</Button>
          </div>
        </div>
      )}
      
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
        .scale-in { animation: scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
        .scale-hover:active { transform: scale(0.98); }
        
        /* Custom Scrollbar */
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: #f1f1f1;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
}
