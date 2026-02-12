
import React from 'react';
import { X, AlertTriangle, Trash2 } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirmar' }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md overflow-hidden rounded-3xl shadow-2xl scale-in-center">
        <div className="p-8 flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
            <AlertTriangle size={40} className="text-red-500" />
          </div>
          <h3 className="text-2xl font-black text-gray-900 mb-2">{title}</h3>
          <p className="text-gray-500 leading-relaxed">{message}</p>
        </div>
        
        <footer className="p-6 bg-gray-50 flex items-center gap-3">
          <button 
            onClick={onClose}
            className="flex-1 px-6 py-3 font-bold text-gray-500 hover:text-gray-900 transition-colors bg-white border border-gray-200 rounded-2xl"
          >
            Cancelar
          </button>
          <button 
            onClick={onConfirm}
            className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-rose-600 text-white px-6 py-3 rounded-2xl font-black shadow-lg shadow-red-100 hover:shadow-red-200 transition-all hover:scale-[1.02] active:scale-95"
          >
            <Trash2 size={18} />
            {confirmText}
          </button>
        </footer>
      </div>
    </div>
  );
};
