import React, { useState } from 'react';
import { useLegal } from '../context/LegalContext';
import {
  Scale,
  Search,
  Calendar,
  Bell,
  BellOff,
  Plus,
  UserCheck,
  FileText,
  Clock,
  DollarSign,
  Menu,
  X,
  LogOut,
  ExternalLink,
  ChevronDown,
  Calculator,
} from 'lucide-react';

interface Props {
  onOpenNewCase: () => void;
  onOpenNewClient: () => void;
  onOpenNewDeadline: () => void;
  onOpenNewHearing: () => void;
  onOpenNewFee: () => void;
  toggleMobileMenu: () => void;
  isMobileMenuOpen: boolean;
}

export const Navbar: React.FC<Props> = ({
  onOpenNewCase,
  onOpenNewClient,
  onOpenNewDeadline,
  onOpenNewHearing,
  onOpenNewFee,
  toggleMobileMenu,
  isMobileMenuOpen,
}) => {
  const {
    searchQuery,
    setSearchQuery,
    googleUser,
    isConnectingGoogle,
    connectGoogle,
    disconnectGoogle,
    notificationsEnabled,
    enableNotifications,
    deadlines,
    hearings,
    googleSyncMessage,
    setActiveTab,
  } = useLegal();

  const [showQuickMenu, setShowQuickMenu] = useState(false);
  const [showGoogleDropdown, setShowGoogleDropdown] = useState(false);

  // Contar urgentes
  const todayStr = new Date().toISOString().split('T')[0];
  const urgentCount = deadlines.filter((d) => d.status === 'PENDIENTE' && d.deadlineDate <= todayStr).length;

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Despacho */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleMobileMenu}
              className="lg:hidden p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 rounded-lg"
              aria-label="Abrir menú"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 via-amber-600/10 to-slate-900 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-sm shadow-amber-500/10">
                <Scale className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold font-legal-heading tracking-wide text-slate-100">
                    BDCM <span className="text-amber-400">ABOGADOS</span>
                  </span>
                  <span className="hidden sm:inline-block px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/20">
                    Chile
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 hidden sm:block">
                  Gestión Judicial & Litigios Estratégicos
                </p>
              </div>
            </div>
          </div>

          {/* Buscador Global */}
          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por ROL, carátula, tribunal, cliente o RUT..."
                className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-hidden focus:border-amber-400/80 focus:ring-1 focus:ring-amber-400/20 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-200"
                >
                  Limpiar
                </button>
              )}
            </div>
          </div>

          {/* Acciones Rápidas & Conexión Google Calendar */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Notificaciones */}
            <button
              onClick={enableNotifications}
              title={notificationsEnabled ? 'Notificaciones automáticas activas' : 'Activar notificaciones de plazos'}
              className={`p-2 rounded-xl border transition-colors relative cursor-pointer ${
                notificationsEnabled
                  ? 'bg-slate-900 border-slate-700 text-amber-400 hover:bg-slate-800'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {notificationsEnabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
              {urgentCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-pulse">
                  {urgentCount}
                </span>
              )}
            </button>

            {/* Acceso directo a Calculadora de Plazos */}
            <button
              onClick={() => setActiveTab('tools')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-amber-500/40 rounded-xl text-xs font-semibold text-slate-300 hover:text-amber-300 transition-all cursor-pointer"
              title="Abrir Calculadora de Plazos Judiciales (CPC y Laboral)"
            >
              <Calculator className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Calculadora</span>
            </button>

            {/* Google Calendar Auth Button */}
            {googleUser ? (
              <div className="relative">
                <button
                  onClick={() => setShowGoogleDropdown(!showGoogleDropdown)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-emerald-500/40 rounded-xl text-xs text-slate-200 hover:border-emerald-400 transition-colors cursor-pointer"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="hidden sm:inline font-medium text-slate-300">Calendar Conectado</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {showGoogleDropdown && (
                  <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-700 rounded-xl shadow-xl p-3 space-y-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                    <div className="border-b border-slate-800 pb-2">
                      <p className="text-xs font-semibold text-slate-200">{googleUser.name || 'Abogado BDCM'}</p>
                      <p className="text-[11px] text-slate-400 truncate">{googleUser.email}</p>
                      <span className="inline-block mt-1 text-[10px] text-emerald-400 font-medium">
                        ✓ Sincronización Google Calendar activa
                      </span>
                    </div>

                    <a
                      href="https://calendar.google.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-slate-300 hover:bg-slate-800 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
                      Abrir Google Calendar Web
                    </a>

                    <button
                      onClick={() => {
                        setShowGoogleDropdown(false);
                        disconnectGoogle();
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Desconectar Google
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Botón oficial Sign in with Google */
              <button
                onClick={connectGoogle}
                disabled={isConnectingGoogle}
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-amber-500/50 rounded-xl text-xs font-medium text-slate-200 shadow-xs transition-all cursor-pointer"
                title="Sincroniza audiencias y plazos fatales con tu cuenta de Google"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span className="hidden sm:inline">
                  {isConnectingGoogle ? 'Conectando...' : 'Conectar Google'}
                </span>
              </button>
            )}

            {/* Botón "+ Nuevo" Desplegable */}
            <div className="relative">
              <button
                onClick={() => setShowQuickMenu(!showQuickMenu)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-bold rounded-xl shadow-md shadow-amber-500/20 transition-all cursor-pointer"
                title="Agregar nuevo registro al despacho"
              >
                <Plus className="w-4 h-4" />
                <span>+ Nuevo</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              {showQuickMenu && (
                <div className="absolute right-0 mt-2 w-52 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <button
                    onClick={() => {
                      setShowQuickMenu(false);
                      onOpenNewCase();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-200 hover:bg-slate-800 text-left transition-colors cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5 text-amber-400" />
                    + Nueva Causa Judicial
                  </button>
                  <button
                    onClick={() => {
                      setShowQuickMenu(false);
                      onOpenNewClient();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-200 hover:bg-slate-800 text-left transition-colors cursor-pointer"
                  >
                    <UserCheck className="w-3.5 h-3.5 text-blue-400" />
                    Nuevo Cliente
                  </button>
                  <button
                    onClick={() => {
                      setShowQuickMenu(false);
                      onOpenNewDeadline();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-200 hover:bg-slate-800 text-left transition-colors cursor-pointer"
                  >
                    <Clock className="w-3.5 h-3.5 text-rose-400" />
                    Nuevo Plazo Fatal
                  </button>
                  <button
                    onClick={() => {
                      setShowQuickMenu(false);
                      onOpenNewHearing();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-200 hover:bg-slate-800 text-left transition-colors cursor-pointer"
                  >
                    <Calendar className="w-3.5 h-3.5 text-purple-400" />
                    Nueva Audiencia
                  </button>
                  <button
                    onClick={() => {
                      setShowQuickMenu(false);
                      onOpenNewFee();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-200 hover:bg-slate-800 text-left transition-colors cursor-pointer"
                  >
                    <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                    + Convenio Honorarios
                  </button>
                  <div className="border-t border-slate-800 my-1"></div>
                  <button
                    onClick={() => {
                      setShowQuickMenu(false);
                      setActiveTab('tools');
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-amber-300 hover:bg-slate-800 text-left transition-colors cursor-pointer"
                  >
                    <Calculator className="w-3.5 h-3.5" />
                    Calculadora de Plazos
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Notificación temporal de sincronización */}
        {googleSyncMessage && (
          <div className="py-1 px-4 bg-emerald-500/10 border-t border-emerald-500/20 text-center text-xs text-emerald-300">
            {googleSyncMessage}
          </div>
        )}
      </div>
    </header>
  );
};
