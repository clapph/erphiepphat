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
  AdminTab
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
  IconHome
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

const MOCK_VEHICLES: Vehicle[] = [
  { id: 'v1', licensePlate: '51C-123.45', vehicleType: 'Xe Tải 5 Tấn', inspectionDate: '2023-01-10', inspectionExpiryDate: '2024-01-10' },
  { id: 'v2', licensePlate: '59D-987.65', vehicleType: 'Xe Container', inspectionDate: '2023-06-15', inspectionExpiryDate: '2024-06-15' },
];

const MOCK_ASSIGNMENTS: DriverAssignment[] = [
  { id: 'a1', driverName: 'Nguyễn Văn A', licensePlate: '51C-123.45', startDate: '2023-01-01' },
  { id: 'a2', driverName: 'Trần Văn B', licensePlate: '59D-987.65', startDate: '2023-01-01' },
];

const MOCK_REQUESTS: FuelRequest[] = [
  { id: 'r1', driverName: 'Nguyễn Văn A', licensePlate: '51C-123.45', requestDate: '2023-10-25', status: RequestStatus.PENDING },
  { id: 'r2', driverName: 'Trần Văn B', licensePlate: '59D-987.65', requestDate: '2023-10-24', status: RequestStatus.APPROVED, approvedAmount: 1175000, approvedLiters: 50, stationId: '1', approvalDate: '2023-10-24' },
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

// Find the active vehicle for a driver on a specific date
const getAssignedVehicle = (driverName: string, date: string, assignments: DriverAssignment[]): string | null => {
  const targetDate = new Date(date).getTime();
  const validAssignments = assignments.filter(a => 
    a.driverName === driverName && new Date(a.startDate).getTime() <= targetDate
  );
  validAssignments.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
  return validAssignments.length > 0 ? validAssignments[0].licensePlate : null;
};

// --- Components ---

const Button = ({ children, onClick, variant = 'primary', className = '', disabled = false }: any) => {
  const baseStyle = "px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2";
  const variants: any = {
    primary: `bg-[#2c4aa0] text-white hover:bg-[#1e3475] disabled:opacity-50`,
    secondary: `bg-white text-[#2c4aa0] border border-[#2c4aa0] hover:bg-blue-50`,
    danger: `bg-red-50 text-red-600 hover:bg-red-100`,
    ghost: `bg-transparent text-gray-500 hover:text-[#2c4aa0] hover:bg-gray-100`
  };
  return (
    <button onClick={onClick} className={`${baseStyle} ${variants[variant]} ${className}`} disabled={disabled}>
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
  
  const [requests, setRequests] = useState<FuelRequest[]>(MOCK_REQUESTS);
  const [prices, setPrices] = useState<FuelPrice[]>(MOCK_PRICES);
  const [stations] = useState<GasStation[]>(MOCK_STATIONS);
  const [assignments, setAssignments] = useState<DriverAssignment[]>(MOCK_ASSIGNMENTS);
  const [drivers, setDrivers] = useState<Driver[]>(MOCK_DRIVERS);
  const [vehicles, setVehicles] = useState<Vehicle[]>(MOCK_VEHICLES);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<FuelRequest | null>(null);
  
  // Admin Action State (For Approving)
  const [adminAmount, setAdminAmount] = useState<string>('');
  const [adminStation, setAdminStation] = useState<string>('');
  
  // Admin Create Request State
  const [adminNewDriver, setAdminNewDriver] = useState('');
  const [adminNewDate, setAdminNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [adminNewAmount, setAdminNewAmount] = useState('');
  const [adminNewStation, setAdminNewStation] = useState('');
  const [adminNewNote, setAdminNewNote] = useState('');

  // New Request State (Driver)
  const [newRequestDate, setNewRequestDate] = useState(new Date().toISOString().split('T')[0]);
  const [newRequestNote, setNewRequestNote] = useState('');

  // AI Report State
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Derived State for Driver View
  const autoAssignedVehicle = useMemo(() => {
    return getAssignedVehicle(CURRENT_DRIVER_NAME, newRequestDate, assignments);
  }, [newRequestDate, assignments]);

  const adminAutoVehicle = useMemo(() => {
    if (!adminNewDriver) return null;
    return getAssignedVehicle(adminNewDriver, adminNewDate, assignments);
  }, [adminNewDriver, adminNewDate, assignments]);

  // --- Actions ---

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
    if (!adminNewDriver || !adminNewAmount || !adminNewStation || !adminAutoVehicle) {
      alert("Vui lòng nhập đầy đủ thông tin: Tài xế, Trạm, Số tiền và đảm bảo có xe phân công.");
      return;
    }
    const price = getPriceForDate(adminNewDate, prices);
    if (!price) {
      alert(`Chưa có giá dầu cho ngày ${formatDate(adminNewDate)}.`);
      return;
    }
    const amount = parseInt(adminNewAmount);
    const liters = amount / price;

    const newReq: FuelRequest = {
      id: Math.random().toString(36).substr(2, 9),
      driverName: adminNewDriver,
      licensePlate: adminAutoVehicle,
      requestDate: adminNewDate,
      status: RequestStatus.APPROVED,
      notes: adminNewNote,
      approvedAmount: amount,
      approvedLiters: parseFloat(liters.toFixed(2)),
      stationId: adminNewStation,
      approvalDate: new Date().toISOString().split('T')[0],
    };

    setRequests([newReq, ...requests]);
    setAdminNewDriver('');
    setAdminNewAmount('');
    setAdminNewNote('');
    alert("Đã tạo và duyệt phiếu cấp dầu thành công!");
  };

  const openApprovalModal = (req: FuelRequest) => {
    setSelectedRequest(req);
    setIsModalOpen(true);
    setAdminAmount('');
    setAdminStation('');
  };

  const handleApprove = () => {
    if (!selectedRequest || !adminAmount || !adminStation) return;
    const price = getPriceForDate(selectedRequest.requestDate, prices);
    if (!price) {
      alert(`Không tìm thấy giá dầu cho ngày ${formatDate(selectedRequest.requestDate)}. Vui lòng cập nhật giá.`);
      return;
    }
    const amount = parseInt(adminAmount);
    const liters = amount / price;

    const updatedReq: FuelRequest = {
      ...selectedRequest,
      status: RequestStatus.APPROVED,
      approvedAmount: amount,
      approvedLiters: parseFloat(liters.toFixed(2)),
      stationId: adminStation,
      approvalDate: new Date().toISOString().split('T')[0],
    };

    setRequests(requests.map(r => r.id === updatedReq.id ? updatedReq : r));
    setIsModalOpen(false);
    setSelectedRequest(null);
  };

  const handleReject = () => {
    if (!selectedRequest) return;
    const updatedReq: FuelRequest = {
      ...selectedRequest,
      status: RequestStatus.REJECTED
    };
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
      setAssignments([
        ...assignments,
        {
          id: Math.random().toString(),
          driverName,
          licensePlate: licensePlate.toUpperCase(),
          startDate
        }
      ]);
      (e.target as HTMLFormElement).reset();
    }
  };

  const handleAddDriver = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const fullName = formData.get('fullName') as string;
    const phoneNumber = formData.get('phoneNumber') as string;
    const licenseNumber = formData.get('licenseNumber') as string;
    const issueDate = formData.get('issueDate') as string;
    const expiryDate = formData.get('expiryDate') as string;

    if (fullName) {
      setDrivers([...drivers, { id: Math.random().toString(), fullName, phoneNumber, licenseNumber, issueDate, expiryDate }]);
      (e.target as HTMLFormElement).reset();
    }
  };

  const handleAddVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const licensePlate = formData.get('licensePlate') as string;
    const vehicleType = formData.get('vehicleType') as string;
    const inspectionDate = formData.get('inspectionDate') as string;
    const inspectionExpiryDate = formData.get('inspectionExpiryDate') as string;

    if (licensePlate) {
      setVehicles([...vehicles, { id: Math.random().toString(), licensePlate: licensePlate.toUpperCase(), vehicleType, inspectionDate, inspectionExpiryDate }]);
      (e.target as HTMLFormElement).reset();
    }
  };

  const handleGenerateReport = async () => {
    setIsAnalyzing(true);
    const report = await analyzeFuelData(requests, prices);
    setAiReport(report);
    setIsAnalyzing(false);
  };

  // --- Views ---

  const renderDriverManagement = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
      {/* Form */}
      <Card>
        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <IconPlus className="w-5 h-5 text-[#2c4aa0]" /> Thêm Tài xế
        </h2>
        <form onSubmit={handleAddDriver} className="space-y-3">
          <input name="fullName" placeholder="Họ và tên" required className="w-full p-2 text-sm border rounded" />
          <input name="phoneNumber" placeholder="Số điện thoại" className="w-full p-2 text-sm border rounded" />
          <input name="licenseNumber" placeholder="Số GPLX" required className="w-full p-2 text-sm border rounded" />
          <div>
            <label className="text-xs text-gray-500">Ngày cấp</label>
            <input name="issueDate" type="date" className="w-full p-2 text-sm border rounded" />
          </div>
          <div>
            <label className="text-xs text-gray-500">Ngày hết hạn</label>
            <input name="expiryDate" type="date" required className="w-full p-2 text-sm border rounded" />
          </div>
          <Button variant="secondary" className="w-full text-xs">Thêm tài xế</Button>
        </form>
      </Card>

      {/* List */}
      <Card className="md:col-span-2">
        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
           <IconUsers className="w-5 h-5 text-[#2c4aa0]" /> Danh sách Tài xế
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-gray-900 font-semibold border-b">
              <tr>
                <th className="p-2">Họ tên</th>
                <th className="p-2">SĐT</th>
                <th className="p-2">GPLX</th>
                <th className="p-2">Ngày cấp</th>
                <th className="p-2">Hết hạn</th>
              </tr>
            </thead>
            <tbody>
              {drivers.map(d => (
                <tr key={d.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="p-2 font-medium">{d.fullName}</td>
                  <td className="p-2">{d.phoneNumber}</td>
                  <td className="p-2">{d.licenseNumber}</td>
                  <td className="p-2">{formatDate(d.issueDate)}</td>
                  <td className="p-2">{formatDate(d.expiryDate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );

  const renderVehicleManagement = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
      <Card>
        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <IconPlus className="w-5 h-5 text-[#2c4aa0]" /> Thêm Xe
        </h2>
        <form onSubmit={handleAddVehicle} className="space-y-3">
          <input name="licensePlate" placeholder="Biển số xe" required className="w-full p-2 text-sm border rounded uppercase" />
          <input name="vehicleType" placeholder="Loại xe" required className="w-full p-2 text-sm border rounded" />
          <div>
            <label className="text-xs text-gray-500">Ngày đăng kiểm</label>
            <input name="inspectionDate" type="date" required className="w-full p-2 text-sm border rounded" />
          </div>
          <div>
            <label className="text-xs text-gray-500">Hết hạn đăng kiểm</label>
            <input name="inspectionExpiryDate" type="date" required className="w-full p-2 text-sm border rounded" />
          </div>
          <Button variant="secondary" className="w-full text-xs">Thêm xe</Button>
        </form>
      </Card>

      <Card className="md:col-span-2">
        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
           <IconTruck className="w-5 h-5 text-[#2c4aa0]" /> Danh sách Xe
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-gray-900 font-semibold border-b">
              <tr>
                <th className="p-2">Biển số</th>
                <th className="p-2">Loại xe</th>
                <th className="p-2">Ngày ĐK</th>
                <th className="p-2">Hết hạn ĐK</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map(v => (
                <tr key={v.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="p-2 font-bold text-[#2c4aa0]">{v.licensePlate}</td>
                  <td className="p-2">{v.vehicleType}</td>
                  <td className="p-2">{formatDate(v.inspectionDate)}</td>
                  <td className="p-2">{formatDate(v.inspectionExpiryDate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );

  const renderDashboard = () => {
    const pendingRequests = requests.filter(r => r.status === RequestStatus.PENDING);
    const historyRequests = requests.filter(r => r.status !== RequestStatus.PENDING);

    return (
      <div className="space-y-8 animate-fade-in">
        {/* Top Stats & AI */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <IconSparkles className="w-5 h-5 text-indigo-500" />
                Trợ lý AI - Phân tích hiệu quả
              </h2>
              <Button variant="secondary" onClick={handleGenerateReport} disabled={isAnalyzing} className="text-xs py-1 px-3">
                {isAnalyzing ? 'Đang phân tích...' : 'Tạo báo cáo'}
              </Button>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-700 min-h-[80px]">
              {aiReport ? (
                <div className="prose prose-sm max-w-none">
                  <p>{aiReport}</p>
                </div>
              ) : (
                <p className="text-gray-400 italic">Nhấn "Tạo báo cáo" để Gemini phân tích dữ liệu đổ dầu và giá cả gần đây.</p>
              )}
            </div>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Fuel Price Management */}
            <Card>
                <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <IconTrendingUp className="w-5 h-5 text-[#2c4aa0]" />
                    Quản lý giá dầu
                </h2>
                <form onSubmit={handleAddPrice} className="space-y-3 mb-4">
                <div className="flex flex-col gap-2">
                    <input name="date" type="date" required className="w-full p-2 text-sm border rounded" />
                    <input name="price" type="number" placeholder="Giá/Lít" required className="w-full p-2 text-sm border rounded" />
                </div>
                <Button variant="secondary" className="w-full text-xs">Cập nhật giá</Button>
                </form>
                <div className="max-h-32 overflow-y-auto space-y-2">
                {prices.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(p => (
                    <div key={p.id} className="flex justify-between text-xs p-2 bg-gray-50 rounded">
                    <span>{formatDate(p.date)}</span>
                    <span className="font-bold">{formatCurrency(p.pricePerLiter)}/L</span>
                    </div>
                ))}
                </div>
            </Card>

            {/* Vehicle Assignment Settings */}
            <Card>
                <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <IconUsers className="w-5 h-5 text-[#2c4aa0]" />
                    Thiết lập Vận hành
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
                <div className="max-h-32 overflow-y-auto space-y-2">
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

        {/* Admin Create Request Section */}
        <Card className="border-[#2c4aa0] border-2">
          <h2 className="text-lg font-bold text-[#2c4aa0] mb-4 flex items-center gap-2">
            <IconPlus className="w-5 h-5" /> Tạo & Duyệt phiếu cấp dầu
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
             <div>
               <label className="block text-xs font-semibold text-gray-600 mb-1">Tài xế</label>
               <select 
                  className="w-full p-2 border rounded-lg text-sm"
                  value={adminNewDriver}
                  onChange={(e) => setAdminNewDriver(e.target.value)}
               >
                 <option value="">-- Chọn tài xế --</option>
                 {drivers.map(d => <option key={d.id} value={d.fullName}>{d.fullName}</option>)}
               </select>
             </div>
             <div>
               <label className="block text-xs font-semibold text-gray-600 mb-1">Ngày đổ dầu</label>
               <input 
                  type="date" 
                  className="w-full p-2 border rounded-lg text-sm"
                  value={adminNewDate}
                  onChange={(e) => setAdminNewDate(e.target.value)}
               />
             </div>
             <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Cây xăng</label>
                <select 
                  className="w-full p-2 border rounded-lg text-sm"
                  value={adminNewStation}
                  onChange={(e) => setAdminNewStation(e.target.value)}
                >
                  <option value="">-- Chọn trạm --</option>
                  {stations.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
             </div>
             <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Số tiền duyệt</label>
                <input 
                  type="number" 
                  placeholder="VNĐ"
                  className="w-full p-2 border rounded-lg text-sm"
                  value={adminNewAmount}
                  onChange={(e) => setAdminNewAmount(e.target.value)}
                />
             </div>
          </div>
          
          <div className="mt-4 flex flex-col md:flex-row gap-4 items-center">
             <div className="flex-1 w-full">
                {/* Info Bar */}
                <div className="bg-gray-50 p-2 rounded flex flex-wrap gap-4 text-sm items-center">
                    <div className="flex items-center gap-1">
                      <span className="text-gray-500">Xe:</span>
                      {adminAutoVehicle ? <span className="font-bold">{adminAutoVehicle}</span> : <span className="text-red-500">Chưa xác định</span>}
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-gray-500">Giá dầu:</span>
                      {getPriceForDate(adminNewDate, prices) ? <span className="font-bold">{formatCurrency(getPriceForDate(adminNewDate, prices)!)}</span> : <span className="text-red-500">Thiếu giá</span>}
                    </div>
                    {adminNewAmount && getPriceForDate(adminNewDate, prices) && (
                       <div className="flex items-center gap-1 text-[#2c4aa0]">
                         <span>Quy đổi:</span>
                         <span className="font-bold text-lg">{(parseInt(adminNewAmount) / getPriceForDate(adminNewDate, prices)!).toFixed(2)} Lít</span>
                       </div>
                    )}
                </div>
             </div>
             <Button className="w-full md:w-auto whitespace-nowrap" onClick={handleAdminCreateRequest}>
                Tạo phiếu & Duyệt ngay
             </Button>
          </div>
        </Card>

        {/* Pending Requests */}
        <div>
          <h2 className="text-xl font-bold text-[#2c4aa0] mb-4 flex items-center gap-2">
            <IconCheckCircle className="w-6 h-6" /> Yêu cầu chờ duyệt ({pendingRequests.length})
          </h2>
          <div className="grid grid-cols-1 gap-4">
            {pendingRequests.length === 0 && <p className="text-gray-500 italic">Không có yêu cầu nào đang chờ.</p>}
            {pendingRequests.map(req => {
               const currentPrice = getPriceForDate(req.requestDate, prices);
               return (
                <div key={req.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-lg">{req.driverName}</span>
                      <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded font-mono border">{req.licensePlate}</span>
                      <span className="text-sm bg-blue-50 text-blue-700 px-2 py-0.5 rounded">Ngày: {formatDate(req.requestDate)}</span>
                    </div>
                    <p className="text-sm text-gray-500">Giá dầu ngày này: {currentPrice ? formatCurrency(currentPrice) : <span className="text-red-500">Chưa có giá</span>}</p>
                    {req.notes && <p className="text-sm text-gray-600 mt-1 italic">"{req.notes}"</p>}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" onClick={() => {
                        setSelectedRequest(req);
                        handleReject();
                    }}>Từ chối</Button>
                    <Button onClick={() => openApprovalModal(req)}>Duyệt cấp dầu</Button>
                  </div>
                </div>
               );
            })}
          </div>
        </div>

        {/* History */}
        <div>
           <h2 className="text-xl font-bold text-gray-700 mb-4 mt-8">Lịch sử giao dịch</h2>
           <div className="overflow-x-auto bg-white rounded-xl shadow-sm">
             <table className="w-full text-left text-sm text-gray-600">
               <thead className="bg-gray-50 text-gray-900 font-semibold border-b">
                 <tr>
                   <th className="p-4">Ngày</th>
                   <th className="p-4">Tài xế / Xe</th>
                   <th className="p-4">Trạm</th>
                   <th className="p-4 text-right">Số tiền</th>
                   <th className="p-4 text-right">Số lít</th>
                   <th className="p-4 text-center">Trạng thái</th>
                 </tr>
               </thead>
               <tbody>
                 {historyRequests.map(req => (
                   <tr key={req.id} className="border-b last:border-0 hover:bg-gray-50">
                     <td className="p-4">{formatDate(req.requestDate)}</td>
                     <td className="p-4">
                        <div className="font-medium text-gray-900">{req.driverName}</div>
                        <div className="text-xs text-gray-500 font-mono">{req.licensePlate}</div>
                     </td>
                     <td className="p-4">{stations.find(s => s.id === req.stationId)?.name || '-'}</td>
                     <td className="p-4 text-right font-medium">{req.approvedAmount ? formatCurrency(req.approvedAmount) : '-'}</td>
                     <td className="p-4 text-right">{req.approvedLiters ? `${req.approvedLiters} L` : '-'}</td>
                     <td className="p-4 text-center"><Badge status={req.status} /></td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
        </div>
      </div>
    );
  };

  const DriverView = () => (
    <div className="max-w-md mx-auto space-y-6">
      <Card>
        <h2 className="text-xl font-bold text-[#2c4aa0] mb-4">Gửi yêu cầu đổ dầu</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ngày đổ dầu</label>
            <input 
              type="date" 
              value={newRequestDate}
              onChange={(e) => setNewRequestDate(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2c4aa0] focus:border-[#2c4aa0] outline-none"
            />
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
            <label className="block text-xs font-semibold text-blue-800 uppercase tracking-wide mb-1">Xe vận hành</label>
            {autoAssignedVehicle ? (
              <div className="flex items-center gap-2">
                 <IconTruck className="w-5 h-5 text-[#2c4aa0]" />
                 <span className="text-xl font-bold text-gray-900">{autoAssignedVehicle}</span>
              </div>
            ) : (
              <div className="text-red-500 text-sm flex items-center gap-2">
                <IconXCircle className="w-5 h-5" />
                Chưa có xe phân công ngày này
              </div>
            )}
            <p className="text-xs text-gray-500 mt-2">
              *Hệ thống tự động xác định xe dựa trên thiết lập vận hành.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú (Số KM, Lộ trình...)</label>
            <textarea 
              rows={3}
              value={newRequestNote}
              onChange={(e) => setNewRequestNote(e.target.value)}
              placeholder="VD: ODO 50000km, đi tỉnh..."
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2c4aa0] focus:border-[#2c4aa0] outline-none"
            />
          </div>
          <Button onClick={handleDriverSubmit} className="w-full" disabled={!autoAssignedVehicle}>
            <IconPlus className="w-5 h-5" /> Gửi yêu cầu
          </Button>
        </div>
      </Card>

      <div className="space-y-4">
        <h3 className="font-semibold text-gray-700">Lịch sử yêu cầu</h3>
        {requests.filter(r => r.driverName === CURRENT_DRIVER_NAME).map(req => (
          <div key={req.id} className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-[#2c4aa0]">
            <div className="flex justify-between items-start mb-2">
              <div className="flex flex-col">
                <span className="font-medium text-gray-900">{formatDate(req.requestDate)}</span>
                <span className="text-xs font-bold text-[#2c4aa0] mt-0.5 bg-blue-50 px-2 py-0.5 rounded w-fit">{req.licensePlate}</span>
              </div>
              <Badge status={req.status} />
            </div>
            {req.status === RequestStatus.APPROVED && (
              <div className="text-sm text-gray-600 mt-2 bg-gray-50 p-2 rounded">
                <p>Số tiền: <span className="font-bold text-[#2c4aa0]">{formatCurrency(req.approvedAmount || 0)}</span></p>
                <p>Số lít: {req.approvedLiters} L</p>
                <p>Trạm: {stations.find(s => s.id === req.stationId)?.name}</p>
              </div>
            )}
            {req.notes && <p className="text-sm text-gray-500 mt-2 italic">"{req.notes}"</p>}
          </div>
        ))}
      </div>
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
              onClick={() => setActiveTab('DRIVERS')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'DRIVERS' ? 'bg-[#2c4aa0] text-white' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <IconUsers className="w-5 h-5" /> Quản lý Tài xế
            </button>
            <button
              onClick={() => setActiveTab('VEHICLES')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'VEHICLES' ? 'bg-[#2c4aa0] text-white' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <IconTruck className="w-5 h-5" /> Quản lý Xe
            </button>
          </div>
        </div>
      </div>

      {/* Main Admin Content */}
      <div className="flex-1">
        {activeTab === 'DASHBOARD' && renderDashboard()}
        {activeTab === 'DRIVERS' && renderDriverManagement()}
        {activeTab === 'VEHICLES' && renderVehicleManagement()}
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
            <span className="font-bold text-xl tracking-tight">FuelFlow</span>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Số tiền duyệt (VND)</label>
                <input 
                  type="number" 
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#2c4aa0] outline-none"
                  placeholder="VD: 500000"
                  value={adminAmount}
                  onChange={(e) => setAdminAmount(e.target.value)}
                />
              </div>

              {/* Live Calculation */}
              {adminAmount && getPriceForDate(selectedRequest.requestDate, prices) && (
                <div className="text-center py-2 text-gray-600">
                  Sẽ cấp: <span className="text-2xl font-bold text-[#2c4aa0]">
                    {(parseInt(adminAmount) / getPriceForDate(selectedRequest.requestDate, prices)!).toFixed(2)} Lít
                  </span>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-8">
              <Button variant="ghost" className="flex-1" onClick={() => setIsModalOpen(false)}>Hủy</Button>
              <Button 
                className="flex-1" 
                onClick={handleApprove}
                disabled={!adminAmount || !adminStation || !getPriceForDate(selectedRequest.requestDate, prices)}
              >
                Xác nhận
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
