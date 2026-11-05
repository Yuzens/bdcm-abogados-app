import React, { useState } from 'react';
import { useLegal } from '../../context/LegalContext';
import { X, Calendar } from 'lucide-react';
import { HearingType } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  preselectedCaseId?: string;
}

export const NewHearingModal: React.FC<Props> = ({
  isOpen,
  onClose,
  preselectedCaseId,
}) => {
  const { cases, addHearing } = useLegal();

  const [caseId, setCaseId] = useState(preselectedCaseId || (cases[0]?.id || ''));
  const [title, setTitle] = useState('');
  const [type, setType] = useState<HearingType>('PREPARATORIA');
  const [date, setDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  });
  const [startTime, setStartTime] = useState('09:30');
  const [endTime, setEndTime] = useState('11:00');
  const [modality, setModality] = useState<'PRESENCIAL' | 'TELEMATICA_ZOOM' | 'GOOGLE_MEET' | 'OTRA'>('TELEMATICA_ZOOM');
  const [courtRoomOrLink, setCourtRoomOrLink] = useState('https://pjud-cl.zoom.us/j/98412039148');
  const [attendees, setAttendees] = useState('Abogado BDCM, Cliente, Tribunal');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date) {
      alert('Por favor ingrese el título y la fecha de la audiencia.');
      return;
    }

    await addHearing({
      caseId: caseId || undefined,
      title: title.trim(),
      type,
      date,
      startTime,
      endTime,
      modality,
      courtRoomOrLink: courtRoomOrLink.trim() || 'Tribunal',
      attendees: attendees.trim(),
      notes: notes.trim(),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-5 animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-slate-100 font-bold font-legal-heading text-base">
            <Calendar className="w-5 h-5 text-blue-400" />
            <span>Agendar Audiencia o Reunión</span>
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
            <label className="block text-slate-300 font-semibold mb-1">Causa Judicial (Opcional)</label>
            <select
              value={caseId}
              onChange={(e) => setCaseId(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-hidden focus:border-blue-400"
            >
              <option value="">Reunión o Audiencia General (Sin causa específica)</option>
              {cases.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.rol} — {c.caratula}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Nombre de la Audiencia / Comparecencia <span className="text-blue-400">*</span>
            </label>
            <input
              type="text"
              placeholder="Ej. Audiencia Preparatoria de Juicio del Trabajo"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-hidden focus:border-blue-400"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Tipo de Audiencia</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-hidden focus:border-blue-400"
              >
                <option value="PREPARATORIA">Preparatoria</option>
                <option value="JUICIO_ORAL">Juicio Oral</option>
                <option value="CONCILIACION">Conciliación</option>
                <option value="MEDIDAS_CAUTELARES">Medidas Cautelares / Formalización</option>
                <option value="ALEGATOS">Alegatos Corte</option>
                <option value="REUNION_CLIENTE">Reunión con Cliente / Directorio</option>
                <option value="DECLARACION">Declaración Testigos</option>
                <option value="OTRA">Otra</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Modalidad</label>
              <select
                value={modality}
                onChange={(e) => setModality(e.target.value as any)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-hidden focus:border-blue-400"
              >
                <option value="TELEMATICA_ZOOM">Telemática (Zoom PJUD)</option>
                <option value="GOOGLE_MEET">Google Meet</option>
                <option value="PRESENCIAL">Presencial en Tribunal / Despacho</option>
                <option value="OTRA">Otra</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Fecha <span className="text-blue-400">*</span>
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono-legal focus:outline-hidden focus:border-blue-400"
                required
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Hora Inicio</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono-legal focus:outline-hidden focus:border-blue-400"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Hora Término</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono-legal focus:outline-hidden focus:border-blue-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Enlace Virtual (Zoom / Meet) o Sala Física
            </label>
            <input
              type="text"
              placeholder="https://pjud-cl.zoom.us/j/... o Sala 301 Centro de Justicia"
              value={courtRoomOrLink}
              onChange={(e) => setCourtRoomOrLink(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-hidden focus:border-blue-400"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Asistentes Convocados</label>
            <input
              type="text"
              placeholder="Ej. Rodrigo Donoso (BDCM), Juan Pérez (Cliente), Magistrado"
              value={attendees}
              onChange={(e) => setAttendees(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-hidden focus:border-blue-400"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Notas y Puntos de Prueba
            </label>
            <textarea
              rows={2}
              placeholder="Preparar excepciones, minuta de testigos o propuesta de avenimiento..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-hidden focus:border-blue-400"
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
              className="px-5 py-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 cursor-pointer"
            >
              Guardar Audiencia
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
