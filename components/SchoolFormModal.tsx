
import React, { useState, useEffect, useMemo } from 'react';
import { School, Licensee, GlobalConfig, SchoolStatus, ProgramType, SchoolEquipment, EquipmentCatalogItem, OverrideValue } from '../types';
import { X, Save, Plus, Trash2, MapPin, User, Wrench, GraduationCap, Percent, DollarSign, Settings2 } from 'lucide-react';
import { formatCurrency, calculateSchoolFinances } from '../services/finance';

interface SchoolFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (school: School) => void;
  schoolToEdit?: School;
  licensees: Licensee[];
  config: GlobalConfig;
}

export const SchoolFormModal: React.FC<SchoolFormModalProps> = ({ isOpen, onClose, onSave, schoolToEdit, licensees, config }) => {
  const [formData, setFormData] = useState<Partial<School>>({});

  useEffect(() => {
    if (schoolToEdit) {
      setFormData(schoolToEdit);
    } else {
      setFormData({
        nombre: '',
        direccion: '',
        ciudad: '',
        estado: '',
        pais: 'MEXICO',
        nivel: 'Primaria/Secundaria',
        contacto: '',
        email: '',
        telefono: '',
        responsableNombre: '',
        responsableTelefono: '',
        licenciatarioId: licensees[0]?.id || '',
        fechaInicio: new Date().toISOString().split('T')[0],
        duracionContrato: 3,
        status: SchoolStatus.ONBOARDING,
        programaTipo: ProgramType.BEST,
        numProgramasIndividuales: 1,
        splitPctLicenciatario: config.splitDefault,
        precioPackBest: { calculated: config.precios.best, final: config.precios.best, isOverride: false },
        costeGestionBest: { calculated: config.precios.costeBest, final: config.precios.costeBest, isOverride: false },
        precioIndividual: { calculated: config.precios.individual, final: config.precios.individual, isOverride: false },
        costeGestionIndividual: { calculated: config.precios.costeIndividual, final: config.precios.costeIndividual, isOverride: false },
        equipamiento: [],
        proyeccion: {
          1: { alumnos: 0, ingresoBruto: { calculated: 0, final: 0, isOverride: false }, costeGestion: { calculated: 0, final: 0, isOverride: false }, inversionLab: { calculated: 0, final: 0, isOverride: false }, ingresoNeto: { calculated: 0, final: 0, isOverride: false }, splitLicenciatario: { calculated: 0, final: 0, isOverride: false }, splitEpic: { calculated: 0, final: 0, isOverride: false } },
          2: { alumnos: 0, ingresoBruto: { calculated: 0, final: 0, isOverride: false }, costeGestion: { calculated: 0, final: 0, isOverride: false }, inversionLab: { calculated: 0, final: 0, isOverride: false }, ingresoNeto: { calculated: 0, final: 0, isOverride: false }, splitLicenciatario: { calculated: 0, final: 0, isOverride: false }, splitEpic: { calculated: 0, final: 0, isOverride: false } },
          3: { alumnos: 0, ingresoBruto: { calculated: 0, final: 0, isOverride: false }, costeGestion: { calculated: 0, final: 0, isOverride: false }, inversionLab: { calculated: 0, final: 0, isOverride: false }, ingresoNeto: { calculated: 0, final: 0, isOverride: false }, splitLicenciatario: { calculated: 0, final: 0, isOverride: false }, splitEpic: { calculated: 0, final: 0, isOverride: false } },
        }
      });
    }
  }, [schoolToEdit, licensees, config, isOpen]);

  // Real-time calculation for the projection summary inside the modal
  const computedSchool = useMemo(() => {
    if (!formData.nombre) return null;
    return calculateSchoolFinances(formData as School, config);
  }, [formData, config]);

  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    // Handle numeric fields
    if (name === 'splitPctLicenciatario') {
        setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleOverrideChange = (field: 'precioPackBest' | 'costeGestionBest' | 'precioIndividual' | 'costeGestionIndividual', newVal: number) => {
      setFormData(prev => {
          const current = prev[field] as OverrideValue<number>;
          return {
              ...prev,
              [field]: {
                  ...current,
                  final: newVal,
                  isOverride: newVal !== current.calculated
              }
          };
      });
  };

  const handleProyeccionChange = (year: number, value: number) => {
    setFormData(prev => ({
      ...prev,
      proyeccion: {
        ...prev.proyeccion!,
        [year]: { ...prev.proyeccion![year as 1|2|3], alumnos: value }
      }
    }));
  };

  const addEquipment = (catalogItem: EquipmentCatalogItem) => {
    const newItem: SchoolEquipment = {
      id: `eq-${Date.now()}`,
      equipoId: catalogItem.id,
      nombre: catalogItem.nombre,
      cantidad: 1,
      precioUnitario: { calculated: catalogItem.precioDefault, final: catalogItem.precioDefault, isOverride: false },
      total: { calculated: catalogItem.precioDefault, final: catalogItem.precioDefault, isOverride: false }
    };
    setFormData(prev => ({
      ...prev,
      equipamiento: [...(prev.equipamiento || []), newItem]
    }));
  };

  const removeEquipment = (id: string) => {
    setFormData(prev => ({
      ...prev,
      equipamiento: prev.equipamiento?.filter(e => e.id !== id)
    }));
  };

  const updateEquipmentQty = (id: string, qty: number) => {
    setFormData(prev => ({
      ...prev,
      equipamiento: prev.equipamiento?.map(e => e.id === id ? { ...e, cantidad: qty } : e)
    }));
  };

  const handleSave = () => {
    if (!formData.nombre) return alert('El nombre de la escuela es obligatorio');
    if (!formData.licenciatarioId) return alert('Debe asignar un licenciatario');
    
    onSave({ 
      ...formData, 
      id: schoolToEdit?.id || `s${Date.now()}` 
    } as School);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-6xl max-h-[95vh] overflow-hidden rounded-[40px] shadow-2xl flex flex-col scale-in-center">
        <header className="p-8 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div>
            <h3 className="text-3xl font-black text-gray-900 tracking-tight">
              {schoolToEdit ? '✏️ Editar Escuela' : '🏫 Nueva Escuela'}
            </h3>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mt-1">Configura los parámetros operativos y financieros completos.</p>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-white hover:shadow-md rounded-full text-gray-400 transition-all">
            <X size={28} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Left Column: Form Inputs */}
            <div className="space-y-12">
              {/* Basic & Location */}
              <section className="space-y-6">
                <div className="flex items-center gap-3 border-b border-indigo-50 pb-2">
                  <MapPin className="text-indigo-600" size={20} />
                  <h4 className="text-xs font-black text-indigo-600 uppercase tracking-widest">Información y Ubicación</h4>
                </div>
                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Nombre de la Escuela</label>
                    <input name="nombre" value={formData.nombre} onChange={handleInputChange} className="w-full border-2 border-gray-100 rounded-2xl p-4 text-sm font-bold focus:border-indigo-500 outline-none transition-all" placeholder="Ej. Centro Educativo Gregor Johann Mendel" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Dirección Completa</label>
                    <input name="direccion" value={formData.direccion} onChange={handleInputChange} className="w-full border-2 border-gray-100 rounded-2xl p-4 text-sm font-bold focus:border-indigo-500 outline-none transition-all" placeholder="Av México 252 Col. Noria Norte" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-6">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Ciudad</label>
                    <input name="ciudad" value={formData.ciudad} onChange={handleInputChange} className="w-full border-2 border-gray-100 rounded-2xl p-4 text-sm font-bold focus:border-indigo-500 outline-none transition-all" placeholder="Apodaca" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Estado</label>
                    <input name="estado" value={formData.estado} onChange={handleInputChange} className="w-full border-2 border-gray-100 rounded-2xl p-4 text-sm font-bold focus:border-indigo-500 outline-none transition-all" placeholder="Nuevo León" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">País</label>
                    <input name="pais" value={formData.pais} onChange={handleInputChange} className="w-full border-2 border-gray-100 rounded-2xl p-4 text-sm font-bold focus:border-indigo-500 outline-none transition-all" />
                  </div>
                </div>
              </section>

              {/* Responsible and Licensee */}
              <section className="space-y-6">
                <div className="flex items-center gap-3 border-b border-indigo-50 pb-2">
                  <User className="text-indigo-600" size={20} />
                  <h4 className="text-xs font-black text-indigo-600 uppercase tracking-widest">Responsables</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Licenciatario Responsable</label>
                    <select name="licenciatarioId" value={formData.licenciatarioId} onChange={handleInputChange} className="w-full border-2 border-gray-100 rounded-2xl p-4 text-sm font-bold focus:border-indigo-500 outline-none transition-all bg-white">
                      {licensees.map(l => <option key={l.id} value={l.id}>{l.nombreComercial}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Status Operativo</label>
                    <select name="status" value={formData.status} onChange={handleInputChange} className="w-full border-2 border-gray-100 rounded-2xl p-4 text-sm font-bold focus:border-indigo-500 outline-none transition-all bg-white">
                      {Object.values(SchoolStatus).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Nombre del Responsable (Escuela)</label>
                    <input name="responsableNombre" value={formData.responsableNombre} onChange={handleInputChange} className="w-full border-2 border-gray-100 rounded-2xl p-4 text-sm font-bold focus:border-indigo-500 outline-none transition-all" placeholder="Judith" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Teléfono Responsable</label>
                    <input name="responsableTelefono" value={formData.responsableTelefono} onChange={handleInputChange} className="w-full border-2 border-gray-100 rounded-2xl p-4 text-sm font-bold focus:border-indigo-500 outline-none transition-all" placeholder="12324556" />
                  </div>
                </div>
              </section>

              {/* Individual Price and Cost Overrides for this school */}
              <section className="space-y-6 bg-indigo-50/20 p-8 rounded-[32px] border border-indigo-100/50">
                  <div className="flex items-center gap-3 border-b border-indigo-100 pb-2">
                      <Settings2 className="text-indigo-600" size={20} />
                      <h4 className="text-xs font-black text-indigo-600 uppercase tracking-widest">Precios y Costes de Gestión Específicos</h4>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Modalidad BEST</p>
                          <div className="space-y-3">
                              <div className="relative">
                                  <label className="text-[9px] font-black text-indigo-400 uppercase mb-1 block">Precio por Alumno</label>
                                  <input 
                                      type="number" 
                                      value={formData.precioPackBest?.final} 
                                      onChange={(e) => handleOverrideChange('precioPackBest', parseFloat(e.target.value) || 0)}
                                      className="w-full border-2 border-white rounded-xl p-3 text-xs font-black focus:border-indigo-400 outline-none bg-white/80" 
                                  />
                                  <span className="absolute right-3 top-[26px] text-gray-300"><DollarSign size={14}/></span>
                              </div>
                              <div className="relative">
                                  <label className="text-[9px] font-black text-indigo-400 uppercase mb-1 block">Coste Gestión por Alumno</label>
                                  <input 
                                      type="number" 
                                      value={formData.costeGestionBest?.final} 
                                      onChange={(e) => handleOverrideChange('costeGestionBest', parseFloat(e.target.value) || 0)}
                                      className="w-full border-2 border-white rounded-xl p-3 text-xs font-black focus:border-indigo-400 outline-none bg-white/80" 
                                  />
                                  <span className="absolute right-3 top-[26px] text-gray-300"><DollarSign size={14}/></span>
                              </div>
                          </div>
                      </div>

                      <div className="space-y-4">
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Modalidad INDIVIDUAL</p>
                          <div className="space-y-3">
                              <div className="relative">
                                  <label className="text-[9px] font-black text-indigo-400 uppercase mb-1 block">Precio por Programa</label>
                                  <input 
                                      type="number" 
                                      value={formData.precioIndividual?.final} 
                                      onChange={(e) => handleOverrideChange('precioIndividual', parseFloat(e.target.value) || 0)}
                                      className="w-full border-2 border-white rounded-xl p-3 text-xs font-black focus:border-indigo-400 outline-none bg-white/80" 
                                  />
                                  <span className="absolute right-3 top-[26px] text-gray-300"><DollarSign size={14}/></span>
                              </div>
                              <div className="relative">
                                  <label className="text-[9px] font-black text-indigo-400 uppercase mb-1 block">Coste Gestión por Programa</label>
                                  <input 
                                      type="number" 
                                      value={formData.costeGestionIndividual?.final} 
                                      onChange={(e) => handleOverrideChange('costeGestionIndividual', parseFloat(e.target.value) || 0)}
                                      className="w-full border-2 border-white rounded-xl p-3 text-xs font-black focus:border-indigo-400 outline-none bg-white/80" 
                                  />
                                  <span className="absolute right-3 top-[26px] text-gray-300"><DollarSign size={14}/></span>
                              </div>
                          </div>
                      </div>
                  </div>
              </section>

              {/* Academic Config & Split */}
              <section className="space-y-6">
                <div className="flex items-center gap-3 border-b border-indigo-50 pb-2">
                  <GraduationCap className="text-indigo-600" size={20} />
                  <h4 className="text-xs font-black text-indigo-600 uppercase tracking-widest">Configuración y Reparto</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Modalidad de Programas</label>
                    <select name="programaTipo" value={formData.programaTipo} onChange={handleInputChange} className="w-full border-2 border-gray-100 rounded-2xl p-4 text-sm font-bold focus:border-indigo-500 outline-none transition-all bg-white">
                      <option value={ProgramType.BEST}>PAQUETE BEST</option>
                      <option value={ProgramType.INDIVIDUAL}>PROGRAMAS INDIVIDUALES</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Reparto Licenciatario (Factor 0.0 - 1.0)</label>
                    <div className="relative">
                        <input type="number" name="splitPctLicenciatario" value={formData.splitPctLicenciatario} onChange={handleInputChange} step="0.01" min="0" max="1" className="w-full border-2 border-gray-100 rounded-2xl p-4 text-sm font-black focus:border-indigo-500 outline-none transition-all" />
                        <Percent className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                    </div>
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Fecha Inicio Contrato</label>
                    <input type="date" name="fechaInicio" value={formData.fechaInicio} onChange={handleInputChange} className="w-full border-2 border-gray-100 rounded-2xl p-4 text-sm font-bold focus:border-indigo-500 outline-none transition-all" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  {[1, 2, 3].map(y => (
                    <div key={y} className="bg-indigo-50/30 p-5 rounded-3xl border border-indigo-100/50">
                      <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest block mb-2 text-center">ALUMNOS AÑO {y}</label>
                      <input type="number" value={formData.proyeccion![y as 1|2|3].alumnos} onChange={(e) => handleProyeccionChange(y, parseInt(e.target.value) || 0)} className="w-full bg-transparent border-none text-2xl font-black text-indigo-900 text-center focus:ring-0" />
                    </div>
                  ))}
                </div>
              </section>

              {/* Laboratory Equipment */}
              <section className="space-y-6">
                <div className="flex items-center justify-between border-b border-indigo-50 pb-2">
                  <div className="flex items-center gap-3">
                    <Wrench className="text-indigo-600" size={20} />
                    <h4 className="text-xs font-black text-indigo-600 uppercase tracking-widest">Equipamiento del Laboratorio</h4>
                  </div>
                  <div className="relative group">
                    <button className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase shadow-lg shadow-indigo-100">
                      <Plus size={14}/> Agregar Item
                    </button>
                    <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-gray-100 rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 p-2">
                      {config.catalog.map(item => (
                        <button key={item.id} onClick={() => addEquipment(item)} className="w-full text-left px-4 py-3 hover:bg-indigo-50 rounded-xl text-xs font-bold text-gray-700 transition-colors">
                          {item.nombre} ({formatCurrency(item.precioDefault)})
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {formData.equipamiento?.map(eq => (
                    <div key={eq.id} className="flex items-center gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100 group">
                      <div className="flex-1">
                        <p className="text-xs font-black text-gray-800 uppercase tracking-tight">{eq.nombre}</p>
                        <p className="text-[10px] font-bold text-indigo-600">{formatCurrency(eq.precioUnitario.final)}</p>
                      </div>
                      <div className="w-24">
                        <input type="number" min="1" value={eq.cantidad} onChange={(e) => updateEquipmentQty(eq.id, parseInt(e.target.value) || 1)} className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-black text-center" />
                      </div>
                      <div className="w-28 text-right font-black text-sm text-gray-900">
                        {formatCurrency(eq.cantidad * eq.precioUnitario.final)}
                      </div>
                      <button onClick={() => removeEquipment(eq.id)} className="p-2 text-gray-300 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                  {(!formData.equipamiento || formData.equipamiento.length === 0) && (
                    <div className="text-center py-10 border-2 border-dashed border-gray-100 rounded-[30px] text-gray-400 text-xs italic">
                      No hay equipos seleccionados aún
                    </div>
                  )}
                </div>
              </section>
            </div>

            {/* Right Column: Financial Real-time Summary */}
            <div className="space-y-8">
              <div className="bg-indigo-900 text-white rounded-[50px] shadow-2xl p-12 border border-indigo-800 sticky top-0 overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none"></div>
                
                <h4 className="text-indigo-200 text-xs font-black uppercase tracking-[0.2em] mb-12 border-b border-indigo-800/50 pb-6">
                  💰 RESUMEN ECONÓMICO PROYECTADO
                </h4>

                {computedSchool ? (
                  <div className="space-y-12">
                    {[1, 2, 3].map(year => {
                      const y = computedSchool.proyeccion[year as 1|2|3];
                      return (
                        <div key={year} className="space-y-4">
                          <div className="flex items-center justify-between mb-4">
                            <h5 className="font-black text-xl">AÑO {year}</h5>
                            <span className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">{y.alumnos} ALUMNOS</span>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white/5 p-4 rounded-2xl">
                              <p className="text-[9px] font-black text-indigo-300 uppercase mb-1">Ingreso Bruto</p>
                              <p className="font-black text-sm">{formatCurrency(y.ingresoBruto.final)}</p>
                            </div>
                            <div className="bg-white/5 p-4 rounded-2xl">
                              <p className="text-[9px] font-black text-indigo-300 uppercase mb-1">Ingreso Neto</p>
                              <p className="font-black text-sm text-emerald-400">{formatCurrency(y.ingresoNeto.final)}</p>
                            </div>
                          </div>
                          <div className="bg-indigo-600/30 border border-indigo-500/30 p-5 rounded-3xl flex justify-between items-center">
                            <span className="text-[10px] font-black text-indigo-100 uppercase tracking-wider">Beneficio Licenciatario ({(computedSchool.splitPctLicenciatario*100).toFixed(0)}%)</span>
                            <span className="text-xl font-black text-amber-400">{formatCurrency(y.splitLicenciatario.final)}</span>
                          </div>
                        </div>
                      );
                    })}

                    <div className="mt-16 pt-10 border-t border-indigo-800">
                      <p className="text-[10px] font-black text-indigo-300 uppercase tracking-[0.2em] mb-4">POTENCIAL TOTAL 3 AÑOS</p>
                      <div className="bg-white/10 p-8 rounded-[36px] text-center border border-white/5 shadow-inner">
                        <p className="text-xs font-black text-indigo-200 uppercase mb-2 tracking-widest tracking-[0.4em]">BENEFICIO TOTAL LICENCIATARIO</p>
                        <p className="text-5xl font-black text-amber-400 tracking-tighter">
                          {formatCurrency(computedSchool.proyeccion[1].splitLicenciatario.final + computedSchool.proyeccion[2].splitLicenciatario.final + computedSchool.proyeccion[3].splitLicenciatario.final)}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-20 text-indigo-400/50 space-y-4">
                    <GraduationCap size={48} className="mx-auto opacity-20" />
                    <p className="text-sm font-bold italic">Rellena el nombre y alumnos para ver la proyección económica en tiempo real.</p>
                  </div>
                )}
              </div>
              
              <div className="p-10 bg-amber-50 border-2 border-dashed border-amber-200 rounded-[40px]">
                <h5 className="text-[10px] font-black text-amber-700 uppercase tracking-widest mb-2 flex items-center gap-2">
                  ⚠️ NOTA IMPORTANTE
                </h5>
                <p className="text-xs font-bold text-amber-900 leading-relaxed italic">
                  Los cálculos de Ingreso Bruto y Neto se basan en la configuración local de precios actual. Podrás realizar más ajustes granulares (overrides) una vez guardada la escuela en su ficha individual.
                </p>
              </div>
            </div>
          </div>
        </div>

        <footer className="p-8 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
          <button onClick={onClose} className="px-10 py-4 font-black text-gray-400 hover:text-gray-900 uppercase text-xs tracking-widest transition-colors">
            Cancelar Operación
          </button>
          <button 
            onClick={handleSave}
            className="flex items-center gap-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-12 py-5 rounded-[24px] font-black text-sm shadow-2xl shadow-indigo-200 hover:shadow-indigo-300 transition-all transform hover:scale-[1.02] active:scale-95"
          >
            <Save size={20} />
            {schoolToEdit ? '💾 Actualizar Datos de Escuela' : '💾 Guardar Nueva Escuela Registrada'}
          </button>
        </footer>
      </div>
    </div>
  );
};
