import React, { useState } from 'react';
import { useLegal } from '../../context/LegalContext';
import {
  Calendar,
  Plus,
  Video,
  MapPin,
  Clock,
  User,
  Trash2,
  ExternalLink,
  CheckCircle,
} from 'lucide-react';
import { formatDateCL } from '../../utils/chileanLegal';

interface Props {
  onOpenNewHearing: () => void;
}

export const HearingsView: React.FC<Props> = ({ onOpenNewHearing }) => {
  const {
    hearings,
    cases,
    deleteHearing,
    updateHearing,
    syncHearingToCalendar,
    googleAccessToken,
  } = useLegal();

  const [filterType, setFilterType] = useState<string>('ALL');

  const filteredHearings = hearings.filter((h) => {
    if (filterType !== 'ALL' && h.type !== filterType) return false;
    return true;
  }).sort((a, b) => `${a.date} ${a.startTime}`.localeCompare(`${b.date} ${b.startTime}`));

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-legal-heading text-slate-100 flex items-center gap-2.5">
            <Calendar className="w-6 h-6 text-blue-400" />
            Audiencias & Citas Judiciales
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Comparecencias telemáticas vía Zoom PJUD, Google Meet y audiencias presenciales en tribunales
          </p>
        </div>

        <button
          onClick={onOpenNewHearing}
          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/20 transition-all flex items-center gap-2 self-start cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ Agendar Audiencia</span>
        </button>
      </div>

      {/* Filter by Type */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {['ALL', 'PREPARATORIA', 'JUICIO_ORAL', 'CONCILIACION', 'ALEGATOS', 'REUNION_CLIENTE'].map((t) => (
          <button
            key={t}
            onClick={() => setFilterType(t)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              filterType === t
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            {t === 'ALL' ? 'Todas las Audiencias' : t}
          </button>
        ))}
      </div>

      {/* Hearings List */}
      <div className="space-y-4">
        {filteredHearings.length === 0 ? (
          <div className="p-12 text-center bg-slate-900/50 border border-slate-800 rounded-2xl text-xs text-slate-400">
            No hay audiencias programadas en esta vista.
          </div>
        ) : (
          filteredHearings.map((h) => {
            const caseItem = cases.find((c) => c.id === h.caseId);
            const isZoom = h.modality === 'TELEMATICA_ZOOM';
            const isMeet = h.modality === 'GOOGLE_MEET';
            const isCompleted = h.status === 'REALIZADA';

            return (
              <div
                key={h.id}
                className="p-5 bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-2xl shadow-md transition-all space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-300 border border-blue-500/20">
                      {h.type}
                    </span>
                    <span className="text-xs text-slate-400 font-mono-legal">
                      {formatDateCL(h.date)} • {h.startTime} a {h.endTime} hrs
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                        isCompleted
                          ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                      }`}
                    >
                      {h.status}
                    </span>

                    {googleAccessToken && !h.syncedToCalendar && (
                      <button
                        onClick={() => syncHearingToCalendar(h.id)}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-amber-400 text-[11px] font-semibold rounded-lg flex items-center gap-1 border border-slate-700"
                        title="Agendar en Google Calendar"
                      >
                        <Calendar className="w-3 h-3" />
                        <span>Google Cal</span>
                      </button>
                    )}

                    <button
                      onClick={() => deleteHearing(h.id)}
                      className="p-1 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg"
                      title="Eliminar audiencia"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  <div className="md:col-span-8 space-y-1.5">
                    <h3 className="text-sm font-bold text-slate-100">{h.title}</h3>
                    {caseItem && (
                      <p className="text-xs text-amber-400 font-mono-legal">
                        Causa: {caseItem.rol} — {caseItem.caratula} ({caseItem.court})
                      </p>
                    )}
                    <p className="text-xs text-slate-400">
                      <strong>Asistentes:</strong> {h.attendees}
                    </p>
                    {h.notes && (
                      <p className="text-xs text-slate-400 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                        {h.notes}
                      </p>
                    )}
                  </div>

                  <div className="md:col-span-4 flex flex-col justify-between items-start md:items-end gap-3 text-xs">
                    <div className="space-y-1 text-left md:text-right">
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">
                        Modalidad & Sala:
                      </span>
                      <span className="text-slate-300 font-semibold">{h.modality}</span>
                      <p className="text-[11px] text-slate-400 truncate max-w-[220px]">
                        {h.courtRoomOrLink}
                      </p>
                    </div>

                    {(isZoom || isMeet) && h.courtRoomOrLink.startsWith('http') && (
                      <a
                        href={h.courtRoomOrLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl flex items-center gap-1.5 transition-colors"
                      >
                        <Video className="w-4 h-4" />
                        <span>Entrar a la Sala Virtual</span>
                      </a>
                    )}
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
