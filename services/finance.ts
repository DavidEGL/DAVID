
import { School, GlobalConfig, FinancialYear, ProgramType, OverrideValue, SchoolEquipment } from '../types';

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(amount);
};

export const calculateSchoolFinances = (school: School, config: GlobalConfig): School => {
  const updatedSchool = { ...school };
  
  // 1. Calculate Equipment Totals
  let totalEquipBase = 0;
  updatedSchool.equipamiento = updatedSchool.equipamiento.map(item => {
    const calcTotal = item.cantidad * item.precioUnitario.final;
    return {
      ...item,
      total: {
        calculated: calcTotal,
        final: item.total.isOverride ? item.total.final : calcTotal,
        isOverride: item.total.isOverride
      }
    };
  });
  
  totalEquipBase = updatedSchool.equipamiento.reduce((acc, item) => acc + item.total.final, 0);

  // 2. Projections for 3 years
  const years: (1 | 2 | 3)[] = [1, 2, 3];
  years.forEach(year => {
    const yearData = updatedSchool.proyeccion[year];
    
    // Alumnos is direct input, no override needed usually but we keep it simple
    const alumnos = yearData.alumnos;

    // Ingreso Bruto
    let calcIngresoBruto = 0;
    if (updatedSchool.programaTipo === ProgramType.BEST) {
      calcIngresoBruto = alumnos * updatedSchool.precioPackBest.final;
    } else {
      calcIngresoBruto = alumnos * (updatedSchool.numProgramasIndividuales * updatedSchool.precioIndividual.final);
    }

    // Coste Gestión
    let calcCosteGestion = 0;
    if (updatedSchool.programaTipo === ProgramType.BEST) {
      calcCosteGestion = alumnos * updatedSchool.costeGestionBest.final;
    } else {
      calcCosteGestion = alumnos * (updatedSchool.numProgramasIndividuales * updatedSchool.costeGestionIndividual.final);
    }

    // Inversion Lab Rule: 100%, 50%, 50%
    let calcInversionLab = 0;
    if (year === 1) calcInversionLab = totalEquipBase;
    else calcInversionLab = totalEquipBase * 0.5;

    // Apply Overrides for the calculated fields
    const finalIngresoBruto = yearData.ingresoBruto.isOverride ? yearData.ingresoBruto.final : calcIngresoBruto;
    const finalCosteGestion = yearData.costeGestion.isOverride ? yearData.costeGestion.final : calcCosteGestion;
    const finalInversionLab = yearData.inversionLab.isOverride ? yearData.inversionLab.final : calcInversionLab;

    const calcIngresoNeto = finalIngresoBruto - finalCosteGestion - finalInversionLab;
    const finalIngresoNeto = yearData.ingresoNeto.isOverride ? yearData.ingresoNeto.final : calcIngresoNeto;

    // Split
    const calcSplitLic = finalIngresoNeto * updatedSchool.splitPctLicenciatario;
    const calcSplitEpic = finalIngresoNeto * (1 - updatedSchool.splitPctLicenciatario);

    updatedSchool.proyeccion[year] = {
      ...yearData,
      ingresoBruto: { calculated: calcIngresoBruto, final: finalIngresoBruto, isOverride: yearData.ingresoBruto.isOverride },
      costeGestion: { calculated: calcCosteGestion, final: finalCosteGestion, isOverride: yearData.costeGestion.isOverride },
      inversionLab: { calculated: calcInversionLab, final: finalInversionLab, isOverride: yearData.inversionLab.isOverride },
      ingresoNeto: { calculated: calcIngresoNeto, final: finalIngresoNeto, isOverride: yearData.ingresoNeto.isOverride },
      splitLicenciatario: { calculated: calcSplitLic, final: yearData.splitLicenciatario.isOverride ? yearData.splitLicenciatario.final : calcSplitLic, isOverride: yearData.splitLicenciatario.isOverride },
      splitEpic: { calculated: calcSplitEpic, final: yearData.splitEpic.isOverride ? yearData.splitEpic.final : calcSplitEpic, isOverride: yearData.splitEpic.isOverride },
    };
  });

  return updatedSchool;
};
