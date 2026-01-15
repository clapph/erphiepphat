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
  VehicleStatus
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

// --- Components ---

const Button = ({ children, onClick, variant = 'primary', className = '', disabled = false, type = 'button' }: any) => {
  const baseStyle = "px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 text-sm";
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

const VehicleStatusBadge = ({ status }: { status: VehicleStatus }) => {
  const styles = {
    'OPERATING': 'bg-green-100 text-green-800',
    'INACTIVE': 'bg-gray-100 text-gray-800',
  };
  const labels = {
    'OPERATING': 'Đang vận hành',
    'INACTIVE': 'Ngừng vận hành',
  };
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[status]}`}>
      {labels[status]}
    </span>
  );
};

// --- Main App Component ---

export default function App() {
  const [role, setRole] = useState<UserRole>('DRIVER');
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
  
  // AI State
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [reportAiAnalysis, setReportAiAnalysis] = useState<string>('');
  const [isAnalyzingReport, setIsAnalyzingReport] = useState(false);

  // Management Edit State
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [editingVehicleType, setEditingVehicleType] = useState<VehicleType | null>(null);
  const [editingFuelPrice, setEditingFuelPrice] = useState<FuelPrice | null>(null);
  const [editingAssignment, setEditingAssignment] = useState<DriverAssignment | null>(null);
  const [editingSalaryRecord, setEditingSalaryRecord] = useState<SalaryRecord | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<FuelRequest | null>(null);
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [copyMessage, setCopyMessage] = useState('');
  const [showImportModal, setShowImportModal] = useState(false);
  const [importText, setImportText] = useState('');
  const [importPreviewRecords, setImportPreviewRecords] = useState<SalaryRecord[]>([]);
  
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

  // Salary State
  const [salaryStartDate, setSalaryStartDate] = useState('');
  const [salaryEndDate, setSalaryEndDate] = useState('');
  const [salaryCargoFilter, setSalaryCargoFilter] = useState('');
  const [selectedSalaryIds, setSelectedSalaryIds] = useState<Set<string>>(new Set());

  // Driver Tab State
  const [driverTab, setDriverTab] = useState<'FUEL' | 'ADVANCE' | 'SALARY'>('FUEL');

  // New Request State (Driver)
  const [newRequestDate, setNewRequestDate] = useState(new Date().toISOString().split('T')[0]);
  const [newRequestNote, setNewRequestNote] = useState('');

  // Report State
  const [reportStartDate, setReportStartDate] = useState('2023-10-01');
  const [reportEndDate, setReportEndDate] = useState(new Date().toISOString().split('T')[0]);

  // Derived State
  const autoAssignedVehicle = useMemo(() => {
    return getAssignedVehicle(CURRENT_DRIVER_NAME, newRequestDate, assignments);
  }, [newRequestDate, assignments]);

  const adminAutoVehicle = useMemo(() => {
    if (!adminNewDriver) return null;
    return getAssignedVehicle(adminNewDriver, adminNewDate, assignments);
  }, [adminNewDriver, adminNewDate, assignments]);

  const appliedPriceForAdminForm = useMemo(() => {
    if (!adminNewDate) return null;
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const lookupTime = adminNewDate === todayStr ? now.toISOString() : `${adminNewDate}T23:59:59`;
    return getPriceForTime(lookupTime, prices);
  }, [adminNewDate, prices]);

  const filteredSalaries = useMemo(() => {
    return salaryRecords.filter(s => {
      const dateMatch = (!salaryStartDate || s.transportDate >= salaryStartDate) && 
                         (!salaryEndDate || s.transportDate <= salaryEndDate);
      const cargoMatch = !salaryCargoFilter || s.cargoType === salaryCargoFilter;
      return dateMatch && cargoMatch;
    }).sort((a,b) => new Date(b.transportDate).getTime() - new Date(a.transportDate).getTime());
  }, [salaryRecords, salaryStartDate, salaryEndDate, salaryCargoFilter]);

  // --- actions ---
  
  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    try {
      const result = await analyzeFuelData(requests, prices);
      setAiAnalysis(result);
    } catch (error) {
      console.error(error);
      setAiAnalysis("Đã có lỗi xảy ra khi kết nối với AI để phân tích.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAnalyzeReport = async () => {
      setIsAnalyzingReport(true);
      try {
          const result = await analyzeFuelData(requests, prices);
          setReportAiAnalysis(result);
      } catch (error) {
          setReportAiAnalysis("Lỗi phân tích AI.");
      } finally {
          setIsAnalyzingReport(false);
      }
  };

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
    const status = formData.get('status') as VehicleStatus;

    if (editingVehicle) {
        setVehicles(vehicles.map(v => v.id === editingVehicle.id ? { ...editingVehicle, licensePlate: licensePlate.toUpperCase(), vehicleType, inspectionDate, inspectionExpiryDate, status } : v));
        setEditingVehicle(null);
    } else {
        setVehicles([...vehicles, { id: Math.random().toString(), licensePlate: licensePlate.toUpperCase(), vehicleType, inspectionDate, inspectionExpiryDate, status }]);
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

  const toggleVehicleStatus = (id: string) => {
    setVehicles(vehicles.map(v => {
      if (v.id === id) {
        const newStatus: VehicleStatus = v.status === 'OPERATING' ? 'INACTIVE' : 'OPERATING';
        return { ...v, status: newStatus };
      }
      return v;
    }));
  };

  const handleSaveVehicleType = (e: React.FormEvent) => {
      e.preventDefault();
      const formData = new FormData(e.target as HTMLFormElement);
      const name = formData.get('name') as string;
      if (name) {
          if (editingVehicleType) {
              setVehicleTypes(vehicleTypes.map(vt => vt.id === editingVehicleType.id ? { ...vt, name } : vt));
              setEditingVehicleType(null);
          } else {
              setVehicleTypes([...vehicleTypes, { id: Math.random().toString(), name }]);
          }
          (e.target as HTMLFormElement).reset();
      }
  };

  const handleEditVehicleType = (vt: VehicleType) => {
    setEditingVehicleType(vt);
  };

  const handleDeleteVehicleType = (id: string) => {
      if (window.confirm("Xóa loại xe này? Dữ liệu xe cũ có thể bị ảnh hưởng.")) {
          setVehicleTypes(vehicleTypes.filter(vt => vt.id !== id));
          if (editingVehicleType?.id === id) setEditingVehicleType(null);
      }
  };
  
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

  // Step 1: Parse Text to Preview
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

    if (newPreview.length > 0) {
      setImportPreviewRecords(newPreview);
    } else {
      alert("Không tìm thấy dữ liệu hợp lệ. Vui lòng kiểm tra lại định dạng tab-separated.");
    }
  };

  // Step 2: Confirm and Save
  const handleConfirmImport = () => {
    if (importPreviewRecords.length === 0) return;
    setSalaryRecords(prev => [...importPreviewRecords, ...prev]);
    setImportPreviewRecords([]);
    setImportText('');
    setShowImportModal(false);
    alert(`Đã lưu thành công ${importPreviewRecords.length} bản ghi lương!`);
  };

  const handleDeleteSalary = (id: string) => {
      if (window.confirm("Bạn có chắc chắn muốn xóa dòng lương này?")) {
          setSalaryRecords(prev => prev.filter(s => s.id !== id));
          if (selectedSalaryIds.has(id)) {
            setSelectedSalaryIds(prev => {
              const next = new Set(prev);
              next.delete(id);
              return next;
            });
          }
      }
  };

  const handleBulkDeleteSalaries = () => {
    if (selectedSalaryIds.size === 0) return;
    if (window.confirm(`Xóa ${selectedSalaryIds.size} bản ghi đã chọn?`)) {
      setSalaryRecords(prev => prev.filter(s => !selectedSalaryIds.has(s.id)));
      setSelectedSalaryIds(new Set());
    }
  };

  const toggleSalarySelection = (id: string) => {
    setSelectedSalaryIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const isAllFilteredSelected = useMemo(() => {
    return filteredSalaries.length > 0 && filteredSalaries.every(s => selectedSalaryIds.has(s.id));
  }, [filteredSalaries, selectedSalaryIds]);

  const toggleAllSalariesOnPage = () => {
    if (isAllFilteredSelected) {
      setSelectedSalaryIds(prev => {
        const next = new Set(prev);
        filteredSalaries.forEach(s => next.delete(s.id));
        return next;
      });
    } else {
      setSelectedSalaryIds(prev => {
        const next = new Set(prev);
        filteredSalaries.forEach(s => next.add(s.id));
        return next;
      });
    }
  };

  const handleEditSalary = (s: SalaryRecord) => {
    setEditingSalaryRecord(s);
  };

  const handleSaveSalaryRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSalaryRecord) return;
    const formData = new FormData(e.target as HTMLFormElement);
    const updated: SalaryRecord = {
      ...editingSalaryRecord,
      transportDate: formData.get('transportDate') as string,
      driverName: formData.get('driverName') as string,
      cargoType: formData.get('cargoType') as CargoType,
      refNumber: formData.get('refNumber') as string,
      quantity20: Number(formData.get('quantity20')),
      quantity40: Number(formData.get('quantity40')),
      quantityOther: Number(formData.get('quantityOther')),
      pickupWarehouse: formData.get('pickupWarehouse') as string,
      deliveryWarehouse: formData.get('deliveryWarehouse') as string,
      depotLocation: formData.get('depotLocation') as string,
      returnLocation: formData.get('returnLocation') as string,
      salary: Number(formData.get('salary')),
      handlingFee: Number(formData.get('handlingFee')),
      notes: formData.get('notes') as string,
    };
    setSalaryRecords(salaryRecords.map(s => s.id === updated.id ? updated : s));
    setEditingSalaryRecord(null);
    alert('Cập nhật thành công!');
  };


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

    // Bổ sung thông tin để copy gửi quản lý
    const formattedMsg = `YÊU CẦU DUYỆT DẦU\nBiển số xe: ${newReq.licensePlate}\nNgày dự kiến: ${formatDate(newReq.requestDate)}\nTài xế: ${newReq.driverName}${newReq.notes ? `\nGhi chú: ${newReq.notes}` : ''}`;
    setCopyMessage(formattedMsg);
    setShowCopyModal(true);

    setNewRequestNote('');
  };

  const handleAdminCreateRequest = () => {
    if (!adminNewDriver || (!adminNewAmount && !adminNewFullTank) || !adminNewStation || !adminAutoVehicle) {
      alert("Vui lòng nhập đầy đủ thông tin: Tài xế, Trạm, Số tiền và đảm bảo có xe phân công.");
      return;
    }

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const lookupTime = adminNewDate === todayStr ? now.toISOString() : `${adminNewDate}T23:59:59`;
    
    const price = getPriceForTime(lookupTime, prices);
    if (!price) {
      alert(`Chưa có giá dầu hợp lệ cho thời điểm này.`);
      return;
    }
    
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
    const formattedMsg = `DUYỆT CẤP DẦU\nXe: ${newReq.licensePlate}\nNgày: ${formatDate(newReq.requestDate)}\nDuyệt: ${amountText}`;
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
    
    const now = new Date();
    const price = getPriceForTime(now.toISOString(), prices);
    if (!price) {
        alert("Thiếu giá dầu!"); 
        return;
    }
    
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
    const formattedMsg = `DUYỆT CẤP DẦU\nXe: ${updatedReq.licensePlate}\nNgày: ${formatDate(updatedReq.requestDate)}\nDuyệt: ${amountText}`;
    setCopyMessage(formattedMsg);
    setShowCopyModal(true);
  };

  const handleUpdateHistoryAmount = (id: string) => {
      const request = requests.find(r => r.id === id);
      if (!request || !editingHistoryAmount) return;
      
      const lookupTime = request.approvalDate || `${request.requestDate}T23:59:59`;
      const price = getPriceForTime(lookupTime, prices);
      if (!price) {
          alert("Không tìm thấy giá dầu hợp lệ!");
          return;
      }

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

  const handleDeleteFuelRequest = (id: string) => {
      if (window.confirm("Bạn có chắc chắn muốn xóa giao dịch đổ dầu này?")) {
          setRequests(requests.filter(r => r.id !== id));
      }
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

  const handleEditFuelPrice = (p: FuelPrice) => {
      setEditingFuelPrice(p);
  };

  const handleDeletePrice = (id: string) => {
      if (window.confirm("Bạn có chắc chắn muốn xóa mốc giá dầu này?")) {
          setPrices(prices.filter(p => p.id !== id));
          if (editingFuelPrice?.id === id) setEditingFuelPrice(null);
      }
  };

  const handleSaveAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const driverName = formData.get('driverName') as string;
    const licensePlate = (formData.get('licensePlate') as string).toUpperCase();
    const startDate = formData.get('startDate') as string;
    const endDate = formData.get('endDate') as string;
    
    if (driverName && licensePlate && startDate) {
      if (endDate && new Date(endDate) < new Date(startDate)) {
        alert("Ngày kết thúc không thể trước ngày bắt đầu.");
        return;
      }

      if (editingAssignment) {
          setAssignments(assignments.map(a => a.id === editingAssignment.id ? {
              ...a,
              driverName,
              licensePlate,
              startDate,
              endDate: endDate || undefined
          } : a));
          setEditingAssignment(null);
      } else {
          const exactDuplicate = assignments.find(a => 
            a.driverName === driverName && a.licensePlate === licensePlate && a.startDate === startDate
          );
          if (exactDuplicate) {
            alert(`Bản ghi này đã tồn tại: ${driverName} - ${licensePlate} từ ngày ${formatDate(startDate)}`);
            return;
          }

          setAssignments([...assignments, { 
            id: Math.random().toString(), 
            driverName, 
            licensePlate, 
            startDate,
            endDate: endDate || undefined
          }]);
      }
      (e.target as HTMLFormElement).reset();
    }
  };

  const handleDeleteAssignment = (id: string) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa phân công này?")) {
      setAssignments(assignments.filter(a => a.id !== id));
      if (editingAssignment?.id === id) setEditingAssignment(null);
    }
  };

  const handleEditAssignment = (a: DriverAssignment) => {
      setEditingAssignment(a);
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

  const handleDeleteAdvanceRequest = (id: string) => {
      if (window.confirm("Bạn có chắc chắn muốn xóa phiếu tạm ứng này?")) {
          setAdvanceRequests(advanceRequests.filter(r => r.id !== id));
      }
  };

  // --- Views ---
  
  const renderSalaryManagement = () => (
    <div className="space-y-6 animate-fade-in">
        <Card className="border-t-4 border-[#2c4aa0]">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <IconCurrency className="w-6 h-6 text-[#2c4aa0]" /> Quản lý Lương & Chi phí
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">Quản lý và lọc dữ liệu lương vận chuyển.</p>
                </div>
                <div className="flex flex-wrap gap-2 w-full md:w-auto">
                    {selectedSalaryIds.size > 0 && (
                      <Button onClick={handleBulkDeleteSalaries} variant="danger" className="animate-pulse">
                        <IconTrash className="w-4 h-4" /> Xóa hàng loạt ({selectedSalaryIds.size})
                      </Button>
                    )}
                    <Button onClick={() => { setImportPreviewRecords([]); setShowImportModal(true); }} variant="secondary" className="bg-blue-50">
                        <IconPlus className="w-4 h-4" /> Import từ Sheets
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-gray-50 p-4 rounded-lg mb-6 grid grid-cols-1 md:grid-cols-4 gap-4 items-end border border-gray-100">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Từ ngày</label>
                  <input type="date" className="w-full p-2 text-sm border rounded focus:ring-2 focus:ring-[#2c4aa0] outline-none" value={salaryStartDate} onChange={e => setSalaryStartDate(e.target.value)} />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Đến ngày</label>
                  <input type="date" className="w-full p-2 text-sm border rounded focus:ring-2 focus:ring-[#2c4aa0] outline-none" value={salaryEndDate} onChange={e => setSalaryEndDate(e.target.value)} />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Loại hàng</label>
                  <select className="w-full p-2 text-sm border rounded bg-white focus:ring-2 focus:ring-[#2c4aa0] outline-none" value={salaryCargoFilter} onChange={e => setSalaryCargoFilter(e.target.value)}>
                    <option value="">Tất cả loại hàng</option>
                    <option value="CONT">Container</option>
                    <option value="PALLET">Pallet</option>
                    <option value="TRANSFER">Chuyển kho</option>
                    <option value="GLASS">Miểng chai</option>
                  </select>
                </div>
                <Button variant="ghost" onClick={() => { setSalaryStartDate(''); setSalaryEndDate(''); setSalaryCargoFilter(''); setSelectedSalaryIds(new Set()); }} className="text-xs hover:text-red-500">
                  Thiết lập lại bộ lọc
                </Button>
            </div>

            <div className="overflow-x-auto relative">
                <table className="w-full text-left text-[10px] text-gray-600 border-collapse">
                    <thead className="bg-gray-100 text-gray-900 font-bold border-b sticky top-0 z-10">
                        <tr>
                            <th className="p-2 border text-center w-10">
                              <input 
                                type="checkbox" 
                                checked={isAllFilteredSelected} 
                                onChange={toggleAllSalariesOnPage}
                                className="w-4 h-4 rounded cursor-pointer"
                              />
                            </th>
                            <th className="p-2 border">Ngày VC</th>
                            <th className="p-2 border">Tài xế</th>
                            <th className="p-2 border">Loại hàng</th>
                            <th className="p-2 border">Số CONT / DO</th>
                            <th className="p-2 border text-center">SL 20'</th>
                            <th className="p-2 border text-center">SL 40'</th>
                            <th className="p-2 border text-center">Pallet/Tấn</th>
                            <th className="p-2 border">Kho Đóng</th>
                            <th className="p-2 border">Kho Nhập</th>
                            <th className="p-2 border">Depot</th>
                            <th className="p-2 border">Hạ bãi</th>
                            <th className="p-2 border text-right">Lương</th>
                            <th className="p-2 border text-right">Làm hàng</th>
                            <th className="p-2 border">Ghi chú</th>
                            <th className="p-2 border text-center">Tác vụ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredSalaries.length === 0 ? (
                            <tr>
                                <td colSpan={16} className="p-12 text-center text-gray-400 italic text-sm bg-gray-50/50">
                                    Không có dữ liệu nào khớp với điều kiện lọc hiện tại.
                                </td>
                            </tr>
                        ) : (
                          filteredSalaries.map(s => (
                                <tr key={s.id} className={`border-b hover:bg-gray-50 group transition-colors ${selectedSalaryIds.has(s.id) ? 'bg-blue-50/50' : ''}`}>
                                    <td className="p-2 border text-center">
                                      <input 
                                        type="checkbox" 
                                        checked={selectedSalaryIds.has(s.id)} 
                                        onChange={() => toggleSalarySelection(s.id)} 
                                        className="w-4 h-4 rounded cursor-pointer"
                                      />
                                    </td>
                                    <td className="p-2 border whitespace-nowrap">{formatDate(s.transportDate)}</td>
                                    <td className="p-2 border font-medium text-gray-900">{s.driverName}</td>
                                    <td className="p-2 border text-center"><span className="px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded font-bold">{s.cargoType}</span></td>
                                    <td className="p-2 border font-mono">{s.refNumber}</td>
                                    <td className="p-2 border text-center font-bold text-gray-700">{s.quantity20 || '-'}</td>
                                    <td className="p-2 border text-center font-bold text-gray-700">{s.quantity40 || '-'}</td>
                                    <td className="p-2 border text-center font-bold text-gray-700">{s.quantityOther || '-'}</td>
                                    <td className="p-2 border truncate max-w-[100px]" title={s.pickupWarehouse}>{s.pickupWarehouse}</td>
                                    <td className="p-2 border truncate max-w-[100px]" title={s.deliveryWarehouse}>{s.deliveryWarehouse}</td>
                                    <td className="p-2 border truncate max-w-[100px]" title={s.depotLocation}>{s.depotLocation}</td>
                                    <td className="p-2 border truncate max-w-[100px]" title={s.returnLocation}>{s.returnLocation}</td>
                                    <td className="p-2 border text-right font-bold text-[#2c4aa0]">{formatCurrency(s.salary)}</td>
                                    <td className="p-2 border text-right font-bold text-orange-600">{formatCurrency(s.handlingFee)}</td>
                                    <td className="p-2 border truncate max-w-[120px]" title={s.notes}>{s.notes}</td>
                                    <td className="p-2 border text-center">
                                      <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => handleEditSalary(s)} className="text-blue-400 hover:text-blue-600 p-1 bg-white rounded shadow-sm border border-gray-100" title="Chỉnh sửa">
                                            <IconEdit className="w-3.5 h-3.5"/>
                                        </button>
                                        <button onClick={() => handleDeleteSalary(s.id)} className="text-red-400 hover:text-red-600 p-1 bg-white rounded shadow-sm border border-gray-100" title="Xóa">
                                            <IconTrash className="w-3.5 h-3.5"/>
                                        </button>
                                      </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </Card>
    </div>
  );

  const renderOperationManagement = () => (
    <div className="space-y-8 animate-fade-in">
        <div>
            <h3 className="text-lg font-bold text-[#2c4aa0] mb-4 flex items-center gap-2 border-b pb-2">
                <IconUsers className="w-5 h-5" /> Nhân sự & Điều vận
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-6">
                    <Card>
                        <h2 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                        {editingDriver ? 'Cập nhật Tài xế' : 'Thêm Tài xế'}
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
                        <h2 className="text-sm font-bold text-gray-800 mb-4">Danh sách Tài xế</h2>
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
                                    <button onClick={() => handleEditDriver(d)} className="text-blue-600 hover:bg-blue-50 p-1 rounded" title="Sửa"><IconEdit className="w-4 h-4" /></button>
                                    <button onClick={() => handleDeleteDriver(d.id)} className="text-red-600 hover:bg-red-50 p-1 rounded" title="Xóa"><IconTrash className="w-4 h-4" /></button>
                                </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                        </div>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card>
                        <h2 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                            {editingAssignment ? 'Chỉnh sửa Phân công xe' : 'Thiết lập Vận hành (Phân công xe)'}
                        </h2>
                        <form onSubmit={handleSaveAssignment} className="space-y-3 mb-4">
                            <div className="flex flex-col gap-2">
                                <select 
                                    name="driverName" 
                                    required 
                                    key={editingAssignment ? `driver-${editingAssignment.id}` : 'driver-new'}
                                    defaultValue={editingAssignment?.driverName}
                                    className="w-full p-2 text-sm border rounded bg-white"
                                >
                                <option value="">Chọn tài xế</option>
                                {drivers.map(d => <option key={d.id} value={d.fullName}>{d.fullName}</option>)}
                                </select>
                                <select 
                                    name="licensePlate" 
                                    required 
                                    key={editingAssignment ? `v-${editingAssignment.id}` : 'v-new'}
                                    defaultValue={editingAssignment?.licensePlate}
                                    className="w-full p-2 text-sm border rounded bg-white"
                                >
                                <option value="">Chọn xe</option>
                                {vehicles.filter(v => v.status === 'OPERATING').map(v => <option key={v.id} value={v.licensePlate}>{v.licensePlate}</option>)}
                                </select>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="text-[10px] text-gray-500 uppercase font-bold">Từ ngày</label>
                                        <input 
                                            name="startDate" 
                                            type="date" 
                                            required 
                                            key={editingAssignment ? `start-${editingAssignment.id}` : 'start-new'}
                                            defaultValue={editingAssignment?.startDate}
                                            className="w-full p-2 text-sm border rounded" 
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-gray-500 uppercase font-bold">Đến ngày (không bắt buộc)</label>
                                        <input 
                                            name="endDate" 
                                            type="date" 
                                            key={editingAssignment ? `end-${editingAssignment.id}` : 'end-new'}
                                            defaultValue={editingAssignment?.endDate}
                                            className="w-full p-2 text-sm border rounded" 
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                {editingAssignment && (
                                    <Button variant="ghost" className="flex-1 text-xs" onClick={() => setEditingAssignment(null)}>Hủy</Button>
                                )}
                                <Button type="submit" variant="secondary" className="flex-1 text-xs">
                                    {editingAssignment ? 'Cập nhật phân công' : 'Xác nhận phân công'}
                                </Button>
                            </div>
                        </form>
                        <div className="max-h-[400px] overflow-y-auto space-y-2">
                            {assignments.sort((a,b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()).map(a => (
                                <div key={a.id} className="text-xs p-3 bg-gray-50 rounded border-l-2 border-[#2c4aa0] flex justify-between items-center group">
                                    <div>
                                        <div className="font-bold text-gray-900">{a.driverName}</div>
                                        <div className="flex flex-col gap-1 mt-1">
                                            <span className="font-mono bg-white border px-1 rounded w-fit">{a.licensePlate}</span>
                                            <span className="text-gray-500 flex items-center gap-1">
                                                {formatDate(a.startDate)} 
                                                <span className="text-gray-300">→</span> 
                                                {a.endDate ? (
                                                  <span className="text-orange-600 font-medium">{formatDate(a.endDate)}</span>
                                                ) : (
                                                  <span className="text-green-600 font-bold">Tiếp tục vận hành</span>
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button 
                                          onClick={() => handleEditAssignment(a)}
                                          className="text-blue-500 hover:text-blue-700 p-1"
                                          title="Sửa phân công"
                                        >
                                          <IconEdit className="w-4 h-4" />
                                        </button>
                                        <button 
                                          onClick={() => handleDeleteAssignment(a.id)}
                                          className="text-red-400 hover:text-red-600 p-1"
                                          title="Xóa phân công"
                                        >
                                          <IconTrash className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>
        </div>

        <div>
            <h3 className="text-lg font-bold text-[#2c4aa0] mb-4 flex items-center gap-2 border-b pb-2 pt-4">
                <IconTruck className="w-5 h-5" /> Quản lý Đội xe
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <Card className="h-fit">
                    <h2 className="text-sm font-bold text-gray-800 mb-4">{editingVehicleType ? 'Sửa Loại xe' : 'Thêm Loại xe'}</h2>
                    <form onSubmit={handleSaveVehicleType} className="flex gap-2 mb-4 items-center">
                        <input 
                          name="name" 
                          placeholder="Tên loại xe..." 
                          required 
                          defaultValue={editingVehicleType?.name}
                          key={editingVehicleType?.id || 'new'}
                          className="flex-1 p-2 text-sm border rounded outline-none focus:ring-1 focus:ring-[#2c4aa0]" 
                        />
                        <Button type="submit" variant="secondary" className="px-3 py-1 text-xs whitespace-nowrap">
                          {editingVehicleType ? <IconCheck className="w-4 h-4" /> : <IconPlus className="w-4 h-4" />}
                        </Button>
                        {editingVehicleType && (
                          <button type="button" onClick={() => setEditingVehicleType(null)} className="text-gray-400 hover:text-red-500">
                            <IconXCircle className="w-4 h-4" />
                          </button>
                        )}
                    </form>
                    <div className="max-h-40 overflow-y-auto space-y-1">
                        {vehicleTypes.map(vt => (
                            <div key={vt.id} className="flex justify-between items-center p-2 bg-gray-50 rounded text-sm group">
                                <span className="font-medium">{vt.name}</span>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button onClick={() => handleEditVehicleType(vt)} className="text-blue-500 hover:text-blue-700">
                                      <IconEdit className="w-4 h-4" />
                                  </button>
                                  <button onClick={() => handleDeleteVehicleType(vt.id)} className="text-gray-400 hover:text-red-500">
                                      <IconTrash className="w-4 h-4" />
                                  </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                <Card className="md:col-span-2">
                    <h2 className="text-sm font-bold text-gray-800 mb-4">
                    {editingVehicle ? 'Cập nhật Phương tiện' : 'Thêm Phương tiện'}
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
                        <div>
                            <label className="text-xs text-gray-500">Trạng thái vận hành</label>
                            <select 
                                name="status" 
                                required 
                                defaultValue={editingVehicle?.status || 'OPERATING'}
                                className="w-full p-2 text-sm border rounded bg-white"
                            >
                                <option value="OPERATING">Đang vận hành</option>
                                <option value="INACTIVE">Ngừng vận hành</option>
                            </select>
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

            <Card>
                <h2 className="text-sm font-bold text-gray-800 mb-4">Danh sách Phương tiện</h2>
                <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-600">
                    <thead className="bg-gray-50 text-gray-900 font-semibold border-b">
                    <tr>
                        <th className="p-2">Biển số</th>
                        <th className="p-2">Loại xe</th>
                        <th className="p-2">Hạn Đăng kiểm</th>
                        <th className="p-2 text-center">Trạng thái</th>
                        <th className="p-2 text-center">Tác vụ</th>
                    </tr>
                    </thead>
                    <tbody>
                    {vehicles.map(v => {
                        const isExpiringSoon = checkInspectionExpiry(v.inspectionExpiryDate);
                        return (
                            <tr key={v.id} className={`border-b last:border-0 hover:bg-gray-50 ${isExpiringSoon ? 'bg-red-50' : ''}`}>
                                <td className="p-2 font-bold text-[#2c4aa0]">{v.licensePlate}</td>
                                <td className="p-2 text-xs">{v.vehicleType}</td>
                                <td className="p-2 text-xs flex items-center gap-2">
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
                                <td className="p-2 text-center">
                                    <VehicleStatusBadge status={v.status} />
                                </td>
                                <td className="p-2 flex justify-center gap-2">
                                    <button 
                                        onClick={() => toggleVehicleStatus(v.id)} 
                                        className={`p-1 rounded transition-colors ${v.status === 'OPERATING' ? 'text-gray-400 hover:text-orange-500' : 'text-green-500 hover:text-green-700'}`}
                                        title={v.status === 'OPERATING' ? 'Ngừng vận hành' : 'Bật vận hành'}
                                    >
                                        <IconCheckCircle className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => handleEditVehicle(v)} className="text-blue-600 hover:bg-blue-50 p-1 rounded" title="Sửa"><IconEdit className="w-4 h-4" /></button>
                                    <button onClick={() => handleDeleteVehicle(v.id)} className="text-red-600 hover:bg-red-50 p-1 rounded" title="Xóa"><IconTrash className="w-4 h-4" /></button>
                                </td>
                            </tr>
                        );
                    })}
                    </tbody>
                </table>
                </div>
            </Card>
        </div>
    </div>
  );

  const renderAdvanceManagement = () => (
      <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="h-fit">
                  <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <IconWallet className="w-5 h-5 text-[#2c4aa0]" /> Quản lý Loại tạm ứng
                  </h2>
                  <form onSubmit={handleAddAdvanceType} className="flex gap-2 mb-4">
                      <input name="name" placeholder="Tên loại (vd: Ăn uống)..." required className="flex-1 p-2 text-sm border rounded" />
                      <Button type="submit" variant="secondary" className="px-3 py-1 text-xs whitespace-nowrap"><IconPlus className="w-4 h-4" /></Button>
                  </form>
                  <div className="max-h-40 overflow-y-auto space-y-1">
                      {advanceTypes.map(at => (
                          <div key={at.id} className="flex justify-between items-center p-2 bg-gray-50 rounded text-sm group">
                              <span>{at.name}</span>
                              <button onClick={() => handleDeleteAdvanceType(at.id)} className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <IconTrash className="w-4 h-4" />
                              </button>
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
                          <input type="number" className="w-full p-2 text-sm border rounded" value={adminAdvAmount} onChange={e => setAdminAdvAmount(e.target.value)} />
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
                                        {req.status === RequestStatus.PENDING && (
                                            <>
                                                <Button variant="success" className="px-2 py-1 text-xs" onClick={() => handleApproveAdvance(req.id)}>Duyệt</Button>
                                                <Button variant="danger" className="px-2 py-1 text-xs" onClick={() => handleRejectAdvance(req.id)}>Từ chối</Button>
                                            </>
                                        )}
                                        <button onClick={() => handleDeleteAdvanceRequest(req.id)} className="text-gray-400 hover:text-red-500 p-1" title="Xóa">
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

  const renderFuelManagement = () => {
    const pendingRequests = requests.filter(r => r.status === RequestStatus.PENDING);
    const historyRequests = requests.filter(r => r.status !== RequestStatus.PENDING);

    return (
      <div className="space-y-8 animate-fade-in">
        <Card>
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <IconTrendingUp className="w-5 h-5 text-[#2c4aa0]" />
                Quản lý giá dầu
            </h2>
            <form onSubmit={handleSaveFuelPrice} className="space-y-3 mb-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                    <div className="flex-1">
                        <label className="text-xs text-gray-500">Ngày áp dụng</label>
                        <input 
                            name="date" 
                            type="date" 
                            required 
                            key={editingFuelPrice ? `date-${editingFuelPrice.id}` : 'date-new'}
                            defaultValue={editingFuelPrice?.date.split('T')[0]} 
                            className="w-full p-2 text-sm border rounded focus:ring-1 focus:ring-[#2c4aa0] outline-none" 
                        />
                    </div>
                    <div className="flex-1">
                        <label className="text-xs text-gray-500">Giờ áp dụng</label>
                        <input 
                            name="time" 
                            type="time" 
                            required 
                            key={editingFuelPrice ? `time-${editingFuelPrice.id}` : 'time-new'}
                            defaultValue={editingFuelPrice?.date.split('T')[1]} 
                            className="w-full p-2 text-sm border rounded focus:ring-1 focus:ring-[#2c4aa0] outline-none" 
                        />
                    </div>
                    <div className="flex-1">
                        <label className="text-xs text-gray-500">Giá (VNĐ/Lít)</label>
                        <input 
                            name="price" 
                            type="number" 
                            placeholder="Giá/Lít" 
                            required 
                            key={editingFuelPrice ? `price-${editingFuelPrice.id}` : 'price-new'}
                            defaultValue={editingFuelPrice?.pricePerLiter} 
                            className="w-full p-2 text-sm border rounded focus:ring-1 focus:ring-[#2c4aa0] outline-none" 
                        />
                    </div>
                    <div className="flex gap-2">
                        <Button variant="secondary" className="text-xs whitespace-nowrap flex-1" type="submit">
                            {editingFuelPrice ? 'Cập nhật' : 'Thêm giá'}
                        </Button>
                        {editingFuelPrice && (
                            <Button variant="ghost" className="text-xs" onClick={() => setEditingFuelPrice(null)}>Hủy</Button>
                        )}
                    </div>
                </div>
            </form>
            <div className="max-h-48 overflow-y-auto space-y-2">
            {prices.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(p => (
                <div key={p.id} className="flex justify-between items-center text-xs p-2 bg-gray-50 rounded group">
                    <div className="flex gap-6 items-center">
                        <div className="flex flex-col">
                            <span className="font-semibold text-gray-900">{formatDateTime(p.date)}</span>
                            <span className="text-[10px] text-gray-400 uppercase">Ngày & Giờ hiệu lực</span>
                        </div>
                        <span className="font-bold text-[#2c4aa0] text-sm">{formatCurrency(p.pricePerLiter)}/L</span>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleEditFuelPrice(p)} className="text-blue-500 hover:text-blue-700" title="Sửa">
                            <IconEdit className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDeletePrice(p.id)} className="text-red-400 hover:text-red-500" title="Xóa">
                            <IconTrash className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>
            ))}
            </div>
        </Card>

        <Card className="border-[#2c4aa0] border-2">
          <h2 className="text-lg font-bold text-[#2c4aa0] mb-4 flex items-center gap-2">
            <IconPlus className="w-5 h-5" /> Tạo & Duyệt phiếu cấp dầu
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
             <div>
               <label className="block text-xs font-semibold text-gray-600 mb-1">Tài xế</label>
               <select className="w-full p-2 border rounded-lg text-sm" value={adminNewDriver} onChange={(e) => setAdminNewDriver(e.target.value)}>
                 <option value="">-- Chọn tài xế --</option>
                 {drivers.map(d => <option key={d.id} value={d.fullName}>{d.fullName}</option>)}
               </select>
             </div>
             <div>
               <label className="block text-xs font-semibold text-gray-600 mb-1">Ngày đổ dầu</label>
               <input type="date" className="w-full p-2 border rounded-lg text-sm" value={adminNewDate} onChange={(e) => setAdminNewDate(e.target.value)} />
             </div>
             <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Cây xăng</label>
                <select className="w-full p-2 border rounded-lg text-sm" value={adminNewStation} onChange={(e) => setAdminNewStation(e.target.value)}>
                  <option value="">-- Chọn trạm --</option>
                  {stations.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
             </div>
             <div>
                <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-semibold text-gray-600">Số tiền duyệt</label>
                    <div className="flex items-center gap-1">
                        <input type="checkbox" id="adminNewFullTank" checked={adminNewFullTank} onChange={(e) => setAdminNewFullTank(e.target.checked)} className="w-3 h-3" />
                        <label htmlFor="adminNewFullTank" className="text-xs text-[#2c4aa0] font-bold cursor-pointer">Đầy bình</label>
                    </div>
                </div>
                {!adminNewFullTank ? (
                     <div className="relative">
                        <input type="number" placeholder="VD: 1.5" step="0.1" className="w-full p-2 border rounded-lg text-sm" value={adminNewAmount} onChange={(e) => setAdminNewAmount(e.target.value)} />
                        <span className="absolute right-2 top-2 text-xs text-gray-400">Triệu VNĐ</span>
                    </div>
                ) : (
                    <div className="w-full p-2 border rounded-lg text-sm bg-gray-100 text-gray-500 italic">Duyệt đổ đầy bình</div>
                )}
             </div>
          </div>
          
          <div className="mt-4 flex flex-col md:flex-row gap-4 items-center">
             <div className="flex-1 w-full">
                <div className="bg-gray-50 p-2 rounded flex flex-wrap gap-4 text-sm items-center">
                    <div className="flex items-center gap-1">
                      <span className="text-gray-500">Xe:</span>
                      {adminAutoVehicle ? <span className="font-bold">{adminAutoVehicle}</span> : <span className="text-red-500">Chưa xác định</span>}
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-gray-500">Giá dầu áp dụng:</span>
                      {appliedPriceForAdminForm ? (
                        <span className="font-bold text-[#2c4aa0]">{formatCurrency(appliedPriceForAdminForm)}</span>
                      ) : (
                        <span className="text-red-500">Thiếu giá</span>
                      )}
                    </div>
                </div>
             </div>
             <Button className="w-full md:w-auto whitespace-nowrap" onClick={handleAdminCreateRequest}>Tạo phiếu & Duyệt ngay</Button>
          </div>
        </Card>

        <div>
          <h2 className="text-xl font-bold text-[#2c4aa0] mb-4 flex items-center gap-2">
            <IconCheckCircle className="w-6 h-6" /> Yêu cầu chờ duyệt ({pendingRequests.length})
          </h2>
          <div className="grid grid-cols-1 gap-4">
            {pendingRequests.length === 0 && <p className="text-gray-500 italic">Không có yêu cầu nào đang chờ.</p>}
            {pendingRequests.map(req => (
                <div key={req.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-lg">{req.driverName}</span>
                      <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded font-mono border">{req.licensePlate}</span>
                      <span className="text-sm bg-blue-50 text-blue-700 px-2 py-0.5 rounded">Ngày: {formatDate(req.requestDate)}</span>
                    </div>
                    {req.notes && <p className="text-sm text-gray-600 mt-1 italic">"{req.notes}"</p>}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" onClick={() => { setSelectedRequest(req); handleReject(); }}>Từ chối</Button>
                    <Button onClick={() => openApprovalModal(req)}>Duyệt cấp dầu</Button>
                  </div>
                </div>
            ))}
          </div>
        </div>

        <div>
           <h2 className="text-xl font-bold text-gray-700 mb-4 mt-8">Lịch sử giao dịch</h2>
           <div className="overflow-x-auto bg-white rounded-xl shadow-sm">
             <table className="w-full text-left text-sm text-gray-600">
               <thead className="bg-gray-50 text-gray-900 font-semibold border-b">
                 <tr>
                   <th className="p-4">Ngày yêu cầu</th>
                   <th className="p-4">Tài xế / Xe</th>
                   <th className="p-4">Trạm</th>
                   <th className="p-4 text-right">Số tiền</th>
                   <th className="p-4 text-right">Số lít</th>
                   <th className="p-4 text-center">Trạng thái</th>
                   <th className="p-4 text-center">Tác vụ</th>
                 </tr>
               </thead>
               <tbody>
                 {historyRequests.map(req => (
                   <tr key={req.id} className="border-b last:border-0 hover:bg-gray-50">
                     <td className="p-4">
                        <div className="text-gray-900">{formatDate(req.requestDate)}</div>
                        {req.approvalDate && <div className="text-[10px] text-gray-400">Duyệt lúc: {formatDateTime(req.approvalDate)}</div>}
                     </td>
                     <td className="p-4">
                        <div className="font-medium text-gray-900">{req.driverName}</div>
                        <div className="text-xs text-gray-500 font-mono">{req.licensePlate}</div>
                     </td>
                     <td className="p-4">{stations.find(s => s.id === req.stationId)?.name || '-'}</td>
                     <td className="p-4 text-right font-medium">
                        {req.isFullTank && editingHistoryId === req.id ? (
                             <div className="flex flex-col items-end gap-1">
                                <div className="relative w-32">
                                     <input autoFocus type="number" step="0.1" className="w-full p-1 text-sm border rounded" value={editingHistoryAmount} onChange={e => setEditingHistoryAmount(e.target.value)} placeholder="Triệu VNĐ" />
                                </div>
                                <div className="flex gap-1">
                                    <button onClick={() => setEditingHistoryId(null)} className="text-xs text-gray-500 hover:text-red-500">Hủy</button>
                                    <button onClick={() => handleUpdateHistoryAmount(req.id)} className="text-xs text-[#2c4aa0] font-bold hover:underline">Lưu</button>
                                </div>
                             </div>
                        ) : (
                             <div className="flex flex-col items-end">
                                 {req.isFullTank && <span className="text-[#2c4aa0] font-bold text-xs bg-blue-50 px-2 py-0.5 rounded mb-1">Đầy bình</span>}
                                 <div className="flex items-center gap-2">
                                    <span>{req.approvedAmount ? formatCurrency(req.approvedAmount) : '0 ₫'}</span>
                                    {req.isFullTank && (
                                        <button onClick={() => { setEditingHistoryId(req.id); setEditingHistoryAmount(req.approvedAmount ? (req.approvedAmount / 1000000).toString() : ''); }} className="text-gray-400 hover:text-[#2c4aa0]"><IconEdit className="w-4 h-4" /></button>
                                    )}
                                 </div>
                             </div>
                        )}
                     </td>
                     <td className="p-4 text-right">{req.approvedLiters ? `${req.approvedLiters} L` : '-'}</td>
                     <td className="p-4 text-center"><Badge status={req.status} /></td>
                     <td className="p-4 text-center">
                        <button onClick={() => handleDeleteFuelRequest(req.id)} className="text-gray-400 hover:text-red-500 p-1" title="Xóa">
                            <IconTrash className="w-4 h-4" />
                        </button>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
        </div>
      </div>
    );
  };

  const renderDashboard = () => (
    <div className="space-y-8 animate-fade-in">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
           <Card className="flex items-center gap-4 border-l-4 border-yellow-400">
              <div className="p-3 bg-yellow-100 rounded-full text-yellow-600"><IconCheckCircle className="w-6 h-6" /></div>
              <div>
                <p className="text-gray-500 text-sm font-medium">Dầu chờ duyệt</p>
                <p className="text-2xl font-bold text-gray-800">{requests.filter(r => r.status === RequestStatus.PENDING).length}</p>
              </div>
           </Card>
           <Card className="flex items-center gap-4 border-l-4 border-orange-400">
              <div className="p-3 bg-orange-100 rounded-full text-orange-600"><IconWallet className="w-6 h-6" /></div>
              <div>
                <p className="text-gray-500 text-sm font-medium">Tạm ứng chờ duyệt</p>
                <p className="text-2xl font-bold text-gray-800">{advanceRequests.filter(r => r.status === RequestStatus.PENDING).length}</p>
              </div>
           </Card>
        </div>

        {/* AI Insight Card */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100 shadow-md">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
                <div>
                    <h3 className="text-lg font-bold text-[#2c4aa0] flex items-center gap-2">
                        <IconSparkles className="w-5 h-5" /> AI Insight - Phân tích hiệu quả
                    </h3>
                    <p className="text-xs text-blue-600">Phân tích xu hướng tiêu thụ và chi phí tự động bởi Gemini AI</p>
                </div>
                <Button 
                    onClick={handleAnalyze} 
                    disabled={isAnalyzing}
                    variant="secondary"
                    className="bg-white border-blue-200 hover:bg-blue-50 shadow-sm"
                >
                    {isAnalyzing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#2c4aa0] mr-2"></div>
                        Đang phân tích...
                      </>
                    ) : (
                      <>
                        <IconSparkles className="w-4 h-4" /> Cập nhật phân tích AI
                      </>
                    )}
                </Button>
            </div>
            {aiAnalysis ? (
                <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line bg-white/70 p-5 rounded-xl border border-blue-50 shadow-inner">
                    {aiAnalysis}
                </div>
            ) : (
                <div className="text-center py-8 px-4 bg-white/30 rounded-xl border border-dashed border-blue-200">
                    <p className="text-sm text-gray-500 italic">Nhấn nút "Cập nhật phân tích AI" để nhận thông tin chi tiết về hoạt động vận hành của bạn.</p>
                </div>
            )}
        </Card>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
             <h3 className="text-lg font-bold text-gray-800 mb-2">Chào mừng đến với ERP HIEPPHAT</h3>
             <p className="text-gray-600">Hệ thống quản lý nhiên liệu và vận tải ERP HIEPPHAT.</p>
        </div>
    </div>
  );

  const renderReports = () => {
      // Calculate report data based on current range
      const periodFuel = requests.filter(r => r.status === RequestStatus.APPROVED && r.requestDate >= reportStartDate && r.requestDate <= reportEndDate);
      const periodAdvances = advanceRequests.filter(a => a.status === RequestStatus.APPROVED && a.requestDate >= reportStartDate && a.requestDate <= reportEndDate);
      const periodSalaries = salaryRecords.filter(s => s.transportDate >= reportStartDate && s.transportDate <= reportEndDate);

      const totalFuelCost = periodFuel.reduce((sum, r) => sum + (r.approvedAmount || 0), 0);
      const totalSalaryCost = periodSalaries.reduce((sum, s) => sum + s.salary + s.handlingFee, 0);
      const totalAdvanceCost = periodAdvances.reduce((sum, a) => sum + a.amount, 0);
      const grandTotal = totalFuelCost + totalSalaryCost;

      // Group by driver
      const driverStats = drivers.map(driver => {
          const dSalary = periodSalaries.filter(s => s.driverName === driver.fullName).reduce((sum, s) => sum + s.salary + s.handlingFee, 0);
          const dFuel = periodFuel.filter(r => r.driverName === driver.fullName).reduce((sum, r) => sum + (r.approvedAmount || 0), 0);
          const dAdvances = periodAdvances.filter(a => a.driverName === driver.fullName).reduce((sum, a) => sum + a.amount, 0);
          return { name: driver.fullName, salary: dSalary, fuel: dFuel, advances: dAdvances, total: dSalary + dFuel };
      }).filter(d => d.total > 0).sort((a,b) => b.total - a.total);

      // Group by cargo
      const cargoStats = {
          CONT: periodSalaries.filter(s => s.cargoType === 'CONT').length,
          PALLET: periodSalaries.filter(s => s.cargoType === 'PALLET').length,
          TRANSFER: periodSalaries.filter(s => s.cargoType === 'TRANSFER').length,
          GLASS: periodSalaries.filter(s => s.cargoType === 'GLASS').length,
      };
      const totalTrips = periodSalaries.length;

      return (
        <div className="space-y-6 animate-fade-in pb-12">
            <Card className="border-t-4 border-[#2c4aa0]">
                <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                            <IconChartBar className="w-7 h-7 text-[#2c4aa0]" /> Báo cáo thống kê
                        </h2>
                        <p className="text-sm text-gray-500">Phân tích dữ liệu từ {formatDate(reportStartDate)} đến {formatDate(reportEndDate)}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 bg-gray-50 p-2 rounded-lg border">
                        <div className="flex items-center gap-2">
                            <label className="text-[10px] font-bold uppercase text-gray-400">Từ</label>
                            <input type="date" value={reportStartDate} onChange={e => setReportStartDate(e.target.value)} className="p-1.5 text-sm border rounded bg-white outline-none focus:ring-1 focus:ring-[#2c4aa0]" />
                        </div>
                        <span className="text-gray-300">|</span>
                        <div className="flex items-center gap-2">
                            <label className="text-[10px] font-bold uppercase text-gray-400">Đến</label>
                            <input type="date" value={reportEndDate} onChange={e => setReportEndDate(e.target.value)} className="p-1.5 text-sm border rounded bg-white outline-none focus:ring-1 focus:ring-[#2c4aa0]" />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-blue-600 text-white p-5 rounded-2xl shadow-lg shadow-blue-100 flex flex-col justify-between">
                        <span className="text-xs font-medium opacity-80 uppercase tracking-wider">Tổng chi phí vận hành</span>
                        <span className="text-2xl font-bold mt-2">{formatCurrency(grandTotal)}</span>
                    </div>
                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Chi phí Nhiên liệu</span>
                        <span className="text-2xl font-bold text-[#2c4aa0] mt-2">{formatCurrency(totalFuelCost)}</span>
                    </div>
                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Chi phí Lương & Thưởng</span>
                        <span className="text-2xl font-bold text-orange-600 mt-2">{formatCurrency(totalSalaryCost)}</span>
                    </div>
                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Tổng Tạm ứng đã duyệt</span>
                        <span className="text-2xl font-bold text-emerald-600 mt-2">{formatCurrency(totalAdvanceCost)}</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2 px-1">
                            <IconUsers className="w-4 h-4" /> Hiệu quả theo Tài xế
                        </h3>
                        <div className="bg-gray-50 rounded-2xl overflow-hidden border">
                            <table className="w-full text-xs text-left">
                                <thead className="bg-white text-gray-400 font-bold uppercase border-b">
                                    <tr>
                                        <th className="p-3">Tài xế</th>
                                        <th className="p-3 text-right">Lương</th>
                                        <th className="p-3 text-right">Dầu</th>
                                        <th className="p-3 text-right">Tổng chi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {driverStats.length === 0 ? (
                                        <tr><td colSpan={4} className="p-8 text-center text-gray-400 italic">Không có dữ liệu trong thời gian này</td></tr>
                                    ) : (
                                        driverStats.map((stat, i) => (
                                            <tr key={i} className="border-b last:border-0 hover:bg-blue-50/50 transition-colors">
                                                <td className="p-3 font-bold text-gray-800">{stat.name}</td>
                                                <td className="p-3 text-right text-gray-600">{formatCurrency(stat.salary)}</td>
                                                <td className="p-3 text-right text-gray-600">{formatCurrency(stat.fuel)}</td>
                                                <td className="p-3 text-right font-bold text-[#2c4aa0]">{formatCurrency(stat.total)}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2 px-1">
                                <IconTruck className="w-4 h-4" /> Cơ cấu chuyến vận chuyển ({totalTrips} chuyến)
                            </h3>
                            <div className="bg-white border rounded-2xl p-6 space-y-4 shadow-sm">
                                {(Object.entries(cargoStats) as [CargoType, number][]).map(([type, count]) => (
                                    <div key={type} className="space-y-1">
                                        <div className="flex justify-between text-[10px] font-bold uppercase">
                                            <span className="text-gray-500">{type}</span>
                                            <span className="text-[#2c4aa0]">{count} chuyến</span>
                                        </div>
                                        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                            <div 
                                                className="h-full bg-[#2c4aa0] transition-all duration-1000" 
                                                style={{ width: totalTrips > 0 ? `${(count/totalTrips)*100}%` : '0%' }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-[#2c4aa0] to-blue-800 rounded-2xl p-6 text-white shadow-xl">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold flex items-center gap-2">
                                    <IconSparkles className="w-5 h-5 text-yellow-300" /> Phân tích AI chuyên sâu
                                </h3>
                                <Button 
                                    onClick={handleAnalyzeReport} 
                                    disabled={isAnalyzingReport}
                                    variant="secondary"
                                    className="bg-white/10 border-white/20 text-white hover:bg-white/20 px-3 py-1.5"
                                >
                                    {isAnalyzingReport ? 'Đang phân tích...' : 'Bắt đầu AI'}
                                </Button>
                            </div>
                            {reportAiAnalysis ? (
                                <div className="text-sm leading-relaxed opacity-95 bg-black/10 p-4 rounded-xl border border-white/10">
                                    {reportAiAnalysis}
                                </div>
                            ) : (
                                <p className="text-xs text-blue-100 opacity-70 italic">Hệ thống AI sẽ đánh giá hiệu suất chi phí, phát hiện bất thường và đề xuất tối ưu dựa trên dữ liệu thật của kỳ này.</p>
                            )}
                        </div>
                    </div>
                </div>
            </Card>
        </div>
      );
  };

  const DriverView = () => {
    const driverHistory = useMemo(() => {
        return requests.filter(r => r.driverName === CURRENT_DRIVER_NAME)
                       .sort((a,b) => new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime());
    }, [requests]);

    return (
      <div className="max-w-md mx-auto space-y-6">
        <div className="flex bg-white rounded-lg shadow-sm p-1 border">
            <button onClick={() => setDriverTab('FUEL')} className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${driverTab === 'FUEL' ? 'bg-[#2c4aa0] text-white' : 'text-gray-600 hover:bg-gray-50'}`}>Nhiên liệu</button>
            <button onClick={() => setDriverTab('ADVANCE')} className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${driverTab === 'ADVANCE' ? 'bg-[#2c4aa0] text-white' : 'text-gray-600 hover:bg-gray-50'}`}>Tạm ứng</button>
            <button onClick={() => setDriverTab('SALARY')} className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${driverTab === 'SALARY' ? 'bg-[#2c4aa0] text-white' : 'text-gray-600 hover:bg-gray-50'}`}>Lương</button>
        </div>

        {driverTab === 'FUEL' && (
          <>
            <Card>
                <h2 className="text-xl font-bold text-[#2c4aa0] mb-4 flex items-center gap-2"><IconGasPump className="w-6 h-6" /> Yêu cầu đổ dầu</h2>
                <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ngày đổ dầu dự kiến</label>
                    <input type="date" value={newRequestDate} onChange={(e) => setNewRequestDate(e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg outline-none" />
                </div>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <label className="block text-xs font-semibold text-blue-800 uppercase mb-1">Xe vận hành</label>
                    {autoAssignedVehicle ? <span className="text-xl font-bold text-gray-900 font-mono">{autoAssignedVehicle}</span> : <span className="text-red-500 text-sm">Chưa có xe phân công ngày này</span>}
                </div>
                <textarea rows={3} value={newRequestNote} onChange={(e) => setNewRequestNote(e.target.value)} placeholder="Ghi chú (Số KM, lộ trình...)" className="w-full p-2 border border-gray-300 rounded-lg outline-none" />
                <Button onClick={handleDriverSubmit} className="w-full" disabled={!autoAssignedVehicle}>Gửi yêu cầu</Button>
                </div>
            </Card>

            <div className="space-y-3">
                <h3 className="font-bold text-gray-700 flex items-center gap-2 px-1">
                    <IconTrendingUp className="w-4 h-4" /> Lịch sử & Thông tin duyệt dầu
                </h3>
                {driverHistory.length === 0 ? (
                    <Card className="text-center py-10 text-gray-400 italic text-sm">Chưa có yêu cầu nào.</Card>
                ) : (
                    driverHistory.map(req => (
                        <Card key={req.id} className="p-4 border-l-4 border-[#2c4aa0] relative group">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">{formatDate(req.requestDate)}</div>
                                    <div className="text-lg font-bold text-gray-800 font-mono mt-0.5">{req.licensePlate}</div>
                                </div>
                                <Badge status={req.status} />
                            </div>

                            {req.status === RequestStatus.APPROVED ? (
                                <div className="bg-green-50 p-3 rounded-lg border border-green-100 mt-2 space-y-1">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-600 font-medium">Số tiền được duyệt:</span>
                                        <span className="text-green-700 font-bold text-lg">{req.isFullTank ? 'Đầy bình' : formatCurrency(req.approvedAmount || 0)}</span>
                                    </div>
                                    {req.approvedLiters && (
                                        <div className="flex justify-between items-center text-sm border-t border-green-100 pt-1">
                                            <span className="text-gray-600">Số lít ước tính:</span>
                                            <span className="text-green-700 font-semibold">{req.approvedLiters} L</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between items-center text-sm border-t border-green-100 pt-1">
                                        <span className="text-gray-600">Trạm xăng:</span>
                                        <span className="text-[#2c4aa0] font-bold">{stations.find(s => s.id === req.stationId)?.name || 'Liên hệ Admin'}</span>
                                    </div>
                                </div>
                            ) : (
                                req.notes && <div className="text-sm text-gray-500 italic mt-2">"{req.notes}"</div>
                            )}

                            {req.approvalDate && (
                                <div className="mt-3 pt-2 border-t border-dashed flex justify-between text-[10px] text-gray-400 font-bold uppercase">
                                    <span>Xử lý lúc:</span>
                                    <span>{formatDateTime(req.approvalDate)}</span>
                                </div>
                            )}
                        </Card>
                    ))
                )}
            </div>
          </>
        )}
      </div>
    );
  };

  const AdminView = () => (
    <div className="flex flex-col md:flex-row gap-6">
      <div className="w-full md:w-64 flex-shrink-0">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sticky top-24">
          <div className="space-y-1">
            <button onClick={() => setActiveTab('DASHBOARD')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'DASHBOARD' ? 'bg-[#2c4aa0] text-white' : 'text-gray-600 hover:bg-gray-50'}`}><IconHome className="w-5 h-5" /> Tổng quan</button>
            <button onClick={() => setActiveTab('FUEL')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'FUEL' ? 'bg-[#2c4aa0] text-white' : 'text-gray-600 hover:bg-gray-50'}`}><IconGasPump className="w-5 h-5" /> Nhiên liệu</button>
            <button onClick={() => setActiveTab('ADVANCES')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'ADVANCES' ? 'bg-[#2c4aa0] text-white' : 'text-gray-600 hover:bg-gray-50'}`}><IconWallet className="w-5 h-5" /> Tạm ứng</button>
            <button onClick={() => setActiveTab('SALARY')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'SALARY' ? 'bg-[#2c4aa0] text-white' : 'text-gray-600 hover:bg-gray-50'}`}><IconCurrency className="w-5 h-5" /> Lương & Chi phí</button>
            <button onClick={() => setActiveTab('OPERATION')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'OPERATION' ? 'bg-[#2c4aa0] text-white' : 'text-gray-600 hover:bg-gray-50'}`}><IconUsers className="w-5 h-5" /> Quản lý Vận hành</button>
            <button onClick={() => setActiveTab('REPORTS')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'REPORTS' ? 'bg-[#2c4aa0] text-white' : 'text-gray-600 hover:bg-gray-50'}`}><IconChartBar className="w-5 h-5" /> Báo cáo thống kê</button>
          </div>
        </div>
      </div>
      <div className="flex-1">
        {activeTab === 'DASHBOARD' && renderDashboard()}
        {activeTab === 'FUEL' && renderFuelManagement()}
        {activeTab === 'ADVANCES' && renderAdvanceManagement()}
        {activeTab === 'SALARY' && renderSalaryManagement()}
        {activeTab === 'OPERATION' && renderOperationManagement()}
        {activeTab === 'REPORTS' && renderReports()}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen pb-12" style={{ backgroundColor: BG_COLOR }}>
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[#2c4aa0]"><IconGasPump className="w-8 h-8" /><span className="font-bold text-xl tracking-tight">ERP HIEPPHAT</span></div>
          <div className="flex items-center gap-4">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button onClick={() => setRole('DRIVER')} className={`px-3 py-1 text-sm rounded-md transition-all ${role === 'DRIVER' ? 'bg-white shadow text-[#2c4aa0] font-medium' : 'text-gray-500'}`}>Tài xế</button>
              <button onClick={() => setRole('ADMIN')} className={`px-3 py-1 text-sm rounded-md transition-all ${role === 'ADMIN' ? 'bg-white shadow text-[#2c4aa0] font-medium' : 'text-gray-500'}`}>Admin</button>
            </div>
            <div className="flex items-center gap-2 text-sm font-medium text-gray-600"><IconUser className="w-5 h-5" /><span className="hidden sm:inline">{role === 'DRIVER' ? CURRENT_DRIVER_NAME : 'Quản trị viên'}</span></div>
          </div>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-8">{role === 'DRIVER' ? <DriverView /> : <AdminView />}</main>

      {/* Approval Modal */}
      {isModalOpen && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-fade-in">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Duyệt cấp dầu</h3>
            <div className="bg-blue-50 p-4 rounded-lg mb-6 text-sm">
              <div className="flex justify-between mb-1"><span className="text-gray-600">Tài xế:</span><span className="font-semibold">{selectedRequest.driverName}</span></div>
              <div className="flex justify-between mb-1"><span className="text-gray-600">Biển số:</span><span className="font-semibold">{selectedRequest.licensePlate}</span></div>
              <div className="mt-2 pt-2 border-t border-blue-100 flex justify-between">
                <span className="text-gray-600">Giá tham chiếu hiện tại:</span>
                <span className="font-bold text-[#2c4aa0]">
                    {getPriceForTime(new Date().toISOString(), prices) 
                        ? formatCurrency(getPriceForTime(new Date().toISOString(), prices)!) 
                        : "Thiếu giá"}
                </span>
              </div>
            </div>
            <div className="space-y-4">
              <select className="w-full p-2 border rounded-lg bg-white" value={adminStation} onChange={(e) => setAdminStation(e.target.value)}><option value="">-- Chọn trạm --</option>{stations.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select>
              <div className="flex items-center gap-2 mb-2"><input type="checkbox" id="isAdminFullTank" checked={isAdminFullTank} onChange={(e) => setIsAdminFullTank(e.target.checked)} /><label htmlFor="isAdminFullTank" className="text-sm font-bold text-[#2c4aa0]">Đầy bình</label></div>
              {!isAdminFullTank && <input type="number" step="0.1" className="w-full p-2 border rounded-lg" placeholder="Số tiền (triệu VNĐ)" value={adminAmount} onChange={(e) => setAdminAmount(e.target.value)} />}
            </div>
            <div className="flex gap-3 mt-8">
              <Button variant="ghost" className="flex-1" onClick={() => setIsModalOpen(false)}>Hủy</Button>
              <Button className="flex-1" onClick={handleApprove} disabled={!adminStation || (!adminAmount && !isAdminFullTank)}>Xác nhận</Button>
            </div>
          </div>
        </div>
      )}

      {/* Copy Message Modal */}
      {showCopyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-sm w-full p-6 animate-fade-in text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600"><IconCheck className="w-6 h-6" /></div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
                {role === 'DRIVER' ? 'Gửi yêu cầu thành công!' : 'Thao tác thành công!'}
            </h3>
            <div className="bg-gray-100 p-3 rounded-lg text-left text-sm font-mono mb-4 whitespace-pre-line border select-all">{copyMessage}</div>
            <Button onClick={handleCopy} variant="primary" className="w-full"><IconCopy className="w-5 h-5" /> Copy & Đóng</Button>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full p-6 animate-fade-in flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800">Import từ Google Sheets</h3>
                <button onClick={() => { setShowImportModal(false); setImportPreviewRecords([]); }} className="text-gray-400 hover:text-gray-600"><IconXCircle className="w-6 h-6" /></button>
            </div>

            {importPreviewRecords.length === 0 ? (
              <>
                <div className="mb-4 bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <p className="text-xs text-blue-800 font-semibold mb-2 uppercase tracking-wider">Thứ tự cột cần copy (14 cột):</p>
                    <p className="text-[11px] text-blue-700 leading-relaxed font-medium">
                        1. Ngày VC | 2. Tài xế | 3. Loại hàng | 4. Số CONT/DO | 5. SL 20 | 6. SL 40 | 7. SL Pallet/Tấn | 8. Kho Đóng | 9. Kho Nhập | 10. Depot | 11. Hạ bãi | 12. Lương | 13. Làm hàng | 14. Ghi chú
                    </p>
                </div>
                <textarea 
                    className="w-full flex-1 p-3 border rounded-lg font-mono text-[10px] focus:ring-2 focus:ring-[#2c4aa0] outline-none min-h-[300px]" 
                    placeholder="Dán dữ liệu từ Sheets vào đây (Ctrl+V)..."
                    value={importText}
                    onChange={(e) => setImportText(e.target.value)}
                />
                <div className="flex gap-3 mt-6">
                  <Button variant="ghost" className="flex-1" onClick={() => setShowImportModal(false)}>Hủy bỏ</Button>
                  <Button className="flex-2" onClick={handleParseImport} disabled={!importText.trim()}>Kiểm tra dữ liệu</Button>
                </div>
              </>
            ) : (
              <>
                <div className="mb-4 flex justify-between items-center bg-yellow-50 p-3 rounded-lg border border-yellow-100">
                    <p className="text-sm text-yellow-800 font-medium">
                      Tìm thấy <strong>{importPreviewRecords.length}</strong> bản ghi. Vui lòng kiểm tra lại trước khi xác nhận lưu.
                    </p>
                    <button onClick={() => setImportPreviewRecords([])} className="text-xs text-blue-600 underline font-bold">Làm lại / Dán lại</button>
                </div>
                <div className="flex-1 overflow-auto border rounded-lg">
                  <table className="w-full text-left text-[9px] border-collapse">
                    <thead className="bg-gray-100 sticky top-0">
                      <tr>
                        <th className="p-2 border">Ngày</th>
                        <th className="p-2 border">Tài xế</th>
                        <th className="p-2 border">Loại</th>
                        <th className="p-2 border">Số Cont/DO</th>
                        <th className="p-2 border text-right">Lương</th>
                        <th className="p-2 border text-right">Làm hàng</th>
                      </tr>
                    </thead>
                    <tbody>
                      {importPreviewRecords.map((r, i) => (
                        <tr key={i} className="hover:bg-gray-50 border-b">
                          <td className="p-2 border">{r.transportDate}</td>
                          <td className="p-2 border font-medium">{r.driverName}</td>
                          <td className="p-2 border">{r.cargoType}</td>
                          <td className="p-2 border font-mono">{r.refNumber}</td>
                          <td className="p-2 border text-right font-bold text-[#2c4aa0]">{formatCurrency(r.salary)}</td>
                          <td className="p-2 border text-right font-bold text-orange-600">{formatCurrency(r.handlingFee)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex gap-3 mt-6">
                  <Button variant="ghost" className="flex-1" onClick={() => setImportPreviewRecords([])}>Quay lại</Button>
                  <Button className="flex-2" onClick={handleConfirmImport}>Xác nhận lưu {importPreviewRecords.length} dòng</Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Edit Salary Modal */}
      {editingSalaryRecord && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 animate-fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800">Chỉnh sửa thông tin lương</h3>
                <button onClick={() => setEditingSalaryRecord(null)} className="text-gray-400 hover:text-gray-600"><IconXCircle className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleSaveSalaryRecord} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Ngày vận chuyển</label>
                <input name="transportDate" type="date" required defaultValue={editingSalaryRecord.transportDate} className="w-full p-2 border rounded text-sm focus:ring-2 focus:ring-[#2c4aa0] outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Tài xế</label>
                <input name="driverName" required defaultValue={editingSalaryRecord.driverName} className="w-full p-2 border rounded text-sm focus:ring-2 focus:ring-[#2c4aa0] outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Loại hàng</label>
                <select name="cargoType" required defaultValue={editingSalaryRecord.cargoType} className="w-full p-2 border rounded text-sm bg-white focus:ring-2 focus:ring-[#2c4aa0] outline-none">
                  <option value="CONT">Container</option>
                  <option value="PALLET">Pallet</option>
                  <option value="TRANSFER">Chuyển kho</option>
                  <option value="GLASS">Miểng chai</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Số CONT / DO</label>
                <input name="refNumber" required defaultValue={editingSalaryRecord.refNumber} className="w-full p-2 border rounded text-sm focus:ring-2 focus:ring-[#2c4aa0] outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Số lượng Cont 20</label>
                <input name="quantity20" type="number" step="0.01" defaultValue={editingSalaryRecord.quantity20} className="w-full p-2 border rounded text-sm focus:ring-2 focus:ring-[#2c4aa0] outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Số lượng Cont 40</label>
                <input name="quantity40" type="number" step="0.01" defaultValue={editingSalaryRecord.quantity40} className="w-full p-2 border rounded text-sm focus:ring-2 focus:ring-[#2c4aa0] outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">SL Pallet / Tấn</label>
                <input name="quantityOther" type="number" step="0.01" defaultValue={editingSalaryRecord.quantityOther} className="w-full p-2 border rounded text-sm focus:ring-2 focus:ring-[#2c4aa0] outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Kho Đóng</label>
                <input name="pickupWarehouse" defaultValue={editingSalaryRecord.pickupWarehouse} className="w-full p-2 border rounded text-sm focus:ring-2 focus:ring-[#2c4aa0] outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Kho Nhập</label>
                <input name="deliveryWarehouse" defaultValue={editingSalaryRecord.deliveryWarehouse} className="w-full p-2 border rounded text-sm focus:ring-2 focus:ring-[#2c4aa0] outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Depot</label>
                <input name="depotLocation" defaultValue={editingSalaryRecord.depotLocation} className="w-full p-2 border rounded text-sm focus:ring-2 focus:ring-[#2c4aa0] outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Hạ bãi</label>
                <input name="returnLocation" defaultValue={editingSalaryRecord.returnLocation} className="w-full p-2 border rounded text-sm focus:ring-2 focus:ring-[#2c4aa0] outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Lương</label>
                <input name="salary" type="number" required defaultValue={editingSalaryRecord.salary} className="w-full p-2 border rounded text-sm font-bold text-[#2c4aa0] focus:ring-2 focus:ring-[#2c4aa0] outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Làm hàng</label>
                <input name="handlingFee" type="number" defaultValue={editingSalaryRecord.handlingFee} className="w-full p-2 border rounded text-sm font-bold text-orange-600 focus:ring-2 focus:ring-[#2c4aa0] outline-none" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-600 mb-1">Ghi chú</label>
                <input name="notes" defaultValue={editingSalaryRecord.notes} className="w-full p-2 border rounded text-sm focus:ring-2 focus:ring-[#2c4aa0] outline-none" />
              </div>
              <div className="md:col-span-2 flex gap-3 mt-4">
                <Button variant="ghost" className="flex-1" onClick={() => setEditingSalaryRecord(null)}>Hủy</Button>
                <Button type="submit" className="flex-2">Lưu thay đổi</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}