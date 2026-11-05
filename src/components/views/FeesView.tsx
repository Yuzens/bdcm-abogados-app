import React, { useState } from 'react';
import { useLegal } from '../../context/LegalContext';
import {
  DollarSign,
  Plus,
  Receipt,
  CheckCircle,
  Clock,
  AlertCircle,
  FileText,
  User,
  Filter,
} from 'lucide-react';
import { formatCurrency, formatDateCL } from '../../utils/chileanLegal';
import { FeeInstallment } from '../../types';

interface Props {
  onOpenNewFee: () => void;
  onOpenRegisterPayment: (installment: FeeInstallment) => void;
  onOpenReceipt: (installment: FeeInstallment) => void;
}

export const FeesView: React.FC<Props> = ({
  onOpenNewFee,
  onOpenRegisterPayment,
  onOpenReceipt,
}) => {
  const { feeAgreements, installments, cases, clients } = useLegal();

  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  const filteredInstallments = installments.filter((inst) => {
    if (filterStatus !== 'ALL' && inst.status !== filterStatus) return false;
    return true;
  }).sort((a, b) => a.dueDate.localeCompare(b.dueDate));

  // Calculations
  const pendingCLP = installments
    .filter((i) => i.status !== 'PAGADA' && i.currency === 'CLP')
    .reduce((acc, i) => acc + i.amount, 0);

  const paidCLP = installments
    .filter((i) => i.status === 'PAGADA' && i.currency === 'CLP')
    .reduce((acc, i) => acc + i.amount, 0);

  const pendingUF = installments
    .filter((i) => i.status !== 'PAGADA' && i.currency === 'UF')
    .reduce((acc, i) => acc + i.amount, 0);

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-legal-heading text-slate-100 flex items-center gap-2.5">
            <DollarSign className="w-6 h-6 text-amber-400" />
            Honorarios, Cobranzas & Cuotas
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Convenios de honorarios (fijo, cuota litis, mixto), cuotas en CLP y UF y emisión de recibos
          </p>
        </div>

        <button
          onClick={onOpenNewFee}
          className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2 self-start cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ Pactar Convenio Honorarios</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
          <span className="text-xs text-slate-400 block font-medium">Por Cobrar (Pendiente CLP):</span>
          <div className="text-2xl font-bold text-amber-400 font-mono-legal mt-1">
            {formatCurrency(pendingCLP, 'CLP')}
          </div>
          {pendingUF > 0 && (
            <span className="text-xs text-slate-400 font-mono-legal mt-1 block">
              + {pendingUF} UF pendientes
            </span>
          )}
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
          <span className="text-xs text-slate-400 block font-medium">Recaudado (Pagado CLP):</span>
          <div className="text-2xl font-bold text-emerald-400 font-mono-legal mt-1">
            {formatCurrency(paidCLP, 'CLP')}
          </div>
          <span className="text-xs text-slate-400 mt-1 block">Registrado en contabilidad</span>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
          <span className="text-xs text-slate-400 block font-medium">Convenios Activos:</span>
          <div className="text-2xl font-bold text-slate-100 font-mono-legal mt-1">
            {feeAgreements.length}
          </div>
          <span className="text-xs text-slate-400 mt-1 block">
            {installments.length} cuotas programadas
          </span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 bg-slate-900/80 p-1.5 rounded-xl border border-slate-800 w-fit">
        <button
          onClick={() => setFilterStatus('ALL')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
            filterStatus === 'ALL' ? 'bg-slate-800 text-slate-200' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Todas ({installments.length})
        </button>
        <button
          onClick={() => setFilterStatus('PENDIENTE')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
            filterStatus === 'PENDIENTE'
              ? 'bg-amber-500 text-slate-950 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Pendientes ({installments.filter((i) => i.status === 'PENDIENTE').length})
        </button>
        <button
          onClick={() => setFilterStatus('ATRASADA')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
            filterStatus === 'ATRASADA'
              ? 'bg-rose-500 text-white font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Atrasadas ({installments.filter((i) => i.status === 'ATRASADA').length})
        </button>
        <button
          onClick={() => setFilterStatus('PAGADA')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
            filterStatus === 'PAGADA'
              ? 'bg-emerald-600 text-white font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Pagadas ({installments.filter((i) => i.status === 'PAGADA').length})
        </button>
      </div>

      {/* Installments Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Cuota / Convenio</th>
                <th className="px-4 py-3">Causa & Cliente</th>
                <th className="px-4 py-3">Vencimiento</th>
                <th className="px-4 py-3">Monto</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredInstallments.map((inst) => {
                const caseItem = cases.find((c) => c.id === inst.caseId);
                const client = clients.find((cli) => cli.id === inst.clientId);
                const isPaid = inst.status === 'PAGADA';
                const isOverdue = inst.status === 'ATRASADA';

                return (
                  <tr key={inst.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-bold text-slate-200">
                        Cuota {inst.installmentNumber} de {inst.totalInstallments}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-slate-200 line-clamp-1">{client?.name}</p>
                      <span className="text-[11px] text-amber-400 font-mono-legal">
                        {caseItem?.rol || 'Convenio general'}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono-legal text-slate-300">
                      {formatDateCL(inst.dueDate)}
                    </td>
                    <td className="px-4 py-3 font-mono-legal font-bold text-slate-100">
                      {formatCurrency(inst.amount, inst.currency)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                          isPaid
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : isOverdue
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                        }`}
                      >
                        {inst.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {isPaid ? (
                        <button
                          onClick={() => onOpenReceipt(inst)}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[11px] font-semibold flex items-center gap-1 ml-auto cursor-pointer border border-slate-700"
                        >
                          <Receipt className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Recibo</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => onOpenRegisterPayment(inst)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 ml-auto cursor-pointer shadow-xs"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Registrar Pago</span>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
