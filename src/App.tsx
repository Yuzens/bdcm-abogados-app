import React, { useState } from 'react';
import { LegalProvider, useLegal } from './context/LegalContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/views/DashboardView';
import { CasesView } from './components/views/CasesView';
import { ClientsView } from './components/views/ClientsView';
import { DeadlinesView } from './components/views/DeadlinesView';
import { HearingsView } from './components/views/HearingsView';
import { FeesView } from './components/views/FeesView';
import { ToolsView } from './components/views/ToolsView';

// Modals
import { NewCaseModal } from './components/modals/NewCaseModal';
import { NewClientModal } from './components/modals/NewClientModal';
import { NewDeadlineModal } from './components/modals/NewDeadlineModal';
import { NewHearingModal } from './components/modals/NewHearingModal';
import { NewFeeAgreementModal } from './components/modals/NewFeeAgreementModal';
import { RegisterPaymentModal } from './components/modals/RegisterPaymentModal';
import { ReceiptModal } from './components/modals/ReceiptModal';
import { FeeInstallment } from './types';

import {
  LayoutDashboard,
  Briefcase,
  Users,
  Clock,
  Calendar,
  DollarSign,
  Wrench,
  Calculator,
} from 'lucide-react';

function AppContent() {
  const { activeTab, setActiveTab } = useLegal();

  // Mobile menu
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Modals visibility
  const [isNewCaseOpen, setIsNewCaseOpen] = useState(false);
  const [isNewClientOpen, setIsNewClientOpen] = useState(false);
  const [isNewDeadlineOpen, setIsNewDeadlineOpen] = useState(false);
  const [isNewHearingOpen, setIsNewHearingOpen] = useState(false);
  const [isNewFeeOpen, setIsNewFeeOpen] = useState(false);

  // Modals with preselection
  const [preselectedCaseId, setPreselectedCaseId] = useState<string | undefined>();
  const [preselectedClientId, setPreselectedClientId] = useState<string | undefined>();
  const [activePaymentInstallment, setActivePaymentInstallment] = useState<FeeInstallment | null>(null);
  const [activeReceiptInstallment, setActiveReceiptInstallment] = useState<FeeInstallment | null>(null);

  // Handlers
  const handleOpenNewCaseForClient = (clientId: string) => {
    setPreselectedClientId(clientId);
    setIsNewCaseOpen(true);
  };

  const handleOpenNewDeadlineForCase = (caseId?: string) => {
    setPreselectedCaseId(caseId);
    setIsNewDeadlineOpen(true);
  };

  const handleOpenNewHearingForCase = (caseId?: string) => {
    setPreselectedCaseId(caseId);
    setIsNewHearingOpen(true);
  };

  const handleOpenNewFeeForCase = (caseId?: string) => {
    setPreselectedCaseId(caseId);
    setIsNewFeeOpen(true);
  };

  const handleOpenDeadlineFromCalculator = (date: string, type: any, days: number) => {
    setIsNewDeadlineOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Barra de Navegación Superior */}
      <Navbar
        onOpenNewCase={() => {
          setPreselectedClientId(undefined);
          setIsNewCaseOpen(true);
        }}
        onOpenNewClient={() => setIsNewClientOpen(true)}
        onOpenNewDeadline={() => {
          setPreselectedCaseId(undefined);
          setIsNewDeadlineOpen(true);
        }}
        onOpenNewHearing={() => {
          setPreselectedCaseId(undefined);
          setIsNewHearingOpen(true);
        }}
        onOpenNewFee={() => {
          setPreselectedCaseId(undefined);
          setIsNewFeeOpen(true);
        }}
        toggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        isMobileMenuOpen={isMobileMenuOpen}
      />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Barra Lateral de Escritorio (Desktop) */}
        <div className="hidden lg:block">
          <Sidebar />
        </div>

        {/* Cajón Lateral Móvil */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div
              className="fixed inset-0 bg-black/70 backdrop-blur-xs"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <div className="relative w-64 bg-slate-950 h-full shadow-2xl z-10 animate-in slide-in-from-left duration-200">
              <Sidebar onCloseMobile={() => setIsMobileMenuOpen(false)} />
            </div>
          </div>
        )}

        {/* Área Principal de Contenido */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 max-w-full overflow-y-auto">
          {activeTab === 'dashboard' && (
            <DashboardView
              onOpenNewCase={() => setIsNewCaseOpen(true)}
              onOpenNewClient={() => setIsNewClientOpen(true)}
              onOpenNewDeadline={() => setIsNewDeadlineOpen(true)}
              onOpenNewHearing={() => setIsNewHearingOpen(true)}
              onOpenNewFee={() => setIsNewFeeOpen(true)}
            />
          )}

          {activeTab === 'cases' && (
            <CasesView
              onOpenNewCase={() => {
                setPreselectedClientId(undefined);
                setIsNewCaseOpen(true);
              }}
              onOpenNewDeadline={handleOpenNewDeadlineForCase}
              onOpenNewHearing={handleOpenNewHearingForCase}
              onOpenNewFee={handleOpenNewFeeForCase}
            />
          )}

          {activeTab === 'clients' && (
            <ClientsView
              onOpenNewClient={() => setIsNewClientOpen(true)}
              onOpenNewCaseForClient={handleOpenNewCaseForClient}
            />
          )}

          {activeTab === 'deadlines' && (
            <DeadlinesView
              onOpenNewDeadline={() => {
                setPreselectedCaseId(undefined);
                setIsNewDeadlineOpen(true);
              }}
              onOpenCalculator={() => setActiveTab('tools')}
            />
          )}

          {activeTab === 'hearings' && (
            <HearingsView
              onOpenNewHearing={() => {
                setPreselectedCaseId(undefined);
                setIsNewHearingOpen(true);
              }}
            />
          )}

          {activeTab === 'fees' && (
            <FeesView
              onOpenNewFee={() => {
                setPreselectedCaseId(undefined);
                setIsNewFeeOpen(true);
              }}
              onOpenRegisterPayment={(inst) => setActivePaymentInstallment(inst)}
              onOpenReceipt={(inst) => setActiveReceiptInstallment(inst)}
            />
          )}

          {activeTab === 'tools' && (
            <ToolsView onOpenNewDeadlineWithDate={handleOpenDeadlineFromCalculator} />
          )}
        </main>
      </div>

      {/* Barra de Navegación Inferior para Móviles */}
      <nav className="lg:hidden sticky bottom-0 z-30 bg-slate-950/95 backdrop-blur-md border-t border-slate-800 flex items-center justify-around py-2 px-1">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center gap-1 p-1.5 rounded-lg text-[10px] font-medium transition-colors ${
            activeTab === 'dashboard' ? 'text-amber-400 font-bold' : 'text-slate-400'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Escritorio</span>
        </button>

        <button
          onClick={() => setActiveTab('cases')}
          className={`flex flex-col items-center gap-1 p-1.5 rounded-lg text-[10px] font-medium transition-colors ${
            activeTab === 'cases' ? 'text-amber-400 font-bold' : 'text-slate-400'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>Causas</span>
        </button>

        <button
          onClick={() => setActiveTab('deadlines')}
          className={`flex flex-col items-center gap-1 p-1.5 rounded-lg text-[10px] font-medium transition-colors ${
            activeTab === 'deadlines' ? 'text-rose-400 font-bold' : 'text-slate-400'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Plazos</span>
        </button>

        <button
          onClick={() => setActiveTab('hearings')}
          className={`flex flex-col items-center gap-1 p-1.5 rounded-lg text-[10px] font-medium transition-colors ${
            activeTab === 'hearings' ? 'text-blue-400 font-bold' : 'text-slate-400'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Agenda</span>
        </button>

        <button
          onClick={() => setActiveTab('fees')}
          className={`flex flex-col items-center gap-1 p-1.5 rounded-lg text-[10px] font-medium transition-colors ${
            activeTab === 'fees' ? 'text-emerald-400 font-bold' : 'text-slate-400'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Cuotas</span>
        </button>

        <button
          onClick={() => setActiveTab('tools')}
          className={`flex flex-col items-center gap-1 p-1.5 rounded-lg text-[10px] font-medium transition-colors ${
            activeTab === 'tools' ? 'text-amber-400 font-bold' : 'text-slate-400'
          }`}
        >
          <Calculator className="w-4 h-4" />
          <span>Calculadora</span>
        </button>
      </nav>

      {/* Modales Globales */}
      <NewCaseModal
        isOpen={isNewCaseOpen}
        onClose={() => setIsNewCaseOpen(false)}
        preselectedClientId={preselectedClientId}
      />

      <NewClientModal
        isOpen={isNewClientOpen}
        onClose={() => setIsNewClientOpen(false)}
      />

      <NewDeadlineModal
        isOpen={isNewDeadlineOpen}
        onClose={() => setIsNewDeadlineOpen(false)}
        preselectedCaseId={preselectedCaseId}
      />

      <NewHearingModal
        isOpen={isNewHearingOpen}
        onClose={() => setIsNewHearingOpen(false)}
        preselectedCaseId={preselectedCaseId}
      />

      <NewFeeAgreementModal
        isOpen={isNewFeeOpen}
        onClose={() => setIsNewFeeOpen(false)}
        preselectedCaseId={preselectedCaseId}
      />

      <RegisterPaymentModal
        installment={activePaymentInstallment}
        onClose={() => setActivePaymentInstallment(null)}
        onReceiptOpen={(inst) => setActiveReceiptInstallment(inst)}
      />

      <ReceiptModal
        installment={activeReceiptInstallment}
        onClose={() => setActiveReceiptInstallment(null)}
      />
    </div>
  );
}

export default function App() {
  return (
    <LegalProvider>
      <AppContent />
    </LegalProvider>
  );
}
