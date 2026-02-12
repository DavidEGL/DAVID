
import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { School, Licensee, Payment, ProgramType, PaymentType, PaymentStatus, SchoolStatus } from '../types';
import { formatCurrency } from '../services/finance';
import { EditableField } from './EditableField';
import { Save, Plus, Trash2, ArrowLeft, Edit2, FileText, Printer, CheckCircle2, Clock, X, Phone, Mail, User } from 'lucide-react';

interface SchoolDetailProps {
  schools: School[];
  licensees: Licensee[];
  payments: Payment[];
  updateSchool: (updated: School) => void;
  addPayment: (p: Omit<Payment, 'id'>) => void;
  onEdit: (s: School) => void;
  onDelete: (s: School) => void;
}

export const SchoolDetail: React.FC<SchoolDetailProps> = ({ 
  schools, licensees, payments, updateSchool, addPayment, onEdit, onDelete
}) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const school = useMemo(() => schools.find(s => s.id === id), [schools, id]);
  const licensee = useMemo(() => licensees.find(l => l.id === school?.licenciatarioId), [licensees, school]);
  
  const [selectedYear, setSelectedYear] = useState<1 | 2 | 3>(1);

  if (!school) return <div>Escuela no encontrada</div>;

  const schoolPayments = payments.filter(p => p.referenciaId === school.id);
  const currentYearPayments = schoolPayments.filter(p => p.anoContrato === selectedYear);
  const totalPaidYear = currentYearPayments.filter(p => p.status === PaymentStatus.PAGADO).reduce((acc, p) => acc + p.monto, 0);
  const totalToCollectYear = school.proyeccion[selectedYear].ingresoBruto.final;

  const handleUpdateField = (path: string, val: any) => {
    const updated = { ...school };
    if (path.includes('proyeccion')) {
      const parts = path.split('.');
      const year = parseInt(parts[1]) as 1|2|3;
      const field = parts[2] as keyof typeof school.proyeccion[1];
      (updated.proyeccion[year] as any)[field] = val;
    } else {
      (updated as any)[path] = val;
    }
    updateSchool(updated);
  };

  return (
    <div className="pb-24 max-w-5xl mx-auto animate-in fade-in duration-500">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-8 border-b border-gray-100 pb-6">
        <div className="flex flex-col gap-1">
          <button onClick={() => navigate('/schools')} className="flex items-center gap-2 text-gray-400 hover:text-indigo-600 font-bold text-xs uppercase transition-all mb-2">
            <ArrowLeft size={14} /> Volver al listado
          </button>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">{school.nombre}</h2>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-white border border-gray-200 px-5 py-2.5 rounded-2xl text-xs font-black text-gray-700 hover:bg-gray-50 transition-all shadow-sm">
            <Printer size={16} /> 📄 Imprimir/PDF
          </button>
          <button onClick={() => navigate('/schools')} className="p-3 text-gray-400 hover:bg-gray-100 rounded-full transition-all">
            <X size={24} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Left Column: Basic Info & Operational Details */}
        <div className="space-y-10">
          {/* Section: General Info */}
          <section className="bg-white rounded-[40px] border border-gray-100 shadow-sm p-10">
            <h4 className="font-black text-indigo-900 text-sm uppercase tracking-widest flex items-center gap-2 mb-8 border-b border-indigo-50 pb-4">
              📋 Información General
            </h4>
            <div className="grid grid-cols-2 gap-y-6">
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Dirección</p>
                <p className="text-sm font-bold text-gray-800">{school.direccion || 'Av México 252 Col. Noria Norte'}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Alumnos</p>
                <p className="text-sm font-black text-indigo-900">{school.proyeccion[1].alumnos}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Ciudad</p>
                <p className="text-sm font-bold text-gray-800">{school.ciudad}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Año Contrato</p>
                <p className="text-sm font-bold text-gray-800">{school.fechaInicio.split('-')[0]}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Estado / País</p>
                <p className="text-sm font-bold text-gray-800">{school.estado}, {school.pais || 'MEXICO'}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Reparto</p>
                <p className="text-sm font-black text-indigo-600">{(school.splitPctLicenciatario*100).toFixed(0)}% / {((1-school.splitPctLicenciatario)*100).toFixed(0)}%</p>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-gray-50">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-4">Estado de la Escuela</p>
              <div className="flex gap-3">
                <button 
                  onClick={() => handleUpdateField('status', SchoolStatus.ACTIVA)}
                  className={`flex-1 py-3 px-4 rounded-[20px] text-xs font-black transition-all border flex items-center justify-center gap-2 ${school.status === SchoolStatus.ACTIVA ? 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-inner' : 'bg-white text-gray-400 border-gray-100 hover:bg-emerald-50'}`}
                >
                  <CheckCircle2 size={16} /> ✓ OK - Activa
                </button>
                <button 
                  onClick={() => handleUpdateField('status', SchoolStatus.ONBOARDING)}
                  className={`flex-1 py-3 px-4 rounded-[20px] text-xs font-black transition-all border flex items-center justify-center gap-2 ${school.status !== SchoolStatus.ACTIVA ? 'bg-amber-50 text-amber-700 border-amber-200 shadow-inner' : 'bg-white text-gray-400 border-gray-100 hover:bg-amber-50'}`}
                >
                  <Clock size={16} /> ⏳ Pendiente
                </button>
              </div>
              <p className="text-[10px] text-gray-400 mt-2 italic text-center">
                {school.status === SchoolStatus.ACTIVA ? '(se incluye en cálculos)' : '(en proceso de alta)'}
              </p>
            </div>
          </section>

          {/* Section: Licensee Info */}
          <section className="bg-white rounded-[40px] border border-gray-100 shadow-sm p-10">
            <h4 className="font-black text-indigo-900 text-sm uppercase tracking-widest flex items-center gap-2 mb-8 border-b border-indigo-50 pb-4">
              👤 Licenciatario
            </h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-0.5">Nombre</p>
                  <p className="text-sm font-black text-gray-900">{licensee?.nombreComercial}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-0.5">Teléfono</p>
                  <p className="text-sm font-bold text-gray-800 flex items-center gap-1 justify-end"><Phone size={12}/> {licensee?.telefono}</p>
                </div>
              </div>
              <div className="pt-2">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-0.5">Email</p>
                <p className="text-sm font-bold text-indigo-600 flex items-center gap-2"><Mail size={14}/> {licensee?.email}</p>
              </div>
            </div>
          </section>

          {/* Section: Responsible Contact */}
          <section className="bg-white rounded-[40px] border border-gray-100 shadow-sm p-10">
            <h4 className="font-black text-indigo-900 text-sm uppercase tracking-widest flex items-center gap-2 mb-8 border-b border-indigo-50 pb-4">
              🏫 Responsable del Centro Educativo
            </h4>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Nombre del Responsable</p>
                <p className="text-sm font-black text-gray-800">{school.responsableNombre || 'Judith'}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Teléfono</p>
                <p className="text-sm font-bold text-gray-800">{school.responsableTelefono || '12324556'}</p>
              </div>
            </div>
          </section>

          {/* Section: Programs */}
          <section className="bg-white rounded-[40px] border border-gray-100 shadow-sm p-10">
            <h4 className="font-black text-indigo-900 text-sm uppercase tracking-widest flex items-center gap-2 mb-8 border-b border-indigo-50 pb-4">
              📚 Programas
            </h4>
            <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-4 mb-6 text-center">
              <p className="text-xs font-black text-indigo-900">
                Precio aplicado: <span className="text-indigo-600">{formatCurrency(school.programaTipo === ProgramType.BEST ? school.precioPackBest.final : school.precioIndividual.final)}</span> ({school.programaTipo === ProgramType.BEST ? 'Pack Best' : 'Programas Individuales'})
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {['Business', 'English', 'STEAM', 'Technology'].map(prog => (
                <div key={prog} className="flex items-center gap-3 bg-gray-50 px-5 py-3 rounded-2xl border border-gray-100 transition-hover hover:border-indigo-200 group">
                  <div className="w-2 h-2 rounded-full bg-indigo-500 group-hover:scale-125 transition-all"></div>
                  <span className="text-xs font-bold text-gray-700">{prog}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Section: Equipment */}
          <section className="bg-white rounded-[40px] border border-gray-100 shadow-sm p-10">
            <h4 className="font-black text-indigo-900 text-sm uppercase tracking-widest flex items-center gap-2 mb-8 border-b border-indigo-50 pb-4">
              🛠️ Equipamiento
            </h4>
            <div className="space-y-4">
              {school.equipamiento.length > 0 ? school.equipamiento.map(eq => (
                <div key={eq.id} className="flex justify-between items-center bg-gray-50/30 p-4 rounded-2xl border border-gray-50 hover:bg-gray-50 transition-colors">
                  <div>
                    <p className="text-xs font-black text-gray-800 uppercase">{eq.nombre}</p>
                    <p className="text-[10px] text-gray-400 font-bold">{eq.cantidad} × {formatCurrency(eq.precioUnitario.final)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-indigo-600">{formatCurrency(eq.total.final)}</p>
                  </div>
                </div>
              )) : (
                <div className="text-center py-10 text-gray-400 italic text-xs">No hay equipamiento registrado</div>
              )}
            </div>
          </section>
        </div>

        {/* Right Column: Financial Projections & Payments */}
        <div className="space-y-10">
          {/* Main Financial Card (Blue/Indigo Gradient Style) */}
          <div className="bg-indigo-900 text-white rounded-[50px] shadow-2xl p-12 border border-indigo-800 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full -mr-40 -mt-40 blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full -ml-32 -mb-32 blur-2xl pointer-events-none"></div>
            
            <h4 className="text-indigo-200 text-xs font-black uppercase tracking-[0.2em] mb-12 border-b border-indigo-800/50 pb-6 relative">
              💰 PROYECCIÓN FINANCIERA A 3 AÑOS
            </h4>
            
            <div className="space-y-16 relative">
              {[1, 2, 3].map((year: any) => {
                const y = school.proyeccion[year as 1|2|3];
                return (
                  <div key={year} className="animate-in slide-in-from-right duration-700" style={{ animationDelay: `${year * 150}ms` }}>
                    <div className="flex items-center justify-between mb-8">
                      <h5 className="font-black text-3xl text-white">AÑO {year}</h5>
                      <span className="bg-indigo-800/80 backdrop-blur-sm border border-indigo-700 px-4 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-wider shadow-sm">
                        {y.alumnos} ALUMNOS
                      </span>
                    </div>
                    
                    <div className="space-y-5">
                      <div className="flex justify-between items-center px-6 py-4 bg-white/5 border border-white/5 rounded-[24px]">
                        <span className="text-indigo-300 text-xs font-black uppercase">Ingreso Bruto</span>
                        <span className="font-black text-xl">{formatCurrency(y.ingresoBruto.final)}</span>
                      </div>
                      <div className="flex justify-between items-center px-6 py-4 bg-white/5 border border-white/5 rounded-[24px]">
                        <span className="text-indigo-300 text-xs font-black uppercase">Coste Gestión</span>
                        <span className="font-black text-xl text-indigo-100">-{formatCurrency(y.costeGestion.final)}</span>
                      </div>
                      <div className="flex justify-between items-center px-6 py-4 bg-white/5 border border-white/5 rounded-[24px]">
                        <span className="text-indigo-300 text-xs font-black uppercase">Inversión Lab</span>
                        <span className="font-black text-xl text-indigo-100">-{formatCurrency(y.inversionLab.final)}</span>
                      </div>
                      <div className="flex justify-between items-center px-8 py-6 bg-indigo-600/40 border border-indigo-400/30 rounded-[30px] shadow-lg">
                        <span className="text-indigo-50 text-base font-black uppercase tracking-tight">Ingreso Neto</span>
                        <span className="font-black text-3xl text-emerald-400">{formatCurrency(y.ingresoNeto.final)}</span>
                      </div>
                      <div className="pt-4 grid grid-cols-2 gap-5">
                        <div className="bg-white/5 border border-white/5 p-5 rounded-[24px] text-center">
                          <p className="text-[10px] font-black text-indigo-300 uppercase mb-2 tracking-widest">LICENCIATARIO ({(school.splitPctLicenciatario*100).toFixed(0)}%)</p>
                          <p className="text-xl font-black text-amber-400">{formatCurrency(y.splitLicenciatario.final)}</p>
                        </div>
                        <div className="bg-white/5 border border-white/5 p-5 rounded-[24px] text-center">
                          <p className="text-[10px] font-black text-indigo-300 uppercase mb-2 tracking-widest">EPICGROUP ({( (1-school.splitPctLicenciatario)*100 ).toFixed(0)}%)</p>
                          <p className="text-xl font-black text-blue-400">{formatCurrency(y.splitEpic.final)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Consolidated Totals Section */}
            <div className="mt-20 pt-12 border-t border-indigo-800 relative">
              <h4 className="text-indigo-200 text-xs font-black uppercase tracking-[0.25em] mb-12 flex items-center gap-3">
                💰 TOTALES CONSOLIDADOS 3 AÑOS
              </h4>
              <div className="space-y-12">
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <p className="text-[11px] font-black text-indigo-300 uppercase tracking-wider">TOTAL LICENCIATARIO ({(school.splitPctLicenciatario*100).toFixed(0)}%)</p>
                    <p className="text-4xl font-black text-amber-400 tracking-tight drop-shadow-lg">
                      {formatCurrency(school.proyeccion[1].splitLicenciatario.final + school.proyeccion[2].splitLicenciatario.final + school.proyeccion[3].splitLicenciatario.final)}
                    </p>
                  </div>
                  <div className="flex gap-4 justify-between bg-white/5 p-3 rounded-xl border border-white/5">
                    <span className="text-[10px] font-bold text-indigo-300">AÑO 1: {formatCurrency(school.proyeccion[1].splitLicenciatario.final)}</span>
                    <span className="text-[10px] font-bold text-indigo-300">AÑO 2: {formatCurrency(school.proyeccion[2].splitLicenciatario.final)}</span>
                    <span className="text-[10px] font-bold text-indigo-300">AÑO 3: {formatCurrency(school.proyeccion[3].splitLicenciatario.final)}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <p className="text-[11px] font-black text-indigo-300 uppercase tracking-wider">TOTAL EPICGROUP ({((1-school.splitPctLicenciatario)*100).toFixed(0)}%)</p>
                    <p className="text-4xl font-black text-blue-400 tracking-tight drop-shadow-lg">
                      {formatCurrency(school.proyeccion[1].splitEpic.final + school.proyeccion[2].splitEpic.final + school.proyeccion[3].splitEpic.final)}
                    </p>
                  </div>
                  <div className="flex gap-4 justify-between bg-white/5 p-3 rounded-xl border border-white/5">
                    <span className="text-[10px] font-bold text-indigo-300">AÑO 1: {formatCurrency(school.proyeccion[1].splitEpic.final)}</span>
                    <span className="text-[10px] font-bold text-indigo-300">AÑO 2: {formatCurrency(school.proyeccion[2].splitEpic.final)}</span>
                    <span className="text-[10px] font-bold text-indigo-300">AÑO 3: {formatCurrency(school.proyeccion[3].splitEpic.final)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Payment Management Section */}
          <section className="bg-white rounded-[40px] border border-gray-100 shadow-sm p-10 overflow-hidden">
            <div className="flex items-center justify-between mb-8">
              <h4 className="font-black text-indigo-900 text-sm uppercase tracking-widest flex items-center gap-2 border-b border-indigo-50 pb-2 flex-1">
                💳 Gestión de Pagos
              </h4>
              <button 
                onClick={() => addPayment({ tipo: PaymentType.COBRO_ESCUELA, referenciaId: school.id, anoContrato: selectedYear, concepto: 'Nuevo Pago', monto: 0, fechaProgramada: new Date().toISOString().split('T')[0], status: PaymentStatus.PROGRAMADO })}
                className="ml-4 flex items-center gap-2 bg-indigo-50 text-indigo-600 px-4 py-2 rounded-2xl text-[10px] font-black uppercase hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
              >
                <Plus size={14}/> AGREGAR PAGO
              </button>
            </div>

            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Ver pagos del año:</p>
            <div className="flex gap-2 mb-8 bg-gray-50 p-1.5 rounded-[20px]">
              {[1, 2, 3].map(y => (
                <button 
                  key={y} onClick={() => setSelectedYear(y as 1|2|3)}
                  className={`flex-1 py-3 text-[10px] font-black rounded-xl transition-all ${selectedYear === y ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-400 hover:bg-white hover:text-gray-900'}`}
                >
                  AÑO {y} ({parseInt(school.fechaInicio.split('-')[0]) + y - 1})
                </button>
              ))}
            </div>

            {/* Annual Totals Breakdown */}
            <div className="grid grid-cols-2 gap-5 mb-10">
              <div className="p-6 bg-emerald-50 rounded-3xl border border-emerald-100 shadow-sm">
                <p className="text-[10px] font-black text-emerald-600 uppercase mb-1 tracking-widest">Total Pagado (Año {selectedYear})</p>
                <p className="text-2xl font-black text-emerald-700">{formatCurrency(totalPaidYear)}</p>
              </div>
              <div className="p-6 bg-amber-50 rounded-3xl border border-amber-100 shadow-sm">
                <p className="text-[10px] font-black text-amber-600 uppercase mb-1 tracking-widest">Pendiente de Cobro</p>
                <p className="text-2xl font-black text-amber-700">{formatCurrency(totalToCollectYear - totalPaidYear)}</p>
              </div>
              <div className="col-span-2 p-6 bg-indigo-50 rounded-3xl border border-indigo-100 shadow-sm text-center">
                <p className="text-[10px] font-black text-indigo-600 uppercase mb-1 tracking-widest">Total a Cobrar (Año {selectedYear})</p>
                <p className="text-3xl font-black text-indigo-900">{formatCurrency(totalToCollectYear)}</p>
              </div>
            </div>

            {/* Itemized Payment History */}
            <div className="space-y-4">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2 flex items-center gap-2">
                <Clock size={12}/> Historial de Pagos (Año {selectedYear})
              </p>
              {currentYearPayments.length > 0 ? currentYearPayments.map(p => (
                <div key={p.id} className="p-5 bg-white rounded-3xl border border-gray-100 flex items-center justify-between group hover:border-indigo-200 hover:shadow-lg transition-all border-l-4 border-l-indigo-500">
                  <div className="space-y-1">
                    <p className="text-xs font-black text-gray-900 uppercase tracking-tight">{p.concepto}</p>
                    <p className="text-[10px] font-bold text-gray-400">Vence: {p.fechaProgramada}</p>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-lg font-black text-gray-900">{formatCurrency(p.monto)}</p>
                      <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter ${p.status === PaymentStatus.PAGADO ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                        {p.status === PaymentStatus.PAGADO ? '✓ Pagado' : '⏳ ' + p.status}
                      </span>
                    </div>
                    <button className="p-2 text-gray-200 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              )) : (
                <div className="text-center py-16 bg-gray-50/50 rounded-[40px] border-2 border-dashed border-gray-100 text-gray-400 text-xs italic">
                  No hay registros de cobros para este periodo
                </div>
              )}
            </div>
          </section>

          {/* Detail Record Buttons Footer */}
          <div className="flex gap-5">
            <button 
              onClick={() => onEdit(school)} 
              className="flex-1 flex items-center justify-center gap-3 bg-white border border-gray-200 py-5 rounded-[28px] text-xs font-black text-gray-800 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600 transition-all shadow-sm group"
            >
              <Edit2 size={18} className="text-gray-400 group-hover:text-indigo-600" /> ✏️ Editar Escuela
            </button>
            <button 
              onClick={() => onDelete(school)} 
              className="flex-1 flex items-center justify-center gap-3 bg-white border border-red-100 py-5 rounded-[28px] text-xs font-black text-red-600 hover:bg-red-50 transition-all shadow-sm group"
            >
              <Trash2 size={18} className="text-red-300 group-hover:text-red-600" /> 🗑️ Eliminar Escuela
            </button>
          </div>
          <button 
            onClick={() => navigate('/schools')}
            className="w-full py-4 rounded-2xl text-xs font-black text-gray-400 hover:text-gray-900 transition-all uppercase tracking-widest"
          >
            Cerrar
          </button>
        </div>
      </div>

      <footer className="mt-20 pt-10 border-t border-gray-100 text-center space-y-2">
        <div className="flex items-center justify-center gap-3 opacity-20">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg"></div>
          <p className="text-lg font-black tracking-tighter text-gray-900">EPIC CONTROL SYSTEM</p>
        </div>
        <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.4em]">ADMINISTRATION & FINANCE PORTAL • V1.0</p>
      </footer>
    </div>
  );
};
