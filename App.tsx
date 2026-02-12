
import React, { useState, useMemo, useEffect } from 'react';
import { HashRouter, Routes, Route, Link, useNavigate, useParams } from 'react-router-dom';
import { LayoutDashboard, School as SchoolIcon, Users, Settings, Plus, Search, ChevronRight, Menu, X, ArrowUpRight, DollarSign, Edit2, Trash2 } from 'lucide-react';
import { 
  School, Licensee, GlobalConfig, Payment, 
  SchoolStatus, ProgramType, PaymentType, PaymentStatus 
} from './types';
import { INITIAL_CONFIG, INITIAL_LICENSEES, MOCK_PAYMENTS } from './constants';
import { calculateSchoolFinances, formatCurrency } from './services/finance';

// Views
import { Dashboard } from './components/Dashboard';
import { SchoolDetail } from './components/SchoolDetail';
import { LicenseeDetail } from './components/LicenseeDetail';
import { ConfigView } from './components/ConfigView';
import { SchoolFormModal } from './components/SchoolFormModal';
import { ConfirmModal } from './components/ConfirmModal';

const SidebarLink = ({ to, icon: Icon, label, active }: any) => (
  <Link 
    to={to} 
    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
      active ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-100 hover:text-gray-900'
    }`}
  >
    <Icon size={20} />
    <span className="font-medium">{label}</span>
  </Link>
);

const App: React.FC = () => {
  const [config, setConfig] = useState<GlobalConfig>(INITIAL_CONFIG);
  const [licensees, setLicensees] = useState<Licensee[]>(INITIAL_LICENSEES);
  const [schools, setSchools] = useState<School[]>([]);
  const [payments, setPayments] = useState<Payment[]>(MOCK_PAYMENTS);

  // Modal states
  const [isSchoolModalOpen, setIsSchoolModalOpen] = useState(false);
  const [schoolToEdit, setSchoolToEdit] = useState<School | undefined>(undefined);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [schoolToDelete, setSchoolToDelete] = useState<School | undefined>(undefined);

  // Helper to sync finances when state changes
  const refreshSchoolFinances = (s: School) => calculateSchoolFinances(s, config);

  // Initialize a mock school if empty
  useEffect(() => {
    if (schools.length === 0) {
      // Added missing required properties: direccion, pais, responsableNombre, responsableTelefono
      const mockSchool: School = {
        id: 's1',
        nombre: 'Colegio Americano',
        direccion: 'Av. Vallarta 1234, Col. Americana',
        ciudad: 'Guadalajara',
        estado: 'Jalisco',
        pais: 'México',
        nivel: 'Primaria/Secundaria',
        contacto: 'Ana Martínez',
        email: 'ana@americano.edu.mx',
        telefono: '3334445556',
        responsableNombre: 'Dr. Roberto Gómez',
        responsableTelefono: '3334445557',
        licenciatarioId: 'l1',
        fechaInicio: '2024-08-01',
        duracionContrato: 3,
        status: SchoolStatus.ACTIVA,
        programaTipo: ProgramType.BEST,
        numProgramasIndividuales: 0,
        precioPackBest: { calculated: 4200, final: 4200, isOverride: false },
        costeGestionBest: { calculated: 1000, final: 1000, isOverride: false },
        precioIndividual: { calculated: 2000, final: 2000, isOverride: false },
        costeGestionIndividual: { calculated: 350, final: 350, isOverride: false },
        splitPctLicenciatario: 0.40,
        equipamiento: [
          { 
            id: 'se1', equipoId: '1', nombre: 'Mesa Grande', cantidad: 4, 
            precioUnitario: { calculated: 40000, final: 40000, isOverride: false }, 
            total: { calculated: 160000, final: 160000, isOverride: false } 
          }
        ],
        proyeccion: {
          1: { alumnos: 100, ingresoBruto: { calculated: 0, final: 0, isOverride: false }, costeGestion: { calculated: 0, final: 0, isOverride: false }, inversionLab: { calculated: 0, final: 0, isOverride: false }, ingresoNeto: { calculated: 0, final: 0, isOverride: false }, splitLicenciatario: { calculated: 0, final: 0, isOverride: false }, splitEpic: { calculated: 0, final: 0, isOverride: false } },
          2: { alumnos: 120, ingresoBruto: { calculated: 0, final: 0, isOverride: false }, costeGestion: { calculated: 0, final: 0, isOverride: false }, inversionLab: { calculated: 0, final: 0, isOverride: false }, ingresoNeto: { calculated: 0, final: 0, isOverride: false }, splitLicenciatario: { calculated: 0, final: 0, isOverride: false }, splitEpic: { calculated: 0, final: 0, isOverride: false } },
          3: { alumnos: 150, ingresoBruto: { calculated: 0, final: 0, isOverride: false }, costeGestion: { calculated: 0, final: 0, isOverride: false }, inversionLab: { calculated: 0, final: 0, isOverride: false }, ingresoNeto: { calculated: 0, final: 0, isOverride: false }, splitLicenciatario: { calculated: 0, final: 0, isOverride: false }, splitEpic: { calculated: 0, final: 0, isOverride: false } },
        }
      };
      setSchools([refreshSchoolFinances(mockSchool)]);
    }
  }, []);

  const handleUpdateSchool = (updated: School) => {
    const recalculated = refreshSchoolFinances(updated);
    setSchools(prev => prev.map(s => s.id === updated.id ? recalculated : s));
  };

  const handleAddSchool = (newSchool: School) => {
    const recalculated = refreshSchoolFinances(newSchool);
    setSchools(prev => [...prev, recalculated]);
  };

  const handleDeleteSchool = (id: string) => {
    setSchools(prev => prev.filter(s => s.id !== id));
    setPayments(prev => prev.filter(p => p.referenciaId !== id));
    setIsConfirmModalOpen(false);
    setSchoolToDelete(undefined);
  };

  const addPayment = (p: Omit<Payment, 'id'>) => {
    const newPayment = { ...p, id: `p${Date.now()}` } as Payment;
    setPayments(prev => [...prev, newPayment]);
  };

  const openEditSchool = (school: School) => {
    setSchoolToEdit(school);
    setIsSchoolModalOpen(true);
  };

  const openDeleteConfirm = (school: School) => {
    setSchoolToDelete(school);
    setIsConfirmModalOpen(true);
  };

  return (
    <HashRouter>
      <div className="flex h-screen overflow-hidden bg-gray-50">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col p-6">
          <div className="flex items-center gap-3 mb-10 px-2">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
              <span className="text-white font-bold text-xl">E</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-gray-900">Epic Control</h1>
          </div>
          
          <nav className="flex-1 space-y-2">
            <SidebarLink to="/" icon={LayoutDashboard} label="Dashboard" />
            <SidebarLink to="/schools" icon={SchoolIcon} label="Escuelas" />
            <SidebarLink to="/licensees" icon={Users} label="Licenciatarios" />
            <SidebarLink to="/config" icon={Settings} label="Configuración" />
          </nav>

          <div className="mt-auto p-4 bg-gray-50 rounded-xl border border-gray-100">
            <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Sistema v1.0</p>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs uppercase">
                AD
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-semibold truncate">Admin Epic</p>
                <p className="text-[10px] text-gray-400 truncate">master@epicgroup.mx</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto relative">
          <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200 px-8 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h2 className="text-lg font-bold">Portal Operativo</h2>
            </div>
            <div className="flex items-center gap-3">
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors relative">
                <Search size={20} className="text-gray-500" />
              </button>
              <div className="h-6 w-[1px] bg-gray-200 mx-2"></div>
              <button 
                onClick={() => { setSchoolToEdit(undefined); setIsSchoolModalOpen(true); }}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-all shadow-md shadow-indigo-100"
              >
                <Plus size={18} />
                <span>Nueva Escuela</span>
              </button>
            </div>
          </header>

          <div className="p-8">
            <Routes>
              <Route path="/" element={<Dashboard schools={schools} licensees={licensees} payments={payments} />} />
              <Route path="/schools" element={<SchoolsList schools={schools} onEdit={openEditSchool} onDelete={openDeleteConfirm} />} />
              <Route path="/school/:id" element={<SchoolDetail schools={schools} licensees={licensees} payments={payments} updateSchool={handleUpdateSchool} addPayment={addPayment} onEdit={openEditSchool} onDelete={openDeleteConfirm} />} />
              <Route path="/licensees" element={<LicenseesList licensees={licensees} schools={schools} />} />
              <Route path="/licensee/:id" element={<LicenseeDetail licensees={licensees} schools={schools} payments={payments} addPayment={addPayment} updateSchool={handleUpdateSchool} />} />
              <Route path="/config" element={<ConfigView config={config} setConfig={setConfig} />} />
            </Routes>
          </div>
        </main>
      </div>

      <SchoolFormModal 
        isOpen={isSchoolModalOpen} 
        onClose={() => setIsSchoolModalOpen(false)} 
        onSave={schoolToEdit ? handleUpdateSchool : handleAddSchool} 
        schoolToEdit={schoolToEdit}
        licensees={licensees}
        config={config}
      />

      <ConfirmModal 
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={() => schoolToDelete && handleDeleteSchool(schoolToDelete.id)}
        title="¿Eliminar Escuela?"
        message={`Esta acción eliminará permanentemente la escuela "${schoolToDelete?.nombre}" y todos sus registros asociados.`}
        confirmText="Eliminar"
      />
    </HashRouter>
  );
};

const SchoolsList = ({ schools, onEdit, onDelete }: { schools: School[], onEdit: (s: School) => void, onDelete: (s: School) => void }) => (
  <div>
    <h3 className="text-2xl font-bold mb-6">Listado de Escuelas</h3>
    <div className="grid grid-cols-1 gap-4">
      {schools.map(school => (
        <div key={school.id} className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-all flex items-center justify-between group">
          <Link to={`/school/${school.id}`} className="flex-1">
            <p className="text-sm font-medium text-indigo-600 mb-1">{school.status}</p>
            <h4 className="text-lg font-bold">{school.nombre}</h4>
            <p className="text-sm text-gray-500">{school.ciudad}, {school.estado}</p>
          </Link>
          <div className="flex items-center gap-2">
            <button 
              onClick={(e) => { e.preventDefault(); onEdit(school); }}
              className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
              title="Editar"
            >
              <Edit2 size={18} />
            </button>
            <button 
              onClick={(e) => { e.preventDefault(); onDelete(school); }}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Eliminar"
            >
              <Trash2 size={18} />
            </button>
            <Link to={`/school/${school.id}`}>
              <ChevronRight className="text-gray-300 group-hover:text-indigo-600 transition-colors ml-2" />
            </Link>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const LicenseesList = ({ licensees, schools }: { licensees: Licensee[], schools: School[] }) => (
  <div>
    <h3 className="text-2xl font-bold mb-6">Licenciatarios</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {licensees.map(lic => {
        const licSchools = schools.filter(s => s.licenciatarioId === lic.id);
        return (
          <Link to={`/licensee/${lic.id}`} key={lic.id} className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-xl font-bold">{lic.nombreComercial}</h4>
              <span className={`px-2 py-1 rounded text-[10px] font-bold ${lic.status === 'ACTIVO' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {lic.status}
              </span>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-500 flex justify-between"><span>País:</span> <span className="text-gray-900 font-medium">{lic.pais}</span></p>
              <p className="text-sm text-gray-500 flex justify-between"><span>Escuelas:</span> <span className="text-gray-900 font-medium">{licSchools.length}</span></p>
              <p className="text-sm text-gray-500 flex justify-between"><span>Tipo:</span> <span className="text-gray-900 font-medium">{lic.tipoLicencia}</span></p>
            </div>
          </Link>
        );
      })}
    </div>
  </div>
);

export default App;
