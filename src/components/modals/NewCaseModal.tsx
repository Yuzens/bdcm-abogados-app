import React, { useState } from 'react';
import { useLegal } from '../../context/LegalContext';
import { X, Briefcase, Plus } from 'lucide-react';
import { CourtType, LegalSubject, ClientRole } from '../../types';
import { CHILEAN_COURTS } from '../../utils/chileanLegal';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  preselectedClientId?: string;
}

export const NewCaseModal: React.FC<Props> = ({ isOpen, onClose, preselectedClientId }) => {
  const { clients, lawyers, addCase } = useLegal();

  const [rol, setRol] = useState('');
  const [caratula, setCaratula] = useState('');
  const [court, setCourt] = useState(CHILEAN_COURTS[0]);
  const [courtType, setCourtType] = useState<CourtType>('CIVIL');
  const [subject, setSubject] = useState<LegalSubject>('Civil');
  const [clientId, setClientId] = useState(preselectedClientId || (clients[0]?.id || ''));
  const [clientRole, setClientRole] = useState<ClientRole>('DEMANDANTE');
  const [opposingParty, setOpposingParty] = useState('');
  const [opposingLawyer, setOpposingLawyer] = useState('');
  const [assignedLawyer, setAssignedLawyer] = useState(lawyers[0]?.name || 'Enrique Blanco Zambrano');
  const [currency, setCurrency] = useState<'CLP' | 'UF'>('CLP');
  const [amount, setAmount] = useState<number>(0);
  const [pjudLink, setPjudLink] = useState('https://ojv.pjud.cl/kpitec-ojv-web/login');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rol.trim() || !caratula.trim() || !clientId) {
      alert('Por favor complete los campos obligatorios (ROL, Carátula, Cliente).');
      return;
    }

    addCase({
      rol: rol.trim(),
      caratula: caratula.trim(),
      court,
      courtType,
      subject,
      clientId,
      clientRole,
      opposingParty: opposingParty.trim() || 'Por individualizar',
      opposingLawyer: opposingLawyer.trim(),
      status: 'TRAMITACION',
      assignedLawyer,
      currency,
      amount: Number(amount) || undefined,
      pjudLink,
      notes: notes.trim(),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-5 animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-slate-100 font-bold font-legal-heading text-base">
            <Briefcase className="w-5 h-5 text-amber-400" />
            <span>Ingreso de Nueva Causa Judicial</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                ROL / RIT / RUC <span className="text-amber-400">*</span>
              </label>
              <input
                type="text"
                placeholder="Ej. C-1245-2024 o O-421-2024"
                value={rol}
                onChange={(e) => setRol(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono-legal focus:outline-hidden focus:border-amber-400"
                required
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Materia Judicial <span className="text-amber-400">*</span>
              </label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value as any)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-hidden focus:border-amber-400"
              >
                <option value="Civil">Civil</option>
                <option value="Laboral">Laboral</option>
                <option value="Penal">Penal</option>
                <option value="Familia">Familia</option>
                <option value="Constitucional">Constitucional</option>
                <option value="Policía Local">Policía Local</option>
                <option value="Comercial">Comercial</option>
                <option value="Inmobiliario">Inmobiliario</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Carátula de la Causa <span className="text-amber-400">*</span>
            </label>
            <input
              type="text"
              placeholder="Ej. Inversiones del Sur SpA c/ Banco de Chile"
              value={caratula}
              onChange={(e) => setCaratula(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-hidden focus:border-amber-400"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Tribunal de Tramitación <span className="text-amber-400">*</span>
              </label>
              <input
                type="text"
                list="courts-list"
                value={court}
                onChange={(e) => setCourt(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-hidden focus:border-amber-400"
                required
              />
              <datalist id="courts-list">
                {CHILEAN_COURTS.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Cliente / Patrocinado <span className="text-amber-400">*</span>
              </label>
              <select
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-hidden focus:border-amber-400"
                required
              >
                {clients.map((cli) => (
                  <option key={cli.id} value={cli.id}>
                    {cli.name} ({cli.rut})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Calidad de Nuestro Cliente
              </label>
              <select
                value={clientRole}
                onChange={(e) => setClientRole(e.target.value as any)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-hidden focus:border-amber-400"
              >
                <option value="DEMANDANTE">Demandante</option>
                <option value="DEMANDADO">Demandado</option>
                <option value="QUERELLANTE">Querellante</option>
                <option value="IMPUTADO">Imputado</option>
                <option value="RECURRENTE">Recurrente</option>
                <option value="RECURRIDO">Recurrido</option>
                <option value="SOLICITANTE">Solicitante</option>
                <option value="TERCERO">Tercero</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-300 font-semibold mb-1">
                Contraparte (Nombre / RUT)
              </label>
              <input
                type="text"
                placeholder="Ej. Constructora Santa Fe S.A."
                value={opposingParty}
                onChange={(e) => setOpposingParty(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-hidden focus:border-amber-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Abogado Asignado</label>
              <select
                value={assignedLawyer}
                onChange={(e) => setAssignedLawyer(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-hidden focus:border-amber-400"
              >
                {lawyers.map((l) => (
                  <option key={l.id} value={l.name}>
                    {l.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Moneda</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as any)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-hidden focus:border-amber-400"
                >
                  <option value="CLP">CLP ($)</option>
                  <option value="UF">UF</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Cuantía</label>
                <input
                  type="number"
                  placeholder="0"
                  value={amount || ''}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono-legal focus:outline-hidden focus:border-amber-400"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Observaciones o Estrategia Inicial
            </label>
            <textarea
              rows={3}
              placeholder="Notas reservadas sobre la causa, plazos relevantes o testigos..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-hidden focus:border-amber-400"
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
              className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl shadow-lg shadow-amber-500/20 cursor-pointer"
            >
              Crear Causa
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
