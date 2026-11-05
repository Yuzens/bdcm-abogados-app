import React, { useState } from 'react';
import { useLegal } from '../../context/LegalContext';
import {
  Briefcase,
  Search,
  Plus,
  Clock,
  Calendar,
  DollarSign,
  ExternalLink,
  ChevronRight,
  Filter,
  FileText,
  User,
  Scale,
  Trash2,
  Send,
} from 'lucide-react';
import { formatDateCL, formatCurrency } from '../../utils/chileanLegal';
import { CaseStatus, LegalSubject } from '../../types';

interface Props {
  onOpenNewCase: () => void;
  onOpenNewDeadline: (caseId?: string) => void;
  onOpenNewHearing: (caseId?: string) => void;
  onOpenNewFee: (caseId?: string) => void;
}

export const CasesView: React.FC<Props> = ({
  onOpenNewCase,
  onOpenNewDeadline,
  onOpenNewHearing,
  onOpenNewFee,
}) => {
  const {
    cases,
    clients,
    selectedCaseId,
    setSelectedCaseId,
    deleteCase,
    addCaseTimelineEvent,
    deadlines,
    hearings,
    installments,
    searchQuery,
  } = useLegal();

  const [subjectFilter, setSubjectFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Timeline event input
  const [timelineTitle, setTimelineTitle] = useState('');
  const [timelineDesc, setTimelineDesc] = useState('');

  // Filtering
  const filteredCases = cases.filter((c) => {
    if (subjectFilter !== 'ALL' && c.subject !== subjectFilter) return false;
    if (statusFilter !== 'ALL' && c.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const client = clients.find((cli) => cli.id === c.clientId);
      const matchRol = c.rol.toLowerCase().includes(q);
      const matchCaratula = c.caratula.toLowerCase().includes(q);
      const matchCourt = c.court.toLowerCase().includes(q);
      const matchClient = client?.name.toLowerCase().includes(q);
      const matchRut = client?.rut.toLowerCase().includes(q);
      if (!matchRol && !matchCaratula && !matchCourt && !matchClient && !matchRut) return false;
    }
    return true;
  });

  const selectedCase = cases.find((c) => c.id === selectedCaseId) || filteredCases[0];
  const selectedClient = selectedCase ? clients.find((cli) => cli.id === selectedCase.clientId) : undefined;

  const caseDeadlines = selectedCase ? deadlines.filter((d) => d.caseId === selectedCase.id) : [];
  const caseHearings = selectedCase ? hearings.filter((h) => h.caseId === selectedCase.id) : [];
  const caseInstallments = selectedCase ? installments.filter((i) => i.caseId === selectedCase.id) : [];

  const handleAddTimeline = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCase || !timelineTitle.trim()) return;
    addCaseTimelineEvent(selectedCase.id, {
      title: timelineTitle.trim(),
      description: timelineDesc.trim() || 'Movimiento procesal ingresado en el expediente.',
      actor: selectedCase.assignedLawyer,
    });
    setTimelineTitle('');
    setTimelineDesc('');
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-legal-heading text-slate-100 flex items-center gap-2.5">
            <Briefcase className="w-6 h-6 text-amber-400" />
            Causas & Expedientes Judiciales
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Gestión procesal, ROL/RIT de tribunales chilenos, partes y línea de tiempo
          </p>
        </div>

        <button
          onClick={onOpenNewCase}
          className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2 self-start cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ Nueva Causa Judicial</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
          <Filter className="w-4 h-4 text-amber-400" />
          <span>Filtros:</span>
        </div>

        <select
          value={subjectFilter}
          onChange={(e) => setSubjectFilter(e.target.value)}
          className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-xl px-3 py-1.5 focus:outline-hidden focus:border-amber-400"
        >
          <option value="ALL">Todas las Materias</option>
          <option value="Civil">Civil</option>
          <option value="Laboral">Laboral</option>
          <option value="Penal">Penal</option>
          <option value="Familia">Familia</option>
          <option value="Constitucional">Constitucional</option>
          <option value="Policía Local">Policía Local</option>
          <option value="Comercial">Comercial</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-xl px-3 py-1.5 focus:outline-hidden focus:border-amber-400"
        >
          <option value="ALL">Todos los Estados</option>
          <option value="TRAMITACION">En Tramitación</option>
          <option value="CITACION_SENTENCIA">Citación a Sentencia</option>
          <option value="APELACION">En Apelación</option>
          <option value="SUSPENDIDA">Suspendida</option>
          <option value="TERMINADA">Terminada</option>
        </select>

        <span className="text-xs text-slate-500 ml-auto">
          {filteredCases.length} causa(s) encontradas
        </span>
      </div>

      {/* Main Grid: List on Left, Detail on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Cases List */}
        <div className="lg:col-span-5 space-y-3">
          {filteredCases.length === 0 ? (
            <div className="p-8 text-center bg-slate-900/50 border border-slate-800 rounded-2xl text-xs text-slate-400">
              No se encontraron causas judiciales con los filtros seleccionados.
            </div>
          ) : (
            filteredCases.map((c) => {
              const isSelected = selectedCase?.id === c.id;
              const client = clients.find((cli) => cli.id === c.clientId);

              return (
                <div
                  key={c.id}
                  onClick={() => setSelectedCaseId(c.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                    isSelected
                      ? 'bg-slate-900 border-amber-500/50 shadow-md shadow-amber-500/5'
                      : 'bg-slate-900/50 border-slate-800/80 hover:bg-slate-900/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold font-mono-legal text-amber-400">
                      {c.rol}
                    </span>
                    <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                      {c.subject}
                    </span>
                  </div>

                  <h3 className="text-xs font-bold text-slate-100 line-clamp-1">{c.caratula}</h3>

                  <div className="text-[11px] text-slate-400 flex items-center justify-between">
                    <span className="truncate max-w-[200px]">{c.court}</span>
                    <span className="text-slate-300 font-medium">{client?.name || 'Cliente'}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Case Detail */}
        <div className="lg:col-span-7">
          {selectedCase ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
              {/* Detail Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold font-mono-legal text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20">
                      {selectedCase.rol}
                    </span>
                    <span className="text-xs text-slate-400">{selectedCase.court}</span>
                  </div>
                  <h2 className="text-base font-bold font-legal-heading text-slate-100 mt-2">
                    {selectedCase.caratula}
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Materia: <strong className="text-slate-300">{selectedCase.subject}</strong> •
                    Estado: <strong className="text-amber-300">{selectedCase.status}</strong>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {selectedCase.pjudLink && (
                    <a
                      href={selectedCase.pjudLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl flex items-center gap-1.5 border border-slate-700"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
                      <span>OJV</span>
                    </a>
                  )}
                  <button
                    onClick={() => deleteCase(selectedCase.id)}
                    className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl"
                    title="Eliminar causa"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Parties & Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-500">
                    Cliente / Nuestro Patrocinado:
                  </span>
                  <p className="font-semibold text-slate-200">
                    {selectedClient?.name || 'Cliente no encontrado'}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    RUT: {selectedClient?.rut || 'S/N'} • Rol: {selectedCase.clientRole}
                  </p>
                </div>

                <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Contraparte:</span>
                  <p className="font-semibold text-slate-200">{selectedCase.opposingParty}</p>
                  <p className="text-[11px] text-slate-400">
                    Abogado: {selectedCase.opposingLawyer || 'No registrado'}
                  </p>
                </div>

                <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Abogado BDCM:</span>
                  <p className="font-semibold text-slate-200">{selectedCase.assignedLawyer}</p>
                  <p className="text-[11px] text-slate-400">
                    Cuantía:{' '}
                    {selectedCase.amount
                      ? formatCurrency(selectedCase.amount, selectedCase.currency)
                      : 'Indeterminada'}
                  </p>
                </div>

                <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Acciones Directas:</span>
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    <button
                      onClick={() => onOpenNewDeadline(selectedCase.id)}
                      className="px-2 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 rounded-lg text-[10px] font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Clock className="w-3 h-3" />
                      + Plazo
                    </button>
                    <button
                      onClick={() => onOpenNewHearing(selectedCase.id)}
                      className="px-2 py-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg text-[10px] font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Calendar className="w-3 h-3" />
                      + Audiencia
                    </button>
                    <button
                      onClick={() => onOpenNewFee(selectedCase.id)}
                      className="px-2 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 rounded-lg text-[10px] font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <DollarSign className="w-3 h-3" />
                      + Honorarios
                    </button>
                  </div>
                </div>
              </div>

              {/* Active Deadlines & Hearings */}
              {(caseDeadlines.length > 0 || caseHearings.length > 0) && (
                <div className="space-y-3 pt-2">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Plazos & Audiencias de esta Causa
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {caseDeadlines.map((dl) => (
                      <div
                        key={dl.id}
                        className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-rose-400 font-mono-legal">
                            PLAZO FATAL
                          </span>
                          <span className="text-[10px] text-slate-400">{formatDateCL(dl.deadlineDate)}</span>
                        </div>
                        <p className="font-semibold text-slate-200 line-clamp-1">{dl.title}</p>
                      </div>
                    ))}
                    {caseHearings.map((hr) => (
                      <div
                        key={hr.id}
                        className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-blue-400 font-mono-legal">
                            AUDIENCIA
                          </span>
                          <span className="text-[10px] text-slate-400">{formatDateCL(hr.date)}</span>
                        </div>
                        <p className="font-semibold text-slate-200 line-clamp-1">{hr.title}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Timeline (Línea de Vida Procesal) */}
              <div className="space-y-4 pt-4 border-t border-slate-800">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  Línea de Tiempo Procesal (Actuaciones & Resoluciones)
                </span>

                {/* Add new event */}
                <form onSubmit={handleAddTimeline} className="space-y-2 bg-slate-950/70 p-3.5 rounded-xl border border-slate-800">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Título de la resolución o escrito presentado..."
                      value={timelineTitle}
                      onChange={(e) => setTimelineTitle(e.target.value)}
                      className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-amber-400"
                    />
                    <button
                      type="submit"
                      className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Registrar</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="Detalles o notas del trámite (opcional)..."
                    value={timelineDesc}
                    onChange={(e) => setTimelineDesc(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-300 placeholder-slate-500 focus:outline-hidden focus:border-amber-400"
                  />
                </form>

                {/* Timeline items */}
                <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
                  {selectedCase.timeline.map((ev) => (
                    <div key={ev.id} className="relative group text-xs space-y-1">
                      <div className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-amber-400 border-2 border-slate-900"></div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-amber-400 font-mono-legal font-semibold">
                          {formatDateCL(ev.date)}
                        </span>
                        <span className="text-[10px] text-slate-400">({ev.actor})</span>
                      </div>
                      <h4 className="font-bold text-slate-200">{ev.title}</h4>
                      <p className="text-slate-400 text-[11px] leading-relaxed">{ev.description}</p>
                      {ev.documentName && (
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 font-mono-legal">
                          <FileText className="w-3 h-3 text-amber-400" />
                          <span>{ev.documentName}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center bg-slate-900/50 border border-slate-800 rounded-2xl text-xs text-slate-400">
              Seleccione una causa judicial para revisar su expediente.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
