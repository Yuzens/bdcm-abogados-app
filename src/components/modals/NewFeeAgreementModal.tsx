import React, { useState } from 'react';
import { useLegal } from '../../context/LegalContext';
import { X, DollarSign } from 'lucide-react';
import { FeeType } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  preselectedCaseId?: string;
}

export const NewFeeAgreementModal: React.FC<Props> = ({
  isOpen,
  onClose,
  preselectedCaseId,
}) => {
  const { cases, clients, addFeeAgreement } = useLegal();

  const [caseId, setCaseId] = useState(preselectedCaseId || (cases[0]?.id || ''));
  const [feeType, setFeeType] = useState<FeeType>('FIJO');
  const [currency, setCurrency] = useState<'CLP' | 'UF'>('CLP');
  const [totalAmount, setTotalAmount] = useState<number>(1500000);
  const [installmentsCount, setInstallmentsCount] = useState<number>(3);
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const currentCase = cases.find((c) => c.id === caseId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!caseId || !totalAmount || installmentsCount < 1) {
      alert('Por favor ingrese la causa, monto total y número de cuotas.');
      return;
    }

    const clientId = currentCase?.clientId || clients[0]?.id || '';
    const installmentAmount = Math.round(totalAmount / installmentsCount);

    const installmentsList = Array.from({ length: installmentsCount }, (_, idx) => {
      const d = new Date();
      d.setMonth(d.getMonth() + idx + 1);
      return {
        dueDate: d.toISOString().split('T')[0],
        amount: installmentAmount,
        notes: `Cuota ${idx + 1} de ${installmentsCount}`,
      };
    });

    addFeeAgreement(
      {
        caseId,
        clientId,
        feeType,
        currency,
        totalAmount,
        installmentsCount,
        notes: notes.trim(),
      },
      installmentsList
    );

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-5 animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-slate-100 font-bold font-legal-heading text-base">
            <DollarSign className="w-5 h-5 text-amber-400" />
            <span>Pactar Convenio de Honorarios</span>
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
              Causa Judicial <span className="text-amber-400">*</span>
            </label>
            <select
              value={caseId}
              onChange={(e) => setCaseId(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-hidden focus:border-amber-400"
              required
            >
              {cases.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.rol} — {c.caratula}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Tipo de Convenio</label>
              <select
                value={feeType}
                onChange={(e) => setFeeType(e.target.value as any)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-hidden focus:border-amber-400"
              >
                <option value="FIJO">Honorario Fijo / Alzada</option>
                <option value="CUOTA_LITIS">Cuota Litis (% sobre éxito)</option>
                <option value="MIXTO">Mixto (Base fija + % éxito)</option>
                <option value="MENSUAL">Retainer / Mensual</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Moneda de Pago</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as any)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-hidden focus:border-amber-400"
              >
                <option value="CLP">Pesos Chilenos (CLP $)</option>
                <option value="UF">Unidades de Fomento (UF)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Monto Total Acordado <span className="text-amber-400">*</span>
              </label>
              <input
                type="number"
                min="1"
                value={totalAmount}
                onChange={(e) => setTotalAmount(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono-legal focus:outline-hidden focus:border-amber-400"
                required
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Número de Cuotas</label>
              <input
                type="number"
                min="1"
                max="24"
                value={installmentsCount}
                onChange={(e) => setInstallmentsCount(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono-legal focus:outline-hidden focus:border-amber-400"
                required
              />
            </div>
          </div>

          <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800 text-slate-300">
            <span className="text-[11px] font-semibold block text-slate-400">
              Proyección de Cuotas:
            </span>
            <p className="font-mono-legal text-amber-300 font-bold mt-1">
              {installmentsCount} cuotas mensuales de aprox.{' '}
              {currency === 'CLP'
                ? `$ ${Math.round(totalAmount / (installmentsCount || 1)).toLocaleString('es-CL')}`
                : `${(totalAmount / (installmentsCount || 1)).toFixed(1)} UF`}
            </p>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Condiciones de Pago & Boleta de Honorarios
            </label>
            <textarea
              rows={2}
              placeholder="Ej. Emisión de boleta de honorarios exenta, 1ª cuota con el ingreso del escrito..."
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
              Generar Plan de Pagos
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
