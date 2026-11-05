import React from 'react';
import { useLegal } from '../../context/LegalContext';
import { X, Printer, Scale, CheckCircle } from 'lucide-react';
import { FeeInstallment } from '../../types';
import { formatCurrency, formatDateCL, formatRutCL } from '../../utils/chileanLegal';

interface Props {
  installment: FeeInstallment | null;
  onClose: () => void;
}

export const ReceiptModal: React.FC<Props> = ({ installment, onClose }) => {
  const { cases, clients } = useLegal();

  if (!installment) return null;

  const currentCase = cases.find((c) => c.id === installment.caseId);
  const client = clients.find((cli) => cli.id === installment.clientId);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl p-6 space-y-6 animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-slate-100 font-bold font-legal-heading text-base">
            <Scale className="w-5 h-5 text-amber-400" />
            <span>Recibo de Pago de Honorarios</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Receipt Card */}
        <div className="p-6 bg-slate-950 border border-amber-500/30 rounded-2xl space-y-5 text-xs text-slate-300">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-bold font-legal-heading text-slate-100 tracking-wide">
                BDCM <span className="text-amber-400">ABOGADOS</span>
              </h3>
              <p className="text-[10px] text-slate-400">Estudio Jurídico • Santiago, Chile</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 font-mono-legal block">
                FOLIO: {installment.receiptFolio || 'REC-001'}
              </span>
              <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1 justify-end">
                <CheckCircle className="w-3 h-3" />
                PAGADO
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-400">Cliente:</span>
              <strong className="text-slate-200">{client?.name || 'Cliente'}</strong>
            </div>
            <div className="flex justify-between font-mono-legal">
              <span className="text-slate-400">RUT:</span>
              <span className="text-slate-200">{client ? formatRutCL(client.rut) : 'S/N'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Causa Judicial:</span>
              <span className="text-amber-300 font-mono-legal">
                {currentCase ? `${currentCase.rol} (${currentCase.court})` : 'Convenio general'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Concepto:</span>
              <span className="text-slate-200">
                Honorarios Profesionales — Cuota {installment.installmentNumber} de{' '}
                {installment.totalInstallments}
              </span>
            </div>
            <div className="flex justify-between font-mono-legal">
              <span className="text-slate-400">Fecha de Pago:</span>
              <span className="text-slate-200">{formatDateCL(installment.paidDate || '')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Medio:</span>
              <span className="text-slate-200">{installment.paymentMethod || 'Transferencia'}</span>
            </div>
          </div>

          <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between">
            <span className="font-bold text-slate-100 uppercase tracking-wider text-[11px]">
              Monto Percibido:
            </span>
            <span className="text-xl font-bold font-mono-legal text-emerald-400">
              {formatCurrency(installment.amount, installment.currency)}
            </span>
          </div>

          <div className="pt-3 border-t border-slate-800 text-center text-[10px] text-slate-500">
            Comprobante digital emitido conforme a la ley chilena por BDCM Abogados.
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs cursor-pointer"
          >
            Cerrar
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-md shadow-amber-500/20"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir Recibo</span>
          </button>
        </div>
      </div>
    </div>
  );
};
