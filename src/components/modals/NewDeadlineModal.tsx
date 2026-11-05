import React, { useState } from 'react';
import { useLegal } from '../../context/LegalContext';
import { X, Clock } from 'lucide-react';
import { DeadlineDaysType } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  preselectedCaseId?: string;
}

export const NewDeadlineModal: React.FC<Props> = ({
  isOpen,
  onClose,
  preselectedCaseId,
}) => {
  const { cases, addDeadline } = useLegal();

  const [caseId, setCaseId] = useState(preselectedCaseId || (cases[0]?.id || ''));
  const [title, setTitle] = useState('');
  const [deadlineDate, setDeadlineDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 5);
    return d.toISOString().split('T')[0];
  });
  const [deadlineTime, setDeadlineTime] = useState('23:59');
  const [isFatal, setIsFatal] = useState(true);
  const [daysType, setDaysType] = useState<DeadlineDaysType>('HABILES_CIVIL');
  const [daysCount, setDaysCount] = useState<number>(5);
  const [priority, setPriority] = useState<'ALTA' | 'MEDIA' | 'BAJA'>('ALTA');
  const [alertDaysBefore, setAlertDaysBefore] = useState<number>(2);
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!caseId || !title.trim() || !deadlineDate) {
      alert('Por favor complete la causa, el título y la fecha del plazo.');
      return;
    }

    await addDeadline({
      caseId,
      title: title.trim(),
      deadlineDate,
      deadlineTime,
      isFatal,
      daysType,
      daysCount,
      priority,
      alertDaysBefore,
      notes: notes.trim(),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-5 animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-slate-100 font-bold font-legal-heading text-base">
            <Clock className="w-5 h-5 text-rose-400" />
            <span>Nuevo Plazo Judicial Fatal</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Causa Judicial Asociada <span className="text-rose-400">*</span>
            </label>
            <select
              value={caseId}
              onChange={(e) => setCaseId(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-hidden focus:border-rose-400"
              required
            >
              {cases.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.rol} — {c.caratula} ({c.court})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Nombre / Actuación del Plazo <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              placeholder="Ej. Evacuar traslado sobre reposición con apelación en subsidio"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-hidden focus:border-rose-400"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Fecha Límite Fatal <span className="text-rose-400">*</span>
              </label>
              <input
                type="date"
                value={deadlineDate}
                onChange={(e) => setDeadlineDate(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono-legal focus:outline-hidden focus:border-rose-400"
                required
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Hora Límite</label>
              <input
                type="time"
                value={deadlineTime}
                onChange={(e) => setDeadlineTime(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono-legal focus:outline-hidden focus:border-rose-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Régimen Procesal</label>
              <select
                value={daysType}
                onChange={(e) => setDaysType(e.target.value as any)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-hidden focus:border-rose-400"
              >
                <option value="HABILES_CIVIL">Civil (Lunes a Sábado, Art. 66 CPC)</option>
                <option value="HABILES_LABORAL">Laboral / Penal (Lunes a Viernes)</option>
                <option value="CORRIDOS">Corridos (Días calendario)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Prioridad</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-hidden focus:border-rose-400"
              >
                <option value="ALTA">Alta (Urgente)</option>
                <option value="MEDIA">Media</option>
                <option value="BAJA">Baja</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-slate-950/70 rounded-xl border border-slate-800">
            <input
              type="checkbox"
              id="isFatal"
              checked={isFatal}
              onChange={(e) => setIsFatal(e.target.checked)}
              className="w-4 h-4 rounded border-slate-700 text-rose-500 focus:ring-rose-400"
            />
            <label htmlFor="isFatal" className="text-xs text-slate-200 cursor-pointer">
              <strong>Plazo Fatal (Art. 64 CPC):</strong> Caduca el derecho por el solo ministerio de la ley.
            </label>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Notas Procesales o Fundamentos del Escrito
            </label>
            <textarea
              rows={2}
              placeholder="Ej. Art. 308 CPC, invocar prórroga tácita de competencia con jurisprudencia de Corte Suprema..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-hidden focus:border-rose-400"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white font-bold rounded-xl shadow-lg shadow-rose-600/20 cursor-pointer"
            >
              Agendar Plazo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
