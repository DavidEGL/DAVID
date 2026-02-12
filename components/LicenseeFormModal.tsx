
import React, { useState, useEffect } from 'react';
import { Licensee, School } from '../types';
import { X, Save, Building2, Mail, Phone, Globe, Calendar, CreditCard } from 'lucide-react';

interface LicenseeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (licensee: Licensee) => void;
  licenseeToEdit?: Licensee;
}

export const LicenseeFormModal: React.FC<LicenseeFormModalProps> = ({ isOpen, onClose, onSave, licenseeToEdit }) => {
  const [formData, setFormData] = useState<Partial<Licensee>>({});

  useEffect(() => {
    if (licenseeToEdit) {
      setFormData(licenseeToEdit);
    } else {
      setFormData({
        nombreComercial: '',
        razonSocial: '',
        pais: 'México',
        estado: '',
        ciudad: '',
        email: '',
        telefono: '',
        contactoPrincipal: '',
        tipoLicencia: 'Standard',
        fechaInicio: new Date().toISOString().split('T')[0],
        fechaFin: new Date(new Date().setFullYear(new Date().getFullYear() + 3)).toISOString().split('T')[0],
        status: 'ACTIVO',
        splitEstandar: 0.40,
        notas: ''
      });
    }
  }, [licenseeToEdit, isOpen]);

  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'splitEstandar') {
      setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = () => {
    if (!formData.nombreComercial || !formData.email) return alert('Campos obligatorios faltantes');
    onSave({ 
      ...formData, 
      id: licenseeToEdit?.id || `l${Date.now()}` 
    } as Licensee);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-[40px] shadow-2xl flex flex-col scale-in-center border border-gray-100">
        <header className="p-8 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div>
            <h3 className="text-3xl font-black text-gray-900 tracking-tight">
              {licenseeToEdit ? '👤 Editar Licenciatario' : '👤 Nuevo Licenciatario'}
            </h3>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mt-1">Gestión de socios comerciales y master franquicias.</p>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-white hover:shadow-md rounded-full text-gray-400 transition-all">
            <X size={28} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-10 space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* General Info */}
            <section className="space-y-6">
              <div className="flex items-center gap-3 border-b border-indigo-50 pb-2">
                <Building2 className="text-indigo-600" size={20} />
                <h4 className="text-xs font-black text-indigo-600 uppercase tracking-widest">Datos Comerciales</h4>
              </div>
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Nombre Comercial</label>
                  <input name="nombreComercial" value={formData.nombreComercial} onChange={handleInputChange} className="w-full border-2 border-gray-100 rounded-2xl p-4 text-sm font-bold focus:border-indigo-500 outline-none transition-all" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Razón Social / Legal</label>
                  <input name="razonSocial" value={formData.razonSocial} onChange={handleInputChange} className="w-full border-2 border-gray-100 rounded-2xl p-4 text-sm font-bold focus:border-indigo-500 outline-none transition-all" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Tipo de Licencia</label>
                    <select name="tipoLicencia" value={formData.tipoLicencia} onChange={handleInputChange} className="w-full border-2 border-gray-100 rounded-2xl p-4 text-sm font-bold focus:border-indigo-500 outline-none transition-all bg-white">
                      <option value="Master">Master</option>
                      <option value="Standard">Standard</option>
                      <option value="Pilot">Piloto</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Split Default (%)</label>
                    <input type="number" step="0.01" name="splitEstandar" value={formData.splitEstandar} onChange={handleInputChange} className="w-full border-2 border-gray-100 rounded-2xl p-4 text-sm font-black focus:border-indigo-500 outline-none transition-all" />
                  </div>
                </div>
              </div>
            </section>

            {/* Location & Contact */}
            <section className="space-y-6">
              <div className="flex items-center gap-3 border-b border-indigo-50 pb-2">
                <Globe className="text-indigo-600" size={20} />
                <h4 className="text-xs font-black text-indigo-600 uppercase tracking-widest">Ubicación y Contacto</h4>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Ciudad</label>
                    <input name="ciudad" value={formData.ciudad} onChange={handleInputChange} className="w-full border-2 border-gray-100 rounded-2xl p-4 text-sm font-bold focus:border-indigo-500 outline-none transition-all" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Estado</label>
                    <input name="estado" value={formData.estado} onChange={handleInputChange} className="w-full border-2 border-gray-100 rounded-2xl p-4 text-sm font-bold focus:border-indigo-500 outline-none transition-all" />
                  </div>
              </div>
              <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Contacto Principal</label>
                  <input name="contactoPrincipal" value={formData.contactoPrincipal} onChange={handleInputChange} className="w-full border-2 border-gray-100 rounded-2xl p-4 text-sm font-bold focus:border-indigo-500 outline-none transition-all" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Email</label>
                    <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full border-2 border-gray-100 rounded-2xl p-4 text-sm font-bold focus:border-indigo-500 outline-none transition-all" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Teléfono</label>
                    <input name="telefono" value={formData.telefono} onChange={handleInputChange} className="w-full border-2 border-gray-100 rounded-2xl p-4 text-sm font-bold focus:border-indigo-500 outline-none transition-all" />
                  </div>
              </div>
            </section>
          </div>

          <section className="bg-gray-50 p-8 rounded-[32px] border border-gray-100">
             <div className="flex items-center gap-3 border-b border-gray-200 pb-2 mb-6">
                <Calendar className="text-gray-600" size={20} />
                <h4 className="text-xs font-black text-gray-600 uppercase tracking-widest">Periodo y Contrato</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Fecha Inicio</label>
                    <input type="date" name="fechaInicio" value={formData.fechaInicio} onChange={handleInputChange} className="w-full border-2 border-white rounded-2xl p-4 text-sm font-bold focus:border-indigo-500 outline-none transition-all" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Fecha Fin</label>
                    <input type="date" name="fechaFin" value={formData.fechaFin} onChange={handleInputChange} className="w-full border-2 border-white rounded-2xl p-4 text-sm font-bold focus:border-indigo-500 outline-none transition-all" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Status</label>
                    <select name="status" value={formData.status} onChange={handleInputChange} className="w-full border-2 border-white rounded-2xl p-4 text-sm font-bold focus:border-indigo-500 outline-none transition-all bg-white">
                      <option value="ACTIVO">ACTIVO</option>
                      <option value="INACTIVO">INACTIVO</option>
                      <option value="VENCIDO">VENCIDO</option>
                    </select>
                  </div>
              </div>
          </section>
        </div>

        <footer className="p-8 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
          <button onClick={onClose} className="px-10 py-4 font-black text-gray-400 hover:text-gray-900 uppercase text-xs tracking-widest transition-colors">
            Cancelar
          </button>
          <button 
            onClick={handleSave}
            className="flex items-center gap-3 bg-indigo-900 text-white px-12 py-5 rounded-[24px] font-black text-sm shadow-2xl hover:bg-indigo-800 transition-all transform hover:scale-[1.02]"
          >
            <Save size={20} />
            {licenseeToEdit ? 'Actualizar Licenciatario' : 'Crear Licenciatario'}
          </button>
        </footer>
      </div>
    </div>
  );
};
