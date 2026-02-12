
import React from 'react';
import { School, Licensee, Payment, PaymentStatus, SchoolStatus } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { formatCurrency } from '../services/finance';
import { School as SchoolIcon, Users, CreditCard, TrendingUp, AlertCircle, CheckCircle2, Clock, MapPin, Calendar, User, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface DashboardProps {
  schools: School[];
  licensees: Licensee[];
  payments: Payment[];
}

export const Dashboard: React.FC<DashboardProps> = ({ schools, licensees, payments }) => {
  const totalStudentsY1 = schools.reduce((acc, s) => acc + s.proyeccion[1].alumnos, 0);
  const totalGrossY1 = schools.reduce((acc, s) => acc + s.proyeccion[1].ingresoBruto.final, 0);
  
  const paidPayments = payments.filter(p => p.status === PaymentStatus.PAGADO);
  const totalCollected = paidPayments.reduce((acc, p) => acc + p.monto, 0);

  const pendingPayments = payments.filter(p => 
    p.status === PaymentStatus.PROGRAMADO || p.status === PaymentStatus.VENCIDO || p.status === PaymentStatus.PARCIAL
  );
  
  const today = new Date();

  const getSchoolName = (id?: string) => schools.find(s => s.id === id)?.nombre || 'N/A';
  const getLicenseeName = (id?: string) => licensees.find(l => l.id === id)?.nombreComercial || 'N/A';

  // Chart data for projections
  const chartData = [
    { name: 'Año 1', total: schools.reduce((acc, s) => acc + s.proyeccion[1].ingresoNeto.final, 0) },
    { name: 'Año 2', total: schools.reduce((acc, s) => acc + s.proyeccion[2].ingresoNeto.final, 0) },
    { name: 'Año 3', total: schools.reduce((acc, s) => acc + s.proyeccion[3].ingresoNeto.final, 0) },
  ];

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-20">
      {/* KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { label: 'Escuelas Registradas', val: schools.length, icon: SchoolIcon, color: 'indigo' },
          { label: 'Alumnos (Año 1)', val: totalStudentsY1, icon: Users, color: 'blue' },
          { label: 'Ingreso Bruto Y1', val: formatCurrency(totalGrossY1), icon: TrendingUp, color: 'emerald' },
          { label: 'Cobrado Total', val: formatCurrency(totalCollected), icon: CreditCard, color: 'orange' }
        ].map((kpi, idx) => (
          <div key={idx} className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm hover:shadow-xl transition-all">
            <div className={`p-4 rounded-3xl bg-${kpi.color}-50 text-${kpi.color}-600 inline-block mb-6`}>
              <kpi.icon size={28} />
            </div>
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">{kpi.label}</p>
            <h4 className={`text-3xl font-black text-gray-900`}>{kpi.val}</h4>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Projections Chart */}
        <div className="lg:col-span-2 bg-white p-10 rounded-[50px] border border-gray-100 shadow-sm space-y-8">
          <div className="flex items-center justify-between">
            <h4 className="text-xl font-black text-gray-900 flex items-center gap-3">
              📈 Proyección de Crecimiento (Neto)
            </h4>
            <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-4 py-1.5 rounded-full uppercase">3 Años Consolidados</span>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 700}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} tickFormatter={(val) => `$${val/1000}k`} />
                <Tooltip 
                  contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.1)', padding: '15px'}}
                  formatter={(value: number) => [formatCurrency(value), 'Ingreso Neto']}
                />
                <Area type="monotone" dataKey="total" stroke="#4f46e5" strokeWidth={4} fillOpacity={1} fill="url(#colorTotal)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Summary Card */}
        <div className="bg-indigo-900 rounded-[50px] p-10 text-white shadow-2xl relative overflow-hidden flex flex-col justify-center border border-indigo-800">
           <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20 blur-2xl"></div>
           <p className="text-[10px] font-black text-indigo-300 uppercase tracking-[0.3em] mb-4">Total Proyectado 3 Años</p>
           <h3 className="text-6xl font-black text-amber-400 tracking-tighter mb-8">
             {formatCurrency(schools.reduce((acc, s) => acc + s.proyeccion[1].ingresoNeto.final + s.proyeccion[2].ingresoNeto.final + s.proyeccion[3].ingresoNeto.final, 0))}
           </h3>
           <div className="space-y-4 pt-8 border-t border-indigo-800">
             <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-indigo-300 uppercase">Status Operativo:</span>
                <span className="bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full font-black">SALUDABLE</span>
             </div>
             <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-indigo-300 uppercase">Eficiencia Cobro:</span>
                <span className="font-black text-indigo-100">{((totalCollected / (totalGrossY1 || 1)) * 100).toFixed(0)}%</span>
             </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Schools Summary List */}
        <div className="space-y-8">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
             <h4 className="text-xl font-black text-gray-800 flex items-center gap-2">
                🏫 Últimas Escuelas
             </h4>
             <Link to="/schools" className="text-[10px] font-black text-indigo-600 uppercase hover:underline">Ver todas</Link>
          </div>
          <div className="space-y-4">
            {schools.slice(0, 4).map(school => {
              const total3yrIncome = school.proyeccion[1].ingresoNeto.final + school.proyeccion[2].ingresoNeto.final + school.proyeccion[3].ingresoNeto.final;
              return (
                <Link to={`/school/${school.id}`} key={school.id} className="block bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-lg transition-all group relative overflow-hidden">
                   <div className="flex justify-between items-start">
                    <div>
                      <h5 className="font-black text-lg text-gray-900 group-hover:text-indigo-600 transition-colors">{school.nombre}</h5>
                      <p className="text-xs text-gray-400 font-bold flex items-center gap-2 mt-1"><MapPin size={12}/> {school.ciudad}, {school.estado}</p>
                    </div>
                    <span className={`text-[10px] font-black px-3 py-1 rounded-full ${school.status === SchoolStatus.ACTIVA ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                      {school.status}
                    </span>
                  </div>
                  <div className="mt-6 pt-6 border-t border-gray-50 flex justify-between items-end">
                    <div>
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Neto 3 Años</p>
                      <p className="text-xl font-black text-indigo-600">{formatCurrency(total3yrIncome)}</p>
                    </div>
                    <ArrowUpRight size={20} className="text-gray-200 group-hover:text-indigo-300 transition-colors" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Payments Summary */}
        <div className="space-y-8">
           <div className="flex items-center justify-between border-b border-gray-100 pb-4">
             <h4 className="text-xl font-black text-gray-800 flex items-center gap-2">
                💳 Cobros Críticos
             </h4>
          </div>
          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            {pendingPayments.map(p => {
              const isOverdue = new Date(p.fechaProgramada) < today;
              return (
                <div key={p.id} className={`bg-white p-6 rounded-[32px] border border-l-8 shadow-sm flex justify-between items-center transition-all hover:scale-[1.01] ${
                  isOverdue ? 'border-l-red-500 bg-red-50/10' : 'border-l-amber-400'
                }`}>
                  <div className="space-y-1">
                    <p className={`text-sm font-black ${isOverdue ? 'text-red-700' : 'text-gray-900'} uppercase tracking-tight`}>{p.concepto}</p>
                    <p className="text-xs text-indigo-600 font-black">{getSchoolName(p.referenciaId)}</p>
                    <p className={`text-[10px] font-bold ${isOverdue ? 'text-red-500' : 'text-gray-400'}`}>
                      {isOverdue ? '⚠️ VENCIDO' : 'Vence'}: {p.fechaProgramada}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-2xl font-black ${isOverdue ? 'text-red-700' : 'text-gray-900'}`}>{formatCurrency(p.monto)}</p>
                    <span className={`text-[9px] font-black uppercase px-3 py-1 rounded-full ${
                      isOverdue ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {p.status}
                    </span>
                  </div>
                </div>
              );
            })}
            {pendingPayments.length === 0 && (
              <div className="text-center py-20 bg-gray-50 border-2 border-dashed border-gray-100 rounded-[40px] text-gray-400 font-bold italic text-sm">
                No hay pagos pendientes registrados.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
