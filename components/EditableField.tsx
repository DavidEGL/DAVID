
import React from 'react';
import { OverrideValue } from '../types';
import { RotateCcw, Edit2 } from 'lucide-react';
import { formatCurrency } from '../services/finance';

interface EditableFieldProps {
  label: string;
  value: OverrideValue<number>;
  onUpdate: (newFinal: number, isOverride: boolean) => void;
  isCurrency?: boolean;
  className?: string;
}

export const EditableField: React.FC<EditableFieldProps> = ({ 
  label, value, onUpdate, isCurrency = true, className = "" 
}) => {
  const [isEditing, setIsEditing] = React.useState(false);
  const [tempValue, setTempValue] = React.useState(value.final.toString());

  const handleSave = () => {
    onUpdate(parseFloat(tempValue) || 0, true);
    setIsEditing(false);
  };

  const handleRestore = () => {
    onUpdate(value.calculated, false);
    setTempValue(value.calculated.toString());
  };

  return (
    <div className={`group flex flex-col ${className}`}>
      <label className="text-xs font-semibold text-gray-500 mb-1 flex items-center gap-1">
        {label}
        {value.isOverride && (
          <span className="bg-amber-100 text-amber-700 px-1 rounded text-[10px] border border-amber-200">
            Override
          </span>
        )}
      </label>
      
      <div className="flex items-center gap-2">
        {isEditing ? (
          <div className="flex items-center gap-1">
            <input
              autoFocus
              type="number"
              className="w-full p-1 border rounded text-sm focus:ring-1 focus:ring-blue-500 outline-none"
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              onBlur={handleSave}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            />
          </div>
        ) : (
          <div 
            onClick={() => { setIsEditing(true); setTempValue(value.final.toString()); }}
            className={`cursor-pointer font-medium text-sm flex items-center gap-2 ${value.isOverride ? 'text-amber-800' : 'text-gray-900'}`}
          >
            {isCurrency ? formatCurrency(value.final) : value.final}
            <Edit2 size={12} className="opacity-0 group-hover:opacity-100 text-gray-400" />
          </div>
        )}

        {value.isOverride && !isEditing && (
          <button 
            onClick={(e) => { e.stopPropagation(); handleRestore(); }}
            className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-blue-600"
            title="Restaurar cálculo automático"
          >
            <RotateCcw size={12} />
          </button>
        )}
      </div>
      
      {value.isOverride && !isEditing && (
        <span className="text-[10px] text-gray-400 italic">
          Auto: {isCurrency ? formatCurrency(value.calculated) : value.calculated}
        </span>
      )}
    </div>
  );
};
