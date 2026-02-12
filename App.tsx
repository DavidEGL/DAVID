
import React, { useState, useMemo, useEffect } from 'react';
import { HashRouter, Routes, Route, Link, useNavigate, useParams } from 'react-router-dom';
import { LayoutDashboard, School as SchoolIcon, Users, Settings, Plus, Search, ChevronRight, Menu, X, ArrowUpRight, DollarSign, Edit2, Trash2, Building2 } from 'lucide-react';
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
import { LicenseeFormModal } from './components/LicenseeFormModal';
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
  const [licenseees, setLicensees] = useState<Licensee[]>(INITIAL_LICENSEES);
  const [schools, setSchools] = useState<School[]>([]);
  const [payments, setPayments] = useState<Payment[]>(MOCK_PAYMENTS);

  // Modal states
  const [isSchoolModalOpen, setIsSchoolModalOpen] = useState(false);
  const [schoolToEdit, setSchoolToEdit] = useState<School | undefined>(undefined);
  
  const [isLicenseeModalOpen, setIsLicenseeModalOpen] = useState(false);
  const [licenseeToEdit, setLicenseeToEdit] = useState<Licensee | undefined>(undefined);

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: string, type: 'school' | 'licensee' } | undefined>(undefined);

  // Helper to sync finances when state changes
  const refreshSchoolFinances = (s: School) => calculateSchoolFinances(s, config);

  // Initialize a mock school if empty
  useEffect(() => {
    if (schools.length === 0) {
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

  const handleSaveSchool = (updated: School) => {
    const recalculated = refreshSchoolFinances(updated);
    setSchools(prev => {
      const exists = prev.find(s => s.id === updated.id);
      if (exists) return prev.map(s => s.id === updated.id ? recalculated : s);
      return [...prev, recalculated];
    });
  };

  const handleSaveLicensee = (lic: Licensee) => {
    setLicensees(prev => {
      const exists = prev.find(l => l.id === lic.id);
      if (exists) return prev.map(l => l.id === lic.id ? lic : l);
      return [...prev, lic];
    });
  };

  const handleDeleteItem = () => {
    if (!itemToDelete) return;
    if (itemToDelete.type === 'school') {
      setSchools(prev => prev.filter(s => s.id !== itemToDelete.id));
      setPayments(prev => prev.filter(p => p.referenciaId !== itemToDelete.id));
    } else {
      setLicensees(prev => prev.filter(l => l.id !== itemToDelete.id));
      // Optionally reassign schools or delete them
    }
    setIsConfirmModalOpen(false);
    setItemToDelete(undefined);
  };

  const addPayment = (p: Payment) => {
    setPayments(prev => {
      const exists = prev.find(pay => pay.id === p.id);
      if (exists) return prev.map(pay => pay.id === p.id ? p : pay);
      return [...prev, p];
    });
  };

  const openEditSchool = (school: School) => {
    setSchoolToEdit(school);
    setIsSchoolModalOpen(true);
  };

  const openEditLicensee = (licensee: Licensee) => {
    setLicenseeToEdit(licensee);
    setIsLicenseeModalOpen(true);
  };

  return (
    <HashRouter>
      <div className="flex h-screen overflow-hidden bg-gray-50">
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
        </aside>

        <main className="flex-1 overflow-y-auto relative">
          <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200 px-8 py-4 flex items-center justify-between">
            <h2 className="text-lg font-bold">Portal Operativo</h2>
            <div className="flex items-center gap-4">
               <button 
                onClick={() => { setLicenseeToEdit(undefined); setIsLicenseeModalOpen(true); }}
                className="flex items-center gap-2 border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg font-medium transition-all"
              >
                <Plus size={18} />
                <span>Licenciatario</span>
              </button>
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
              <Route path="/" element={<Dashboard schools={schools} licensees={licenseees} payments={payments} />} />
              <Route path="/schools" element={<SchoolsList schools={schools} onEdit={openEditSchool} onDelete={(s) => { setItemToDelete({ id: s.id, type: 'school' }); setIsConfirmModalOpen(true); }} />} />
              <Route path="/school/:id" element={<SchoolDetail schools={schools} licensees={licenseees} payments={payments} updateSchool={handleSaveSchool} addPayment={addPayment} onEdit={openEditSchool} onDelete={(s) => { setItemToDelete({ id: s.id, type: 'school' }); setIsConfirmModalOpen(true); }} />} />
              <Route path="/licensees" element={<LicenseesList licensees={licenseees} schools={schools} onEdit={openEditLicensee} />} />
              <Route path="/licensee/:id" element={<LicenseeDetail licensees={licenseees} schools={schools} payments={payments} addPayment={addPayment} updateSchool={handleSaveSchool} />} />
              <Route path="/config" element={<ConfigView config={config} setConfig={setConfig} />} />
            </Routes>
          </div>
        </main>
      </div>

      <SchoolFormModal 
        isOpen={isSchoolModalOpen} 
        onClose={() => setIsSchoolModalOpen(false)} 
        onSave={handleSaveSchool} 
        schoolToEdit={schoolToEdit}
        licensees={licenseees}
        config={config}
      />

      <LicenseeFormModal
        isOpen={isLicenseeModalOpen}
        onClose={() => setIsLicenseeModalOpen(false)}
        onSave={handleSaveLicensee}
        licenseeToEdit={licenseeToEdit}
      />

      <ConfirmModal 
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleDeleteItem}
        title={itemToDelete?.type === 'school' ? "¿Eliminar Escuela?" : "¿Eliminar Licenciatario?"}
        message="Esta acción no se puede deshacer y borrará todos los registros financieros asociados."
        confirmText="Confirmar Eliminación"
      />
    </HashRouter>
  );
};

const SchoolsList = ({ schools, onEdit, onDelete }: { schools: School[], onEdit: (s: School) => void, onDelete: (s: School) => void }) => (
  <div>
    <h3 className="text-3xl font-black mb-8">Listado de Escuelas</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {schools.map(school => (
        <div key={school.id} className="bg-white p-6 rounded-[32px] border border-gray-100 hover:shadow-2xl hover:-translate-y-1 transition-all flex flex-col justify-between group relative overflow-hidden">
          <div className={`absolute top-0 left-0 w-1 h-full ${school.status === SchoolStatus.ACTIVA ? 'bg-emerald-500' : 'bg-amber-400'}`}></div>
          <Link to={`/school/${school.id}`} className="mb-6">
            <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter mb-4 inline-block ${school.status === SchoolStatus.ACTIVA ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
              {school.status}
            </span>
            <h4 className="text-xl font-black text-gray-900 group-hover:text-indigo-600 transition-colors">{school.nombre}</h4>
            <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest">{school.ciudad}, {school.estado}</p>
          </Link>
          <div className="flex items-center justify-between pt-6 border-t border-gray-50">
            <div className="flex items-center gap-1">
               <button onClick={(e) => { e.preventDefault(); onEdit(school); }} className="p-2.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all">
                  <Edit2 size={16} />
               </button>
               <button onClick={(e) => { e.preventDefault(); onDelete(school); }} className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                  <Trash2 size={16} />
               </button>
            </div>
            <Link to={`/school/${school.id}`} className="p-3 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all">
              <ChevronRight size={18} />
            </Link>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const LicenseesList = ({ licensees, schools, onEdit }: { licensees: Licensee[], schools: School[], onEdit: (l: Licensee) => void }) => (
  <div>
    <h3 className="text-3xl font-black mb-8">Directorio de Licenciatarios</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {licensees.map(lic => {
        const licSchools = schools.filter(s => s.licenciatarioId === lic.id);
        return (
          <div key={lic.id} className="bg-white p-8 rounded-[40px] border border-gray-100 hover:shadow-2xl transition-all relative group">
            <div className="flex items-center justify-between mb-8">
              <div className="p-4 bg-indigo-50 rounded-2xl text-indigo-600">
                <Building2 size={24} />
              </div>
              <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${lic.status === 'ACTIVO' ? 'bg-green-100 text-green-700 shadow-sm' : 'bg-red-100 text-red-700'}`}>
                {lic.status}
              </span>
            </div>
            <Link to={`/licensee/${lic.id}`}>
               <h4 className="text-2xl font-black text-gray-900 group-hover:text-indigo-600 transition-colors">{lic.nombreComercial}</h4>
               <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-[0.2em] mb-8">{lic.razonSocial}</p>
            </Link>
            <div className="space-y-4 pt-6 border-t border-gray-50">
              <div className="flex justify-between text-xs font-bold text-gray-500">
                <span>Escuelas:</span>
                <span className="text-indigo-600 font-black">{licSchools.length} centros</span>
              </div>
              <div className="flex justify-between text-xs font-bold text-gray-500">
                <span>Tipo:</span>
                <span className="text-gray-900">{lic.tipoLicencia}</span>
              </div>
            </div>
            <div className="mt-8 flex gap-3">
               <button onClick={() => onEdit(lic)} className="flex-1 py-3 text-[10px] font-black uppercase tracking-widest bg-gray-50 text-gray-500 hover:bg-indigo-50 hover:text-indigo-600 rounded-2xl transition-all border border-gray-100">Editar Perfil</button>
               <Link to={`/licensee/${lic.id}`} className="flex-1 py-3 text-[10px] font-black uppercase tracking-widest bg-indigo-600 text-white text-center rounded-2xl shadow-lg hover:shadow-xl transition-all">Ver Finanzas</Link>
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

export default App;
