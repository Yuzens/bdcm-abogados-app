import React, { useState } from 'react';
import { useLegal } from '../../context/LegalContext';
import {
  Briefcase,
  Clock,
  Calendar,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  ExternalLink,
  Video,
  ArrowRight,
  Sparkles,
  Scale,
  RefreshCw,
  Plus,
  Calculator,
  UserPlus,
  FileText,
  ChevronDown,
  X,
} from 'lucide-react';
import { formatCurrency, formatDateCL, getDaysRemaining } from '../../utils/chileanLegal';

interface Props {
  onOpenNewCase: () => void;
  onOpenNewClient: () => void;
  onOpenNewDeadline: () => void;
  onOpenNewHearing: () => void;
  onOpenNewFee: () => void;
}

export const DashboardView: React.FC<Props> = ({
  onOpenNewCase,
  onOpenNewClient,
  onOpenNewDeadline,
  onOpenNewHearing,
  onOpenNewFee,
}) => {
  const {
    cases,
    deadlines,
    hearings,
    installments,
    clients,
    setActiveTab,
    setSelectedCaseId,
    toggleDeadlineStatus,
    syncDeadlineToCalendar,
    syncHearingToCalendar,
    syncAllToCalendar,
    googleAccessToken,
    connectGoogle,
  } = useLegal();

  const [showQuickMenu, setShowQuickMenu] = useState(false);
  const [showFabMenu, setShowFabMenu] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];

  // Métricas
  const activeCases = cases.filter((c) => c.status !== 'TERMINADA' && c.status !== 'ARCHIVADA');
  const pendingDeadlines = deadlines.filter((d) => d.status === 'PENDIENTE');
  const urgentDeadlines = pendingDeadlines
    .filter((d) => d.deadlineDate <= todayStr || getDaysRemaining(d.deadlineDate) <= 3)
    .sort((a, b) => a.deadlineDate.localeCompare(b.deadlineDate));

  const upcomingHearings = hearings
    .filter((h) => h.status === 'PROGRAMADA' && h.date >= todayStr)
    .sort((a, b) => `${a.date} ${a.startTime}`.localeCompare(`${b.date} ${b.startTime}`))
    .slice(0, 4);

  // Cobranzas
  const pendingInstallments = installments.filter((i) => i.status !== 'PAGADA');
  const pendingCLP = pendingInstallments
    .filter((i) => i.currency === 'CLP')
    .reduce((acc, curr) => acc + curr.amount, 0);
  const pendingUF = pendingInstallments
    .filter((i) => i.currency === 'UF')
    .reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="space-y-6 pb-20 relative">
      {/* Banner Principal del Despacho BDCM */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/40 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400">
              <Scale className="w-4 h-4" />
              <span>Estudio Jurídico BDCM Abogados — Chile</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-legal-heading text-slate-100">
              Panel de Control Jurídico
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
              Monitoreo centralizado de causas judiciales, plazos fatales, audiencias telemáticas y cobranzas de honorarios en tribunales chilenos.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Botón Principal "+ Agregar Nuevo" en Pantalla Principal */}
            <div className="relative">
              <button
                onClick={() => setShowQuickMenu(!showQuickMenu)}
                className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ Agregar Nuevo</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              {showQuickMenu && (
                <div className="absolute right-0 mt-2 w-52 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <button
                    onClick={() => {
                      setShowQuickMenu(false);
                      onOpenNewCase();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-200 hover:bg-slate-800 text-left transition-colors cursor-pointer"
                  >
                    <FileText className="w-4 h-4 text-amber-400" />
                    + Nueva Causa Judicial
                  </button>
                  <button
                    onClick={() => {
                      setShowQuickMenu(false);
                      onOpenNewDeadline();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-200 hover:bg-slate-800 text-left transition-colors cursor-pointer"
                  >
                    <Clock className="w-4 h-4 text-rose-400" />
                    + Nuevo Plazo Fatal
                  </button>
                  <button
                    onClick={() => {
                      setShowQuickMenu(false);
                      onOpenNewHearing();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-200 hover:bg-slate-800 text-left transition-colors cursor-pointer"
                  >
                    <Calendar className="w-4 h-4 text-blue-400" />
                    + Nueva Audiencia
                  </button>
                  <button
                    onClick={() => {
                      setShowQuickMenu(false);
                      onOpenNewClient();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-200 hover:bg-slate-800 text-left transition-colors cursor-pointer"
                  >
                    <UserPlus className="w-4 h-4 text-emerald-400" />
                    + Nuevo Cliente
                  </button>
                  <button
                    onClick={() => {
                      setShowQuickMenu(false);
                      onOpenNewFee();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-200 hover:bg-slate-800 text-left transition-colors cursor-pointer"
                  >
                    <DollarSign className="w-4 h-4 text-amber-300" />
                    + Convenio Honorarios
                  </button>
                </div>
              )}
            </div>

            {/* Botón Calculadora */}
            <button
              onClick={() => setActiveTab('tools')}
              className="px-4 py-2.5 bg-slate-800/90 hover:bg-slate-700 text-amber-300 border border-amber-500/30 text-xs font-semibold rounded-xl flex items-center gap-2 transition-all shadow-sm cursor-pointer"
              title="Abrir Calculadora de Plazos CPC / Laboral"
            >
              <Calculator className="w-4 h-4 text-amber-400" />
              <span>Calculadora de Plazos</span>
            </button>

            {/* Sincronización Google Calendar */}
            {googleAccessToken ? (
              <button
                onClick={() => syncAllToCalendar()}
                className="px-3.5 py-2.5 bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-medium rounded-xl flex items-center gap-2 transition-all shadow-sm cursor-pointer"
                title="Sincronizar eventos con Google Calendar"
              >
                <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Sync Google</span>
              </button>
            ) : (
              <button
                onClick={connectGoogle}
                className="px-3.5 py-2.5 bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-medium rounded-xl flex items-center gap-2 transition-all shadow-sm cursor-pointer"
                title="Conectar con Google Calendar"
              >
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden sm:inline">Google Cal</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* CENTRO DE ACCIONES RÁPIDAS EN PANTALLA PRINCIPAL */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 sm:p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-200 uppercase tracking-wider">
            <Plus className="w-3.5 h-3.5 text-amber-400" />
            <span>Acciones Rápidas del Despacho</span>
          </div>
          <span className="text-[11px] text-slate-400">Crear registros con 1 clic</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          <button
            onClick={onOpenNewCase}
            className="p-3 bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800 hover:border-amber-500/40 rounded-xl text-left transition-all group cursor-pointer flex flex-col justify-between"
          >
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-2 group-hover:scale-110 transition-transform">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-200 group-hover:text-amber-400 transition-colors">
                + Nueva Causa
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">Expediente ROL/RIT</p>
            </div>
          </button>

          <button
            onClick={onOpenNewDeadline}
            className="p-3 bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800 hover:border-rose-500/40 rounded-xl text-left transition-all group cursor-pointer flex flex-col justify-between"
          >
            <div className="w-7 h-7 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-2 group-hover:scale-110 transition-transform">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-200 group-hover:text-rose-400 transition-colors">
                + Nuevo Plazo
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">Vencimiento fatal</p>
            </div>
          </button>

          <button
            onClick={onOpenNewHearing}
            className="p-3 bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800 hover:border-blue-500/40 rounded-xl text-left transition-all group cursor-pointer flex flex-col justify-between"
          >
            <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-2 group-hover:scale-110 transition-transform">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-200 group-hover:text-blue-400 transition-colors">
                + Nueva Audiencia
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">Zoom PJUD / Sala</p>
            </div>
          </button>

          <button
            onClick={onOpenNewClient}
            className="p-3 bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800 hover:border-emerald-500/40 rounded-xl text-left transition-all group cursor-pointer flex flex-col justify-between"
          >
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-2 group-hover:scale-110 transition-transform">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-200 group-hover:text-emerald-400 transition-colors">
                + Nuevo Cliente
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">Ficha con RUT CL</p>
            </div>
          </button>

          <button
            onClick={onOpenNewFee}
            className="p-3 bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800 hover:border-amber-400/40 rounded-xl text-left transition-all group cursor-pointer flex flex-col justify-between"
          >
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-300 mb-2 group-hover:scale-110 transition-transform">
              <DollarSign className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-200 group-hover:text-amber-300 transition-colors">
                + Pactar Honorarios
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">Convenio y cuotas</p>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('tools')}
            className="p-3 bg-slate-950/80 hover:bg-slate-800/80 border border-amber-500/30 hover:border-amber-400/60 rounded-xl text-left transition-all group cursor-pointer flex flex-col justify-between"
          >
            <div className="w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-2 group-hover:scale-110 transition-transform">
              <Calculator className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-amber-300 group-hover:text-amber-200 transition-colors">
                Calculadora CPC
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">Cómputo días hábiles</p>
            </div>
          </button>
        </div>
      </div>

      {/* Tarjetas KPI */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Causas Activas */}
        <div
          onClick={() => setActiveTab('cases')}
          className="bg-slate-900/80 hover:bg-slate-850 border border-slate-800 hover:border-amber-500/40 rounded-2xl p-5 transition-all cursor-pointer group shadow-sm"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-400">Causas en Tramitación</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-slate-100 font-mono-legal">
            {activeCases.length}
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1">
            <span>Total registradas: {cases.length}</span>
            <ArrowRight className="w-3 h-3 text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity ml-auto" />
          </div>
        </div>

        {/* KPI 2: Plazos en Riesgo */}
        <div
          onClick={() => setActiveTab('deadlines')}
          className="bg-slate-900/80 hover:bg-slate-850 border border-slate-800 hover:border-rose-500/40 rounded-2xl p-5 transition-all cursor-pointer group shadow-sm"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-400">Plazos Próximos (≤ 3 días)</span>
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 group-hover:scale-105 transition-transform">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-rose-400 font-mono-legal flex items-baseline gap-2">
            {urgentDeadlines.length}
            {urgentDeadlines.filter((d) => d.deadlineDate <= todayStr).length > 0 && (
              <span className="text-xs font-normal text-rose-400 animate-pulse">
                ({urgentDeadlines.filter((d) => d.deadlineDate <= todayStr).length} hoy)
              </span>
            )}
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1">
            <span>Pendientes totales: {pendingDeadlines.length}</span>
            <ArrowRight className="w-3 h-3 text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity ml-auto" />
          </div>
        </div>

        {/* KPI 3: Audiencias Programadas */}
        <div
          onClick={() => setActiveTab('hearings')}
          className="bg-slate-900/80 hover:bg-slate-850 border border-slate-800 hover:border-blue-500/40 rounded-2xl p-5 transition-all cursor-pointer group shadow-sm"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-400">Audiencias Próximas</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-105 transition-transform">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-blue-400 font-mono-legal">
            {upcomingHearings.length}
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1">
            <span>Programadas en agenda</span>
            <ArrowRight className="w-3 h-3 text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity ml-auto" />
          </div>
        </div>

        {/* KPI 4: Honorarios por Cobrar */}
        <div
          onClick={() => setActiveTab('fees')}
          className="bg-slate-900/80 hover:bg-slate-850 border border-slate-800 hover:border-emerald-500/40 rounded-2xl p-5 transition-all cursor-pointer group shadow-sm"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-400">Cobranzas Pendientes</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-emerald-400 font-mono-legal truncate">
            {formatCurrency(pendingCLP, 'CLP')}
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between">
            <span>{pendingUF > 0 ? `+ ${pendingUF} UF` : `${pendingInstallments.length} cuotas`}</span>
            <ArrowRight className="w-3 h-3 text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>
      </div>

      {/* ALERTA DE VENCIMIENTOS INMINENTES */}
      {urgentDeadlines.length > 0 && (
        <div className="bg-rose-950/20 border border-rose-500/30 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-rose-400 font-semibold text-sm">
              <AlertTriangle className="w-4 h-4 animate-bounce" />
              <span>Plazos Judiciales Fatales con Vencimiento Inminente</span>
            </div>
            <button
              onClick={() => setActiveTab('deadlines')}
              className="text-xs text-rose-300 hover:text-rose-200 underline"
            >
              Ver todos los plazos
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {urgentDeadlines.slice(0, 4).map((dl) => {
              const c = cases.find((item) => item.id === dl.caseId);
              const daysLeft = getDaysRemaining(dl.deadlineDate);
              const isToday = daysLeft === 0;
              const isPast = daysLeft < 0;

              return (
                <div
                  key={dl.id}
                  className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between gap-2 shadow-xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-mono-legal text-amber-400 font-medium">
                        {c?.rol} • {c?.court}
                      </span>
                      <h4 className="text-xs font-bold text-slate-100 mt-0.5 line-clamp-1">
                        {dl.title}
                      </h4>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold font-mono-legal shrink-0 ${
                        isPast
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : isToday
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse'
                          : 'bg-yellow-500/10 text-yellow-300 border border-yellow-500/20'
                      }`}
                    >
                      {isPast ? '¡VENCIDO!' : isToday ? '¡VENCE HOY!' : `En ${daysLeft} días`}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[11px]">
                    <span className="text-slate-400 font-mono-legal">
                      Límite: {formatDateCL(dl.deadlineDate)} ({dl.deadlineTime})
                    </span>

                    <div className="flex items-center gap-2">
                      {!dl.syncedToCalendar && googleAccessToken && (
                        <button
                          onClick={() => syncDeadlineToCalendar(dl.id)}
                          className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                        >
                          <Calendar className="w-3 h-3" />
                          Google Cal
                        </button>
                      )}
                      <button
                        onClick={() => toggleDeadlineStatus(dl.id)}
                        className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer font-medium"
                      >
                        <CheckCircle className="w-3 h-3" />
                        Cumplido
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Grid de 2 Columnas: Próximas Audiencias & Causas Recientes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Próximas Audiencias & Reuniones */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-400" />
              <h2 className="text-sm font-bold text-slate-100 font-legal-heading">
                Audiencias & Comparecencias
              </h2>
            </div>
            <button
              onClick={onOpenNewHearing}
              className="text-xs text-amber-400 hover:text-amber-300 font-semibold cursor-pointer flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              Agendar
            </button>
          </div>

          {upcomingHearings.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400">
              No hay audiencias pendientes en los próximos días.
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingHearings.map((h) => {
                const c = cases.find((item) => item.id === h.caseId);
                const isZoom = h.modality === 'TELEMATICA_ZOOM';
                const isMeet = h.modality === 'GOOGLE_MEET';

                return (
                  <div
                    key={h.id}
                    className="p-3.5 bg-slate-950/60 border border-slate-800/80 rounded-xl space-y-2 hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded-sm bg-blue-500/10 text-blue-300 border border-blue-500/20">
                            {h.type}
                          </span>
                          <span className="text-[11px] text-slate-400 font-mono-legal">
                            {formatDateCL(h.date)} • {h.startTime} hrs
                          </span>
                        </div>
                        <h4 className="text-xs font-semibold text-slate-100 mt-1">
                          {h.title}
                        </h4>
                        {c && (
                          <p className="text-[11px] text-amber-400/90 font-mono-legal">
                            {c.rol} - {c.court}
                          </p>
                        )}
                      </div>

                      {(isZoom || isMeet) && h.courtRoomOrLink && (
                        <a
                          href={h.courtRoomOrLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1.5 bg-blue-500/15 hover:bg-blue-500/25 border border-blue-500/30 text-blue-300 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shrink-0"
                        >
                          <Video className="w-3.5 h-3.5 text-blue-400" />
                          <span>Conectar</span>
                        </a>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-900">
                      <span className="truncate max-w-[200px]">Sala: {h.courtRoomOrLink || 'Tribunal'}</span>
                      {!h.syncedToCalendar && googleAccessToken && (
                        <button
                          onClick={() => syncHearingToCalendar(h.id)}
                          className="text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                        >
                          <Calendar className="w-3 h-3" />
                          Sincronizar
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Causas Activas Destacadas */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-amber-400" />
              <h2 className="text-sm font-bold text-slate-100 font-legal-heading">
                Expedientes en Tramitación
              </h2>
            </div>
            <button
              onClick={onOpenNewCase}
              className="text-xs text-amber-400 hover:text-amber-300 font-semibold cursor-pointer flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              Nueva Causa
            </button>
          </div>

          <div className="space-y-3">
            {activeCases.slice(0, 4).map((c) => {
              const client = clients.find((cli) => cli.id === c.clientId);

              return (
                <div
                  key={c.id}
                  onClick={() => {
                    setSelectedCaseId(c.id);
                    setActiveTab('cases');
                  }}
                  className="p-3.5 bg-slate-950/60 border border-slate-800/80 rounded-xl hover:border-amber-500/30 transition-all cursor-pointer space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-400 font-mono-legal">
                      {c.rol}
                    </span>
                    <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                      {c.subject}
                    </span>
                  </div>

                  <h4 className="text-xs font-semibold text-slate-100 line-clamp-1">
                    {c.caratula}
                  </h4>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                    <span className="truncate max-w-[240px]">{c.court}</span>
                    <span className="text-slate-300 font-medium">{c.assignedLawyer.split(' ')[0]}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Enlaces Rápidos del Sistema Judicial Chileno */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 sm:p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Accesos Directos a Portales Oficiales de Chile
          </span>
          <span className="text-[11px] text-amber-400">Poder Judicial & Instituciones</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <a
            href="https://ojv.pjud.cl/kpitec-ojv-web/login"
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 bg-slate-950/70 hover:bg-slate-800/60 border border-slate-800 rounded-xl text-left transition-colors group flex items-center justify-between"
          >
            <div>
              <p className="text-xs font-semibold text-slate-200 group-hover:text-amber-400 transition-colors">
                OJV Poder Judicial
              </p>
              <p className="text-[10px] text-slate-400">Oficina Judicial Virtual</p>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-400" />
          </a>

          <a
            href="https://civil.pjud.cl"
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 bg-slate-950/70 hover:bg-slate-800/60 border border-slate-800 rounded-xl text-left transition-colors group flex items-center justify-between"
          >
            <div>
              <p className="text-xs font-semibold text-slate-200 group-hover:text-amber-400 transition-colors">
                Consulta Unificada
              </p>
              <p className="text-[10px] text-slate-400">Buscador ROL / RIT</p>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-400" />
          </a>

          <a
            href="https://www.diarioficial.interior.gob.cl"
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 bg-slate-950/70 hover:bg-slate-800/60 border border-slate-800 rounded-xl text-left transition-colors group flex items-center justify-between"
          >
            <div>
              <p className="text-xs font-semibold text-slate-200 group-hover:text-amber-400 transition-colors">
                Diario Oficial
              </p>
              <p className="text-[10px] text-slate-400">Publicaciones legales</p>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-400" />
          </a>

          <a
            href="https://www.bcn.cl/leychile/"
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 bg-slate-950/70 hover:bg-slate-800/60 border border-slate-800 rounded-xl text-left transition-colors group flex items-center justify-between"
          >
            <div>
              <p className="text-xs font-semibold text-slate-200 group-hover:text-amber-400 transition-colors">
                Ley Chile (BCN)
              </p>
              <p className="text-[10px] text-slate-400">Códigos y leyes vigentes</p>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-400" />
          </a>
        </div>
      </div>

      {/* Botón Flotante "+" (FAB) en Pantalla Principal */}
      <div className="fixed bottom-20 lg:bottom-8 right-6 z-40">
        <div className="relative">
          {showFabMenu && (
            <div className="absolute bottom-16 right-0 w-52 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-2 space-y-1.5 animate-in slide-in-from-bottom-5 duration-150 z-50">
              <span className="text-[10px] uppercase tracking-wider font-bold text-amber-400 px-2 py-1 block">
                Crear Registro Rápido:
              </span>
              <button
                onClick={() => {
                  setShowFabMenu(false);
                  onOpenNewCase();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-800 rounded-xl text-left transition-colors cursor-pointer"
              >
                <FileText className="w-4 h-4 text-amber-400" />
                + Causa Judicial
              </button>
              <button
                onClick={() => {
                  setShowFabMenu(false);
                  onOpenNewDeadline();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-800 rounded-xl text-left transition-colors cursor-pointer"
              >
                <Clock className="w-4 h-4 text-rose-400" />
                + Plazo Fatal
              </button>
              <button
                onClick={() => {
                  setShowFabMenu(false);
                  onOpenNewHearing();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-800 rounded-xl text-left transition-colors cursor-pointer"
              >
                <Calendar className="w-4 h-4 text-blue-400" />
                + Audiencia
              </button>
              <button
                onClick={() => {
                  setShowFabMenu(false);
                  onOpenNewClient();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-800 rounded-xl text-left transition-colors cursor-pointer"
              >
                <UserPlus className="w-4 h-4 text-emerald-400" />
                + Cliente
              </button>
              <button
                onClick={() => {
                  setShowFabMenu(false);
                  onOpenNewFee();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-800 rounded-xl text-left transition-colors cursor-pointer"
              >
                <DollarSign className="w-4 h-4 text-amber-300" />
                + Honorarios
              </button>
              <div className="border-t border-slate-800 pt-1 mt-1">
                <button
                  onClick={() => {
                    setShowFabMenu(false);
                    setActiveTab('tools');
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-amber-300 hover:bg-slate-800 rounded-xl text-left transition-colors cursor-pointer"
                >
                  <Calculator className="w-4 h-4" />
                  Calculadora CPC
                </button>
              </div>
            </div>
          )}

          <button
            onClick={() => setShowFabMenu(!showFabMenu)}
            className="w-14 h-14 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold shadow-2xl shadow-amber-500/40 flex items-center justify-center transition-all transform hover:scale-105 active:scale-95 cursor-pointer"
            title="Agregar nuevo elemento al despacho"
            aria-label="Agregar nuevo"
          >
            {showFabMenu ? <X className="w-6 h-6" /> : <Plus className="w-7 h-7" />}
          </button>
        </div>
      </div>
    </div>
  );
};
