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
  CargoType
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
const BG_COLOR = '#f5f7fa';
const CURRENT_DRIVER_NAME = 'Nguyễn Văn A'; // Mock logged-in user

const MOCK_STATIONS: GasStation[] = [
  { id: '1', name: 'Petrolimex 01', address: '123 Lê Lợi, Q1' },
  { id: '2', name: 'PVOIL Thủ Đức', address: '456 Xa Lộ Hà Nội' },
  { id: '3', name: 'Comeco Ngã 4', address: '789 Nguyễn Văn Linh' },
];

const MOCK_PRICES: FuelPrice[] = [
  { id: 'p1', date: '2023-10-20', pricePerLiter: 23500 },
  { id: 'p2', date: '2023-10-10', pricePerLiter: 24100 },
  { id: 'p3', date: '2023-10-01', pricePerLiter: 23900 },
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
  { id: 'v1', licensePlate: '51C-123.45', vehicleType: 'Xe Tải 5 Tấn', inspectionDate: '2023-01-10', inspectionExpiryDate: '2024-01-10' },
  { id: 'v2', licensePlate: '59D-987.65', vehicleType: 'Xe Container', inspectionDate: '2023-06-15', inspectionExpiryDate: '2024-06-15' },
  { id: 'v3', licensePlate: '60A-111.22', vehicleType: 'Xe Bán Tải', inspectionDate: '2023-10-15', inspectionExpiryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] }, 
];

const MOCK_ASSIGNMENTS: DriverAssignment[] = [
  { id: 'a1', driverName: 'Nguyễn Văn A', licensePlate: '51C-123.45', startDate: '2023-01-01' },
  { id: 'a2', driverName: 'Trần Văn B', licensePlate: '59D-987.65', startDate: '2023-01-01' },
];

const MOCK_REQUESTS: FuelRequest[] = [
  { id: 'r1', driverName: 'Nguyễn Văn A', licensePlate: '51C-123.45', requestDate: '2023-10-25', status: RequestStatus.PENDING },
  { id: 'r2', driverName: 'Trần Văn B', licensePlate: '59D-987.65', requestDate: '2023-10-24', status: RequestStatus.APPROVED, approvedAmount: 1175000, approvedLiters: 50, stationId: '1', approvalDate: '2023-10-24', isFullTank: false },
  { id: 'r3', driverName: 'Nguyễn Văn A', licensePlate: '51C-123.45', requestDate: '2023-10-02', status: RequestStatus.APPROVED, approvedAmount: 940000, approvedLiters: 40, stationId: '2', approvalDate: '2023-10-02', isFullTank: false },
  // Example of un-updated Full Tank
  { id: 'r4', driverName: 'Nguyễn Văn A', licensePlate: '51C-123.45', requestDate: '2023-10-26', status: RequestStatus.APPROVED, approvedAmount: 0, approvedLiters: 0, stationId: '1', approvalDate: '2023-10-26', isFullTank: true },
];

const MOCK_ADVANCE_TYPES: AdvanceType[] = [
    { id: 'at1', name: 'Chi phí đi đường' },
    { id: 'at2', name: 'Sửa chữa nhỏ' },
    { id: 'at3', name: 'Ăn uống' },
];

const MOCK_ADVANCE_REQUESTS: AdvanceRequest[] = [
    { id: 'ar1', driverName: 'Nguyễn Văn A', requestDate: '2023-10-26', amount: 500000, typeId: 'at1', status: RequestStatus.PENDING },
];

const MOCK_SALARY_RECORDS: SalaryRecord[] = [
  {
    id: 's1',
    driverName: 'Nguyễn Văn A',
    transportDate: '2023-10-26',
    cargoType: 'CONT',
    pickupWarehouse: 'ICD Phước Long',
    pickupLocation: 'Cảng Cát Lái',
    depotLocation: 'Depot 1',
    dropoffLocation: 'KCN Sóng Thần',
    tripSalary: 500000,
    handlingFee: 100000,
    quantityCont20: 1,
    quantityCont40: 0,
    notes: 'Cont nặng'
  },
  {
    id: 's2',
    driverName: 'Trần Văn B',
    transportDate: '2023-10-25',
    cargoType: 'GLASS',
    pickupWarehouse: 'Kho A',
    pickupLocation: 'Nhà máy Bia',
    depotLocation: '-',
    dropoffLocation: 'Bãi xử lý',
    tripSalary: 600000,
    handlingFee: 50000,
    quantityTons: 15.5,
    notes: 'Miểng chai'
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

const getPriceForDate = (date: string, prices: FuelPrice[]): number | null => {
  const sortedPrices = [...prices].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const targetDate = new Date(date).getTime();
  const applicablePrice = sortedPrices.find(p => new Date(p.date).getTime() <= targetDate);
  return applicablePrice ? applicablePrice.pricePerLiter : null;
};

const getAssignedVehicle = (driverName: string, date: string, assignments: DriverAssignment[]): string | null => {
  const targetDate = new Date(date).getTime();
  const validAssignments = assignments.filter(a => 
    a.driverName === driverName && new Date(a.startDate).getTime() <= targetDate
  );
  validAssignments.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
  return validAssignments.length > 0 ? validAssignments[0].licensePlate : null;
};

// Check if inspection expires within 10 days
const checkInspectionExpiry = (expiryDateStr: string): boolean => {
  if (!expiryDateStr) return false;
  const expiry = new Date(expiryDateStr).getTime();
  const now = new Date().getTime();
  const diffTime = expiry - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays <= 10;
};

// --- Components ---

const Button = ({ children, onClick, variant = 'primary', className = '', disabled = false, type = 'button' }: any) => {
  const baseStyle = "px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2";
  const variants: any = {
    primary: `bg-[#2c4aa0] text-white hover:bg-[#1e3475] disabled:opacity-50`,
    secondary: `bg-white text-[#2c4aa0] border border-[#2c4aa0] hover:bg-blue-50`,
    danger: `bg-red-50 text-red-600 hover:bg-red-100`,
    ghost: `bg-transparent text-gray-500 hover:text-[#2c4aa0] hover:bg-gray-100`,
    success: `bg-green-600 text-white hover:bg-green-700`
  };
  return (
    <button type={type} onClick={onClick} className={`${baseStyle} ${variants[variant]} ${className}`} disabled={disabled}>
      {children}
    </button>
  );
};

const Card = ({ children, className = '' }: any) => (
  <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 ${className}`}>
    {children}
  </div>
);

const Badge = ({ status }: { status: RequestStatus }) => {
  const styles = {
    [RequestStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
    [RequestStatus.APPROVED]: 'bg-green-100 text-green-800',
    [RequestStatus.REJECTED]: 'bg-red-100 text-red-800',
  };
  const labels = {
    [RequestStatus.PENDING]: 'Chờ duyệt',
    [RequestStatus.APPROVED]: 'Đã duyệt',
    [RequestStatus.REJECTED]: 'Từ chối',
  };
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[status]}`}>
      {labels[status]}
    </span>
  );
};

// --- Main App Component ---

export default function App() {
  const [role, setRole] = useState<UserRole>('ADMIN');
  const [activeTab, setActiveTab] = useState<AdminTab>('DASHBOARD');
  
  // Data State
  const [requests, setRequests] = useState<FuelRequest[]>(MOCK_REQUESTS);
  const [prices, setPrices] = useState<FuelPrice[]>(MOCK_PRICES);
  const [stations] = useState<GasStation[]>(MOCK_STATIONS);
  const [assignments, setAssignments] = useState<DriverAssignment[]>(MOCK_ASSIGNMENTS);
  const [drivers, setDrivers] = useState<Driver[]>(MOCK_DRIVERS);
  const [vehicles, setVehicles] = useState<Vehicle[]>(MOCK_VEHICLES);
  const [vehicleTypes, setVehicleTypes] = useState<VehicleType[]>(MOCK_VEHICLE_TYPES);
  const [advanceTypes, setAdvanceTypes] = useState<AdvanceType[]>(MOCK_ADVANCE_TYPES);
  const [advanceRequests, setAdvanceRequests] = useState<AdvanceRequest[]>(MOCK_ADVANCE_REQUESTS);
  const [salaryRecords, setSalaryRecords] = useState<SalaryRecord[]>(MOCK_SALARY_RECORDS);
  
  // Management Edit State
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<FuelRequest | null>(null);
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [copyMessage, setCopyMessage] = useState('');
  
  // Admin Fuel Action State
  const [adminAmount, setAdminAmount] = useState<string>('');
  const [adminStation, setAdminStation] = useState<string>('');
  const [isAdminFullTank, setIsAdminFullTank] = useState(false);
  
  // Admin Create Fuel Request State
  const [adminNewDriver, setAdminNewDriver] = useState('');
  const [adminNewDate, setAdminNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [adminNewAmount, setAdminNewAmount] = useState('');
  const [adminNewStation, setAdminNewStation] = useState('');
  const [adminNewNote, setAdminNewNote] = useState('');
  const [adminNewFullTank, setAdminNewFullTank] = useState(false);

  // History Editing State
  const [editingHistoryId, setEditingHistoryId] = useState<string | null>(null);
  const [editingHistoryAmount, setEditingHistoryAmount] = useState<string>('');

  // Advance Request State
  const [newAdvanceDate, setNewAdvanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [newAdvanceAmount, setNewAdvanceAmount] = useState('');
  const [newAdvanceType, setNewAdvanceType] = useState('');
  const [newAdvanceNote, setNewAdvanceNote] = useState('');
  
  // Admin Create Advance State
  const [adminAdvDriver, setAdminAdvDriver] = useState('');
  const [adminAdvDate, setAdminAdvDate] = useState(new Date().toISOString().split('T')[0]);
  const [adminAdvAmount, setAdminAdvAmount] = useState('');
  const [adminAdvType, setAdminAdvType] = useState('');
  const [adminAdvNote, setAdminAdvNote] = useState('');

  // Salary Form State
  const [newSalaryCargoType, setNewSalaryCargoType] = useState<CargoType>('CONT');

  // Driver Tab State (for mobile view or separate menus if needed)
  const [driverTab, setDriverTab] = useState<'FUEL' | 'ADVANCE'>('FUEL');


  // New Request State (Driver)
  const [newRequestDate, setNewRequestDate] = useState(new Date().toISOString().split('T')[0]);
  const [newRequestNote, setNewRequestNote] = useState('');

  // Report State
  const [reportStartDate, setReportStartDate] = useState('2023-10-01');
  const [reportEndDate, setReportEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Derived State
  const autoAssignedVehicle = useMemo(() => {
    return getAssignedVehicle(CURRENT_DRIVER_NAME, newRequestDate, assignments);
  }, [newRequestDate, assignments]);

  const adminAutoVehicle = useMemo(() => {
    if (!adminNewDriver) return null;
    return getAssignedVehicle(adminNewDriver, adminNewDate, assignments);
  }, [adminNewDriver, adminNewDate, assignments]);

  // --- CRUD Actions: Drivers ---

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

  const handleEditDriver = (driver: Driver) => {
      setEditingDriver(driver);
  };

  const handleDeleteDriver = (id: string) => {
      if (window.confirm("Bạn có chắc chắn muốn xóa tài xế này?")) {
          setDrivers(drivers.filter(d => d.id !== id));
          if (editingDriver?.id === id) setEditingDriver(null);
      }
  };

  // --- CRUD Actions: Vehicles ---

  const handleSaveVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const licensePlate = formData.get('licensePlate') as string;
    const vehicleType = formData.get('vehicleType') as string;
    const inspectionDate = formData.get('inspectionDate') as string;
    const inspectionExpiryDate = formData.get('inspectionExpiryDate') as string;

    if (editingVehicle) {
        setVehicles(vehicles.map(v => v.id === editingVehicle.id ? { ...editingVehicle, licensePlate: licensePlate.toUpperCase(), vehicleType, inspectionDate, inspectionExpiryDate } : v));
        setEditingVehicle(null);
    } else {
        setVehicles([...vehicles, { id: Math.random().toString(), licensePlate: licensePlate.toUpperCase(), vehicleType, inspectionDate, inspectionExpiryDate }]);
    }
    (e.target as HTMLFormElement).reset();
  };

  const handleEditVehicle = (vehicle: Vehicle) => {
      setEditingVehicle(vehicle);
  };

  const handleDeleteVehicle = (id: string) => {
      if (window.confirm("Bạn có chắc chắn muốn xóa xe này?")) {
          setVehicles(vehicles.filter(v => v.id !== id));
          if (editingVehicle?.id === id) setEditingVehicle(null);
      }
  };

  // --- Actions: Vehicle Types ---
  const handleAddVehicleType = (e: React.FormEvent) => {
      e.preventDefault();
      const formData = new FormData(e.target as HTMLFormElement);
      const name = formData.get('name') as string;
      if (name) {
          setVehicleTypes([...vehicleTypes, { id: Math.random().toString(), name }]);
          (e.target as HTMLFormElement).reset();
      }
  };

  const handleDeleteVehicleType = (id: string) => {
      if (window.confirm("Xóa loại xe này?")) {
          setVehicleTypes(vehicleTypes.filter(vt => vt.id !== id));
      }
  };
  
  // --- Actions: Advance Types ---
  const handleAddAdvanceType = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const name = formData.get('name') as string;
    if (name) {
      setAdvanceTypes([...advanceTypes, { id: Math.random().toString(), name }]);
      (e.target as HTMLFormElement).reset();
    }
  };
  
  const handleDeleteAdvanceType = (id: string) => {
    if (window.confirm("Xóa loại tạm ứng này?")) {
      setAdvanceTypes(advanceTypes.filter(t => t.id !== id));
    }
  };

  // --- Salary Actions ---
  const handleAddSalary = (e: React.FormEvent) => {
      e.preventDefault();
      const formData = new FormData(e.target as HTMLFormElement);
      
      const newRecord: SalaryRecord = {
          id: Math.random().toString(),
          driverName: formData.get('driverName') as string,
          transportDate: formData.get('transportDate') as string,
          cargoType: newSalaryCargoType,
          pickupWarehouse: formData.get('pickupWarehouse') as string,
          pickupLocation: formData.get('pickupLocation') as string,
          depotLocation: formData.get('depotLocation') as string,
          dropoffLocation: formData.get('dropoffLocation') as string,
          tripSalary: Number(formData.get('tripSalary')),
          handlingFee: Number(formData.get('handlingFee')),
          notes: formData.get('notes') as string
      };

      if (newSalaryCargoType === 'CONT') {
          newRecord.quantityCont20 = Number(formData.get('quantityCont20')) || 0;
          newRecord.quantityCont40 = Number(formData.get('quantityCont40')) || 0;
      } else if (newSalaryCargoType === 'PALLET' || newSalaryCargoType === 'TRANSFER') {
          newRecord.quantityPallet = Number(formData.get('quantityPallet')) || 0;
      } else if (newSalaryCargoType === 'GLASS') {
          newRecord.quantityTons = Number(formData.get('quantityTons')) || 0;
      }

      setSalaryRecords([newRecord, ...salaryRecords]);
      (e.target as HTMLFormElement).reset();
      // Reset Select to default to trigger UI update if needed, though we track state
      setNewSalaryCargoType('CONT');
      alert("Đã lưu bảng lương!");
  };

  const handleDeleteSalary = (id: string) => {
      if (window.confirm("Xóa dòng lương này?")) {
          setSalaryRecords(salaryRecords.filter(r => r.id !== id));
      }
  };

  // --- Fuel Actions ---

  const handleDriverSubmit = () => {
    if (!autoAssignedVehicle) {
      alert('Bạn chưa được phân công xe cho ngày này. Vui lòng liên hệ Admin.');
      return;
    }
    const newReq: FuelRequest = {
      id: Math.random().toString(36).substr(2, 9),
      driverName: CURRENT_DRIVER_NAME,
      licensePlate: autoAssignedVehicle,
      requestDate: newRequestDate,
      status: RequestStatus.PENDING,
      notes: newRequestNote,
    };
    setRequests([newReq, ...requests]);
    setNewRequestNote('');
    alert('Đã gửi yêu cầu thành công!');
  };

  const handleAdminCreateRequest = () => {
    if (!adminNewDriver || (!adminNewAmount && !adminNewFullTank) || !adminNewStation || !adminAutoVehicle) {
      alert("Vui lòng nhập đầy đủ thông tin: Tài xế, Trạm, Số tiền và đảm bảo có xe phân công.");
      return;
    }
    const price = getPriceForDate(adminNewDate, prices);
    if (!price) {
      alert(`Chưa có giá dầu cho ngày ${formatDate(adminNewDate)}.`);
      return;
    }
    
    // Logic: If Full Tank selected during creation -> Amount = 0.
    // Logic: If not Full Tank -> Amount is entered in Millions
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
      approvalDate: new Date().toISOString().split('T')[0],
      isFullTank: adminNewFullTank
    };
    setRequests([newReq, ...requests]);
    setAdminNewDriver('');
    setAdminNewAmount('');
    setAdminNewNote('');
    setAdminNewFullTank(false);
    
    // Copy Logic
    const amountText = adminNewFullTank ? "Đầy bình" : formatCurrency(finalAmount);
    const formattedMsg = `Xe: ${newReq.licensePlate}\nNgày: ${formatDate(newReq.requestDate)}\nDuyệt: ${amountText}`;
    setCopyMessage(formattedMsg);
    setShowCopyModal(true);
  };

  const openApprovalModal = (req: FuelRequest) => {
    setSelectedRequest(req);
    setAdminAmount('');
    setAdminStation('');
    setIsAdminFullTank(false);
    setIsModalOpen(true);
  };

  const handleApprove = () => {
    if (!selectedRequest || (!adminAmount && !isAdminFullTank) || !adminStation) return;
    const price = getPriceForDate(selectedRequest.requestDate, prices);
    if (!price) {
        alert("Thiếu giá dầu!"); 
        return;
    }
    
    // Approval Logic: If Full Tank -> Amount 0. Else -> Amount in Millions * 1M
    const finalAmount = isAdminFullTank ? 0 : (parseFloat(adminAmount) * 1000000);
    const liters = isAdminFullTank ? 0 : finalAmount / price;
    
    const updatedReq: FuelRequest = {
      ...selectedRequest,
      status: RequestStatus.APPROVED,
      approvedAmount: finalAmount,
      approvedLiters: parseFloat(liters.toFixed(2)),
      stationId: adminStation,
      approvalDate: new Date().toISOString().split('T')[0],
      isFullTank: isAdminFullTank
    };
    setRequests(requests.map(r => r.id === updatedReq.id ? updatedReq : r));
    setIsModalOpen(false);
    setSelectedRequest(null);
    
    // Copy Logic
    const amountText = isAdminFullTank ? "Đầy bình" : formatCurrency(finalAmount);
    const formattedMsg = `Xe: ${updatedReq.licensePlate}\nNgày: ${formatDate(updatedReq.requestDate)}\nDuyệt: ${amountText}`;
    setCopyMessage(formattedMsg);
    setShowCopyModal(true);
  };

  const handleUpdateHistoryAmount = (id: string) => {
      const request = requests.find(r => r.id === id);
      if (!request || !editingHistoryAmount) return;
      
      const price = getPriceForDate(request.requestDate, prices);
      if (!price) {
          alert("Không tìm thấy giá dầu cho ngày này!");
          return;
      }

      // Input in History is already actual amount (VND), not millions, for precision
      // Or should we keep consistency? Let's assume input in table is in Millions for consistency.
      const amount = parseFloat(editingHistoryAmount) * 1000000;
      const liters = amount / price;

      const updatedReq = {
          ...request,
          approvedAmount: amount,
          approvedLiters: parseFloat(liters.toFixed(2))
      };
      
      setRequests(requests.map(r => r.id === id ? updatedReq : r));
      setEditingHistoryId(null);
      setEditingHistoryAmount('');
  };

  const handleReject = () => {
    if (!selectedRequest) return;
    const updatedReq: FuelRequest = { ...selectedRequest, status: RequestStatus.REJECTED };
    setRequests(requests.map(r => r.id === updatedReq.id ? updatedReq : r));
    setIsModalOpen(false);
    setSelectedRequest(null);
  };

  const handleAddPrice = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const date = formData.get('date') as string;
    const price = formData.get('price') as string;
    if (date && price) {
      setPrices([...prices, { id: Math.random().toString(), date, pricePerLiter: Number(price) }]);
      (e.target as HTMLFormElement).reset();
    }
  };

  const handleAddAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const driverName = formData.get('driverName') as string;
    const licensePlate = formData.get('licensePlate') as string;
    const startDate = formData.get('startDate') as string;
    if (driverName && licensePlate && startDate) {
      setAssignments([...assignments, { id: Math.random().toString(), driverName, licensePlate: licensePlate.toUpperCase(), startDate }]);
      (e.target as HTMLFormElement).reset();
    }
  };
  
  const handleCopy = () => {
    navigator.clipboard.writeText(copyMessage);
    alert('Đã copy nội dung!');
    setShowCopyModal(false);
  };

  // --- Advance Actions ---
  
  const handleDriverAdvanceSubmit = () => {
      if (!newAdvanceAmount || !newAdvanceType) {
          alert("Vui lòng nhập số tiền và chọn loại tạm ứng");
          return;
      }
      const newReq: AdvanceRequest = {
          id: Math.random().toString(),
          driverName: CURRENT_DRIVER_NAME,
          requestDate: new Date().toISOString().split('T')[0],
          amount: parseFloat(newAdvanceAmount),
          typeId: newAdvanceType,
          status: RequestStatus.PENDING,
          notes: newAdvanceNote
      };
      setAdvanceRequests([newReq, ...advanceRequests]);
      setNewAdvanceAmount('');
      setNewAdvanceNote('');
      alert("Đã gửi yêu cầu tạm ứng!");
  };

  const handleAdminCreateAdvance = () => {
     if (!adminAdvDriver || !adminAdvAmount || !adminAdvType) {
         alert("Vui lòng nhập đủ thông tin.");
         return;
     }
     const newReq: AdvanceRequest = {
         id: Math.random().toString(),
         driverName: adminAdvDriver,
         requestDate: adminAdvDate,
         amount: parseFloat(adminAdvAmount),
         typeId: adminAdvType,
         status: RequestStatus.APPROVED,
         notes: adminAdvNote,
         approvalDate: new Date().toISOString().split('T')[0]
     };
     setAdvanceRequests([newReq, ...advanceRequests]);
     setAdminAdvAmount('');
     setAdminAdvNote('');
     alert("Đã tạo và duyệt phiếu tạm ứng!");
  };
  
  const handleApproveAdvance = (id: string) => {
      setAdvanceRequests(advanceRequests.map(r => r.id === id ? {...r, status: RequestStatus.APPROVED, approvalDate: new Date().toISOString().split('T')[0]} : r));
  };

  const handleRejectAdvance = (id: string) => {
    setAdvanceRequests(advanceRequests.map(r => r.id === id ? {...r, status: RequestStatus.REJECTED} : r));
  };
  
  // --- Report Actions ---
  
  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setAiAnalysis('');
    const filtered = requests.filter(r => {
        const d = new Date(r.requestDate);
        return d >= new Date(reportStartDate) && d <= new Date(reportEndDate);
    });
    try {
        const result = await analyzeFuelData(filtered, prices);
        setAiAnalysis(result);
    } catch (e) {
        setAiAnalysis("Lỗi khi phân tích.");
    } finally {
        setIsAnalyzing(false);
    }
  };

  // --- Views ---

  const renderSalaryManagement = () => (
      <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* Form Input */}
              <div className="xl:col-span-1">
                  <Card className="sticky top-24">
                      <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                          <IconPlus className="w-5 h-5 text-[#2c4aa0]" /> Thêm Lương chuyến
                      </h2>
                      <form onSubmit={handleAddSalary} className="space-y-3">
                          <div>
                              <label className="text-xs font-semibold text-gray-600">Tài xế</label>
                              <select name="driverName" required className="w-full p-2 text-sm border rounded bg-white">
                                  <option value="">-- Chọn tài xế --</option>
                                  {drivers.map(d => <option key={d.id} value={d.fullName}>{d.fullName}</option>)}
                              </select>
                          </div>
                          <div>
                              <label className="text-xs font-semibold text-gray-600">Ngày Vận chuyển</label>
                              <input name="transportDate" type="date" required className="w-full p-2 text-sm border rounded" defaultValue={new Date().toISOString().split('T')[0]}/>
                          </div>
                          
                          <div className="border-t pt-3">
                              <label className="text-xs font-semibold text-gray-600">Loại hàng</label>
                              <select 
                                  name="cargoType" 
                                  required 
                                  className="w-full p-2 text-sm border rounded bg-white mb-2"
                                  value={newSalaryCargoType}
                                  onChange={(e) => setNewSalaryCargoType(e.target.value as CargoType)}
                              >
                                  <option value="CONT">Container</option>
                                  <option value="PALLET">Pallet</option>
                                  <option value="TRANSFER">Chuyển kho</option>
                                  <option value="GLASS">Miểng chai</option>
                              </select>
                              
                              {/* Dynamic Input Fields based on Cargo Type */}
                              <div className="grid grid-cols-2 gap-2 bg-gray-50 p-2 rounded border mb-2">
                                  {newSalaryCargoType === 'CONT' && (
                                      <>
                                          <div>
                                              <label className="text-xs text-gray-500">SL Cont 20</label>
                                              <input name="quantityCont20" type="number" min="0" className="w-full p-1 text-sm border rounded" placeholder="0" />
                                          </div>
                                          <div>
                                              <label className="text-xs text-gray-500">SL Cont 40</label>
                                              <input name="quantityCont40" type="number" min="0" className="w-full p-1 text-sm border rounded" placeholder="0" />
                                          </div>
                                      </>
                                  )}
                                  {(newSalaryCargoType === 'PALLET' || newSalaryCargoType === 'TRANSFER') && (
                                      <div className="col-span-2">
                                          <label className="text-xs text-gray-500">Số lượng Pallet</label>
                                          <input name="quantityPallet" type="number" min="0" className="w-full p-1 text-sm border rounded" placeholder="0" />
                                      </div>
                                  )}
                                  {newSalaryCargoType === 'GLASS' && (
                                      <div className="col-span-2">
                                          <label className="text-xs text-gray-500">Khối lượng (Tấn)</label>
                                          <input name="quantityTons" type="number" step="0.01" min="0" className="w-full p-1 text-sm border rounded" placeholder="0.00" />
                                      </div>
                                  )}
                              </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                              <div>
                                  <label className="text-xs text-gray-500">Kho Đóng / Nhập</label>
                                  <input name="pickupWarehouse" required className="w-full p-2 text-sm border rounded" placeholder="Kho..." />
                              </div>
                              <div>
                                  <label className="text-xs text-gray-500">Địa điểm Kho</label>
                                  <input name="pickupLocation" required className="w-full p-2 text-sm border rounded" placeholder="Địa chỉ..." />
                              </div>
                              <div>
                                  <label className="text-xs text-gray-500">Depot Lấy Rỗng/Full</label>
                                  <input name="depotLocation" required className="w-full p-2 text-sm border rounded" placeholder="Depot..." />
                              </div>
                              <div>
                                  <label className="text-xs text-gray-500">Hạ Cont/Trả Rỗng</label>
                                  <input name="dropoffLocation" required className="w-full p-2 text-sm border rounded" placeholder="Nơi hạ..." />
                              </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2 border-t pt-3">
                              <div>
                                  <label className="text-xs font-bold text-[#2c4aa0]">Lương chuyến</label>
                                  <input name="tripSalary" type="number" required className="w-full p-2 text-sm border rounded font-bold" placeholder="VNĐ" />
                              </div>
                              <div>
                                  <label className="text-xs font-bold text-gray-600">Tiền làm hàng</label>
                                  <input name="handlingFee" type="number" className="w-full p-2 text-sm border rounded" placeholder="VNĐ" defaultValue="0" />
                              </div>
                          </div>
                          
                          <div>
                              <label className="text-xs text-gray-500">Ghi chú</label>
                              <input name="notes" className="w-full p-2 text-sm border rounded" />
                          </div>

                          <Button type="submit" className="w-full">Lưu Lương chuyến</Button>
                      </form>
                  </Card>
              </div>

              {/* List View */}
              <div className="xl:col-span-2">
                  <Card>
                      <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                          <IconCurrency className="w-5 h-5 text-[#2c4aa0]" /> Bảng kê Lương tài xế
                      </h2>
                      <div className="overflow-x-auto">
                          <table className="w-full text-left text-sm text-gray-600">
                              <thead className="bg-gray-50 text-gray-900 font-semibold border-b">
                                  <tr>
                                      <th className="p-2 whitespace-nowrap">Ngày / Tài xế</th>
                                      <th className="p-2">Hành trình</th>
                                      <th className="p-2 text-center">Chi tiết hàng</th>
                                      <th className="p-2 text-right">Chi phí</th>
                                      <th className="p-2 text-center">Xóa</th>
                                  </tr>
                              </thead>
                              <tbody>
                                  {salaryRecords.sort((a,b) => new Date(b.transportDate).getTime() - new Date(a.transportDate).getTime()).map(rec => (
                                      <tr key={rec.id} className="border-b hover:bg-gray-50">
                                          <td className="p-2 align-top">
                                              <div className="font-bold text-gray-800">{formatDate(rec.transportDate)}</div>
                                              <div className="text-xs text-[#2c4aa0]">{rec.driverName}</div>
                                              <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] mt-1 font-bold 
                                                  ${rec.cargoType === 'CONT' ? 'bg-blue-100 text-blue-800' : 
                                                  rec.cargoType === 'GLASS' ? 'bg-orange-100 text-orange-800' : 'bg-purple-100 text-purple-800'}`}>
                                                  {rec.cargoType === 'CONT' ? 'CONTAINER' : 
                                                   rec.cargoType === 'GLASS' ? 'MIỂNG CHAI' : 
                                                   rec.cargoType === 'TRANSFER' ? 'CHUYỂN KHO' : 'PALLET'}
                                              </span>
                                          </td>
                                          <td className="p-2 align-top text-xs space-y-1">
                                              <div><span className="text-gray-400">Kho:</span> {rec.pickupWarehouse} - {rec.pickupLocation}</div>
                                              <div><span className="text-gray-400">Depot:</span> {rec.depotLocation}</div>
                                              <div><span className="text-gray-400">Hạ:</span> {rec.dropoffLocation}</div>
                                          </td>
                                          <td className="p-2 align-top text-center">
                                              {rec.cargoType === 'CONT' && (
                                                  <div className="flex flex-col gap-1">
                                                      {rec.quantityCont20 > 0 && <span className="bg-gray-100 px-1 rounded text-xs border">20': {rec.quantityCont20}</span>}
                                                      {rec.quantityCont40 > 0 && <span className="bg-gray-100 px-1 rounded text-xs border">40': {rec.quantityCont40}</span>}
                                                  </div>
                                              )}
                                              {(rec.cargoType === 'PALLET' || rec.cargoType === 'TRANSFER') && (
                                                  <span className="font-bold">{rec.quantityPallet} Pallet</span>
                                              )}
                                              {rec.cargoType === 'GLASS' && (
                                                  <span className="font-bold text-orange-600">{rec.quantityTons} Tấn</span>
                                              )}
                                          </td>
                                          <td className="p-2 align-top text-right">
                                              <div className="font-bold text-[#2c4aa0]">{formatCurrency(rec.tripSalary)}</div>
                                              {rec.handlingFee > 0 && (
                                                  <div className="text-xs text-gray-500">+ {formatCurrency(rec.handlingFee)} (LH)</div>
                                              )}
                                          </td>
                                          <td className="p-2 align-top text-center">
                                              <button onClick={() => handleDeleteSalary(rec.id)} className="text-gray-400 hover:text-red-500">
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
      </div>
  );

  const renderOperationManagement = () => (
    <div className="space-y-6 animate-fade-in">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Driver Management */}
            <div className="space-y-6">
                <Card>
                    <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <IconPlus className="w-5 h-5 text-[#2c4aa0]" /> {editingDriver ? 'Cập nhật Tài xế' : 'Thêm Tài xế'}
                    </h2>
                    <form onSubmit={handleSaveDriver} className="space-y-3">
                    <input 
                        name="fullName" 
                        placeholder="Họ và tên" 
                        required 
                        defaultValue={editingDriver?.fullName} 
                        className="w-full p-2 text-sm border rounded" 
                    />
                    <input 
                        name="phoneNumber" 
                        placeholder="Số điện thoại" 
                        defaultValue={editingDriver?.phoneNumber}
                        className="w-full p-2 text-sm border rounded" 
                    />
                    <input 
                        name="licenseNumber" 
                        placeholder="Số GPLX" 
                        required 
                        defaultValue={editingDriver?.licenseNumber}
                        className="w-full p-2 text-sm border rounded" 
                    />
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                        <label className="text-xs text-gray-500">Ngày cấp</label>
                        <input name="issueDate" type="date" defaultValue={editingDriver?.issueDate} className="w-full p-2 text-sm border rounded" />
                        </div>
                        <div>
                        <label className="text-xs text-gray-500">Ngày hết hạn</label>
                        <input name="expiryDate" type="date" required defaultValue={editingDriver?.expiryDate} className="w-full p-2 text-sm border rounded" />
                        </div>
                    </div>
                    <div className="flex gap-2">
                        {editingDriver && (
                            <Button variant="ghost" onClick={() => setEditingDriver(null)} className="flex-1 text-xs">Hủy</Button>
                        )}
                        <Button type="submit" variant="secondary" className="flex-1 text-xs">{editingDriver ? 'Lưu thay đổi' : 'Thêm tài xế'}</Button>
                    </div>
                    </form>
                </Card>

                <Card>
                    <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <IconUsers className="w-5 h-5 text-[#2c4aa0]" /> Danh sách Tài xế
                    </h2>
                    <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="bg-gray-50 text-gray-900 font-semibold border-b">
                        <tr>
                            <th className="p-2">Họ tên</th>
                            <th className="p-2">SĐT</th>
                            <th className="p-2">Tác vụ</th>
                        </tr>
                        </thead>
                        <tbody>
                        {drivers.map(d => (
                            <tr key={d.id} className="border-b last:border-0 hover:bg-gray-50">
                            <td className="p-2 font-medium">{d.fullName}</td>
                            <td className="p-2">{d.phoneNumber}</td>
                            <td className="p-2 flex gap-2">
                                <button onClick={() => handleEditDriver(d)} className="text-blue-600 hover:bg-blue-50 p-1 rounded"><IconEdit className="w-4 h-4" /></button>
                                <button onClick={() => handleDeleteDriver(d.id)} className="text-red-600 hover:bg-red-50 p-1 rounded"><IconTrash className="w-4 h-4" /></button>
                            </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                    </div>
                </Card>
            </div>

            {/* Assignments */}
            <div className="space-y-6">
                <Card>
                    <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <IconUsers className="w-5 h-5 text-[#2c4aa0]" />
                        Thiết lập Vận hành (Phân công xe)
                    </h2>
                    <form onSubmit={handleAddAssignment} className="space-y-3 mb-4">
                        <div className="flex flex-col gap-2">
                            <select name="driverName" required className="w-full p-2 text-sm border rounded bg-white">
                            <option value="">Chọn tài xế</option>
                            {drivers.map(d => <option key={d.id} value={d.fullName}>{d.fullName}</option>)}
                            </select>
                            <select name="licensePlate" required className="w-full p-2 text-sm border rounded bg-white">
                            <option value="">Chọn xe</option>
                            {vehicles.map(v => <option key={v.id} value={v.licensePlate}>{v.licensePlate}</option>)}
                            </select>
                            <input name="startDate" type="date" required className="w-full p-2 text-sm border rounded" title="Ngày bắt đầu" />
                        </div>
                        <Button variant="secondary" className="w-full text-xs">Phân công xe</Button>
                    </form>
                    <div className="max-h-64 overflow-y-auto space-y-2">
                        {assignments.sort((a,b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()).map(a => (
                            <div key={a.id} className="text-xs p-2 bg-gray-50 rounded border-l-2 border-[#2c4aa0]">
                                <div className="font-bold">{a.driverName}</div>
                                <div className="flex justify-between mt-1">
                                    <span className="font-mono bg-white border px-1 rounded">{a.licensePlate}</span>
                                    <span className="text-gray-500">Từ: {formatDate(a.startDate)}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    </div>
  );

  const renderVehicleManagement = () => (
    <div className="space-y-6 animate-fade-in">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Vehicle Type Manager (Mini) */}
            <Card className="h-fit">
                <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <IconTruck className="w-5 h-5 text-[#2c4aa0]" /> Quản lý Loại xe
                </h2>
                <form onSubmit={handleAddVehicleType} className="flex gap-2 mb-4">
                    <input name="name" placeholder="Tên loại xe..." required className="flex-1 p-2 text-sm border rounded" />
                    <Button type="submit" variant="secondary" className="px-3 py-1 text-xs whitespace-nowrap"><IconPlus className="w-4 h-4" /></Button>
                </form>
                <div className="max-h-40 overflow-y-auto space-y-1">
                    {vehicleTypes.map(vt => (
                        <div key={vt.id} className="flex justify-between items-center p-2 bg-gray-50 rounded text-sm group">
                            <span>{vt.name}</span>
                            <button onClick={() => handleDeleteVehicleType(vt.id)} className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                <IconTrash className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
            </Card>

            {/* Vehicle Form */}
            <Card className="md:col-span-2">
                <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <IconPlus className="w-5 h-5 text-[#2c4aa0]" /> {editingVehicle ? 'Cập nhật Phương tiện' : 'Thêm Phương tiện'}
                </h2>
                <form onSubmit={handleSaveVehicle} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input 
                        name="licensePlate" 
                        placeholder="Biển số xe" 
                        required 
                        defaultValue={editingVehicle?.licensePlate}
                        className="w-full p-2 text-sm border rounded uppercase" 
                    />
                    <select 
                        name="vehicleType" 
                        required 
                        defaultValue={editingVehicle?.vehicleType}
                        className="w-full p-2 text-sm border rounded bg-white"
                    >
                        <option value="">-- Chọn loại xe --</option>
                        {vehicleTypes.map(vt => <option key={vt.id} value={vt.name}>{vt.name}</option>)}
                    </select>
                    <div>
                        <label className="text-xs text-gray-500">Ngày Đăng kiểm</label>
                        <input 
                            name="inspectionDate" 
                            type="date" 
                            required 
                            defaultValue={editingVehicle?.inspectionDate}
                            className="w-full p-2 text-sm border rounded" 
                        />
                    </div>
                    <div>
                        <label className="text-xs text-gray-500">Hạn Đăng kiểm</label>
                        <input 
                            name="inspectionExpiryDate" 
                            type="date" 
                            required 
                            defaultValue={editingVehicle?.inspectionExpiryDate}
                            className="w-full p-2 text-sm border rounded" 
                        />
                    </div>
                    <div className="md:col-span-2 flex gap-2">
                        {editingVehicle && (
                            <Button variant="ghost" onClick={() => setEditingVehicle(null)} className="flex-1 text-xs">Hủy</Button>
                        )}
                        <Button type="submit" variant="secondary" className="flex-1 text-xs">{editingVehicle ? 'Lưu thay đổi' : 'Thêm xe'}</Button>
                    </div>
                </form>
            </Card>
        </div>

        {/* Vehicle List */}
        <Card>
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <IconTruck className="w-5 h-5 text-[#2c4aa0]" /> Danh sách Phương tiện
            </h2>
            <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50 text-gray-900 font-semibold border-b">
                <tr>
                    <th className="p-2">Biển số</th>
                    <th className="p-2">Loại xe</th>
                    <th className="p-2">Ngày Đăng kiểm</th>
                    <th className="p-2">Hạn Đăng kiểm</th>
                    <th className="p-2 text-center">Tác vụ</th>
                </tr>
                </thead>
                <tbody>
                {vehicles.map(v => {
                    const isExpiringSoon = checkInspectionExpiry(v.inspectionExpiryDate);
                    return (
                        <tr key={v.id} className={`border-b last:border-0 hover:bg-gray-50 ${isExpiringSoon ? 'bg-red-50' : ''}`}>
                            <td className="p-2 font-bold text-[#2c4aa0]">{v.licensePlate}</td>
                            <td className="p-2">{v.vehicleType}</td>
                            <td className="p-2">{formatDate(v.inspectionDate)}</td>
                            <td className="p-2 flex items-center gap-2">
                                <span className={isExpiringSoon ? 'font-bold text-red-600' : ''}>
                                    {formatDate(v.inspectionExpiryDate)}
                                </span>
                                {isExpiringSoon && (
                                    <div className="relative group">
                                        <IconAlert className="w-4 h-4 text-red-500" />
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block bg-gray-800 text-white text-xs p-1 rounded whitespace-nowrap z-10">
                                            Sắp hết hạn!
                                        </div>
                                    </div>
                                )}
                            </td>
                            <td className="p-2 flex justify-center gap-2">
                                <button onClick={() => handleEditVehicle(v)} className="text-blue-600 hover:bg-blue-50 p-1 rounded"><IconEdit className="w-4 h-4" /></button>
                                <button onClick={() => handleDeleteVehicle(v.id)} className="text-red-600 hover:bg-red-50 p-1 rounded"><IconTrash className="w-4 h-4" /></button>
                            </td>
                        </tr>
                    );
                })}
                </tbody>
            </table>
            </div>
        </Card>
    </div>
  );

  const renderDashboard = () => {
    const pendingFuel = requests.filter(r => r.status === RequestStatus.PENDING).length;
    const pendingAdvance = advanceRequests.filter(r => r.status === RequestStatus.PENDING).length;
    const approvedFuelToday = requests.filter(r => r.status === RequestStatus.APPROVED && r.approvalDate === new Date().toISOString().split('T')[0]).reduce((acc, curr) => acc + (curr.approvedAmount || 0), 0);

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-none">
                    <div className="flex items-start justify-between">
                         <div>
                             <p className="text-blue-100 text-sm font-medium mb-1">Cần duyệt (Dầu)</p>
                             <h3 className="text-3xl font-bold">{pendingFuel}</h3>
                         </div>
                         <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                             <IconGasPump className="w-6 h-6 text-white" />
                         </div>
                    </div>
                </Card>
                 <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-none">
                    <div className="flex items-start justify-between">
                         <div>
                             <p className="text-purple-100 text-sm font-medium mb-1">Cần duyệt (Tạm ứng)</p>
                             <h3 className="text-3xl font-bold">{pendingAdvance}</h3>
                         </div>
                         <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                             <IconWallet className="w-6 h-6 text-white" />
                         </div>
                    </div>
                </Card>
                 <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-none">
                    <div className="flex items-start justify-between">
                         <div>
                             <p className="text-green-100 text-sm font-medium mb-1">Đã cấp hôm nay</p>
                             <h3 className="text-3xl font-bold">{formatCurrency(approvedFuelToday)}</h3>
                         </div>
                         <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                             <IconTrendingUp className="w-6 h-6 text-white" />
                         </div>
                    </div>
                </Card>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <h2 className="text-lg font-bold text-gray-800 mb-4">Hoạt động gần đây</h2>
                    <div className="space-y-4">
                        {requests.slice(0, 5).map(r => (
                            <div key={r.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-full ${r.status === 'APPROVED' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
                                        <IconGasPump className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <div className="font-medium text-sm">{r.driverName}</div>
                                        <div className="text-xs text-gray-500">{formatDate(r.requestDate)} • {r.licensePlate}</div>
                                    </div>
                                </div>
                                <Badge status={r.status} />
                            </div>
                        ))}
                    </div>
                </Card>
                
                 <Card>
                    <h2 className="text-lg font-bold text-gray-800 mb-4">Giá dầu gần đây</h2>
                    <div className="overflow-hidden rounded-lg border">
                         <table className="w-full text-sm text-left">
                             <thead className="bg-gray-50 font-semibold text-gray-700">
                                 <tr>
                                     <th className="p-3">Ngày áp dụng</th>
                                     <th className="p-3 text-right">Giá (VNĐ/Lít)</th>
                                 </tr>
                             </thead>
                             <tbody>
                                 {prices.slice(0, 5).map(p => (
                                     <tr key={p.id} className="border-t">
                                         <td className="p-3">{formatDate(p.date)}</td>
                                         <td className="p-3 text-right font-mono font-medium">{formatCurrency(p.pricePerLiter)}</td>
                                     </tr>
                                 ))}
                             </tbody>
                         </table>
                    </div>
                </Card>
            </div>
        </div>
    );
  };

  const renderFuelManagement = () => (
      <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="xl:col-span-1 space-y-6">
                   {/* Create Admin Request */}
                  <Card>
                      <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                          <IconPlus className="w-5 h-5 text-[#2c4aa0]" /> Tạo phiếu cấp dầu
                      </h2>
                      <div className="space-y-3">
                          <select 
                             value={adminNewDriver} 
                             onChange={(e) => setAdminNewDriver(e.target.value)}
                             className="w-full p-2 text-sm border rounded bg-white"
                          >
                              <option value="">Chọn tài xế</option>
                              {drivers.map(d => <option key={d.id} value={d.fullName}>{d.fullName}</option>)}
                          </select>
                           <input 
                              type="date"
                              value={adminNewDate}
                              onChange={(e) => setAdminNewDate(e.target.value)}
                              className="w-full p-2 text-sm border rounded"
                          />
                          {adminAutoVehicle ? (
                              <div className="text-xs text-[#2c4aa0] font-medium bg-blue-50 p-2 rounded">
                                  Xe: {adminAutoVehicle}
                              </div>
                          ) : adminNewDriver ? (
                              <div className="text-xs text-red-500 bg-red-50 p-2 rounded">Chưa có xe phân công</div>
                          ) : null}

                          <select
                             value={adminNewStation}
                             onChange={(e) => setAdminNewStation(e.target.value)}
                             className="w-full p-2 text-sm border rounded bg-white"
                          >
                              <option value="">Chọn trạm</option>
                              {stations.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                          </select>
                           
                           <div>
                              <div className="flex items-center gap-2 mb-2">
                                  <input 
                                      type="checkbox" 
                                      checked={adminNewFullTank}
                                      onChange={(e) => setAdminNewFullTank(e.target.checked)}
                                      id="newFullTank"
                                  />
                                  <label htmlFor="newFullTank" className="text-sm">Đổ đầy bình</label>
                              </div>
                              {!adminNewFullTank && (
                                  <div className="relative">
                                      <input 
                                          type="number" 
                                          step="0.1"
                                          placeholder="Số tiền (Triệu VNĐ)"
                                          value={adminNewAmount}
                                          onChange={(e) => setAdminNewAmount(e.target.value)}
                                          className="w-full p-2 text-sm border rounded"
                                      />
                                      <span className="absolute right-2 top-2 text-xs text-gray-400">Tr.VNĐ</span>
                                  </div>
                              )}
                           </div>
                           
                           <input 
                              placeholder="Ghi chú"
                              value={adminNewNote}
                              onChange={(e) => setAdminNewNote(e.target.value)}
                              className="w-full p-2 text-sm border rounded"
                          />
                          <Button onClick={handleAdminCreateRequest} className="w-full">Tạo & Duyệt</Button>
                      </div>
                  </Card>

                  {/* Price Management */}
                  <Card>
                      <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                          <IconTrendingUp className="w-5 h-5 text-[#2c4aa0]" /> Cập nhật giá dầu
                      </h2>
                      <form onSubmit={handleAddPrice} className="flex gap-2 mb-4">
                          <input name="date" type="date" required className="w-1/3 p-2 text-sm border rounded" />
                          <input name="price" type="number" placeholder="Giá/Lít" required className="w-1/3 p-2 text-sm border rounded" />
                          <Button type="submit" variant="secondary" className="flex-1 text-xs"><IconPlus className="w-4 h-4" /></Button>
                      </form>
                      <div className="max-h-40 overflow-y-auto text-sm">
                           {prices.slice(0, 5).map(p => (
                               <div key={p.id} className="flex justify-between p-2 border-b last:border-0">
                                   <span>{formatDate(p.date)}</span>
                                   <span className="font-bold">{formatCurrency(p.pricePerLiter)}</span>
                               </div>
                           ))}
                      </div>
                  </Card>
              </div>

              {/* Requests List */}
               <div className="xl:col-span-2">
                  <Card className="h-full">
                       <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                          <IconGasPump className="w-5 h-5 text-[#2c4aa0]" /> Danh sách yêu cầu
                      </h2>
                      <div className="overflow-x-auto">
                          <table className="w-full text-left text-sm text-gray-600">
                              <thead className="bg-gray-50 text-gray-900 font-semibold border-b">
                                  <tr>
                                      <th className="p-3">Ngày</th>
                                      <th className="p-3">Tài xế / Xe</th>
                                      <th className="p-3">Trạng thái</th>
                                      <th className="p-3 text-right">Duyệt (Triệu)</th>
                                      <th className="p-3 text-right">Lít</th>
                                      <th className="p-3 text-center">Tác vụ</th>
                                  </tr>
                              </thead>
                              <tbody>
                                  {requests.sort((a,b) => new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime()).map(req => (
                                      <tr key={req.id} className="border-b hover:bg-gray-50">
                                          <td className="p-3">{formatDate(req.requestDate)}</td>
                                          <td className="p-3">
                                              <div className="font-medium text-gray-900">{req.driverName}</div>
                                              <div className="text-xs text-gray-500">{req.licensePlate}</div>
                                          </td>
                                          <td className="p-3"><Badge status={req.status} /></td>
                                          <td className="p-3 text-right">
                                              {req.status === RequestStatus.APPROVED ? (
                                                  editingHistoryId === req.id ? (
                                                      <div className="flex items-center justify-end gap-1">
                                                          <input 
                                                              type="number" 
                                                              step="0.1" 
                                                              className="w-16 p-1 border rounded text-right"
                                                              autoFocus
                                                              value={editingHistoryAmount}
                                                              onChange={(e) => setEditingHistoryAmount(e.target.value)}
                                                              onKeyDown={(e) => {
                                                                  if (e.key === 'Enter') handleUpdateHistoryAmount(req.id);
                                                                  if (e.key === 'Escape') setEditingHistoryId(null);
                                                              }}
                                                          />
                                                      </div>
                                                  ) : (
                                                       <span 
                                                          className="font-bold text-[#2c4aa0] cursor-pointer hover:underline decoration-dashed"
                                                          onClick={() => {
                                                              if (!req.isFullTank) {
                                                                  setEditingHistoryId(req.id);
                                                                  setEditingHistoryAmount((req.approvedAmount! / 1000000).toString());
                                                              }
                                                          }}
                                                          title="Click để sửa nhanh số tiền"
                                                       >
                                                          {req.isFullTank ? 'Full' : (req.approvedAmount! / 1000000).toFixed(2)}
                                                       </span>
                                                  )
                                              ) : '-'}
                                          </td>
                                          <td className="p-3 text-right">{req.approvedLiters ? req.approvedLiters.toFixed(1) : '-'}</td>
                                          <td className="p-3 text-center">
                                              {req.status === RequestStatus.PENDING && (
                                                  <Button onClick={() => openApprovalModal(req)} variant="primary" className="px-2 py-1 text-xs">
                                                      Duyệt
                                                  </Button>
                                              )}
                                              {req.status === RequestStatus.APPROVED && (
                                                  <div className="flex justify-center gap-2">
                                                     {/* Reuse functionality if needed, currently just display check */}
                                                     <IconCheckCircle className="w-5 h-5 text-green-500" />
                                                  </div>
                                              )}
                                          </td>
                                      </tr>
                                  ))}
                              </tbody>
                          </table>
                      </div>
                  </Card>
               </div>
          </div>
      </div>
  );

  const renderAdvanceManagement = () => (
      <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Settings & Create */}
              <div className="space-y-6">
                   <Card>
                      <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                          <IconPlus className="w-5 h-5 text-[#2c4aa0]" /> Tạo phiếu Tạm ứng
                      </h2>
                      <div className="space-y-3">
                           <select 
                             value={adminAdvDriver} 
                             onChange={(e) => setAdminAdvDriver(e.target.value)}
                             className="w-full p-2 text-sm border rounded bg-white"
                          >
                              <option value="">Chọn tài xế</option>
                              {drivers.map(d => <option key={d.id} value={d.fullName}>{d.fullName}</option>)}
                          </select>
                           <input 
                              type="date"
                              value={adminAdvDate}
                              onChange={(e) => setAdminAdvDate(e.target.value)}
                              className="w-full p-2 text-sm border rounded"
                          />
                           <input 
                              type="number"
                              placeholder="Số tiền (VNĐ)"
                              value={adminAdvAmount}
                              onChange={(e) => setAdminAdvAmount(e.target.value)}
                              className="w-full p-2 text-sm border rounded"
                          />
                          <select
                                value={adminAdvType}
                                onChange={(e) => setAdminAdvType(e.target.value)}
                                className="w-full p-2 text-sm border rounded bg-white"
                            >
                                <option value="">-- Loại chi phí --</option>
                                {advanceTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </select>
                          <input 
                              placeholder="Ghi chú"
                              value={adminAdvNote}
                              onChange={(e) => setAdminAdvNote(e.target.value)}
                              className="w-full p-2 text-sm border rounded"
                          />
                          <Button onClick={handleAdminCreateAdvance} className="w-full">Tạo & Duyệt</Button>
                      </div>
                  </Card>

                   <Card>
                      <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                          <IconWallet className="w-5 h-5 text-[#2c4aa0]" /> Loại chi phí
                      </h2>
                       <form onSubmit={handleAddAdvanceType} className="flex gap-2 mb-4">
                          <input name="name" placeholder="Tên loại..." required className="flex-1 p-2 text-sm border rounded" />
                          <Button type="submit" variant="secondary" className="px-3 py-1 text-xs whitespace-nowrap"><IconPlus className="w-4 h-4" /></Button>
                      </form>
                      <div className="max-h-40 overflow-y-auto space-y-1">
                        {advanceTypes.map(t => (
                            <div key={t.id} className="flex justify-between items-center p-2 bg-gray-50 rounded text-sm group">
                                <span>{t.name}</span>
                                <button onClick={() => handleDeleteAdvanceType(t.id)} className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <IconTrash className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                      </div>
                   </Card>
              </div>

               {/* Advance List */}
              <div className="md:col-span-2">
                   <Card className="h-full">
                       <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                          <IconDocument className="w-5 h-5 text-[#2c4aa0]" /> Danh sách Tạm ứng
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
                                  </tr>
                              </thead>
                              <tbody>
                                  {advanceRequests.sort((a,b) => new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime()).map(req => (
                                      <tr key={req.id} className="border-b hover:bg-gray-50">
                                          <td className="p-3">{formatDate(req.requestDate)}</td>
                                          <td className="p-3 font-medium text-gray-900">{req.driverName}</td>
                                          <td className="p-3">{advanceTypes.find(t => t.id === req.typeId)?.name}</td>
                                          <td className="p-3 text-right font-bold text-[#2c4aa0]">{formatCurrency(req.amount)}</td>
                                          <td className="p-3 text-center">
                                              {req.status === RequestStatus.PENDING ? (
                                                  <div className="flex justify-center gap-2">
                                                      <button onClick={() => handleApproveAdvance(req.id)} className="text-green-600 hover:bg-green-50 p-1 rounded border border-green-200"><IconCheck className="w-4 h-4" /></button>
                                                      <button onClick={() => handleRejectAdvance(req.id)} className="text-red-600 hover:bg-red-50 p-1 rounded border border-red-200"><IconXCircle className="w-4 h-4" /></button>
                                                  </div>
                                              ) : (
                                                  <Badge status={req.status} />
                                              )}
                                          </td>
                                      </tr>
                                  ))}
                              </tbody>
                          </table>
                      </div>
                  </Card>
              </div>
          </div>
      </div>
  );

  const renderReports = () => {
      const filteredRequests = requests.filter(r => {
        const d = new Date(r.requestDate);
        return d >= new Date(reportStartDate) && d <= new Date(reportEndDate);
      });
      const totalFuelCost = filteredRequests.filter(r => r.status === RequestStatus.APPROVED).reduce((acc, curr) => acc + (curr.approvedAmount || 0), 0);
      const totalLiters = filteredRequests.filter(r => r.status === RequestStatus.APPROVED).reduce((acc, curr) => acc + (curr.approvedLiters || 0), 0);
      
      return (
        <div className="space-y-6 animate-fade-in">
             <Card>
                 <div className="flex flex-col md:flex-row gap-4 items-end justify-between mb-6">
                     <div className="flex gap-4 w-full md:w-auto">
                         <div>
                             <label className="text-sm font-bold text-gray-700">Từ ngày</label>
                             <input type="date" value={reportStartDate} onChange={e => setReportStartDate(e.target.value)} className="block w-full p-2 border rounded mt-1" />
                         </div>
                         <div>
                             <label className="text-sm font-bold text-gray-700">Đến ngày</label>
                             <input type="date" value={reportEndDate} onChange={e => setReportEndDate(e.target.value)} className="block w-full p-2 border rounded mt-1" />
                         </div>
                     </div>
                     <Button onClick={handleAnalyze} disabled={isAnalyzing} className="w-full md:w-auto">
                         <IconSparkles className="w-5 h-5" /> 
                         {isAnalyzing ? 'Đang phân tích...' : 'Phân tích AI'}
                     </Button>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                     <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                         <div className="text-blue-600 text-sm font-bold uppercase tracking-wider">Tổng chi phí dầu</div>
                         <div className="text-2xl font-bold text-gray-800 mt-1">{formatCurrency(totalFuelCost)}</div>
                     </div>
                     <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                         <div className="text-indigo-600 text-sm font-bold uppercase tracking-wider">Tổng nhiên liệu</div>
                         <div className="text-2xl font-bold text-gray-800 mt-1">{totalLiters.toFixed(2)} Lít</div>
                     </div>
                     <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
                         <div className="text-purple-600 text-sm font-bold uppercase tracking-wider">Số phiếu đã duyệt</div>
                         <div className="text-2xl font-bold text-gray-800 mt-1">{filteredRequests.filter(r => r.status === RequestStatus.APPROVED).length}</div>
                     </div>
                 </div>

                 {aiAnalysis && (
                     <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100 animate-fade-in">
                         <h3 className="font-bold text-blue-800 flex items-center gap-2 mb-3">
                             <IconSparkles className="w-5 h-5" /> Góc nhìn AI
                         </h3>
                         <div className="prose text-gray-700 text-sm">
                             {aiAnalysis.split('\n').map((line, i) => <p key={i}>{line}</p>)}
                         </div>
                     </div>
                 )}
             </Card>
        </div>
      );
  };

  const DriverView = () => (
    <div className="space-y-6 animate-fade-in">
        <div className="flex justify-center gap-4 mb-4">
            <button
                onClick={() => setDriverTab('FUEL')}
                className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${driverTab === 'FUEL' ? 'bg-[#2c4aa0] text-white shadow-lg' : 'bg-white text-gray-500 border hover:bg-gray-50'}`}
            >
                Đổ dầu
            </button>
            <button
                onClick={() => setDriverTab('ADVANCE')}
                className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${driverTab === 'ADVANCE' ? 'bg-[#2c4aa0] text-white shadow-lg' : 'bg-white text-gray-500 border hover:bg-gray-50'}`}
            >
                Tạm ứng
            </button>
        </div>

        {driverTab === 'FUEL' ? (
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-1 h-fit">
                    <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <IconPlus className="w-5 h-5 text-[#2c4aa0]" /> Yêu cầu Đổ dầu
                    </h2>
                    
                    {autoAssignedVehicle ? (
                        <div className="bg-blue-50 p-3 rounded-lg mb-4 text-sm border border-blue-100">
                             <div className="text-gray-500 mb-1">Xe đang vận hành:</div>
                             <div className="font-bold text-[#2c4aa0] text-lg">{autoAssignedVehicle}</div>
                        </div>
                    ) : (
                        <div className="bg-red-50 p-3 rounded-lg mb-4 text-sm border border-red-100 text-red-600 flex items-start gap-2">
                            <IconAlert className="w-5 h-5 flex-shrink-0" />
                            <div>Bạn chưa được phân công xe cho ngày này. Liên hệ Admin.</div>
                        </div>
                    )}

                    <div className="space-y-3">
                        <div>
                            <label className="text-sm font-medium text-gray-700">Ngày yêu cầu</label>
                            <input 
                                type="date" 
                                value={newRequestDate}
                                onChange={(e) => setNewRequestDate(e.target.value)}
                                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#2c4aa0] outline-none"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700">Ghi chú (Odo, lý do...)</label>
                            <textarea 
                                value={newRequestNote}
                                onChange={(e) => setNewRequestNote(e.target.value)}
                                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#2c4aa0] outline-none h-24 resize-none"
                                placeholder="Nhập số công tơ mét hiện tại..."
                            />
                        </div>
                        <Button onClick={handleDriverSubmit} className="w-full" disabled={!autoAssignedVehicle}>
                            Gửi yêu cầu
                        </Button>
                    </div>
                </Card>

                <Card className="md:col-span-2">
                     <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <IconGasPump className="w-5 h-5 text-[#2c4aa0]" /> Lịch sử Đổ dầu
                    </h2>
                    <div className="space-y-3">
                        {requests.filter(r => r.driverName === CURRENT_DRIVER_NAME).length === 0 && (
                            <div className="text-center py-8 text-gray-400">Chưa có yêu cầu nào.</div>
                        )}
                        {requests.filter(r => r.driverName === CURRENT_DRIVER_NAME)
                            .sort((a,b) => new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime())
                            .map(req => (
                            <div key={req.id} className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <div className="font-bold text-gray-800 flex items-center gap-2">
                                            {formatDate(req.requestDate)}
                                            <Badge status={req.status} />
                                        </div>
                                        <div className="text-sm text-gray-600 mt-1">Xe: {req.licensePlate}</div>
                                    </div>
                                    {req.status === RequestStatus.APPROVED && (
                                        <div className="text-right">
                                            <div className="font-bold text-[#2c4aa0] text-lg">
                                                {req.isFullTank ? 'Đầy bình' : formatCurrency(req.approvedAmount!)}
                                            </div>
                                            <div className="text-xs text-gray-500">{req.approvedLiters?.toFixed(1)} Lít</div>
                                        </div>
                                    )}
                                </div>
                                {(req.stationId || req.notes) && (
                                    <div className="border-t pt-2 mt-2 text-sm text-gray-500 flex flex-col gap-1">
                                        {req.stationId && <div>Trạm: {stations.find(s => s.id === req.stationId)?.name}</div>}
                                        {req.notes && <div className="italic">"{req.notes}"</div>}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </Card>
             </div>
        ) : (
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-1 h-fit">
                    <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <IconWallet className="w-5 h-5 text-[#2c4aa0]" /> Yêu cầu Tạm ứng
                    </h2>
                     <div className="space-y-3">
                        <div>
                            <label className="text-sm font-medium text-gray-700">Số tiền</label>
                            <input 
                                type="number" 
                                value={newAdvanceAmount}
                                onChange={(e) => setNewAdvanceAmount(e.target.value)}
                                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#2c4aa0] outline-none"
                                placeholder="VNĐ"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700">Loại chi phí</label>
                            <select
                                value={newAdvanceType}
                                onChange={(e) => setNewAdvanceType(e.target.value)}
                                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#2c4aa0] outline-none bg-white"
                            >
                                <option value="">-- Chọn loại --</option>
                                {advanceTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700">Ghi chú</label>
                            <textarea 
                                value={newAdvanceNote}
                                onChange={(e) => setNewAdvanceNote(e.target.value)}
                                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#2c4aa0] outline-none h-20 resize-none"
                            />
                        </div>
                        <Button onClick={handleDriverAdvanceSubmit} className="w-full">
                            Gửi yêu cầu
                        </Button>
                    </div>
                </Card>

                <Card className="md:col-span-2">
                     <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <IconDocument className="w-5 h-5 text-[#2c4aa0]" /> Lịch sử Tạm ứng
                    </h2>
                    <div className="space-y-3">
                        {advanceRequests.filter(r => r.driverName === CURRENT_DRIVER_NAME).length === 0 && (
                             <div className="text-center py-8 text-gray-400">Chưa có yêu cầu nào.</div>
                        )}
                         {advanceRequests.filter(r => r.driverName === CURRENT_DRIVER_NAME)
                            .sort((a,b) => new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime())
                            .map(req => (
                            <div key={req.id} className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="font-bold text-gray-800 flex items-center gap-2">
                                            {formatDate(req.requestDate)}
                                            <Badge status={req.status} />
                                        </div>
                                        <div className="text-sm text-gray-600 mt-1">
                                            {advanceTypes.find(t => t.id === req.typeId)?.name}
                                        </div>
                                    </div>
                                    <div className="text-right font-bold text-[#2c4aa0] text-lg">
                                        {formatCurrency(req.amount)}
                                    </div>
                                </div>
                                {req.notes && (
                                    <div className="mt-2 text-sm text-gray-500 italic border-t pt-2">"{req.notes}"</div>
                                )}
                            </div>
                         ))}
                    </div>
                </Card>
             </div>
        )}
    </div>
  );

  const AdminView = () => (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Sidebar Navigation */}
      <div className="w-full md:w-64 flex-shrink-0">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sticky top-24">
          <div className="space-y-1">
            <button
              onClick={() => setActiveTab('DASHBOARD')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'DASHBOARD' ? 'bg-[#2c4aa0] text-white' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <IconHome className="w-5 h-5" /> Tổng quan
            </button>
            <button
              onClick={() => setActiveTab('FUEL')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'FUEL' ? 'bg-[#2c4aa0] text-white' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <IconGasPump className="w-5 h-5" /> Nhiên liệu
            </button>
            <button
              onClick={() => setActiveTab('ADVANCES')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'ADVANCES' ? 'bg-[#2c4aa0] text-white' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <IconWallet className="w-5 h-5" /> Tạm ứng
            </button>
            <button
              onClick={() => setActiveTab('SALARY')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'SALARY' ? 'bg-[#2c4aa0] text-white' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <IconCurrency className="w-5 h-5" /> Lương chuyến
            </button>
            <button
              onClick={() => setActiveTab('OPERATION')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'OPERATION' ? 'bg-[#2c4aa0] text-white' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <IconUsers className="w-5 h-5" /> Quản lý Vận hành
            </button>
            <button
              onClick={() => setActiveTab('VEHICLES')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'VEHICLES' ? 'bg-[#2c4aa0] text-white' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <IconTruck className="w-5 h-5" /> Quản lý Phương tiện
            </button>
            <button
              onClick={() => setActiveTab('REPORTS')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'REPORTS' ? 'bg-[#2c4aa0] text-white' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <IconChartBar className="w-5 h-5" /> Báo cáo thống kê
            </button>
          </div>
        </div>
      </div>

      {/* Main Admin Content */}
      <div className="flex-1">
        {activeTab === 'DASHBOARD' && renderDashboard()}
        {activeTab === 'FUEL' && renderFuelManagement()}
        {activeTab === 'ADVANCES' && renderAdvanceManagement()}
        {activeTab === 'SALARY' && renderSalaryManagement()}
        {activeTab === 'OPERATION' && renderOperationManagement()}
        {activeTab === 'VEHICLES' && renderVehicleManagement()}
        {activeTab === 'REPORTS' && renderReports()}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen pb-12" style={{ backgroundColor: BG_COLOR }}>
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[#2c4aa0]">
            <IconGasPump className="w-8 h-8" />
            <span className="font-bold text-xl tracking-tight">FuelFlow ERP</span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button 
                onClick={() => setRole('DRIVER')}
                className={`px-3 py-1 text-sm rounded-md transition-all ${role === 'DRIVER' ? 'bg-white shadow text-[#2c4aa0] font-medium' : 'text-gray-500'}`}
              >
                Tài xế
              </button>
              <button 
                onClick={() => setRole('ADMIN')}
                className={`px-3 py-1 text-sm rounded-md transition-all ${role === 'ADMIN' ? 'bg-white shadow text-[#2c4aa0] font-medium' : 'text-gray-500'}`}
              >
                Admin
              </button>
            </div>
            <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
               <IconUser className="w-5 h-5" />
               <span className="hidden sm:inline">{role === 'DRIVER' ? CURRENT_DRIVER_NAME : 'Quản trị viên'}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {role === 'DRIVER' ? <DriverView /> : <AdminView />}
      </main>

      {/* Approval Modal */}
      {isModalOpen && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-fade-in">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Duyệt cấp dầu</h3>
            
            <div className="bg-blue-50 p-4 rounded-lg mb-6 text-sm">
              <div className="flex justify-between mb-1">
                <span className="text-gray-600">Tài xế:</span>
                <span className="font-semibold">{selectedRequest.driverName}</span>
              </div>
              <div className="flex justify-between mb-1">
                <span className="text-gray-600">Biển số xe:</span>
                <span className="font-semibold">{selectedRequest.licensePlate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Ngày yêu cầu:</span>
                <span className="font-semibold">{formatDate(selectedRequest.requestDate)}</span>
              </div>
              <div className="mt-2 pt-2 border-t border-blue-100 flex justify-between">
                 <span className="text-gray-600">Giá tham chiếu:</span>
                 <span className="font-bold text-[#2c4aa0]">
                    {getPriceForDate(selectedRequest.requestDate, prices) 
                      ? formatCurrency(getPriceForDate(selectedRequest.requestDate, prices)!) + "/L" 
                      : "Chưa có giá"}
                 </span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Chọn cây dầu</label>
                <select 
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#2c4aa0] outline-none bg-white"
                  value={adminStation}
                  onChange={(e) => setAdminStation(e.target.value)}
                >
                  <option value="">-- Chọn trạm --</option>
                  {stations.map(s => <option key={s.id} value={s.id}>{s.name} - {s.address}</option>)}
                </select>
              </div>
              
               <div>
                  <div className="flex justify-between items-center mb-1">
                      <label className="block text-sm font-medium text-gray-700">Số tiền duyệt</label>
                      <div className="flex items-center gap-1">
                          <input 
                              type="checkbox" 
                              id="isAdminFullTank" 
                              checked={isAdminFullTank} 
                              onChange={(e) => setIsAdminFullTank(e.target.checked)}
                              className="w-4 h-4"
                          />
                          <label htmlFor="isAdminFullTank" className="text-sm text-[#2c4aa0] font-bold cursor-pointer">Đầy bình</label>
                      </div>
                  </div>
                  {!isAdminFullTank ? (
                      <div className="relative">
                          <input 
                              type="number" 
                              step="0.1"
                              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#2c4aa0] outline-none"
                              placeholder="VD: 1.5"
                              value={adminAmount}
                              onChange={(e) => setAdminAmount(e.target.value)}
                          />
                          <span className="absolute right-2 top-2 text-sm text-gray-400">Triệu VNĐ</span>
                      </div>
                  ) : (
                      <div className="w-full p-2 border rounded-lg bg-gray-100 text-gray-500 italic">
                          Duyệt đổ đầy bình
                      </div>
                  )}
               </div>


              {/* Live Calculation */}
              {!isAdminFullTank && adminAmount && getPriceForDate(selectedRequest.requestDate, prices) && (
                <div className="text-center py-2 text-gray-600">
                   <div className="text-xs text-gray-400">Thành tiền: {formatCurrency(parseFloat(adminAmount) * 1000000)}</div>
                   Sẽ cấp: <span className="text-2xl font-bold text-[#2c4aa0]">
                    {((parseFloat(adminAmount) * 1000000) / getPriceForDate(selectedRequest.requestDate, prices)!).toFixed(2)} Lít
                  </span>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-8">
              <Button variant="ghost" className="flex-1" onClick={() => setIsModalOpen(false)}>Hủy</Button>
              <Button 
                className="flex-1" 
                onClick={handleApprove}
                disabled={!adminStation || (!adminAmount && !isAdminFullTank) || !getPriceForDate(selectedRequest.requestDate, prices)}
              >
                Xác nhận
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Copy Message Modal */}
      {showCopyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 animate-fade-in text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600">
                <IconCheck className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Duyệt thành công!</h3>
            <p className="text-sm text-gray-500 mb-4">Nội dung tin nhắn thông báo:</p>
            
            <div className="bg-gray-100 p-3 rounded-lg text-left text-sm font-mono mb-4 whitespace-pre-line border">
                {copyMessage}
            </div>

            <Button onClick={handleCopy} variant="primary" className="w-full">
                <IconCopy className="w-5 h-5" /> Copy nội dung & Đóng
            </Button>
            <Button onClick={() => setShowCopyModal(false)} variant="ghost" className="w-full mt-2 text-xs">
                Đóng
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}