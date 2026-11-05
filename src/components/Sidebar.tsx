import React from 'react';
import { useLegal, ActiveTab } from '../context/LegalContext';
import {
  LayoutDashboard,
  Briefcase,
  Users,
  Clock,
  Calendar,
  DollarSign,
  Wrench,
  Scale,
  Shield,
  FileText,
  Calculator,
} from 'lucide-react';
import { getDaysRemaining } from '../utils/chileanLegal';

interface SidebarProps {
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onCloseMobile }) => {
  const { activeTab, setActiveTab, cases, deadlines, hearings, installments, clients } = useLegal();

  const todayStr = new Date().toISOString().split('T')[0];

  // Counters
  const activeCasesCount = cases.filter((c) => c.status !== 'TERMINADA' && c.status !== 'ARCHIVADA').length;
  const urgentDeadlinesCount = deadlines.filter(
    (d) => d.status === 'PENDIENTE' && (d.deadlineDate <= todayStr || getDaysRemaining(d.deadlineDate) <= 3)
  ).length;
  const upcomingHearingsCount = hearings.filter((h) => h.status === 'PROGRAMADA' && h.date >= todayStr).length;
  const pendingInstallmentsCount = installments.filter((i) => i.status !== 'PAGADA').length;

  const navItems: Array<{
    id: ActiveTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    count?: number;
    badgeColor?: string;
  }> = [
    {
      id: 'dashboard',
      label: 'Panel Principal',
      icon: LayoutDashboard,
    },
    {
      id: 'cases',
      label: 'Causas Judiciales',
      icon: Briefcase,
      count: activeCasesCount,
    },
    {
      id: 'clients',
      label: 'Clientes & Fichas',
      icon: Users,
      count: clients.length,
    },
    {
      id: 'deadlines',
      label: 'Plazos Fatales',
      icon: Clock,
      count: urgentDeadlinesCount,
      badgeColor: 'bg-rose-500 text-white',
    },
    {
      id: 'hearings',
      label: 'Audiencias & Citas',
      icon: Calendar,
      count: upcomingHearingsCount,
      badgeColor: 'bg-blue-500 text-white',
    },
    {
      id: 'fees',
      label: 'Honorarios & Cuotas',
      icon: DollarSign,
      count: pendingInstallmentsCount,
    },
    {
      id: 'tools',
      label: 'Calculadora & Herramientas',
      icon: Calculator,
    },
  ];

  const handleSelectTab = (tab: ActiveTab) => {
    setActiveTab(tab);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <aside className="w-64 border-r border-slate-800 bg-slate-950 p-4 flex flex-col justify-between h-[calc(100vh-4rem)] sticky top-16 select-none">
      <div className="space-y-6">
        {/* Despacho Tag */}
        <div className="px-3 py-2.5 rounded-xl bg-gradient-to-r from-amber-500/10 via-slate-900 to-slate-900 border border-amber-500/20">
          <div className="flex items-center gap-2 text-amber-400">
            <Scale className="w-4 h-4" />
            <span className="text-xs font-bold font-legal-heading tracking-wide">BDCM ABOGADOS</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Santiago, Chile • PJUD OJV</p>
        </div>

        {/* Navigation list */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>

                {typeof item.count === 'number' && item.count > 0 && (
                  <span
                    className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono-legal font-bold ${
                      item.badgeColor || 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Info */}
      <div className="pt-4 border-t border-slate-800 space-y-2">
        <div className="p-3 bg-slate-900/60 border border-slate-800/80 rounded-xl text-[11px] space-y-1">
          <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span>Sistema Conforme a Ley</span>
          </div>
          <p className="text-[10px] text-slate-500 leading-tight">
            Cómputos ajustados al Código de Procedimiento Civil chileno (Ley 1.552).
          </p>
        </div>

        <div className="text-[10px] text-slate-400 text-center font-mono-legal">
          v2.4.0 • Despacho BDCM Chile
        </div>
      </div>
    </aside>
  );
};
