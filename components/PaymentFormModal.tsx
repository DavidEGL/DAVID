
import React, { useState, useEffect } from 'react';
import { Payment, PaymentType, PaymentStatus, School } from '../types';
import { X, Save, DollarSign, Calendar, FileText, CheckCircle2 } from 'lucide-react';

interface PaymentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payment: Payment) => void;
  paymentToEdit?: Partial<Payment>;
  schoolId?: string;
}

export const PaymentFormModal: React.FC<PaymentFormModalProps> = ({ isOpen, onClose, onSave, paymentToEdit, schoolId }) => {
  const [formData, setFormData] = useState<Partial<Payment>>({});

  useEffect(() => {
    if (paymentToEdit && paymentToEdit.id) {
      setFormData(paymentToEdit);
    } else {
      setFormData({
        tipo: PaymentType.COBRO_ESCUELA,
        referenciaId: schoolId || '',
        anoContrato: 1,
        concepto: '',
        monto: 0,
        fechaProgramada: new Date().toISOString().split('T')[0],
        status: PaymentStatus.PROGRAMADO,
        notas: ''
      });
    }
  }, [paymentToEdit, schoolId, isOpen]);

  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'monto' || name === 'anoContrato') {
      setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = () => {
    if (!formData.monto || !formData.concepto) return alert('Datos incompletos');
    onSave({ 
      ...formData, 
      id: formData.id || `p${Date.now()}` 
    } as Payment);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg overflow-hidden rounded-[40px] shadow-2xl flex flex-col scale-in-center">
        <header className="p-8 border-b border-gray-100 flex items-center justify-between bg-indigo-900 text-white">
          <div>
            <h3 className="text-2xl font-black tracking-tight">
              {formData.id ? '💳 Editar Registro de Pago' : '💳 Nuevo Registro de Pago'}
            </h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-all">
            <X size={24} />
          </button>
        </header>

        <div className="p-8 space-y-6">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Concepto del Pago</label>
            <input name="concepto" value={formData.concepto} onChange={handleInputChange} className="w-full border-2 border-gray-100 rounded-2xl p-4 text-sm font-bold focus:border-indigo-500 outline-none" placeholder="Ej. Pago Inicial Lab" />
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-1 text-indigo-600">
                <label className="text-[10px] font-black uppercase tracking-wider">Monto (MXN)</label>
                <div className="relative">
                   <input type="number" name="monto" value={formData.monto} onChange={handleInputChange} className="w-full border-2 border-indigo-100 rounded-2xl p-4 text-xl font-black focus:border-indigo-500 outline-none" />
                   <DollarSign className="absolute right-4 top-1/2 -translate-y-1/2 opacity-30" size={20} />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Año de Contrato</label>
                <select name="anoContrato" value={formData.anoContrato} onChange={handleInputChange} className="w-full border-2 border-gray-100 rounded-2xl p-4 text-sm font-bold focus:border-indigo-500 outline-none bg-white">
                  <option value={1}>Año 1</option>
                  <option value={2}>Año 2</option>
                  <option value={3}>Año 3</option>
                </select>
              </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Fecha Programada</label>
                <input type="date" name="fechaProgramada" value={formData.fechaProgramada} onChange={handleInputChange} className="w-full border-2 border-gray-100 rounded-2xl p-4 text-sm font-bold focus:border-indigo-500 outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Status del Pago</label>
                <select name="status" value={formData.status} onChange={handleInputChange} className="w-full border-2 border-gray-100 rounded-2xl p-4 text-sm font-bold focus:border-indigo-500 outline-none bg-white">
                  {Object.values(PaymentStatus).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Notas Adicionales</label>
            <textarea name="notas" value={formData.notas} onChange={handleInputChange} rows={3} className="w-full border-2 border-gray-100 rounded-2xl p-4 text-sm font-medium focus:border-indigo-500 outline-none resize-none" />
          </div>
        </div>

        <footer className="p-8 border-t border-gray-100 bg-gray-50 flex items-center gap-4">
          <button onClick={onClose} className="flex-1 py-4 font-black text-gray-400 hover:text-gray-900 uppercase text-xs tracking-widest transition-colors bg-white border border-gray-200 rounded-2xl">
            Cancelar
          </button>
          <button 
            onClick={handleSave}
            className="flex-1 flex items-center justify-center gap-3 bg-indigo-900 text-white py-4 rounded-2xl font-black text-sm shadow-xl hover:bg-indigo-800 transition-all"
          >
            <Save size={20} />
            {formData.id ? 'Actualizar' : 'Registrar Pago'}
          </button>
        </footer>
      </div>
    </div>
  );
};
