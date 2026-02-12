
import React, { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Licensee, School, Payment, PaymentStatus, PaymentType, SchoolStatus } from '../types';
import { formatCurrency } from '../services/finance';
// Added missing DollarSign icon from lucide-react
import { ArrowLeft, Plus, Printer, CheckCircle2, Clock, MapPin, Users, Calendar, ChevronRight, Mail, Phone, TrendingUp, CreditCard, X, DollarSign } from 'lucide-react';

interface LicenseeDetailProps {
  licensees: Licensee[];
  schools: School[];
  payments: Payment[];
  addPayment: (p: Omit<Payment, 'id'>) => void;
  updateSchool: (updated: School) => void;
}

export const LicenseeDetail: React.FC<LicenseeDetailProps> = ({ licensees, schools, payments, addPayment, updateSchool }) => {
  const { id } = useParams();
  const licensee = useMemo(() => licensees.find(l => l.id === id), [licensees, id]);
  const licenseeSchools = useMemo(() => schools.filter(s => s.licenciatarioId === id), [schools, id]);
  const okSchools = useMemo(() => licenseeSchools.filter(s => s.status === SchoolStatus.ACTIVA), [licenseeSchools]);
  const pendingSchools = useMemo(() => licenseeSchools.filter(s => s.status !== SchoolStatus.ACTIVA), [licenseeSchools]);

  if (!licensee) return <div>Licenciatario no encontrado</div>;

  // Global totals for OK schools only
  const financialSummary = useMemo(() => {
    const years = { 
      1: { bruto: 0, cost: 0, lab: 0, net: 0, benefit: 0 }, 
      2: { bruto: 0, cost: 0, lab: 0, net: 0, benefit: 0 }, 
      3: { bruto: 0, cost: 0, lab: 0, net: 0, benefit: 0 } 
    };
    let totalBruto = 0;
    let totalNeto = 0;
    let totalBenefit = 0;

    okSchools.forEach(s => {
      [1, 2, 3].forEach(year => {
        const y = s.proyeccion[year as 1|2|3];
        years[year as 1|2|3].bruto += y.ingresoBruto.final;
        years[year as 1|2|3].cost += y.costeGestion.final;
        years[year as 1|2|3].lab += y.inversionLab.final;
        years[year as 1|2|3].net += y.ingresoNeto.final;
        years[year as 1|2|3].benefit += y.splitLicenciatario.final;
        
        totalBruto += y.ingresoBruto.final;
        totalNeto += y.ingresoNeto.final;
        totalBenefit += y.splitLicenciatario.final;
      });
    });

    return { years, totalBruto, totalNeto, totalBenefit };
  }, [okSchools]);

  return (
    <div className="pb-24 max-w-6xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Section */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-8">
        <div className="flex items-center gap-6">
          <Link to="/licensees" className="p-4 bg-white border border-gray-100 rounded-[20px] shadow-sm hover:text-indigo-600 hover:shadow-md transition-all">
            <ArrowLeft size={24} />
          </Link>
          <div>
            <h3 className="text-4xl font-black text-gray-900 tracking-tight">{licensee.nombreComercial}</h3>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-[0.2em]">{licensee.razonSocial}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-white border border-gray-200 px-6 py-3 rounded-2xl text-xs font-black text-gray-700 hover:bg-gray-50 transition-all shadow-sm">
            <Printer size={18} /> 📄 Imprimir/PDF
          </button>
          <Link to="/licensees" className="p-3 text-gray-400 hover:bg-gray-100 rounded-full transition-all">
            <X size={24} />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left Column: Contact & Schools Detail */}
        <div className="space-y-12">
          {/* Contact Information */}
          <section className="bg-white rounded-[40px] border border-gray-100 shadow-sm p-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-16 -mt-16 pointer-events-none"></div>
            <h4 className="font-black text-indigo-900 text-sm uppercase tracking-widest mb-10 border-b border-indigo-50 pb-4 relative">
              📋 Información de Contacto
            </h4>
            <div className="grid grid-cols-2 gap-y-8 relative">
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Email</p>
                <p className="text-sm font-black text-indigo-600 break-all flex items-center gap-2">
                  <Mail size={14}/> {licensee.email}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Escuelas Totales</p>
                <p className="text-sm font-black text-gray-900">
                  {licenseeSchools.length} <span className="text-gray-400 font-bold">({okSchools.length} OK + {pendingSchools.length} Pendientes)</span>
                </p>
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Teléfono</p>
                <p className="text-sm font-black text-gray-800 flex items-center gap-2">
                  <Phone size={14}/> {licensee.telefono}
                </p>
              </div>
            </div>
          </section>

          {/* Active Schools OK - Detailed View */}
          <section className="space-y-8">
            <h4 className="text-xl font-black text-gray-900 flex items-center gap-3">
              <CheckCircle2 className="text-emerald-500" size={24} />
              ✅ Escuelas Activas (OK) - Detalle Completo
            </h4>
            
            {okSchools.length > 0 ? okSchools.map(school => {
              const totalBenefit3yr = school.proyeccion[1].splitLicenciatario.final + school.proyeccion[2].splitLicenciatario.final + school.proyeccion[3].splitLicenciatario.final;
              const totalGross3yr = school.proyeccion[1].ingresoBruto.final + school.proyeccion[2].ingresoBruto.final + school.proyeccion[3].ingresoBruto.final;
              const totalNet3yr = school.proyeccion[1].ingresoNeto.final + school.proyeccion[2].ingresoNeto.final + school.proyeccion[3].ingresoNeto.final;

              return (
                <div key={school.id} className="bg-white rounded-[50px] border border-gray-100 shadow-sm p-12 space-y-10 relative overflow-hidden transition-hover hover:shadow-xl hover:border-indigo-100 group">
                  <div className="flex justify-between items-start border-b border-gray-50 pb-8">
                    <div>
                      <h5 className="text-2xl font-black text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">{school.nombre}</h5>
                      <div className="flex flex-wrap gap-5 text-gray-400">
                        <p className="text-xs font-bold flex items-center gap-1.5"><MapPin size={14} className="text-indigo-300"/> {school.ciudad}, {school.estado}</p>
                        <p className="text-xs font-bold flex items-center gap-1.5"><Users size={14} className="text-indigo-300"/> {school.proyeccion[1].alumnos} alumnos</p>
                        <p className="text-xs font-bold flex items-center gap-1.5"><Calendar size={14} className="text-indigo-300"/> Desde {school.fechaInicio.split('-')[0]}</p>
                        <p className="text-xs font-black text-emerald-600 bg-emerald-50 px-3 py-0.5 rounded-full border border-emerald-100">✓ OK</p>
                      </div>
                    </div>
                    <Link to={`/school/${school.id}`} className="p-4 bg-gray-50 text-gray-400 rounded-[20px] hover:bg-indigo-600 hover:text-white hover:shadow-lg transition-all transform group-hover:scale-110">
                      <ChevronRight size={28} />
                    </Link>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gray-50 p-6 rounded-[32px] border border-gray-100">
                      <p className="text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest">Ingresos Brutos (3 años)</p>
                      <p className="text-xl font-black text-gray-900">{formatCurrency(totalGross3yr)}</p>
                    </div>
                    <div className="bg-gray-50 p-6 rounded-[32px] border border-gray-100">
                      <p className="text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest">Ingreso Neto (3 años)</p>
                      <p className="text-xl font-black text-emerald-600">{formatCurrency(totalNet3yr)}</p>
                    </div>
                    <div className="bg-indigo-900 p-6 rounded-[32px] text-white shadow-lg relative overflow-hidden">
                       <div className="absolute top-0 right-0 w-16 h-16 bg-white/5 rounded-full -mr-8 -mt-8"></div>
                      <p className="text-[10px] font-black text-indigo-200 uppercase mb-2 tracking-widest relative">Tu Beneficio {(school.splitPctLicenciatario*100).toFixed(0)}%</p>
                      <p className="text-2xl font-black text-amber-400 relative">{formatCurrency(totalBenefit3yr)}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-[10px] font-black text-gray-500 uppercase text-center py-3 bg-gray-50 border border-gray-100 rounded-2xl">Año 1: {formatCurrency(school.proyeccion[1].splitLicenciatario.final)}</div>
                    <div className="text-[10px] font-black text-gray-500 uppercase text-center py-3 bg-gray-50 border border-gray-100 rounded-2xl">Año 2: {formatCurrency(school.proyeccion[2].splitLicenciatario.final)}</div>
                    <div className="text-[10px] font-black text-gray-500 uppercase text-center py-3 bg-gray-50 border border-gray-100 rounded-2xl">Año 3: {formatCurrency(school.proyeccion[3].splitLicenciatario.final)}</div>
                  </div>

                  {/* Payment States Breakdown for School */}
                  <div className="space-y-5 pt-8 border-t border-gray-50">
                    <h6 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                      <CreditCard size={14} className="text-indigo-400"/> Estado de Cobros por Año
                    </h6>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {[1, 2, 3].map(y => {
                        const totalYear = school.proyeccion[y as 1|2|3].ingresoBruto.final;
                        const paidYear = payments.filter(p => p.referenciaId === school.id && p.anoContrato === y && p.status === PaymentStatus.PAGADO).reduce((acc, p) => acc + p.monto, 0);
                        const pendingYear = totalYear - paidYear;

                        return (
                          <div key={y} className="bg-gray-50/50 p-5 rounded-3xl border border-gray-100 hover:bg-white transition-all">
                            <p className="text-[11px] font-black text-indigo-900 mb-3 border-b border-indigo-50 pb-2">AÑO {y} ({parseInt(school.fechaInicio.split('-')[0]) + y - 1})</p>
                            <p className="text-[10px] font-bold text-gray-400 mb-4 flex justify-between"><span>Base:</span> <span className="text-gray-900">{formatCurrency(totalYear)}</span></p>
                            <div className="space-y-2">
                              <div className="flex justify-between items-center bg-emerald-50/50 p-2 rounded-xl">
                                <span className="text-[9px] font-black text-emerald-700 uppercase">✓ Cobrado</span>
                                <span className="text-[10px] font-black text-emerald-700">{formatCurrency(paidYear)}</span>
                              </div>
                              <div className={`flex justify-between items-center p-2 rounded-xl ${pendingYear > 0 ? 'bg-amber-50/50' : 'bg-gray-100/50 opacity-40'}`}>
                                <span className="text-[9px] font-black text-amber-700 uppercase">⏳ Pendiente</span>
                                <span className="text-[10px] font-black text-amber-700">{formatCurrency(pendingYear)}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            }) : (
              <div className="bg-white rounded-[40px] border-2 border-dashed border-gray-100 p-20 text-center text-gray-400 text-sm font-medium italic">
                No hay escuelas activas registradas para este licenciatario.
              </div>
            )}
          </section>

          {/* Pending Schools Section */}
          {pendingSchools.length > 0 && (
            <section className="space-y-8">
              <h4 className="text-xl font-black text-gray-400 flex items-center gap-3 italic">
                <Clock size={24} className="animate-pulse" />
                ⏳ Escuelas Pendientes - En Proceso
              </h4>
              {pendingSchools.map(school => (
                <div key={school.id} className="bg-white/60 rounded-[40px] border-2 border-dashed border-gray-200 p-12 opacity-80 group hover:opacity-100 hover:bg-white hover:border-amber-200 transition-all">
                   <div className="flex justify-between items-start mb-8">
                    <div>
                      <h5 className="text-2xl font-black text-gray-400 group-hover:text-gray-900 transition-colors">{school.nombre}</h5>
                      <span className="mt-2 inline-block text-[10px] font-black uppercase text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-100 shadow-sm">⏳ PENDIENTE</span>
                    </div>
                    <button 
                      onClick={() => updateSchool({ ...school, status: SchoolStatus.ACTIVA })}
                      className="text-[10px] font-black text-emerald-600 bg-emerald-50 hover:bg-emerald-600 hover:text-white px-6 py-3 border border-emerald-200 rounded-2xl transition-all shadow-sm transform hover:scale-105"
                    >
                      ✓ Marcar como OK
                    </button>
                  </div>
                  <div className="flex gap-6 text-xs font-bold text-gray-400 group-hover:text-gray-600 transition-colors">
                    <p className="flex items-center gap-1.5"><MapPin size={14}/> {school.ciudad}, {school.estado}</p>
                    <p className="flex items-center gap-1.5"><Users size={14}/> {school.proyeccion[1].alumnos} alumnos</p>
                    <p className="flex items-center gap-1.5"><TrendingUp size={14}/> Potencial: {(school.splitPctLicenciatario*100).toFixed(0)}% Split</p>
                  </div>
                </div>
              ))}
            </section>
          )}
        </div>

        {/* Right Column: Massive Financial Summary - Dashboard Style */}
        <div className="space-y-12">
          <div className="bg-indigo-900 text-white rounded-[60px] shadow-2xl p-12 lg:p-16 sticky top-24 border border-indigo-800 relative overflow-hidden group">
             {/* Decorative Elements */}
             <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -mr-48 -mt-48 blur-3xl pointer-events-none group-hover:bg-indigo-400/10 transition-all duration-1000"></div>
             <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/5 rounded-full -ml-32 -mb-32 blur-2xl pointer-events-none"></div>

             <div className="flex flex-col gap-3 mb-14 border-b border-indigo-800/50 pb-8 relative">
                <h4 className="text-indigo-200 text-xs font-black uppercase tracking-[0.3em]">📊 RESUMEN FINANCIERO DEL LICENCIATARIO</h4>
                <p className="text-[11px] text-indigo-400 font-bold uppercase tracking-wider">(Cifras consolidadas solo sobre {okSchools.length} escuelas con status OK)</p>
             </div>

             <div className="grid grid-cols-2 gap-8 mb-16 relative">
                <div className="bg-white/5 p-8 rounded-[36px] border border-white/5 backdrop-blur-sm shadow-xl transform hover:scale-105 transition-all">
                   <p className="text-[11px] text-indigo-300 font-black uppercase mb-3 tracking-widest">Escuelas Activas</p>
                   <p className="text-5xl font-black text-white">{okSchools.length}</p>
                   <p className="text-[10px] text-indigo-400 font-bold mt-2 italic">✓ Operación 100%</p>
                </div>
                <div className="bg-white/5 p-8 rounded-[36px] border border-white/5 backdrop-blur-sm shadow-xl transform hover:scale-105 transition-all">
                   <p className="text-[11px] text-indigo-300 font-black uppercase mb-3 tracking-widest">Total Ingresos Brutos (3 Años)</p>
                   <p className="text-3xl font-black text-emerald-400">{formatCurrency(financialSummary.totalBruto)}</p>
                   <p className="text-[10px] text-indigo-400 font-bold mt-2 italic">Proyección trianual</p>
                </div>
             </div>

             <h4 className="text-indigo-200 text-xs font-black uppercase tracking-widest mb-10 border-b border-indigo-800/50 pb-6 relative">
               🎯 BENEFICIO DEL LICENCIATARIO - DESGLOSE COMPLETO
             </h4>
             
             <div className="space-y-14 mb-16 relative">
                {[1, 2, 3].map(y => {
                  const data = financialSummary.years[y as 1|2|3];
                  return (
                    <div key={y} className="relative pl-8 border-l-4 border-indigo-700 animate-in fade-in slide-in-from-right duration-500" style={{ animationDelay: `${y * 200}ms` }}>
                       <div className="flex items-center justify-between mb-6">
                          <h5 className="font-black text-2xl text-white tracking-tight">AÑO {y}</h5>
                          <div className="h-px flex-1 bg-indigo-800/40 mx-6"></div>
                       </div>
                       
                       <div className="grid grid-cols-1 gap-3 mb-6">
                          <div className="flex justify-between text-[11px] text-indigo-300 font-black uppercase px-2">
                             <span>Ingresos Brutos:</span>
                             <span className="text-white">{formatCurrency(data.bruto)}</span>
                          </div>
                          <div className="flex justify-between text-[11px] text-indigo-300 font-black uppercase px-2">
                             <span>Costes Gestión:</span>
                             <span className="text-indigo-100">-{formatCurrency(data.cost)}</span>
                          </div>
                          <div className="flex justify-between text-[11px] text-indigo-300 font-black uppercase px-2">
                             <span>Inversiones Lab:</span>
                             <span className="text-indigo-100">-{formatCurrency(data.lab)}</span>
                          </div>
                       </div>
                       
                       <div className="bg-indigo-600/20 p-5 rounded-3xl flex justify-between items-center border border-indigo-700/50 mb-6 shadow-inner">
                          <span className="text-[11px] font-black text-indigo-200 uppercase tracking-widest">Ingreso Neto (Escuelas)</span>
                          <span className="font-black text-xl text-emerald-400">{formatCurrency(data.net)}</span>
                       </div>
                       
                       <div className="flex justify-between items-center bg-white/5 p-6 rounded-[32px] border border-indigo-500/10 shadow-lg">
                          <span className="text-sm font-black text-indigo-100 uppercase tracking-[0.2em]">TU BENEFICIO</span>
                          <span className="text-4xl font-black text-amber-400 tracking-tighter drop-shadow-lg">{formatCurrency(data.benefit)}</span>
                       </div>
                    </div>
                  );
                })}
             </div>

             <div className="mt-16 pt-12 border-t border-indigo-800 bg-black/10 -mx-12 px-12 pb-16 rounded-b-[60px] relative">
                <h4 className="text-indigo-200 text-xs font-black uppercase tracking-[0.3em] mb-10 flex items-center justify-between">
                  <span>💰 TOTAL CONSOLIDADO 3 AÑOS</span>
                  <DollarSign size={20} className="text-indigo-400 opacity-30" />
                </h4>
                <div className="space-y-8">
                   <div className="flex justify-between items-end border-b border-indigo-800/50 pb-6">
                      <div>
                        <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Total Ingresos Netos (3 años):</p>
                        <p className="text-2xl font-bold text-emerald-300/80">{formatCurrency(financialSummary.totalNeto)}</p>
                      </div>
                   </div>
                   <div className="space-y-4 text-center p-8 bg-indigo-600/40 rounded-[40px] border border-indigo-400/20 shadow-2xl transform hover:scale-105 transition-all">
                      <p className="text-xs font-black text-indigo-200 uppercase tracking-[0.4em]">TU BENEFICIO TOTAL (3 años):</p>
                      <p className="text-6xl font-black text-amber-400 tracking-tighter drop-shadow-2xl">
                        {formatCurrency(financialSummary.totalBenefit)}
                      </p>
                      <div className="h-1.5 w-32 bg-amber-400/20 mx-auto rounded-full mt-4"></div>
                   </div>
                </div>
             </div>
          </div>

          <div className="p-10 bg-gray-50 border-2 border-dashed border-gray-200 rounded-[40px] text-center">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest leading-relaxed">
              💡 Nota: Para editar o eliminar la información del licenciatario, debes editar las escuelas individuales donde está asignado o acudir al módulo de configuración.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
