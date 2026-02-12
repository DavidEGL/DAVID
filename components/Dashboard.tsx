
import React from 'react';
import { School, Licensee, Payment, PaymentStatus, SchoolStatus } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { formatCurrency } from '../services/finance';
import { School as SchoolIcon, Users, CreditCard, TrendingUp, AlertCircle, CheckCircle2, Clock, MapPin, Calendar, User } from 'lucide-react';
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

  return (
    <div className="space-y-10">
      {/* KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-gray-400 mb-1">Escuelas Registradas</p>
            <h4 className="text-2xl font-black text-indigo-900">{schools.length}</h4>
          </div>
          <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600">
            <SchoolIcon size={24} />
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-gray-400 mb-1">Alumnos (Año 1)</p>
            <h4 className="text-2xl font-black text-blue-900">{totalStudentsY1}</h4>
          </div>
          <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
            <Users size={24} />
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-gray-400 mb-1">Ingreso Bruto Y1</p>
            <h4 className="text-2xl font-black text-emerald-900">{formatCurrency(totalGrossY1)}</h4>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
            <TrendingUp size={24} />
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-gray-400 mb-1">Cobrado Total</p>
            <h4 className="text-2xl font-black text-orange-900">{formatCurrency(totalCollected)}</h4>
          </div>
          <div className="p-3 rounded-xl bg-orange-50 text-orange-600">
            <CreditCard size={24} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Schools Summary List */}
        <div className="space-y-6">
          <h4 className="text-lg font-black text-gray-800 flex items-center gap-2">
            🏫 Escuelas Registradas
          </h4>
          <div className="space-y-4">
            {schools.map(school => {
              const total3yrIncome = school.proyeccion[1].ingresoNeto.final + school.proyeccion[2].ingresoNeto.final + school.proyeccion[3].ingresoNeto.final;
              return (
                <Link to={`/school/${school.id}`} key={school.id} className="block bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group border-l-4 border-indigo-500">
                  <div className="flex justify-between items-start mb-4">
                    <h5 className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{school.nombre}</h5>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${school.status === SchoolStatus.ACTIVA ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                      {school.status === SchoolStatus.ACTIVA ? '✓ OK' : '⏳ ' + school.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-y-2 gap-x-4 mb-4">
                    <p className="text-xs text-gray-500 flex items-center gap-1"><MapPin size={12} /> {school.ciudad}, {school.estado}, {school.pais || 'MX'}</p>
                    <p className="text-xs text-gray-500 flex items-center gap-1"><Users size={12} /> {school.proyeccion[1].alumnos} alumnos</p>
                    <p className="text-xs text-gray-500 flex items-center gap-1"><Calendar size={12} /> Contrato desde {school.fechaInicio.split('-')[0]}</p>
                    <p className="text-xs text-gray-500 flex items-center gap-1"><User size={12} /> Licenciatario: {getLicenseeName(school.licenciatarioId)}</p>
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t border-gray-50">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-tighter">📊 Reparto: {school.splitPctLicenciatario * 100}% / {(1 - school.splitPctLicenciatario) * 100}%</p>
                    <div className="text-right">
                      <p className="text-[10px] text-gray-400 uppercase font-black">Ingreso Neto (3 años)</p>
                      <p className="text-lg font-black text-indigo-600">{formatCurrency(total3yrIncome)}</p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Payments Section */}
        <div className="space-y-8">
          <div className="space-y-4">
            <h4 className="text-lg font-black text-gray-800 flex items-center gap-2">
              <CheckCircle2 className="text-emerald-500" size={20} />
              ✅ Pagos Realizados
            </h4>
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
              {paidPayments.map(p => (
                <div key={p.id} className="bg-white p-4 rounded-xl border border-emerald-100 border-l-4 border-l-emerald-500 shadow-sm flex justify-between items-center">
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-gray-900">{p.concepto}</p>
                    <p className="text-xs text-indigo-600 font-bold">{getSchoolName(p.referenciaId)}</p>
                    <p className="text-[10px] text-gray-400">Vence: {p.fechaProgramada} • Año {p.anoContrato}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-black text-emerald-600">{formatCurrency(p.monto)}</p>
                    <span className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">✅ Pagado</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-black text-gray-800 flex items-center gap-2">
              <Clock className="text-amber-500" size={20} />
              ⏳ Pagos Pendientes
            </h4>
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
              {pendingPayments.map(p => {
                const isOverdue = new Date(p.fechaProgramada) < today;
                return (
                  <div key={p.id} className={`bg-white p-4 rounded-xl border border-l-4 shadow-sm flex justify-between items-center ${
                    isOverdue ? 'border-red-200 border-l-red-500 bg-red-50/20' : 'border-amber-100 border-l-amber-400'
                  }`}>
                    <div className="space-y-1">
                      <p className={`text-sm font-bold ${isOverdue ? 'text-red-700' : 'text-gray-900'}`}>{p.concepto}</p>
                      <p className="text-xs text-indigo-600 font-bold">{getSchoolName(p.referenciaId)}</p>
                      <p className={`text-[10px] font-bold ${isOverdue ? 'text-red-500 animate-pulse' : 'text-gray-400'}`}>
                        {isOverdue ? '⚠️ VENCIDO' : 'Vence'}: {p.fechaProgramada} • Año {p.anoContrato}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`text-xl font-black ${isOverdue ? 'text-red-700' : 'text-amber-600'}`}>{formatCurrency(p.monto)}</p>
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                        isOverdue ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        ⏳ Pendiente
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
