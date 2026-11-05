import React, { useState } from 'react';
import { useLegal } from '../../context/LegalContext';
import {
  Clock,
  Plus,
  Calendar,
  CheckCircle,
  AlertTriangle,
  Calculator,
  Trash2,
  Filter,
  Check,
} from 'lucide-react';
import { formatDateCL, getDaysRemaining } from '../../utils/chileanLegal';

interface Props {
  onOpenNewDeadline: () => void;
  onOpenCalculator: () => void;
}

export const DeadlinesView: React.FC<Props> = ({ onOpenNewDeadline, onOpenCalculator }) => {
  const {
    deadlines,
    cases,
    toggleDeadlineStatus,
    deleteDeadline,
    syncDeadlineToCalendar,
    googleAccessToken,
  } = useLegal();

  const [filterStatus, setFilterStatus] = useState<'ALL' | 'PENDIENTE' | 'CUMPLIDO'>('PENDIENTE');

  const todayStr = new Date().toISOString().split('T')[0];

  const filteredDeadlines = deadlines.filter((d) => {
    if (filterStatus === 'ALL') return true;
    return d.status === filterStatus;
  }).sort((a, b) => a.deadlineDate.localeCompare(b.deadlineDate));

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-legal-heading text-slate-100 flex items-center gap-2.5">
            <Clock className="w-6 h-6 text-rose-400" />
            Control de Plazos Fatales
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Vencimientos judiciales según el Código de Procedimiento Civil chileno y sincronización Google Calendar
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start">
          <button
            onClick={onOpenCalculator}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 text-xs font-semibold rounded-xl flex items-center gap-2 transition-all cursor-pointer"
          >
            <Calculator className="w-4 h-4 text-amber-400" />
            <span>Calculadora CPC</span>
          </button>

          <button
            onClick={onOpenNewDeadline}
            className="px-4 py-2 bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-600/20 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Nuevo Plazo Fatal</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 bg-slate-900/80 p-1.5 rounded-xl border border-slate-800 w-fit">
        <button
          onClick={() => setFilterStatus('PENDIENTE')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
            filterStatus === 'PENDIENTE'
              ? 'bg-rose-500 text-white shadow-xs'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Pendientes ({deadlines.filter((d) => d.status === 'PENDIENTE').length})
        </button>
        <button
          onClick={() => setFilterStatus('CUMPLIDO')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
            filterStatus === 'CUMPLIDO'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Cumplidos ({deadlines.filter((d) => d.status === 'CUMPLIDO').length})
        </button>
        <button
          onClick={() => setFilterStatus('ALL')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
            filterStatus === 'ALL' ? 'bg-slate-800 text-slate-200' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Todos ({deadlines.length})
        </button>
      </div>

      {/* Deadlines List */}
      <div className="space-y-3">
        {filteredDeadlines.length === 0 ? (
          <div className="p-12 text-center bg-slate-900/50 border border-slate-800 rounded-2xl text-xs text-slate-400">
            No hay plazos registrados en esta sección.
          </div>
        ) : (
          filteredDeadlines.map((dl) => {
            const caseItem = cases.find((c) => c.id === dl.caseId);
            const daysLeft = getDaysRemaining(dl.deadlineDate);
            const isCompleted = dl.status === 'CUMPLIDO';
            const isOverdue = !isCompleted && daysLeft < 0;
            const isToday = !isCompleted && daysLeft === 0;

            return (
              <div
                key={dl.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  isCompleted
                    ? 'bg-slate-950/40 border-slate-800/60 opacity-70'
                    : isOverdue
                    ? 'bg-rose-950/20 border-rose-500/40 shadow-sm'
                    : isToday
                    ? 'bg-amber-950/20 border-amber-500/40'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => toggleDeadlineStatus(dl.id)}
                    className={`mt-0.5 w-6 h-6 rounded-lg border flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                      isCompleted
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                        : 'border-slate-700 hover:border-emerald-400 text-transparent hover:text-emerald-400/50'
                    }`}
                    title={isCompleted ? 'Marcar pendiente' : 'Marcar cumplido'}
                  >
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </button>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-bold font-mono-legal text-amber-400">
                        {caseItem ? `${caseItem.rol} • ${caseItem.court}` : 'BDCM Despacho'}
                      </span>
                      <span className="text-[9px] uppercase px-1.5 py-0.5 rounded-sm bg-slate-800 text-slate-300 font-mono-legal">
                        {dl.daysType}
                      </span>
                      {dl.isFatal && (
                        <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded-sm bg-rose-500/20 text-rose-300 border border-rose-500/30">
                          FATAL
                        </span>
                      )}
                    </div>

                    <h3
                      className={`text-xs font-bold ${
                        isCompleted ? 'line-through text-slate-400' : 'text-slate-100'
                      }`}
                    >
                      {dl.title}
                    </h3>

                    {dl.notes && <p className="text-[11px] text-slate-400 leading-tight">{dl.notes}</p>}
                  </div>
                </div>

                {/* Right side date & actions */}
                <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-800">
                  <div className="text-left sm:text-right font-mono-legal">
                    <div className="text-xs font-bold text-slate-200">
                      {formatDateCL(dl.deadlineDate)}
                    </div>
                    <div className="text-[10px] text-slate-400">{dl.deadlineTime} hrs</div>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-xl text-[10px] font-mono-legal font-bold shrink-0 ${
                      isCompleted
                        ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                        : isOverdue
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse'
                        : isToday
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse'
                        : 'bg-slate-800 text-slate-300 border border-slate-700'
                    }`}
                  >
                    {isCompleted
                      ? 'Cumplido'
                      : isOverdue
                      ? `Vencido hace ${Math.abs(daysLeft)}d`
                      : isToday
                      ? '¡VENCE HOY!'
                      : `En ${daysLeft} días`}
                  </span>

                  <div className="flex items-center gap-1.5">
                    {googleAccessToken && !dl.syncedToCalendar && !isCompleted && (
                      <button
                        onClick={() => syncDeadlineToCalendar(dl.id)}
                        className="p-1.5 text-amber-400 hover:text-amber-300 hover:bg-slate-800 rounded-lg"
                        title="Sincronizar con Google Calendar"
                      >
                        <Calendar className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => deleteDeadline(dl.id)}
                      className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg"
                      title="Eliminar plazo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
