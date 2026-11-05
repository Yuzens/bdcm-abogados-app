import React, { useState } from 'react';
import { useLegal } from '../../context/LegalContext';
import {
  Wrench,
  Calculator,
  Calendar,
  ExternalLink,
  Download,
  Upload,
  RefreshCw,
  Scale,
  Sparkles,
  ShieldAlert,
  Info,
  CheckCircle,
} from 'lucide-react';
import { calculateLegalDeadline, formatDateCL } from '../../utils/chileanLegal';

interface Props {
  onOpenNewDeadlineWithDate: (computedDate: string, daysType: any, daysCount: number) => void;
}

export const ToolsView: React.FC<Props> = ({ onOpenNewDeadlineWithDate }) => {
  const { exportDataJson, importDataJson, resetAllData } = useLegal();

  // Estado Calculadora
  const [startDate, setStartDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [daysCount, setDaysCount] = useState<number>(5);
  const [computationType, setComputationType] = useState<'HABILES_CIVIL' | 'HABILES_LABORAL' | 'CORRIDOS'>('HABILES_CIVIL');
  const [calculationResult, setCalculationResult] = useState<{ deadlineDate: string; breakdown: string[] } | null>(null);

  const [importStatus, setImportStatus] = useState<string | null>(null);

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    const result = calculateLegalDeadline(startDate, daysCount, computationType);
    setCalculationResult(result);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const ok = importDataJson(content);
      if (ok) {
        setImportStatus('¡Datos de respaldo restaurados con éxito!');
        setTimeout(() => setImportStatus(null), 4000);
      } else {
        setImportStatus('Error: el archivo no tiene un formato válido.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-8 pb-16">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold font-legal-heading text-slate-100 flex items-center gap-2.5">
          <Wrench className="w-6 h-6 text-amber-400" />
          Herramientas Jurídicas & Calculadora Procesal
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Cómputo de plazos según legislación chilena (CPC y Código del Trabajo), accesos al PJUD y copias de seguridad
        </p>
      </div>

      {/* 1. CALCULADORA DE PLAZOS JUDICIALES CHILENOS */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100 font-legal-heading">
              Calculadora de Plazos Judiciales Chilenos
            </h2>
            <p className="text-xs text-slate-400">
              Descuenta automáticamente domingos, festivos oficiales de Chile y sábados según la materia
            </p>
          </div>
        </div>

        <form onSubmit={handleCalculate} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Fecha de Notificación / Resolución
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-hidden focus:border-amber-400 font-mono-legal"
              required
            />
            <span className="text-[10px] text-slate-500 mt-1 block">
              El plazo comienza a correr al día hábil siguiente (Art. 67 CPC).
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Días de Plazo Legal
            </label>
            <input
              type="number"
              min="1"
              max="365"
              value={daysCount}
              onChange={(e) => setDaysCount(Number(e.target.value))}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-hidden focus:border-amber-400 font-mono-legal"
              required
            />
            <div className="flex gap-1.5 mt-1.5">
              {[3, 5, 8, 10, 15, 18].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setDaysCount(preset)}
                  className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] font-mono-legal"
                >
                  {preset}d
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Régimen de Cómputo
            </label>
            <select
              value={computationType}
              onChange={(e) => setComputationType(e.target.value as any)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-hidden focus:border-amber-400"
            >
              <option value="HABILES_CIVIL">Civil (CPC Art. 66: Lunes a Sábado)</option>
              <option value="HABILES_LABORAL">Laboral / Penal (Lunes a Viernes)</option>
              <option value="CORRIDOS">Días Corridos (Prorroga al hábil sgte)</option>
            </select>
          </div>

          <div className="md:col-span-3 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              Calcular Fecha Fatal
            </button>
          </div>
        </form>

        {calculationResult && (
          <div className="p-5 bg-slate-950 border border-amber-500/30 rounded-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs text-slate-400 block font-medium">Fecha de Vencimiento Fatal:</span>
                <div className="text-2xl font-bold text-amber-300 font-mono-legal mt-0.5">
                  {formatDateCL(calculationResult.deadlineDate)} (23:59 hrs)
                </div>
                <span className="text-xs text-slate-400">
                  Total de {daysCount} días calculados bajo régimen{' '}
                  <span className="text-slate-200 font-semibold">{computationType}</span>
                </span>
              </div>

              <button
                onClick={() => onOpenNewDeadlineWithDate(calculationResult.deadlineDate, computationType, daysCount)}
                className="px-4 py-2 bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs rounded-xl shadow-md shadow-rose-500/20 transition-colors flex items-center gap-2 self-start cursor-pointer"
              >
                <Calendar className="w-4 h-4" />
                Crear Plazo con esta Fecha
              </button>
            </div>

            <div className="border-t border-slate-800 pt-3">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                Desglose Cronológico del Cómputo Judicial:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs font-mono-legal text-slate-300">
                {calculationResult.breakdown.map((item, idx) => (
                  <div
                    key={idx}
                    className={`p-2 rounded-lg border text-[11px] ${
                      item.includes('Inhábil') || item.includes('Feriado') || item.includes('Domingo')
                        ? 'bg-rose-950/20 border-rose-500/30 text-rose-300'
                        : item.includes('Prorroga')
                        ? 'bg-amber-950/20 border-amber-500/30 text-amber-300'
                        : 'bg-slate-900 border-slate-800 text-slate-300'
                    }`}
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2. ACCESOS DIRECTOS A INSTITUCIONES JUDICIALES CHILENAS */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100 font-legal-heading">
              Portales del Poder Judicial de Chile
            </h2>
            <p className="text-xs text-slate-400">
              Acceso rápido a tramitación telemática, jurisprudencia y registros públicos
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          <a
            href="https://ojv.pjud.cl/kpitec-ojv-web/login"
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 rounded-xl transition-all group flex items-start justify-between"
          >
            <div>
              <p className="font-bold text-slate-200 group-hover:text-amber-400 transition-colors text-sm">
                Oficina Judicial Virtual (OJV)
              </p>
              <p className="text-slate-400 mt-1">
                Ingreso de demandas, escritos, poderes y revisión de expedientes digitales con ClaveÚnica.
              </p>
            </div>
            <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-amber-400 shrink-0 ml-2" />
          </a>

          <a
            href="https://civil.pjud.cl"
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 rounded-xl transition-all group flex items-start justify-between"
          >
            <div>
              <p className="font-bold text-slate-200 group-hover:text-amber-400 transition-colors text-sm">
                Consulta Unificada de Causas
              </p>
              <p className="text-slate-400 mt-1">
                Búsqueda pública por ROL, RIT o RUC en tribunales civiles, laborales, penal y familia.
              </p>
            </div>
            <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-amber-400 shrink-0 ml-2" />
          </a>

          <a
            href="https://www.diarioficial.interior.gob.cl"
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 rounded-xl transition-all group flex items-start justify-between"
          >
            <div>
              <p className="font-bold text-slate-200 group-hover:text-amber-400 transition-colors text-sm">
                Diario Oficial de Chile
              </p>
              <p className="text-slate-400 mt-1">
                Notificaciones por avisos, publicaciones de quiebras, extractos de sociedades y leyes.
              </p>
            </div>
            <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-amber-400 shrink-0 ml-2" />
          </a>

          <a
            href="https://www.bcn.cl/leychile/"
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 rounded-xl transition-all group flex items-start justify-between"
          >
            <div>
              <p className="font-bold text-slate-200 group-hover:text-amber-400 transition-colors text-sm">
                Ley Chile (BCN)
              </p>
              <p className="text-slate-400 mt-1">
                Biblioteca del Congreso Nacional: Códigos Civil, Procesal Civil, Penal y del Trabajo vigentes.
              </p>
            </div>
            <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-amber-400 shrink-0 ml-2" />
          </a>

          <a
            href="https://www.cbrsantiago.cl"
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 rounded-xl transition-all group flex items-start justify-between"
          >
            <div>
              <p className="font-bold text-slate-200 group-hover:text-amber-400 transition-colors text-sm">
                Conservador de Bienes Raíces
              </p>
              <p className="text-slate-400 mt-1">
                CBR Santiago: certificados de dominio vigente, hipotecas, gravámenes e interdicciones.
              </p>
            </div>
            <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-amber-400 shrink-0 ml-2" />
          </a>

          <a
            href="https://www.cmfchile.cl"
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 rounded-xl transition-all group flex items-start justify-between"
          >
            <div>
              <p className="font-bold text-slate-200 group-hover:text-amber-400 transition-colors text-sm">
                Comisión Mercado Financiero (CMF)
              </p>
              <p className="text-slate-400 mt-1">
                Consulta de entidades reguladas, acreencias bancarias y estados financieros corporativos.
              </p>
            </div>
            <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-amber-400 shrink-0 ml-2" />
          </a>
        </div>
      </div>

      {/* 3. RESPALDO Y RESTAURACIÓN DE DATOS DEL DESPACHO */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Download className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100 font-legal-heading">
              Seguridad, Respaldos & Exportación
            </h2>
            <p className="text-xs text-slate-400">
              Descarga una copia completa de las causas, clientes, audiencias y honorarios de BDCM Abogados
            </p>
          </div>
        </div>

        {importStatus && (
          <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 rounded-xl text-xs font-semibold flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{importStatus}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-3">
            <span className="font-bold text-slate-200 block text-sm">Exportar Respaldo</span>
            <p className="text-slate-400">
              Descarga un archivo JSON cifrado localmente con toda la información de causas y clientes.
            </p>
            <button
              onClick={exportDataJson}
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              Descargar Respaldo JSON
            </button>
          </div>

          <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-3">
            <span className="font-bold text-slate-200 block text-sm">Restaurar Copia</span>
            <p className="text-slate-400">
              Sube un archivo de respaldo previamente exportado para recuperar datos.
            </p>
            <label className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer border border-slate-700">
              <Upload className="w-4 h-4" />
              <span>Seleccionar Archivo</span>
              <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>

          <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-3">
            <span className="font-bold text-slate-200 block text-sm">Restablecer Muestra</span>
            <p className="text-slate-400">
              Reinicia los datos a los expedientes iniciales de prueba de BDCM Abogados en Chile.
            </p>
            <button
              onClick={resetAllData}
              className="w-full py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-semibold rounded-lg border border-rose-500/30 flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              Restablecer Datos de Ejemplo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
