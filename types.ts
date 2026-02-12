
export enum PaymentStatus {
  PROGRAMADO = 'PROGRAMADO',
  PAGADO = 'PAGADO',
  VENCIDO = 'VENCIDO',
  PARCIAL = 'PARCIAL'
}

export enum PaymentType {
  COBRO_ESCUELA = 'COBRO_ESCUELA',
  PAGO_LICENCIA = 'PAGO_LICENCIA',
  OTRO = 'OTRO'
}

export enum SchoolStatus {
  ACTIVA = 'ACTIVA',
  ONBOARDING = 'ONBOARDING',
  RIESGO = 'RIESGO',
  INACTIVA = 'INACTIVA'
}

export enum ProgramType {
  BEST = 'BEST',
  INDIVIDUAL = 'INDIVIDUAL'
}

export interface OverrideValue<T> {
  calculated: T;
  final: T;
  isOverride: boolean;
}

export interface EquipmentCatalogItem {
  id: string;
  nombre: string;
  precioDefault: number;
  unidad: string;
  activo: boolean;
}

export interface SchoolEquipment {
  id: string;
  equipoId: string;
  nombre: string;
  cantidad: number;
  precioUnitario: OverrideValue<number>;
  total: OverrideValue<number>;
}

export interface Payment {
  id: string;
  tipo: PaymentType;
  referenciaId?: string;
  anoContrato?: number;
  concepto: string;
  monto: number;
  fechaProgramada: string;
  fechaPagada?: string;
  status: PaymentStatus;
  metodoPago?: string;
  comprobanteUrl?: string;
  notas?: string;
}

export interface FinancialYear {
  alumnos: number;
  ingresoBruto: OverrideValue<number>;
  costeGestion: OverrideValue<number>;
  inversionLab: OverrideValue<number>;
  ingresoNeto: OverrideValue<number>;
  splitLicenciatario: OverrideValue<number>;
  splitEpic: OverrideValue<number>;
}

export interface School {
  id: string;
  nombre: string;
  direccion: string;
  ciudad: string;
  estado: string;
  pais: string;
  nivel: string;
  contacto: string;
  email: string;
  telefono: string;
  responsableNombre: string;
  responsableTelefono: string;
  licenciatarioId: string;
  fechaInicio: string;
  duracionContrato: number;
  status: SchoolStatus;
  programaTipo: ProgramType;
  numProgramasIndividuales: number;
  
  precioPackBest: OverrideValue<number>;
  costeGestionBest: OverrideValue<number>;
  precioIndividual: OverrideValue<number>;
  costeGestionIndividual: OverrideValue<number>;
  splitPctLicenciatario: number;

  equipamiento: SchoolEquipment[];
  proyeccion: {
    1: FinancialYear;
    2: FinancialYear;
    3: FinancialYear;
  };
}

export interface Licensee {
  id: string;
  nombreComercial: string;
  razonSocial: string;
  pais: string;
  estado: string;
  ciudad: string;
  email: string;
  telefono: string;
  contactoPrincipal: string;
  tipoLicencia: string;
  fechaInicio: string;
  fechaFin: string;
  status: 'ACTIVO' | 'INACTIVO' | 'VENCIDO';
  splitEstandar: number;
  notas: string;
}

export interface GlobalConfig {
  precios: {
    best: number;
    costeBest: number;
    individual: number;
    costeIndividual: number;
  };
  splitDefault: number;
  catalog: EquipmentCatalogItem[];
}
