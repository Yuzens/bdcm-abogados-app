import React, { useState } from 'react';
import { useLegal } from '../../context/LegalContext';
import { X, CheckCircle, Receipt } from 'lucide-react';
import { FeeInstallment } from '../../types';
import { formatCurrency, formatDateCL } from '../../utils/chileanLegal';

interface Props {
  installment: FeeInstallment | null;
  onClose: () => void;
  onReceiptOpen: (installment: FeeInstallment) => void;
}

export const RegisterPaymentModal: React.FC<Props> = ({
  installment,
  onClose,
  onReceiptOpen,
}) => {
  const { registerInstallmentPayment } = useLegal();

  const [paidDate, setPaidDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<'TRANSFERENCIA' | 'VALE_VISTA' | 'CHEQUE' | 'WEBPAY' | 'EFECTIVO'>('TRANSFERENCIA');
  const [receiptFolio, setReceiptFolio] = useState(() => `BHE-${Math.floor(100 + Math.random() * 900)}`);
  const [notes, setNotes] = useState('');

  if (!installment) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    registerInstallmentPayment(installment.id, {
      paidDate,
      paymentMethod,
      receiptFolio: receiptFolio.trim(),
      notes: notes.trim(),
    });

    const updated = {
      ...installment,
      status: 'PAGADA' as const,
      paidDate,
      paymentMethod,
      receiptFolio: receiptFolio.trim(),
    };

    onClose();
    onReceiptOpen(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-5 animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-slate-100 font-bold font-legal-heading text-base">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            <span>Registrar Pago de Cuota</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-3.5 bg-slate-950/70 rounded-xl border border-slate-800 text-xs space-y-1">
          <span className="text-slate-400 block">Detalle de la Cuota a Cancelar:</span>
          <div className="flex items-center justify-between font-mono-legal text-sm">
            <span className="font-bold text-slate-200">
              Cuota {installment.installmentNumber} de {installment.totalInstallments}
            </span>
            <span className="font-bold text-emerald-400">
              {formatCurrency(installment.amount, installment.currency)}
            </span>
          </div>
          <span className="text-[11px] text-slate-500 block">
            Vencimiento programado: {formatDateCL(installment.dueDate)}
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Fecha Real de Pago</label>
            <input
              type="date"
              value={paidDate}
              onChange={(e) => setPaidDate(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono-legal focus:outline-hidden focus:border-emerald-400"
              required
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Medio de Pago</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as any)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-hidden focus:border-emerald-400"
            >
              <option value="TRANSFERENCIA">Transferencia Electrónica (TEF)</option>
              <option value="VALE_VISTA">Vale Vista Bancario</option>
              <option value="CHEQUE">Cheque al Día / Plazo</option>
              <option value="WEBPAY">Webpay / Tarjeta Débito-Crédito</option>
              <option value="EFECTIVO">Efectivo en Despacho</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Folio de Comprobante / Boleta de Honorarios (BHE)
            </label>
            <input
              type="text"
              placeholder="Ej. BHE-1048 o N° Operación Bancaria"
              value={receiptFolio}
              onChange={(e) => setReceiptFolio(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono-legal focus:outline-hidden focus:border-emerald-400"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Notas Contables</label>
            <textarea
              rows={2}
              placeholder="Banco emisor, RUT del depositante, observaciones..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-hidden focus:border-emerald-400"
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
              className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 flex items-center gap-2 cursor-pointer"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Confirmar Pago & Generar Recibo</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
