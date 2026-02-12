
import React from 'react';
import { GlobalConfig } from '../types';
import { formatCurrency } from '../services/finance';
import { Save, Plus, Trash2 } from 'lucide-react';

interface ConfigViewProps {
  config: GlobalConfig;
  setConfig: (c: GlobalConfig) => void;
}

export const ConfigView: React.FC<ConfigViewProps> = ({ config, setConfig }) => {
  const handleUpdatePrecio = (field: keyof GlobalConfig['precios'], val: number) => {
    setConfig({
      ...config,
      precios: { ...config.precios, [field]: val }
    });
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <h3 className="text-2xl font-bold">Configuración del Sistema</h3>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50 font-bold bg-gray-50/30">Precios y Costes Globales</div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h5 className="text-xs font-bold text-gray-400 uppercase tracking-widest">PAQUETE BEST</h5>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Precio por Alumno Anual</label>
                <input 
                  type="number" className="w-full border rounded p-2" 
                  value={config.precios.best} 
                  onChange={(e) => handleUpdatePrecio('best', parseFloat(e.target.value))}
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Coste Gestión Anual</label>
                <input 
                  type="number" className="w-full border rounded p-2" 
                  value={config.precios.costeBest} 
                  onChange={(e) => handleUpdatePrecio('costeBest', parseFloat(e.target.value))}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h5 className="text-xs font-bold text-gray-400 uppercase tracking-widest">INDIVIDUAL</h5>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Precio Programa Anual</label>
                <input 
                  type="number" className="w-full border rounded p-2" 
                  value={config.precios.individual} 
                  onChange={(e) => handleUpdatePrecio('individual', parseFloat(e.target.value))}
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Coste Gestión Anual</label>
                <input 
                  type="number" className="w-full border rounded p-2" 
                  value={config.precios.costeIndividual} 
                  onChange={(e) => handleUpdatePrecio('costeIndividual', parseFloat(e.target.value))}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50 font-bold bg-gray-50/30 flex items-center justify-between">
          <span>Catálogo General de Equipamiento</span>
          <button className="text-indigo-600 hover:bg-indigo-50 p-1 rounded flex items-center gap-1 text-sm">
            <Plus size={16}/> AGREGAR AL CATÁLOGO
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
              <tr>
                <th className="px-6 py-3">Nombre Equipo</th>
                <th className="px-6 py-3">Precio Unit. Default</th>
                <th className="px-6 py-3">Unidad</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {config.catalog.map(item => (
                <tr key={item.id}>
                  <td className="px-6 py-4 font-medium">{item.nombre}</td>
                  <td className="px-6 py-4">{formatCurrency(item.precioDefault)}</td>
                  <td className="px-6 py-4 text-gray-500">{item.unidad}</td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-gray-300 hover:text-red-500"><Trash2 size={16}/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
