
import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { School, Licensee, Payment, ProgramType, PaymentType, PaymentStatus, SchoolStatus } from '../types';
import { formatCurrency } from '../services/finance';
import { EditableField } from './EditableField';
import { PaymentFormModal } from './PaymentFormModal';
// Added missing ChevronRight icon from lucide-react
import { Save, Plus, Trash2, ArrowLeft, Edit2, FileText, Printer, CheckCircle2, Clock, X, Phone, Mail, User, AlertCircle, ChevronRight } from 'lucide-react';

interface SchoolDetailProps {
  schools: School[];
  licensees: Licensee[];
  payments: Payment[];
  updateSchool: (updated: School) => void;
  addPayment: (p: Payment) => void;
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
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentToEdit, setPaymentToEdit] = useState<Partial<Payment> | undefined>(undefined);

  if (!school) return <div className="p-20 text-center font-black text-gray-400">Escuela no encontrada</div>;

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
    <div className="pb-24 max-w-6xl mx-auto animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-12 border-b border-gray-100 pb-8">
        <div className="flex flex-col gap-2">
          <button onClick={() => navigate('/schools')} className="flex items-center gap-2 text-gray-400 hover:text-indigo-600 font-bold text-[10px] uppercase transition-all mb-2 tracking-widest">
            <ArrowLeft size={16} /> Volver al listado
          </button>
          <div className="flex items-center gap-4">
             <h2 className="text-4xl font-black text-gray-900 tracking-tight">{school.nombre}</h2>
             <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${school.status === SchoolStatus.ACTIVA ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                {school.status}
             </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-white border border-gray-200 px-6 py-3 rounded-3xl text-[10px] font-black text-gray-700 hover:bg-gray-50 transition-all shadow-sm uppercase tracking-widest">
            <Printer size={18} /> Generar Reporte
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
        {/* Left: General & Academic */}
        <div className="space-y-12">
          <section className="bg-white rounded-[48px] border border-gray-100 shadow-sm p-12">
             <h4 className="font-black text-indigo-900 text-xs uppercase tracking-[0.3em] flex items-center gap-3 mb-10 border-b border-indigo-50 pb-6">
              📋 Ficha Operativa
            </h4>
            <div className="grid grid-cols-2 gap-y-8 gap-x-10">
               {[
                 { label: 'Dirección', val: school.direccion },
                 { label: 'Ciudad / Estado', val: `${school.ciudad}, ${school.estado}` },
                 { label: 'País', val: school.pais || 'MÉXICO' },
                 { label: 'Inicio Contrato', val: school.fechaInicio },
                 { label: 'Modalidad', val: school.programaTipo },
                 { label: 'Split (%)', val: `${(school.splitPctLicenciatario * 100).toFixed(0)}%` }
               ].map((item, i) => (
                 <div key={i}>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{item.label}</p>
                    <p className="text-sm font-black text-gray-800">{item.val}</p>
                 </div>
               ))}
            </div>
          </section>

          <section className="bg-white rounded-[48px] border border-gray-100 shadow-sm p-12">
             <h4 className="font-black text-indigo-900 text-xs uppercase tracking-[0.3em] flex items-center gap-3 mb-10 border-b border-indigo-50 pb-6">
              👤 Responsables
            </h4>
            <div className="space-y-8">
               <div className="flex items-center gap-6 p-6 bg-indigo-50 rounded-[32px] border border-indigo-100">
                  <div className="w-14 h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center font-black text-xl shadow-lg shadow-indigo-200">
                    {licensee?.nombreComercial?.[0]}
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-0.5">Licenciatario</p>
                    <p className="text-lg font-black text-indigo-900">{licensee?.nombreComercial}</p>
                    <p className="text-xs font-bold text-indigo-600/60">{licensee?.email}</p>
                  </div>
               </div>
               <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Responsable Escuela</p>
                    <p className="text-sm font-black text-gray-800">{school.responsableNombre || 'No definido'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Teléfono Directo</p>
                    <p className="text-sm font-black text-gray-800">{school.responsableTelefono || 'No definido'}</p>
                  </div>
               </div>
            </div>
          </section>

          {/* Equipment list */}
          <section className="bg-white rounded-[48px] border border-gray-100 shadow-sm p-12 overflow-hidden">
             <h4 className="font-black text-indigo-900 text-xs uppercase tracking-[0.3em] flex items-center gap-3 mb-10 border-b border-indigo-50 pb-6">
              🛠️ Inventario Tecnológico
            </h4>
            <div className="space-y-4">
               {school.equipamiento.map(eq => (
                 <div key={eq.id} className="p-6 bg-gray-50/50 rounded-3xl border border-gray-100 flex justify-between items-center group transition-all hover:bg-white hover:shadow-lg">
                    <div className="flex items-center gap-5">
                       <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-gray-100 group-hover:scale-110 transition-transform">
                          <CheckCircle2 className="text-indigo-400" size={20} />
                       </div>
                       <div>
                          <p className="text-sm font-black text-gray-900 uppercase tracking-tight">{eq.nombre}</p>
                          <p className="text-[10px] font-bold text-gray-400 tracking-widest">{eq.cantidad} UNIDADES</p>
                       </div>
                    </div>
                    <div className="text-right">
                       <p className="text-lg font-black text-indigo-600">{formatCurrency(eq.total.final)}</p>
                       <p className="text-[9px] font-bold text-gray-300 uppercase tracking-tighter">Total Inversión</p>
                    </div>
                 </div>
               ))}
               {school.equipamiento.length === 0 && (
                 <div className="py-20 text-center border-2 border-dashed border-gray-100 rounded-[40px] text-gray-400 text-xs italic">
                    Sin equipamiento registrado.
                 </div>
               )}
            </div>
          </section>
        </div>

        {/* Right: Financials */}
        <div className="space-y-12">
           <div className="bg-indigo-900 text-white rounded-[60px] shadow-2xl p-12 lg:p-16 border border-indigo-800 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full -mr-40 -mt-40 blur-3xl group-hover:bg-indigo-400/10 transition-all duration-1000"></div>
              
              <div className="flex justify-between items-end mb-16 border-b border-indigo-800/50 pb-8">
                 <h4 className="text-indigo-200 text-xs font-black uppercase tracking-[0.3em]">💰 PROYECCIÓN ECONÓMICA</h4>
                 <div className="flex gap-2">
                    {[1, 2, 3].map(y => (
                      <button 
                        key={y} onClick={() => setSelectedYear(y as 1|2|3)}
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center text-[10px] font-black transition-all border ${selectedYear === y ? 'bg-amber-400 border-amber-400 text-indigo-900 shadow-lg scale-110' : 'bg-white/5 border-white/10 text-indigo-300 hover:bg-white/10'}`}
                      >
                        Y{y}
                      </button>
                    ))}
                 </div>
              </div>

              <div className="space-y-12 animate-in slide-in-from-right duration-500">
                  <div className="space-y-6">
                     <div className="flex justify-between items-center text-[10px] text-indigo-300 font-black uppercase tracking-[0.2em] px-4">
                        <span>Ingreso Bruto Estimado</span>
                        <span className="text-white text-base">{formatCurrency(school.proyeccion[selectedYear].ingresoBruto.final)}</span>
                     </div>
                     <div className="flex justify-between items-center text-[10px] text-indigo-300 font-black uppercase tracking-[0.2em] px-4">
                        <span>Deducción Operativa & Lab</span>
                        <span className="text-indigo-100 text-base">-{formatCurrency(school.proyeccion[selectedYear].costeGestion.final + school.proyeccion[selectedYear].inversionLab.final)}</span>
                     </div>
                  </div>

                  <div className="bg-gradient-to-br from-indigo-800/50 to-transparent p-10 rounded-[48px] border border-indigo-700/50 text-center shadow-inner">
                     <p className="text-[10px] font-black text-indigo-200 uppercase tracking-[0.4em] mb-4">Ingreso Neto (Año {selectedYear})</p>
                     <p className="text-6xl font-black text-emerald-400 tracking-tighter mb-4 drop-shadow-xl">
                        {formatCurrency(school.proyeccion[selectedYear].ingresoNeto.final)}
                     </p>
                     <div className="h-1.5 w-32 bg-emerald-400/20 mx-auto rounded-full"></div>
                  </div>

                  <div className="grid grid-cols-2 gap-8">
                     <div className="bg-white/5 p-8 rounded-[40px] border border-white/5 text-center transition-all hover:bg-white/10">
                        <p className="text-[9px] font-black text-indigo-300 uppercase tracking-widest mb-3">Split Licenciatario</p>
                        <p className="text-2xl font-black text-amber-400">{formatCurrency(school.proyeccion[selectedYear].splitLicenciatario.final)}</p>
                        <p className="text-[9px] font-bold text-indigo-500/50 mt-1 uppercase">Factor {(school.splitPctLicenciatario*100).toFixed(0)}%</p>
                     </div>
                     <div className="bg-white/5 p-8 rounded-[40px] border border-white/5 text-center transition-all hover:bg-white/10">
                        <p className="text-[9px] font-black text-indigo-300 uppercase tracking-widest mb-3">Split EpicGroup</p>
                        <p className="text-2xl font-black text-blue-400">{formatCurrency(school.proyeccion[selectedYear].splitEpic.final)}</p>
                        <p className="text-[9px] font-bold text-indigo-500/50 mt-1 uppercase">Factor {((1-school.splitPctLicenciatario)*100).toFixed(0)}%</p>
                     </div>
                  </div>
              </div>

              <div className="mt-20 pt-10 border-t border-indigo-800">
                 <div className="flex justify-between items-center bg-black/20 p-8 rounded-[40px]">
                    <div className="text-left">
                       <p className="text-[10px] font-black text-indigo-400 uppercase mb-1">Potencial 3 Años (Total)</p>
                       <p className="text-3xl font-black text-amber-400">
                          {formatCurrency(school.proyeccion[1].splitLicenciatario.final + school.proyeccion[2].splitLicenciatario.final + school.proyeccion[3].splitLicenciatario.final)}
                       </p>
                    </div>
                    <div className="w-14 h-14 bg-amber-400/10 rounded-full flex items-center justify-center text-amber-400">
                       <TrendingUpIcon size={28} />
                    </div>
                 </div>
              </div>
           </div>

           {/* Payments Management */}
           <section className="bg-white rounded-[50px] border border-gray-100 shadow-sm p-12 space-y-10">
              <div className="flex items-center justify-between border-b border-gray-50 pb-6">
                 <h4 className="text-xl font-black text-gray-900">💳 Control de Cobros</h4>
                 <button 
                  onClick={() => { setPaymentToEdit(undefined); setIsPaymentModalOpen(true); }}
                  className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-100 hover:scale-110 transition-all"
                 >
                    <Plus size={20} />
                 </button>
              </div>

              <div className="grid grid-cols-2 gap-6">
                 <div className="p-6 bg-emerald-50 rounded-3xl border border-emerald-100">
                    <p className="text-[9px] font-black text-emerald-600 uppercase mb-1 tracking-widest">Cobrado (Año {selectedYear})</p>
                    <p className="text-2xl font-black text-emerald-700">{formatCurrency(totalPaidYear)}</p>
                 </div>
                 <div className="p-6 bg-amber-50 rounded-3xl border border-amber-100">
                    <p className="text-[9px] font-black text-amber-600 uppercase mb-1 tracking-widest">Pendiente</p>
                    <p className="text-2xl font-black text-amber-700">{formatCurrency(totalToCollectYear - totalPaidYear)}</p>
                 </div>
              </div>

              <div className="space-y-4">
                 {currentYearPayments.length > 0 ? currentYearPayments.map(p => (
                   <div key={p.id} onClick={() => { setPaymentToEdit(p); setIsPaymentModalOpen(true); }} className="p-6 bg-gray-50 hover:bg-white rounded-3xl border border-gray-100 flex justify-between items-center group cursor-pointer hover:shadow-xl transition-all border-l-8 border-l-indigo-600">
                      <div>
                         <p className="text-sm font-black text-gray-900 uppercase tracking-tight">{p.concepto}</p>
                         <p className="text-[10px] font-bold text-gray-400 flex items-center gap-1.5"><Clock size={12}/> Vence: {p.fechaProgramada}</p>
                      </div>
                      <div className="text-right flex items-center gap-6">
                         <div>
                            <p className="text-lg font-black text-gray-900">{formatCurrency(p.monto)}</p>
                            <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase ${p.status === PaymentStatus.PAGADO ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                               {p.status}
                            </span>
                         </div>
                         <ChevronRight size={20} className="text-gray-200 group-hover:text-indigo-400 transition-all" />
                      </div>
                   </div>
                 )) : (
                   <div className="py-20 text-center border-2 border-dashed border-gray-100 rounded-[40px] text-gray-400 text-sm font-bold italic">
                      No hay cobros registrados para este periodo.
                   </div>
                 )}
              </div>
           </section>

           <div className="flex gap-4">
              <button onClick={() => onEdit(school)} className="flex-1 py-5 bg-white border border-gray-200 rounded-[32px] font-black text-xs text-gray-500 uppercase tracking-widest hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-100 transition-all shadow-sm">Editar Escuela</button>
              <button onClick={() => onDelete(school)} className="flex-1 py-5 bg-white border border-red-100 rounded-[32px] font-black text-xs text-red-400 uppercase tracking-widest hover:bg-red-50 hover:text-red-600 transition-all shadow-sm">Eliminar Registro</button>
           </div>
        </div>
      </div>

      <PaymentFormModal 
        isOpen={isPaymentModalOpen} 
        onClose={() => setIsPaymentModalOpen(false)} 
        onSave={addPayment} 
        paymentToEdit={paymentToEdit}
        schoolId={school.id}
      />
    </div>
  );
};

const TrendingUpIcon = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
    <polyline points="17 6 23 6 23 12"></polyline>
  </svg>
);
