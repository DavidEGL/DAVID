
import { GlobalConfig, EquipmentCatalogItem, Licensee, School, SchoolStatus, ProgramType, PaymentStatus, PaymentType } from './types';

export const INITIAL_CATALOG: EquipmentCatalogItem[] = [
  { id: '1', nombre: 'Mesa Grande', precioDefault: 40000, unidad: 'Pza', activo: true },
  { id: '2', nombre: 'Mesa Pequeña', precioDefault: 30000, unidad: 'Pza', activo: true },
  { id: '3', nombre: 'VR Meta Quest', precioDefault: 7000, unidad: 'Pza', activo: true },
  { id: '4', nombre: 'Laptop', precioDefault: 3500, unidad: 'Pza', activo: true },
  { id: '5', nombre: 'Tablet', precioDefault: 2000, unidad: 'Pza', activo: true },
  { id: '6', nombre: 'Impresora 3D', precioDefault: 3000, unidad: 'Pza', activo: true },
  { id: '7', nombre: 'Pantalla 55"', precioDefault: 5500, unidad: 'Pza', activo: true },
  { id: '8', nombre: 'Vinilado AR', precioDefault: 6000, unidad: 'Pza', activo: true },
];

export const INITIAL_CONFIG: GlobalConfig = {
  precios: {
    best: 4200,
    costeBest: 1000,
    individual: 2000,
    costeIndividual: 350,
  },
  splitDefault: 0.40,
  catalog: INITIAL_CATALOG,
};

export const INITIAL_LICENSEES: Licensee[] = [
  {
    id: 'l1',
    nombreComercial: 'Epic Jalisco',
    razonSocial: 'Soluciones Educativas SA',
    pais: 'México',
    estado: 'Jalisco',
    ciudad: 'Guadalajara',
    email: 'contacto@epicjalisco.com',
    telefono: '3312345678',
    contactoPrincipal: 'Juan Pérez',
    tipoLicencia: 'Master',
    fechaInicio: '2024-01-01',
    fechaFin: '2027-01-01',
    status: 'ACTIVO',
    splitEstandar: 0.40,
    notas: 'Licenciatario principal región occidente.'
  }
];

// Helper to create empty override values
const createOV = <T,>(val: T): { calculated: T; final: T; isOverride: boolean } => ({
  calculated: val,
  final: val,
  isOverride: false
});

export const MOCK_PAYMENTS = [
  {
    id: 'p1',
    tipo: PaymentType.COBRO_ESCUELA,
    referenciaId: 's1',
    anoContrato: 1,
    concepto: 'Pago Inicial Lab',
    monto: 25000,
    fechaProgramada: '2024-02-15',
    fechaPagada: '2024-02-14',
    status: PaymentStatus.PAGADO,
    metodoPago: 'Transferencia'
  }
];
