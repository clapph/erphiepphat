
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
  SalaryRecord,
  CargoType,
  VehicleStatus,
  User
} from './types';
import { analyzeFuelData } from './services/geminiService';
import { 
  IconGasPump, 
  IconTrendingUp, 
  IconCheckCircle, 
  IconXCircle, 
  IconPlus, 
  IconUser, 
  IconSparkles, 
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
  IconCurrency
} from './components/Icons';

// --- Constants & Mock Data ---
const PRIMARY_COLOR = '#2c4aa0';
const BG_COLOR = '#f8fafc'; 

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
  { id: 'v3', licensePlate: '60A-111.22', vehicleType: 'Xe Bán Tải', inspectionDate: '2023-10-15', inspectionExpiryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], status: 'INACTIVE' }, 
];

const MOCK_ASSIGNMENTS: DriverAssignment[] = [
  { id: 'a1', driverName: 'Nguyễn Văn A', licensePlate: '51C-123.45', startDate: '2023-01-01' },
  { id: 'a2', driverName: 'Trần Văn B', licensePlate: '59D-987.65', startDate: '2023-01-01' },
];

const MOCK_REQUESTS: FuelRequest[] = [
  { id: 'r1', driverName: 'Nguyễn Văn A', licensePlate: '51C-123.45', requestDate: '2023-10-25', status: RequestStatus.APPROVED, approvedAmount: 1500000, approvedLiters: 63.8, stationId: '1', approvalDate: '2023-10-25', isFullTank: false },
  { id: 'r2', driverName: 'Trần Văn B', licensePlate: '59D-987.65', requestDate: '2023-10-24', status: RequestStatus.APPROVED, approvedAmount: 1175000, approvedLiters: 50, stationId: '1', approvalDate: '2023-10-24', isFullTank: false },
];

const MOCK_ADVANCE_TYPES: AdvanceType[] = [
    { id: 'at1', name: 'Chi phí đi đường' },
    { id: 'at2', name: 'Sửa chữa nhỏ' },
    { id: 'at3', name: 'Ăn uống' },
];

const MOCK_ADVANCE_REQUESTS: AdvanceRequest[] = [
    { id: 'ar1', driverName: 'Nguyễn Văn A', requestDate: '2023-10-26', amount: 500000, typeId: 'at1', status: RequestStatus.APPROVED, approvalDate: '2023-10-26' },
];

const MOCK_SALARY_RECORDS: SalaryRecord[] = [
  {
    id: 's1',
    transportDate: '2023-10-20',
    driverName: 'Nguyễn Văn A',
    cargoType: 'CONT',
    refNumber: 'TCLU1234567',
    quantity20: 1,
    quantity40: 0,
    quantityOther: 0,
    pickupWarehouse: 'ICD Phước Long',
    deliveryWarehouse: 'Cảng Cát Lái',
    depotLocation: 'Depot 6',
    returnLocation: 'Hạ bãi',
    salary: 800000,
    handlingFee: 100000,
    notes: 'Kẹt xe'
  }
];

const MOCK_USERS: User[] = [
  { id: 'u1', username: 'admin', password: '123', fullName: 'Quản trị viên HP', role: 'ADMIN' },
  { id: 'u2', username: 'driverA', password: '123', fullName: 'Nguyễn Văn A', role: 'DRIVER' },
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
  return applicablePrice ? applicablePrice.pricePerLiter : sortedPrices[sortedPrices.length - 1].pricePerLiter;
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

const Card = ({ children, className = '' }: any) => (
  <div className={`bg-white rounded-2xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border border-white/40 p-6 ${className}`}>
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
  
  // UI State
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [editingFuelPrice, setEditingFuelPrice] = useState<FuelPrice | null>(null);
  const [editingAssignment, setEditingAssignment] = useState<DriverAssignment | null>(null);
  const [editingSalaryRecord, setEditingSalaryRecord] = useState<SalaryRecord | null>(null);
  const [editingStation, setEditingStation] = useState<GasStation | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<FuelRequest | null>(null);
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [copyMessage, setCopyMessage] = useState('');
  const [showImportModal, setShowImportModal] = useState(false);
  const [importText, setImportText] = useState('');
  const [importPreviewRecords, setImportPreviewRecords] = useState<SalaryRecord[]>([]);
  
  const [adminAmount, setAdminAmount] = useState<string>('');
  const [adminStation, setAdminStation] = useState<string>('');
  const [isAdminFullTank, setIsAdminFullTank] = useState(false);
  
  const [adminNewDriver, setAdminNewDriver] = useState('');
  const [adminNewDate, setAdminNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [adminNewAmount, setAdminNewAmount] = useState('');
  const [adminNewStation, setAdminNewStation] = useState('');
  const [adminNewNote, setAdminNewNote] = useState('');
  const [adminNewFullTank, setAdminNewFullTank] = useState(false);

  const [salaryStartDate, setSalaryStartDate] = useState('');
  const [salaryEndDate, setSalaryEndDate] = useState('');
  const [salaryCargoFilter, setSalaryCargoFilter] = useState('');
  const [selectedSalaryIds, setSelectedSalaryIds] = useState<Set<string>>(new Set());

  const [driverTab, setDriverTab] = useState<'FUEL' | 'ADVANCE' | 'SALARY' | 'REPORTS'>('FUEL');

  const [newRequestDate, setNewRequestDate] = useState(new Date().toISOString().split('T')[0]);
  const [newRequestNote, setNewRequestNote] = useState('');

  // Advance state for admin
  const [adminAdvDriver, setAdminAdvDriver] = useState('');
  const [adminAdvDate, setAdminAdvDate] = useState(new Date().toISOString().split('T')[0]);
  const [adminAdvAmount, setAdminAdvAmount] = useState('');
  const [adminAdvType, setAdminAdvType] = useState('');
  const [adminAdvNote, setAdminAdvNote] = useState('');

  // Login State
  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginError, setLoginError] = useState('');

  // Derived State
  const autoAssignedVehicle = useMemo(() => {
    return getAssignedVehicle(currentUser?.fullName || '', newRequestDate, assignments);
  }, [newRequestDate, assignments, currentUser]);

  const adminAutoVehicle = useMemo(() => {
    if (!adminNewDriver) return null;
    return getAssignedVehicle(adminNewDriver, adminNewDate, assignments);
  }, [adminNewDriver, adminNewDate, assignments]);

  const filteredSalaries = useMemo(() => {
    return salaryRecords.filter(s => {
      const dateMatch = (!salaryStartDate || s.transportDate >= salaryStartDate) && 
                         (!salaryEndDate || s.transportDate <= salaryEndDate);
      const cargoMatch = !salaryCargoFilter || s.cargoType === salaryCargoFilter;
      return dateMatch && cargoMatch;
    }).sort((a,b) => new Date(b.transportDate).getTime() - new Date(a.transportDate).getTime());
  }, [salaryRecords, salaryStartDate, salaryEndDate, salaryCargoFilter]);

  const isAllFilteredSelected = useMemo(() => {
    return filteredSalaries.length > 0 && filteredSalaries.every(s => selectedSalaryIds.has(s.id));
  }, [filteredSalaries, selectedSalaryIds]);

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

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    try {
      const result = await analyzeFuelData(requests, prices);
      setAiAnalysis(result);
    } catch (error) {
      setAiAnalysis("Lỗi phân tích AI.");
    } finally {
      setIsAnalyzing(false);
    }
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
      isFullTank: adminNewFullTank
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
      isFullTank: isAdminFullTank
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

  const handleCopy = () => {
    navigator.clipboard.writeText(copyMessage);
    setShowCopyModal(false);
  };

  const handleParseImport = () => {
    if (!importText.trim()) return;
    const rows = importText.trim().split('\n');
    const newPreview: SalaryRecord[] = [];
    rows.forEach((row, index) => {
      const cols = row.split('\t');
      if (cols.length < 5 || (index === 0 && cols[0].includes("Ngày"))) return;
      newPreview.push({
        id: Math.random().toString(36).substr(2, 9),
        transportDate: cols[0]?.trim() || new Date().toISOString().split('T')[0],
        driverName: cols[1]?.trim() || 'Unknown',
        cargoType: (cols[2]?.trim().toUpperCase() as CargoType) || 'CONT',
        refNumber: cols[3]?.trim() || '',
        quantity20: Number(cols[4]?.replace(/[^\d.]/g, '')) || 0,
        quantity40: Number(cols[5]?.replace(/[^\d.]/g, '')) || 0,
        quantityOther: Number(cols[6]?.replace(/[^\d.]/g, '')) || 0,
        pickupWarehouse: cols[7]?.trim() || '',
        deliveryWarehouse: cols[8]?.trim() || '',
        depotLocation: cols[9]?.trim() || '',
        returnLocation: cols[10]?.trim() || '',
        salary: Number(cols[11]?.replace(/[^\d]/g, '')) || 0,
        handlingFee: Number(cols[12]?.replace(/[^\d]/g, '')) || 0,
        notes: cols[13]?.trim() || ''
      });
    });
    if (newPreview.length > 0) setImportPreviewRecords(newPreview);
    else alert("Định dạng dữ liệu không hợp lệ.");
  };

  const handleConfirmImport = () => {
    setSalaryRecords([...importPreviewRecords, ...salaryRecords]);
    setImportPreviewRecords([]);
    setImportText('');
    setShowImportModal(false);
  };

  const handleSaveSalaryRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSalaryRecord) return;
    const formData = new FormData(e.target as HTMLFormElement);
    const updated: SalaryRecord = {
      ...editingSalaryRecord,
      transportDate: formData.get('transportDate') as string,
      driverName: formData.get('driverName') as string,
      salary: Number(formData.get('salary')),
      handlingFee: Number(formData.get('handlingFee')),
    };
    setSalaryRecords(salaryRecords.map(s => s.id === updated.id ? updated : s));
    setEditingSalaryRecord(null);
  };

  const handleBulkDeleteSalaries = () => {
    if (window.confirm(`Xóa ${selectedSalaryIds.size} dòng đã chọn?`)) {
      setSalaryRecords(salaryRecords.filter(s => !selectedSalaryIds.has(s.id)));
      setSelectedSalaryIds(new Set());
    }
  };

  const toggleAllSalariesOnPage = () => {
    if (isAllFilteredSelected) {
      const next = new Set(selectedSalaryIds);
      filteredSalaries.forEach(s => next.delete(s.id));
      setSelectedSalaryIds(next);
    } else {
      const next = new Set(selectedSalaryIds);
      filteredSalaries.forEach(s => next.add(s.id));
      setSelectedSalaryIds(next);
    }
  };

  const handleAdminCreateAdvance = () => {
    if (!adminAdvAmount || !adminAdvType || !adminAdvDriver) {
      alert("Vui lòng nhập đầy đủ thông tin tạm ứng.");
      return;
    }
    const newReq: AdvanceRequest = {
      id: Math.random().toString(36).substr(2, 9),
      driverName: adminAdvDriver,
      requestDate: adminAdvDate,
      amount: parseFloat(adminAdvAmount),
      typeId: adminAdvType,
      status: RequestStatus.APPROVED,
      notes: adminAdvNote,
      approvalDate: new Date().toISOString()
    };
    setAdvanceRequests([newReq, ...advanceRequests]);
    setAdminAdvAmount('');
    setAdminAdvNote('');
    alert("Đã tạo và duyệt phiếu tạm ứng!");
  };

  // --- Views as internal functions ---

  const renderDashboard = () => (
    <div className="space-y-8 animate-fade-in">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-bl-full -mr-8 -mt-8 group-hover:bg-amber-500/20 transition-all duration-500"></div>
            <div className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-1">Cần xử lý</div>
            <div className="text-sm font-medium text-gray-400 mb-2">Dầu chờ duyệt</div>
            <div className="text-4xl font-black text-gray-800">{requests.filter(r=>r.status==='PENDING').length} <span className="text-sm font-normal text-gray-400">phiếu</span></div>
          </Card>
          <Card className="relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/10 rounded-bl-full -mr-8 -mt-8 group-hover:bg-orange-500/20 transition-all duration-500"></div>
            <div className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-1">Tài chính</div>
            <div className="text-sm font-medium text-gray-400 mb-2">Tạm ứng chờ duyệt</div>
            <div className="text-4xl font-black text-gray-800">{advanceRequests.filter(r=>r.status==='PENDING').length} <span className="text-sm font-normal text-gray-400">yêu cầu</span></div>
          </Card>
          <Card className="relative overflow-hidden group border-l-4 border-emerald-500">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-bl-full -mr-8 -mt-8 group-hover:bg-emerald-500/20 transition-all duration-500"></div>
            <div className="text-xs font-bold text-emerald-500 uppercase tracking-widest mb-1">Hiệu suất</div>
            <div className="text-sm font-medium text-gray-400 mb-2">Xe đang vận hành</div>
            <div className="text-4xl font-black text-gray-800">{vehicles.filter(v=>v.status==='OPERATING').length} <span className="text-sm font-normal text-gray-400">phương tiện</span></div>
          </Card>
        </div>

        <Card className="bg-gradient-to-br from-[#2c4aa0] to-[#1e3475] border-none text-white shadow-xl shadow-[#2c4aa0]/20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
                  <IconSparkles className="w-8 h-8 text-blue-200" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">AI Business Insight</h3>
                  <p className="text-sm text-blue-100 opacity-80">Trợ lý ảo phân tích dữ liệu doanh nghiệp thời gian thực</p>
                </div>
              </div>
              <Button variant="secondary" onClick={handleAnalyze} disabled={isAnalyzing} className="bg-white/10 border-white/20 text-white hover:bg-white/20 min-w-[150px]">
                {isAnalyzing ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Đang xử lý...</span>
                  </div>
                ) : 'Phân tích ngay'}
              </Button>
            </div>
            {aiAnalysis ? (
              <div className="text-sm leading-relaxed p-6 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm animate-fade-in">
                {aiAnalysis}
              </div>
            ) : (
              <div className="p-12 text-center text-blue-100/40 italic border-2 border-dashed border-white/10 rounded-2xl">
                Nhấn nút để bắt đầu phân tích dữ liệu nhiên liệu và vận hành...
              </div>
            )}
        </Card>
    </div>
  );

  const renderAdvanceManagement = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="h-fit">
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <IconWallet className="w-5 h-5 text-[#2c4aa0]" /> Quản lý Tạm ứng
              </h2>
              <div className="max-h-40 overflow-y-auto space-y-1">
                  {advanceTypes.map(at => (
                      <div key={at.id} className="flex justify-between items-center p-2 bg-gray-50 rounded text-sm group">
                          <span>{at.name}</span>
                      </div>
                  ))}
              </div>
          </Card>

          <Card className="md:col-span-2 border-[#2c4aa0] border-2">
              <h2 className="text-lg font-bold text-[#2c4aa0] mb-4 flex items-center gap-2">
                  <IconPlus className="w-5 h-5" /> Tạo & Duyệt phiếu Tạm ứng
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
              <Button className="w-full mt-4" onClick={handleAdminCreateAdvance}>Tạo & Duyệt</Button>
          </Card>
      </div>

      <Card>
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <IconCheckCircle className="w-6 h-6 text-[#2c4aa0]" /> Danh sách Tạm ứng
          </h2>
          <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600">
                  <thead className="bg-gray-50 text-gray-900 font-semibold border-b">
                      <tr>
                          <th className="p-3">Ngày</th>
                          <th className="p-3">Tài xế</th>
                          <th className="p-3">Loại</th>
                          <th className="p-3 text-right">Số tiền</th>
                          <th className="p-3 text-center">Trạng thái</th>
                          <th className="p-3 text-center">Tác vụ</th>
                      </tr>
                  </thead>
                  <tbody>
                      {advanceRequests.sort((a,b) => new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime()).map(req => (
                          <tr key={req.id} className="border-b hover:bg-gray-50">
                              <td className="p-3">{formatDate(req.requestDate)}</td>
                              <td className="p-3 font-medium">{req.driverName}</td>
                              <td className="p-3">{advanceTypes.find(t => t.id === req.typeId)?.name || 'Khác'}</td>
                              <td className="p-3 text-right font-bold text-[#2c4aa0]">{formatCurrency(req.amount)}</td>
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

  const renderSalaryManagement = () => (
    <div className="space-y-6 animate-fade-in">
        <Card className="border-t-4 border-[#2c4aa0]">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2"><IconCurrency className="w-6 h-6 text-[#2c4aa0]" /> Quản lý Lương chuyến</h2>
                    <p className="text-sm text-gray-500 mt-1">Hệ thống ghi nhận và quản lý thanh toán chuyến vận chuyển.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    {selectedSalaryIds.size > 0 && <Button onClick={handleBulkDeleteSalaries} variant="danger" className="animate-pulse">Xóa hàng loạt ({selectedSalaryIds.size})</Button>}
                    <Button onClick={() => { setImportPreviewRecords([]); setShowImportModal(true); }} variant="secondary" className="bg-blue-50/50"><IconPlus className="w-4 h-4" /> Import từ Sheets</Button>
                </div>
            </div>
            <div className="bg-gray-50/50 p-4 rounded-xl mb-6 grid grid-cols-1 md:grid-cols-4 gap-4 items-end border border-gray-100">
                <div><label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">Từ ngày</label><input type="date" className="w-full p-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2c4aa0]/20 outline-none transition-all" value={salaryStartDate} onChange={e => setSalaryStartDate(e.target.value)} /></div>
                <div><label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">Đến ngày</label><input type="date" className="w-full p-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2c4aa0]/20 outline-none transition-all" value={salaryEndDate} onChange={e => setSalaryEndDate(e.target.value)} /></div>
                <div><label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">Loại hàng</label><select className="w-full p-2 text-sm border border-gray-200 rounded-lg bg-white outline-none focus:ring-2 focus:ring-[#2c4aa0]/20 transition-all" value={salaryCargoFilter} onChange={e => setSalaryCargoFilter(e.target.value)}><option value="">Tất cả</option><option value="CONT">Container</option><option value="PALLET">Pallet</option></select></div>
                <Button variant="ghost" onClick={() => { setSalaryStartDate(''); setSalaryEndDate(''); setSalaryCargoFilter(''); setSelectedSalaryIds(new Set()); }} className="text-xs">Xóa lọc</Button>
            </div>
            <div className="overflow-x-auto rounded-xl border border-gray-100 shadow-sm">
                <table className="w-full text-left text-[11px] text-gray-600 border-collapse">
                    <thead className="bg-gray-50 text-gray-500 font-bold border-b">
                        <tr>
                            <th className="p-3 text-center w-10"><input type="checkbox" className="rounded border-gray-300 text-[#2c4aa0] focus:ring-[#2c4aa0]" checked={isAllFilteredSelected} onChange={toggleAllSalariesOnPage} /></th>
                            <th className="p-3 uppercase tracking-tighter">Ngày VC</th>
                            <th className="p-3 uppercase tracking-tighter">Tài xế</th>
                            <th className="p-3 uppercase tracking-tighter">Loại hàng</th>
                            <th className="p-3 uppercase tracking-tighter">Số CONT / DO</th>
                            <th className="p-3 text-right">Lương chuyến</th>
                            <th className="p-3 text-right">Làm hàng</th>
                            <th className="p-3 text-center">Tác vụ</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {filteredSalaries.map(s => (
                            <tr key={s.id} className={`group hover:bg-[#f8f9ff] transition-colors ${selectedSalaryIds.has(s.id) ? 'bg-blue-50' : ''}`}>
                                <td className="p-3 text-center"><input type="checkbox" className="rounded border-gray-300 text-[#2c4aa0] focus:ring-[#2c4aa0]" checked={selectedSalaryIds.has(s.id)} onChange={() => { const next = new Set(selectedSalaryIds); if (next.has(s.id)) next.delete(s.id); else next.add(s.id); setSelectedSalaryIds(next); }} /></td>
                                <td className="p-3 whitespace-nowrap font-medium text-gray-400">{formatDate(s.transportDate)}</td>
                                <td className="p-3 font-semibold text-gray-800">{s.driverName}</td>
                                <td className="p-3 text-center"><span className="px-2 py-0.5 rounded bg-gray-100 text-[10px] font-bold text-gray-500">{s.cargoType}</span></td>
                                <td className="p-3 font-mono font-medium text-blue-600">{s.refNumber}</td>
                                <td className="p-3 text-right font-bold text-[#2c4aa0]">{formatCurrency(s.salary)}</td>
                                <td className="p-3 text-right font-bold text-orange-600">{formatCurrency(s.handlingFee)}</td>
                                <td className="p-3 text-center">
                                  <div className="flex gap-1 justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => setEditingSalaryRecord(s)} className="p-1.5 text-blue-500 hover:bg-blue-100 rounded-lg transition-colors"><IconEdit className="w-4 h-4"/></button>
                                    <button onClick={() => { if(window.confirm("Xóa dòng lương này?")) setSalaryRecords(salaryRecords.filter(x => x.id !== s.id)); }} className="p-1.5 text-red-400 hover:bg-red-100 rounded-lg transition-colors"><IconTrash className="w-4 h-4"/></button>
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

  const renderOperationManagement = () => (
    <div className="space-y-8 animate-fade-in">
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
                          <tbody className="divide-y divide-gray-50">{drivers.map(d => (<tr key={d.id} className="hover:bg-gray-50"><td className="p-3 font-semibold text-gray-700">{d.fullName}</td><td className="p-3 flex justify-end gap-2"><button onClick={() => handleEditDriver(d)} className="p-1 text-blue-500 hover:bg-blue-50 rounded"><IconEdit className="w-4 h-4" /></button><button onClick={() => handleDeleteDriver(d.id)} className="p-1 text-red-400 hover:bg-red-50 rounded"><IconTrash className="w-4 h-4" /></button></td></tr>))}</tbody>
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
                                  <button onClick={() => handleDeleteVehicle(v.id)} className="p-1 text-rose-400 hover:bg-rose-50 rounded"><IconTrash className="w-4 h-4" /></button>
                                </td>
                              </tr>
                            )})}
                          </tbody>
                        </table>
                    </div>
                </div>
            </Card>
        </div>
    </div>
  );

  const renderFuelManagement = () => (
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

        <Card className="border border-blue-100 bg-white shadow-xl">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
                  <IconPlus className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-gray-800 tracking-tight">Tạo phiếu cấp dầu nhanh</h2>
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-widest">Hệ thống phê duyệt nhiên liệu ERP</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-1">
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
                    <option value="">Chọn đối tác cấp</option>
                    {stations.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2 px-1">
                    <IconCurrency className="w-3.5 h-3.5" /> Định mức cấp
                  </label>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setAdminNewFullTank(!adminNewFullTank)}
                      className={`flex-1 p-3.5 rounded-2xl border transition-all text-xs font-black uppercase tracking-tight flex items-center justify-center gap-2 ${
                        adminNewFullTank 
                        ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200' 
                        : 'bg-white border-slate-200 text-slate-400 hover:border-blue-300 hover:text-blue-500'
                      }`}
                    >
                      {adminNewFullTank && <IconCheck className="w-4 h-4" />}
                      Đầy bình
                    </button>
                    {!adminNewFullTank && (
                      <input 
                        type="number" 
                        step="0.1" 
                        placeholder="Triệu VNĐ" 
                        className="flex-1 p-3.5 text-sm border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all font-black text-blue-600 text-center" 
                        value={adminNewAmount} 
                        onChange={e => setAdminNewAmount(e.target.value)} 
                      />
                    )}
                  </div>
                </div>
            </div>

            {adminNewDriver && (
              <div className="mt-8 flex flex-col md:flex-row gap-4">
                <div className={`flex-1 p-5 rounded-3xl border flex items-start gap-4 transition-all duration-500 ${
                  adminAutoVehicle 
                  ? 'bg-emerald-50/80 border-emerald-100 text-emerald-900 shadow-sm' 
                  : 'bg-rose-50 border-rose-100 text-rose-900'
                }`}>
                  <div className={`p-2.5 rounded-2xl ${adminAutoVehicle ? 'bg-emerald-200/50' : 'bg-rose-200/50'}`}>
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
                  <div className="p-2.5 bg-slate-200/50 rounded-2xl">
                    <IconDocument className="w-6 h-6 text-slate-500" />
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

            <div className="mt-10 flex gap-4">
              <Button 
                variant="ghost" 
                className="px-8 py-4 text-xs uppercase font-black tracking-widest text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-2xl"
                onClick={() => {
                  setAdminNewDriver(''); setAdminNewAmount(''); setAdminNewNote(''); setAdminNewFullTank(false);
                }}
              >
                Làm mới biểu mẫu
              </Button>
              <Button 
                className="flex-1 py-5 text-base font-black uppercase tracking-widest shadow-2xl shadow-blue-600/30 rounded-2xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 transition-all scale-hover" 
                onClick={handleAdminCreateRequest}
              >
                <IconCheckCircle className="w-6 h-6" /> Phê duyệt & Phát hành phiếu
              </Button>
            </div>
        </Card>

        <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2"><IconDocument className="w-5 h-5 text-gray-400" /> Nhật ký giao dịch dầu</h2>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <table className="w-full text-left text-sm text-gray-600 border-collapse">
                <thead className="bg-gray-50/80 text-gray-400 font-bold uppercase tracking-wider text-[10px] border-b border-gray-100">
                  <tr><th className="p-4">Ngày giao dịch</th><th className="p-4">Tài xế / Biển số</th><th className="p-4 text-right">Giá trị duyệt</th><th className="p-4 text-center">Trạng thái</th><th className="p-4 text-center">Tác vụ</th></tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {requests.filter(r=>r.status!=='PENDING').map(req => (
                    <tr key={req.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="p-4 whitespace-nowrap text-gray-500 font-medium">{formatDate(req.requestDate)}</td>
                      <td className="p-4">
                        <div className="font-bold text-gray-800">{req.driverName}</div>
                        <div className="font-mono text-[10px] text-blue-500 bg-blue-50 inline-block px-1.5 rounded">{req.licensePlate}</div>
                      </td>
                      <td className="p-4 text-right font-bold text-slate-700">
                        {req.isFullTank ? <span className="text-[#2c4aa0] bg-[#2c4aa0]/5 px-2 py-0.5 rounded">Đầy bình</span> : formatCurrency(req.approvedAmount || 0)}
                      </td>
                      <td className="p-4 text-center"><Badge status={req.status} /></td>
                      <td className="p-4 text-center">
                        <div className="flex justify-center gap-2">
                          <button onClick={() => {
                            setCopyMessage(`PHIEU CAP DAU\nXe: ${req.licensePlate}\nTai xe: ${req.driverName}\nNgay: ${formatDate(req.requestDate)}\nDuyet: ${req.isFullTank ? 'Đầy bình' : formatCurrency(req.approvedAmount || 0)}`);
                            setShowCopyModal(true);
                          }} className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all" title="Copy thông tin"><IconCopy className="w-4 h-4"/></button>
                          <button onClick={() => {if(window.confirm("Xóa giao dịch này khỏi nhật ký?")) setRequests(requests.filter(x=>x.id!==req.id));}} className="p-1.5 text-rose-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"><IconTrash className="w-4 h-4"/></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
        </div>
    </div>
  );

  const renderReports = () => (
      <div className="space-y-6 animate-fade-in">
          <Card className="border-t-4 border-[#2c4aa0]">
              <h2 className="text-xl font-bold mb-8 flex items-center gap-2 text-gray-800"><IconChartBar className="w-6 h-6 text-[#2c4aa0]"/> Báo cáo tài chính & vận hành</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-6 rounded-3xl text-white shadow-xl shadow-blue-200">
                    <div className="text-xs font-bold uppercase tracking-wider opacity-80 mb-1">Tổng chi phí kỳ này</div>
                    <div className="text-3xl font-black mb-4">
                      {formatCurrency(requests.filter(r=>r.status==='APPROVED').reduce((s,r)=>s+(r.approvedAmount||0),0) + salaryRecords.reduce((s,sa)=>s+sa.salary+sa.handlingFee, 0))}
                    </div>
                    <div className="text-[10px] bg-white/20 p-2 rounded-xl border border-white/20 inline-block">Bao gồm: Nhiên liệu + Lương chuyến</div>
                  </div>
                  <Card className="border border-slate-100">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Chi phí Nhiên liệu</div>
                    <div className="text-2xl font-bold text-slate-800">
                      {formatCurrency(requests.filter(r=>r.status==='APPROVED').reduce((s,r)=>s+(r.approvedAmount||0),0))}
                    </div>
                  </Card>
                  <Card className="border border-slate-100">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Chi phí Lương chuyến</div>
                    <div className="text-2xl font-bold text-slate-800">
                      {formatCurrency(salaryRecords.reduce((s,sa)=>s+sa.salary+sa.handlingFee, 0))}
                    </div>
                  </Card>
              </div>
          </Card>
      </div>
  );

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
                      <button onClick={() => {
                        if(u.username === 'admin') return alert('Không thể xóa admin mặc định');
                        if(window.confirm('Xóa người dùng này?')) setUsers(users.filter(x=>x.id!==u.id));
                      }} className="p-1 text-rose-400 hover:bg-rose-50 rounded">
                        <IconTrash className="w-4 h-4" />
                      </button>
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
            <button onClick={() => setActiveTab('FUEL')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all group ${activeTab === 'FUEL' ? 'bg-[#2c4aa0] text-white shadow-lg shadow-[#2c4aa0]/20' : 'text-slate-600 hover:bg-slate-50 hover:text-[#2c4aa0]'}`}>
              <IconGasPump className={`w-5 h-5 ${activeTab === 'FUEL' ? 'text-white' : 'text-slate-400 group-hover:text-[#2c4aa0]'}`} /> 
              <span>Nhiên liệu</span>
            </button>
            <button onClick={() => setActiveTab('ADVANCES')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all group ${activeTab === 'ADVANCES' ? 'bg-[#2c4aa0] text-white shadow-lg shadow-[#2c4aa0]/20' : 'text-slate-600 hover:bg-slate-50 hover:text-[#2c4aa0]'}`}>
              <IconWallet className={`w-5 h-5 ${activeTab === 'ADVANCES' ? 'text-white' : 'text-slate-400 group-hover:text-[#2c4aa0]'}`} /> 
              <span>Tạm ứng</span>
            </button>
            <button onClick={() => setActiveTab('SALARY')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all group ${activeTab === 'SALARY' ? 'bg-[#2c4aa0] text-white shadow-lg shadow-[#2c4aa0]/20' : 'text-slate-600 hover:bg-slate-50 hover:text-[#2c4aa0]'}`}>
              <IconCurrency className={`w-5 h-5 ${activeTab === 'SALARY' ? 'text-white' : 'text-slate-400 group-hover:text-[#2c4aa0]'}`} /> 
              <span>Lương chuyến</span>
            </button>
            <h3 className="px-3 py-2 mt-4 text-[10px] font-bold text-gray-400 uppercase tracking-[2px]">Hệ thống</h3>
            <button onClick={() => setActiveTab('OPERATION')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all group ${activeTab === 'OPERATION' ? 'bg-[#2c4aa0] text-white shadow-lg shadow-[#2c4aa0]/20' : 'text-slate-600 hover:bg-slate-50 hover:text-[#2c4aa0]'}`}>
              <IconUsers className={`w-5 h-5 ${activeTab === 'OPERATION' ? 'text-white' : 'text-slate-400 group-hover:text-[#2c4aa0]'}`} /> 
              <span>Vận hành</span>
            </button>
            <button onClick={() => setActiveTab('USERS')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all group ${activeTab === 'USERS' ? 'bg-[#2c4aa0] text-white shadow-lg shadow-[#2c4aa0]/20' : 'text-slate-600 hover:bg-slate-50 hover:text-[#2c4aa0]'}`}>
              <IconUser className={`w-5 h-5 ${activeTab === 'USERS' ? 'text-white' : 'text-slate-400 group-hover:text-[#2c4aa0]'}`} /> 
              <span>Người dùng</span>
            </button>
            <button onClick={() => setActiveTab('REPORTS')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all group ${activeTab === 'REPORTS' ? 'bg-[#2c4aa0] text-white shadow-lg shadow-[#2c4aa0]/20' : 'text-slate-600 hover:bg-slate-50 hover:text-[#2c4aa0]'}`}>
              <IconChartBar className={`w-5 h-5 ${activeTab === 'REPORTS' ? 'text-white' : 'text-slate-400 group-hover:text-[#2c4aa0]'}`} /> 
              <span>Báo cáo</span>
            </button>
        </div>
      </div>

      <div className="flex-1 space-y-8">
        {activeTab === 'DASHBOARD' && renderDashboard()}
        {activeTab === 'FUEL' && renderFuelManagement()}
        {activeTab === 'SALARY' && renderSalaryManagement()}
        {activeTab === 'OPERATION' && renderOperationManagement()}
        {activeTab === 'ADVANCES' && renderAdvanceManagement()}
        {activeTab === 'USERS' && renderUserManagement()}
        {activeTab === 'REPORTS' && renderReports()}
      </div>
    </div>
  );

  const DriverView = () => (
    <div className="max-w-xl mx-auto space-y-8 animate-fade-in">
        <div className="bg-white rounded-2xl p-1.5 border border-gray-100 shadow-sm flex sticky top-20 z-10 backdrop-blur-md bg-white/90">
            <button onClick={() => setDriverTab('FUEL')} className={`flex-1 flex flex-col items-center justify-center py-3 rounded-xl transition-all ${driverTab === 'FUEL' ? 'bg-[#2c4aa0] text-white shadow-lg shadow-blue-200' : 'text-slate-400 hover:bg-slate-50'}`}>
              <IconGasPump className="w-6 h-6 mb-1" />
              <span className="text-[10px] font-bold uppercase">Đổ dầu</span>
            </button>
            <button onClick={() => setDriverTab('ADVANCE')} className={`flex-1 flex flex-col items-center justify-center py-3 rounded-xl transition-all ${driverTab === 'ADVANCE' ? 'bg-[#2c4aa0] text-white shadow-lg shadow-blue-200' : 'text-slate-400 hover:bg-slate-50'}`}>
              <IconWallet className="w-6 h-6 mb-1" />
              <span className="text-[10px] font-bold uppercase">Tạm ứng</span>
            </button>
            <button onClick={() => setDriverTab('SALARY')} className={`flex-1 flex flex-col items-center justify-center py-3 rounded-xl transition-all ${driverTab === 'SALARY' ? 'bg-[#2c4aa0] text-white shadow-lg shadow-blue-200' : 'text-slate-400 hover:bg-slate-50'}`}>
              <IconCurrency className="w-6 h-6 mb-1" />
              <span className="text-[10px] font-bold uppercase">Lương</span>
            </button>
        </div>

        {driverTab === 'FUEL' && (
            <div className="space-y-6">
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
                        <IconTruck className="w-6 h-6"/> {autoAssignedVehicle || 'CHƯA PHÂN CÔNG'}
                      </div>
                      {!autoAssignedVehicle && <p className="text-[10px] mt-2 text-rose-500 font-bold">* Vui lòng liên hệ Admin để phân công xe.</p>}
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">Ghi chú (Số KM / Lý do)</label>
                      <textarea rows={3} placeholder="Ví dụ: Đã chạy được 5000km, cần đổ đầy chuẩn bị đi chuyến..." value={newRequestNote} onChange={e=>setNewRequestNote(e.target.value)} className="w-full p-3 border border-gray-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 transition-all text-sm" />
                    </div>
                    <Button onClick={handleDriverSubmit} className="w-full py-4 text-base shadow-xl shadow-blue-200" disabled={!autoAssignedVehicle}>Gửi yêu cầu duyệt ngay</Button>
                  </div>
                </Card>
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-gray-500 px-2 flex items-center gap-2"><IconDocument className="w-4 h-4"/> Lịch sử yêu cầu gần đây</h3>
                  {requests.filter(r=>r.driverName===currentUser?.fullName).map(req=>(
                    <Card key={req.id} className="p-4 border-l-4 border-slate-200 group hover:border-[#2c4aa0] transition-all">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <div className="text-[10px] font-bold text-slate-400 uppercase">{formatDate(req.requestDate)}</div>
                          <div className="font-black text-lg text-slate-800 tracking-tight">{req.licensePlate}</div>
                          {req.status==='APPROVED' && (
                            <div className="mt-2 text-[#2c4aa0] font-black text-xl">
                              {req.isFullTank ? 'ĐẦY BÌNH' : formatCurrency(req.approvedAmount||0)}
                            </div>
                          )}
                        </div>
                        <Badge status={req.status}/>
                      </div>
                    </Card>
                  ))}
                </div>
            </div>
        )}
        
        {driverTab === 'SALARY' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-500 px-2 flex items-center gap-2"><IconCurrency className="w-4 h-4"/> Bảng lương chuyến chi tiết</h3>
              {salaryRecords.filter(s=>s.driverName===currentUser?.fullName).map(s=>(
                <Card key={s.id} className="p-5 hover:scale-[1.02] transition-transform">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-[11px] font-bold text-blue-500 bg-blue-50 px-2 py-1 rounded-lg uppercase">{s.cargoType}</span>
                    <span className="text-[10px] font-bold text-gray-300">{formatDate(s.transportDate)}</span>
                  </div>
                  <div className="flex justify-between items-end">
                    <div>
                      <div className="text-[10px] uppercase font-bold text-gray-400 mb-1">Số Cont/DO</div>
                      <div className="font-black text-slate-800 font-mono text-lg">{s.refNumber}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] font-bold text-emerald-500 uppercase">Thanh toán</div>
                      <div className="text-2xl font-black text-[#2c4aa0] tracking-tight">{formatCurrency(s.salary+s.handlingFee)}</div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
        )}

        {driverTab === 'ADVANCE' && (
          <div className="space-y-6">
            <Card className="border-t-4 border-amber-400">
               <h2 className="text-xl font-black text-amber-600 mb-6 flex items-center gap-2">Xin tạm ứng chi phí</h2>
               <div className="space-y-4">
                 <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase mb-1.5 block">Số tiền (VNĐ)</label>
                    <input type="number" placeholder="Nhập số tiền..." value={adminAdvAmount} onChange={e => setAdminAdvAmount(e.target.value)} className="w-full p-3 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-amber-100 outline-none transition-all font-bold text-amber-700" />
                 </div>
                 <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase mb-1.5 block">Mục đích tạm ứng</label>
                    <select className="w-full p-3 border border-gray-200 rounded-2xl outline-none focus:ring-4 focus:ring-amber-100 transition-all font-bold" value={adminAdvType} onChange={e => setAdminAdvType(e.target.value)}>
                      <option value="">-- Chọn lý do --</option>
                      {advanceTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                 </div>
                 <Button className="w-full py-4 text-base bg-amber-600 hover:bg-amber-700 shadow-xl shadow-amber-200" onClick={handleAdminCreateAdvance}>Gửi yêu cầu tạm ứng</Button>
               </div>
            </Card>
          </div>
        )}
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
          <p className="text-[10px] text-slate-300 font-bold uppercase tracking-tighter">Phiên bản 2.0.4. © 2024 Hiệp Phát Logistics</p>
        </div>
      </Card>
    </div>
  );

  if (!currentUser) return renderLogin();

  return (
    <div className="min-h-screen pb-12" style={{ backgroundColor: BG_COLOR }}>
      <header className="bg-white/80 backdrop-blur-lg shadow-sm border-b border-gray-100 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#2c4aa0] rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
              <IconGasPump className="w-6 h-6 text-white" />
            </div>
            <div className="hidden sm:block">
              <span className="text-[#2c4aa0] font-black text-xl tracking-tighter">HIEPPHAT</span>
              <span className="text-gray-300 font-bold text-xs ml-1 tracking-widest uppercase">ERP v2.0</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
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
            <div className="h-8 w-[1px] bg-slate-200 hidden sm:block mx-2"></div>
            <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-rose-500 transition-colors" title="Đăng xuất">
              <IconXCircle className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        {currentUser.role === 'DRIVER' ? DriverView() : AdminView()}
      </main>

      {/* Modals */}
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

      {showImportModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full p-8 flex flex-col max-h-[90vh] border-none">
            <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
              <h3 className="text-2xl font-black text-slate-800">Import từ Google Sheets</h3>
              <button onClick={()=>setShowImportModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><IconXCircle className="w-8 h-8 text-slate-300 hover:text-rose-500"/></button>
            </div>
            {importPreviewRecords.length === 0 ? (
                <>
                    <textarea className="w-full flex-1 p-4 border border-gray-200 rounded-3xl font-mono text-[11px] outline-none focus:ring-4 focus:ring-blue-100 transition-all resize-none" placeholder="Dán dữ liệu vào đây (Ctrl+V)..." value={importText} onChange={e=>setImportText(e.target.value)} />
                    <div className="flex gap-4 mt-8">
                      <Button variant="ghost" className="flex-1" onClick={()=>setShowImportModal(false)}>Hủy bỏ</Button>
                      <Button onClick={handleParseImport} className="flex-[2] py-4">Kiểm tra dữ liệu</Button>
                    </div>
                </>
            ) : (
                <div className="flex flex-col flex-1 overflow-hidden">
                    <div className="overflow-auto flex-1 border border-gray-100 rounded-2xl bg-slate-50/50">
                      <table className="w-full text-left text-[10px] border-collapse">
                        <thead className="bg-slate-100 sticky top-0 z-10 border-b border-gray-200">
                          <tr><th className="p-2 uppercase font-bold text-gray-500">Tài xế</th><th className="p-2 uppercase font-bold text-gray-500">Số Cont</th><th className="p-2 text-right uppercase font-bold text-gray-500">Lương chuyến</th></tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {importPreviewRecords.map((r,i)=>(<tr key={i} className="hover:bg-white"><td className="p-2 font-semibold">{r.driverName}</td><td className="p-2 font-mono text-blue-600">{r.refNumber}</td><td className="p-2 text-right font-bold">{formatCurrency(r.salary)}</td></tr>))}
                        </tbody>
                      </table>
                    </div>
                    <div className="flex gap-4 mt-8">
                      <Button variant="ghost" className="flex-1" onClick={()=>setImportPreviewRecords([])}>Quay lại sửa</Button>
                      <Button onClick={handleConfirmImport} className="flex-[2] py-4">Xác nhận Lưu ({importPreviewRecords.length} dòng)</Button>
                    </div>
                </div>
            )}
          </div>
        </div>
      )}

      {editingSalaryRecord && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-auto border-none shadow-2xl scale-in">
              <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-4">
                  <h3 className="text-2xl font-black text-slate-800 tracking-tight">Chi tiết chuyến vận chuyển</h3>
                  <button onClick={() => setEditingSalaryRecord(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><IconXCircle className="w-8 h-8 text-slate-300 hover:text-rose-500" /></button>
              </div>
              <form onSubmit={handleSaveSalaryRecord} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Ngày vận chuyển</label>
                  <input name="transportDate" type="date" required defaultValue={editingSalaryRecord.transportDate} className="w-full p-3 border border-gray-200 rounded-2xl text-sm focus:ring-4 focus:ring-blue-100 outline-none transition-all" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Họ tên Tài xế</label>
                  <input name="driverName" required defaultValue={editingSalaryRecord.driverName} className="w-full p-3 border border-gray-200 rounded-2xl text-sm focus:ring-4 focus:ring-blue-100 outline-none transition-all" />
                </div>
                <div className="md:col-span-2 grid grid-cols-2 gap-6 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="col-span-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Mức lương cơ bản</label>
                    <input name="salary" type="number" required defaultValue={editingSalaryRecord.salary} className="w-full p-3 border border-gray-200 rounded-2xl text-sm font-black text-[#2c4aa0] focus:ring-4 focus:ring-blue-100 outline-none transition-all" />
                  </div>
                  <div className="col-span-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Chi phí làm hàng</label>
                    <input name="handlingFee" type="number" defaultValue={editingSalaryRecord.handlingFee} className="w-full p-3 border border-gray-200 rounded-2xl text-sm font-black text-orange-600 focus:ring-4 focus:ring-blue-100 outline-none transition-all" />
                  </div>
                </div>
                <div className="md:col-span-2 flex gap-4 pt-6">
                  <Button variant="ghost" className="flex-1" onClick={() => setEditingSalaryRecord(null)}>Hủy bỏ</Button>
                  <Button type="submit" className="flex-[2] py-4 shadow-lg shadow-blue-200">Cập nhật thông tin</Button>
                </div>
              </form>
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
      `}</style>
    </div>
  );
}
