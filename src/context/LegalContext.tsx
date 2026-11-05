import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Client,
  LegalCase,
  CaseDeadline,
  Hearing,
  FeeAgreement,
  FeeInstallment,
  LawyerUser,
} from '../types';
import {
  INITIAL_LAWYERS,
  INITIAL_CLIENTS,
  INITIAL_CASES,
  INITIAL_DEADLINES,
  INITIAL_HEARINGS,
  INITIAL_FEE_AGREEMENTS,
  INITIAL_INSTALLMENTS,
} from '../data/initialData';
import { getStoredAccessToken, subscribeToAuthChanges, loginWithGoogle, logoutUser } from '../services/auth';
import { createGoogleCalendarEvent, deleteGoogleCalendarEvent } from '../services/googleCalendar';
import { playAlertSound, sendBrowserNotification } from '../services/notifications';

export type ActiveTab = 'dashboard' | 'cases' | 'clients' | 'deadlines' | 'hearings' | 'fees' | 'tools';

interface LegalContextType {
  // Navigation & Filtering
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  selectedCaseId?: string;
  setSelectedCaseId: (id?: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Data
  clients: Client[];
  cases: LegalCase[];
  deadlines: CaseDeadline[];
  hearings: Hearing[];
  feeAgreements: FeeAgreement[];
  installments: FeeInstallment[];
  lawyers: LawyerUser[];

  // Google Calendar Integration
  googleUser: LawyerUser | null;
  googleAccessToken: string | null;
  isConnectingGoogle: boolean;
  googleSyncMessage: string | null;
  connectGoogle: () => Promise<void>;
  disconnectGoogle: () => Promise<void>;
  syncDeadlineToCalendar: (deadlineId: string) => Promise<boolean>;
  syncHearingToCalendar: (hearingId: string) => Promise<boolean>;
  syncAllToCalendar: () => Promise<void>;

  // Notifications
  notificationsEnabled: boolean;
  enableNotifications: () => Promise<void>;

  // CRUD Actions - Cases
  addCase: (newCase: Omit<LegalCase, 'id' | 'createdAt' | 'updatedAt' | 'timeline'>) => LegalCase;
  updateCase: (id: string, updated: Partial<LegalCase>) => void;
  deleteCase: (id: string) => void;
  addCaseTimelineEvent: (caseId: string, event: { title: string; description: string; actor: string; documentName?: string }) => void;

  // CRUD Actions - Clients
  addClient: (client: Omit<Client, 'id' | 'createdAt'>) => Client;
  updateClient: (id: string, updated: Partial<Client>) => void;
  deleteClient: (id: string) => void;

  // CRUD Actions - Deadlines
  addDeadline: (deadline: Omit<CaseDeadline, 'id' | 'createdAt' | 'status' | 'syncedToCalendar'>) => Promise<CaseDeadline>;
  toggleDeadlineStatus: (id: string) => void;
  deleteDeadline: (id: string) => void;

  // CRUD Actions - Hearings
  addHearing: (hearing: Omit<Hearing, 'id' | 'status' | 'syncedToCalendar'>) => Promise<Hearing>;
  updateHearing: (id: string, updated: Partial<Hearing>) => void;
  deleteHearing: (id: string) => void;

  // CRUD Actions - Fees
  addFeeAgreement: (
    agreement: Omit<FeeAgreement, 'id' | 'createdAt'>,
    installmentsList: Array<{ dueDate: string; amount: number; notes?: string }>
  ) => FeeAgreement;
  registerInstallmentPayment: (
    installmentId: string,
    data: { paidDate: string; paymentMethod: any; receiptFolio?: string; notes?: string }
  ) => void;

  // Backup & Restore
  exportDataJson: () => void;
  importDataJson: (jsonStr: string) => boolean;
  resetAllData: () => void;
}

const STORAGE_KEYS = {
  CLIENTS: 'bdcm_clients_v3',
  CASES: 'bdcm_cases_v3',
  DEADLINES: 'bdcm_deadlines_v3',
  HEARINGS: 'bdcm_hearings_v3',
  AGREEMENTS: 'bdcm_agreements_v3',
  INSTALLMENTS: 'bdcm_installments_v3',
  NOTIFICATIONS: 'bdcm_notifications_v3',
};

const LegalContext = createContext<LegalContextType | undefined>(undefined);

export const LegalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [selectedCaseId, setSelectedCaseId] = useState<string | undefined>();
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Main State loaded from localStorage
  const [clients, setClients] = useState<Client[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CLIENTS);
    return saved ? JSON.parse(saved) : INITIAL_CLIENTS;
  });

  const [cases, setCases] = useState<LegalCase[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CASES);
    return saved ? JSON.parse(saved) : INITIAL_CASES;
  });

  const [deadlines, setDeadlines] = useState<CaseDeadline[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.DEADLINES);
    return saved ? JSON.parse(saved) : INITIAL_DEADLINES;
  });

  const [hearings, setHearings] = useState<Hearing[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.HEARINGS);
    return saved ? JSON.parse(saved) : INITIAL_HEARINGS;
  });

  const [feeAgreements, setFeeAgreements] = useState<FeeAgreement[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.AGREEMENTS);
    return saved ? JSON.parse(saved) : INITIAL_FEE_AGREEMENTS;
  });

  const [installments, setInstallments] = useState<FeeInstallment[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.INSTALLMENTS);
    return saved ? JSON.parse(saved) : INITIAL_INSTALLMENTS;
  });

  const [lawyers] = useState<LawyerUser[]>(INITIAL_LAWYERS);

  // Google Calendar Integration
  const [googleUser, setGoogleUser] = useState<LawyerUser | null>(null);
  const [googleAccessToken, setGoogleAccessToken] = useState<string | null>(() => getStoredAccessToken());
  const [isConnectingGoogle, setIsConnectingGoogle] = useState(false);
  const [googleSyncMessage, setGoogleSyncMessage] = useState<string | null>(null);

  // Desktop Notifications
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(() => {
    return typeof Notification !== 'undefined' && Notification.permission === 'granted';
  });

  // LocalStorage persistence
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CASES, JSON.stringify(cases));
  }, [cases]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DEADLINES, JSON.stringify(deadlines));
  }, [deadlines]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.HEARINGS, JSON.stringify(hearings));
  }, [hearings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.AGREEMENTS, JSON.stringify(feeAgreements));
  }, [feeAgreements]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.INSTALLMENTS, JSON.stringify(installments));
  }, [installments]);

  // Auth subscriber
  useEffect(() => {
    const unsub = subscribeToAuthChanges((user) => {
      setGoogleUser(user);
      const token = getStoredAccessToken();
      setGoogleAccessToken(token);
    });
    return () => unsub();
  }, []);

  // Periodic deadline monitor & alert sound
  useEffect(() => {
    const checkUrgentDeadlines = () => {
      const today = new Date().toISOString().split('T')[0];
      const urgent = deadlines.filter((d) => d.status === 'PENDIENTE' && d.deadlineDate <= today);
      if (urgent.length > 0 && notificationsEnabled) {
        sendBrowserNotification(`⚖️ ¡Alerta BDCM Abogados: ${urgent.length} plazo(s) fatal(es) hoy!`, {
          body: `Revisa la lista de plazos del despacho para evitar preclusión judicial.`,
        });
      }
    };

    checkUrgentDeadlines();
    const interval = setInterval(checkUrgentDeadlines, 1000 * 60 * 30); // every 30 mins
    return () => clearInterval(interval);
  }, [deadlines, notificationsEnabled]);

  // Enable Notifications
  const enableNotifications = async () => {
    if (!('Notification' in window)) {
      alert('Tu navegador no soporta notificaciones de escritorio.');
      return;
    }
    const perm = await Notification.requestPermission();
    if (perm === 'granted') {
      setNotificationsEnabled(true);
      playAlertSound('success');
      sendBrowserNotification('Notificaciones BDCM Abogados Activas', {
        body: 'Te avisaremos oportunamente sobre audiencias telemáticas y vencimientos judiciales fatales.',
      });
    } else {
      setNotificationsEnabled(false);
    }
  };

  // Google Calendar Auth
  const connectGoogle = async () => {
    setIsConnectingGoogle(true);
    try {
      const user = await loginWithGoogle();
      setGoogleUser(user);
      const token = getStoredAccessToken();
      setGoogleAccessToken(token);
      playAlertSound('success');
      showSyncMessage('✓ Conectado a Google Calendar con éxito');
    } catch (err: any) {
      console.error(err);
      alert('Error al conectar Google Calendar: ' + err.message);
    } finally {
      setIsConnectingGoogle(false);
    }
  };

  const disconnectGoogle = async () => {
    await logoutUser();
    setGoogleUser(null);
    setGoogleAccessToken(null);
    showSyncMessage('Google Calendar desconectado');
  };

  const showSyncMessage = (msg: string) => {
    setGoogleSyncMessage(msg);
    setTimeout(() => setGoogleSyncMessage(null), 4500);
  };

  // Sync Deadline to Google Calendar
  const syncDeadlineToCalendar = async (deadlineId: string): Promise<boolean> => {
    const token = googleAccessToken || getStoredAccessToken();
    if (!token) {
      alert('Debes conectar tu cuenta de Google en la barra superior primero.');
      return false;
    }

    const d = deadlines.find((item) => item.id === deadlineId);
    if (!d) return false;

    const caseItem = cases.find((c) => c.id === d.caseId);
    const title = `🚨 [PLAZO FATAL] ${d.title} - ${caseItem?.rol || 'BDCM'}`;
    const desc = `ESTUDIO JURÍDICO BDCM ABOGADOS - CHILE
Causa: ${caseItem?.caratula || 'Sin carátula'}
Tribunal: ${caseItem?.court || 'Tribunal Civil/Laboral'}
ROL: ${caseItem?.rol || 'S/N'}
Tipo de plazo: ${d.daysType} (${d.daysCount || 0} días)
Fatal: ${d.isFatal ? 'SÍ (CPC Art. 64)' : 'No'}
Hora límite: ${d.deadlineTime}
Notas: ${d.notes || 'Revisar OJV Poder Judicial'}`;

    const startDateTime = new Date(`${d.deadlineDate}T09:00:00`).toISOString();
    const endDateTime = new Date(`${d.deadlineDate}T${d.deadlineTime}:00`).toISOString();

    const res = await createGoogleCalendarEvent(token, {
      title,
      description: desc,
      location: caseItem?.court || 'Tribunal respectivo',
      startDateTime,
      endDateTime,
    });

    if (res.success && res.eventId) {
      setDeadlines((prev) =>
        prev.map((item) => (item.id === deadlineId ? { ...item, syncedToCalendar: true, googleEventId: res.eventId } : item))
      );
      playAlertSound('success');
      showSyncMessage(`✓ Plazo "${d.title}" sincronizado con Google Calendar`);
      return true;
    } else {
      alert(`No se pudo agendar en Google Calendar: ${res.error || 'Intente nuevamente'}`);
      return false;
    }
  };

  // Sync Hearing to Google Calendar
  const syncHearingToCalendar = async (hearingId: string): Promise<boolean> => {
    const token = googleAccessToken || getStoredAccessToken();
    if (!token) {
      alert('Debes conectar tu cuenta de Google en la barra superior primero.');
      return false;
    }

    const h = hearings.find((item) => item.id === hearingId);
    if (!h) return false;

    const caseItem = cases.find((c) => c.id === h.caseId);
    const title = `⚖️ [AUDIENCIA] ${h.title} - ${caseItem?.rol || 'BDCM'}`;
    const desc = `AUDIENCIA JUDICIAL - BDCM ABOGADOS
Tipo: ${h.type}
Tribunal / Sala: ${h.courtRoomOrLink}
Modalidad: ${h.modality}
Asistentes: ${h.attendees}
Causa: ${caseItem?.caratula || 'Directorio BDCM'}
Notas: ${h.notes || 'Preparar alegatos y prueba'}`;

    const startDateTime = new Date(`${h.date}T${h.startTime}:00`).toISOString();
    const endDateTime = new Date(`${h.date}T${h.endTime}:00`).toISOString();

    const res = await createGoogleCalendarEvent(token, {
      title,
      description: desc,
      location: h.courtRoomOrLink,
      startDateTime,
      endDateTime,
    });

    if (res.success && res.eventId) {
      setHearings((prev) =>
        prev.map((item) => (item.id === hearingId ? { ...item, syncedToCalendar: true, googleEventId: res.eventId } : item))
      );
      playAlertSound('success');
      showSyncMessage(`✓ Audiencia "${h.title}" sincronizada con Google Calendar`);
      return true;
    } else {
      alert(`No se pudo agendar en Google Calendar: ${res.error || 'Intente nuevamente'}`);
      return false;
    }
  };

  const syncAllToCalendar = async () => {
    const token = googleAccessToken || getStoredAccessToken();
    if (!token) {
      alert('Conecta Google Calendar primero.');
      return;
    }

    let count = 0;
    const unsyncedDeadlines = deadlines.filter((d) => !d.syncedToCalendar && d.status === 'PENDIENTE');
    for (const d of unsyncedDeadlines) {
      await syncDeadlineToCalendar(d.id);
      count++;
    }

    const unsyncedHearings = hearings.filter((h) => !h.syncedToCalendar && h.status === 'PROGRAMADA');
    for (const h of unsyncedHearings) {
      await syncHearingToCalendar(h.id);
      count++;
    }

    showSyncMessage(`✓ ${count} eventos sincronizados con tu Google Calendar`);
  };

  // Case CRUD
  const addCase = (data: Omit<LegalCase, 'id' | 'createdAt' | 'updatedAt' | 'timeline'>): LegalCase => {
    const newCase: LegalCase = {
      ...data,
      id: `case-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      timeline: [
        {
          id: `t-${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          title: 'Apertura de Expediente',
          description: 'Causa registrada en el sistema del despacho BDCM Abogados.',
          actor: data.assignedLawyer,
        },
      ],
    };
    setCases((prev) => [newCase, ...prev]);
    playAlertSound('success');
    return newCase;
  };

  const updateCase = (id: string, updated: Partial<LegalCase>) => {
    setCases((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updated, updatedAt: new Date().toISOString().split('T')[0] } : c))
    );
  };

  const deleteCase = (id: string) => {
    if (confirm('¿Eliminar esta causa judicial y sus registros asociados?')) {
      setCases((prev) => prev.filter((c) => c.id !== id));
      setDeadlines((prev) => prev.filter((d) => d.caseId !== id));
      setHearings((prev) => prev.filter((h) => h.caseId !== id));
      setFeeAgreements((prev) => prev.filter((f) => f.caseId !== id));
      setInstallments((prev) => prev.filter((i) => i.caseId !== id));
      if (selectedCaseId === id) setSelectedCaseId(undefined);
    }
  };

  const addCaseTimelineEvent = (
    caseId: string,
    event: { title: string; description: string; actor: string; documentName?: string }
  ) => {
    setCases((prev) =>
      prev.map((c) => {
        if (c.id !== caseId) return c;
        const newEv = {
          id: `t-${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          ...event,
        };
        return {
          ...c,
          timeline: [newEv, ...c.timeline],
          updatedAt: new Date().toISOString().split('T')[0],
        };
      })
    );
    playAlertSound('notification');
  };

  // Client CRUD
  const addClient = (data: Omit<Client, 'id' | 'createdAt'>): Client => {
    const newClient: Client = {
      ...data,
      id: `cli-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setClients((prev) => [newClient, ...prev]);
    playAlertSound('success');
    return newClient;
  };

  const updateClient = (id: string, updated: Partial<Client>) => {
    setClients((prev) => prev.map((c) => (c.id === id ? { ...c, ...updated } : c)));
  };

  const deleteClient = (id: string) => {
    if (cases.some((c) => c.clientId === id)) {
      alert('No se puede eliminar el cliente porque posee causas judiciales vigentes en el despacho.');
      return;
    }
    if (confirm('¿Eliminar ficha de cliente?')) {
      setClients((prev) => prev.filter((c) => c.id !== id));
    }
  };

  // Deadline CRUD
  const addDeadline = async (
    data: Omit<CaseDeadline, 'id' | 'createdAt' | 'status' | 'syncedToCalendar'>
  ): Promise<CaseDeadline> => {
    const newDl: CaseDeadline = {
      ...data,
      id: `dl-${Date.now()}`,
      status: 'PENDIENTE',
      syncedToCalendar: false,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setDeadlines((prev) => [newDl, ...prev]);
    playAlertSound('urgent');

    // Auto-sync if google calendar connected
    if (googleAccessToken) {
      setTimeout(() => {
        syncDeadlineToCalendar(newDl.id);
      }, 500);
    }
    return newDl;
  };

  const toggleDeadlineStatus = (id: string) => {
    setDeadlines((prev) =>
      prev.map((d) => {
        if (d.id !== id) return d;
        const newStatus = d.status === 'CUMPLIDO' ? 'PENDIENTE' : 'CUMPLIDO';
        return { ...d, status: newStatus };
      })
    );
    playAlertSound('notification');
  };

  const deleteDeadline = (id: string) => {
    setDeadlines((prev) => prev.filter((d) => d.id !== id));
  };

  // Hearing CRUD
  const addHearing = async (
    data: Omit<Hearing, 'id' | 'status' | 'syncedToCalendar'>
  ): Promise<Hearing> => {
    const newHr: Hearing = {
      ...data,
      id: `hr-${Date.now()}`,
      status: 'PROGRAMADA',
      syncedToCalendar: false,
    };
    setHearings((prev) => [newHr, ...prev]);
    playAlertSound('notification');

    if (googleAccessToken) {
      setTimeout(() => {
        syncHearingToCalendar(newHr.id);
      }, 500);
    }
    return newHr;
  };

  const updateHearing = (id: string, updated: Partial<Hearing>) => {
    setHearings((prev) => prev.map((h) => (h.id === id ? { ...h, ...updated } : h)));
  };

  const deleteHearing = (id: string) => {
    setHearings((prev) => prev.filter((h) => h.id !== id));
  };

  // Fees & Installments CRUD
  const addFeeAgreement = (
    data: Omit<FeeAgreement, 'id' | 'createdAt'>,
    installmentsList: Array<{ dueDate: string; amount: number; notes?: string }>
  ): FeeAgreement => {
    const agreementId = `fee-${Date.now()}`;
    const newAgreement: FeeAgreement = {
      ...data,
      id: agreementId,
      installmentsCount: installmentsList.length,
      createdAt: new Date().toISOString().split('T')[0],
    };

    const newInsts: FeeInstallment[] = installmentsList.map((item, idx) => ({
      id: `inst-${Date.now()}-${idx + 1}`,
      feeAgreementId: agreementId,
      caseId: data.caseId,
      clientId: data.clientId,
      installmentNumber: idx + 1,
      totalInstallments: installmentsList.length,
      dueDate: item.dueDate,
      amount: item.amount,
      currency: data.currency,
      status: 'PENDIENTE',
      notes: item.notes,
    }));

    setFeeAgreements((prev) => [newAgreement, ...prev]);
    setInstallments((prev) => [...newInsts, ...prev]);
    playAlertSound('success');
    return newAgreement;
  };

  const registerInstallmentPayment = (
    installmentId: string,
    data: { paidDate: string; paymentMethod: any; receiptFolio?: string; notes?: string }
  ) => {
    setInstallments((prev) =>
      prev.map((inst) =>
        inst.id === installmentId
          ? {
              ...inst,
              status: 'PAGADA',
              paidDate: data.paidDate,
              paymentMethod: data.paymentMethod,
              receiptFolio: data.receiptFolio || `REC-${Math.floor(1000 + Math.random() * 9000)}`,
              notes: data.notes || inst.notes,
            }
          : inst
      )
    );
    playAlertSound('success');
  };

  // Backup & Restore
  const exportDataJson = () => {
    const data = {
      firm: 'BDCM ABOGADOS CHILE',
      exportedAt: new Date().toISOString(),
      clients,
      cases,
      deadlines,
      hearings,
      feeAgreements,
      installments,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `BDCM_ABOGADOS_RESPALDO_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    playAlertSound('success');
  };

  const importDataJson = (jsonStr: string): boolean => {
    try {
      const data = JSON.parse(jsonStr);
      if (!Array.isArray(data.cases) || !Array.isArray(data.clients)) {
        throw new Error('Archivo inválido');
      }
      setClients(data.clients);
      setCases(data.cases);
      setDeadlines(data.deadlines || []);
      setHearings(data.hearings || []);
      setFeeAgreements(data.feeAgreements || []);
      setInstallments(data.installments || []);
      playAlertSound('success');
      return true;
    } catch {
      return false;
    }
  };

  const resetAllData = () => {
    if (confirm('¿Restablecer datos originales del estudio BDCM Abogados? Se perderán cambios no exportados.')) {
      setClients(INITIAL_CLIENTS);
      setCases(INITIAL_CASES);
      setDeadlines(INITIAL_DEADLINES);
      setHearings(INITIAL_HEARINGS);
      setFeeAgreements(INITIAL_FEE_AGREEMENTS);
      setInstallments(INITIAL_INSTALLMENTS);
      localStorage.clear();
      playAlertSound('success');
      alert('Datos de prueba de BDCM Abogados restablecidos.');
    }
  };

  return (
    <LegalContext.Provider
      value={{
        activeTab,
        setActiveTab,
        selectedCaseId,
        setSelectedCaseId,
        searchQuery,
        setSearchQuery,
        clients,
        cases,
        deadlines,
        hearings,
        feeAgreements,
        installments,
        lawyers,
        googleUser,
        googleAccessToken,
        isConnectingGoogle,
        googleSyncMessage,
        connectGoogle,
        disconnectGoogle,
        syncDeadlineToCalendar,
        syncHearingToCalendar,
        syncAllToCalendar,
        notificationsEnabled,
        enableNotifications,
        addCase,
        updateCase,
        deleteCase,
        addCaseTimelineEvent,
        addClient,
        updateClient,
        deleteClient,
        addDeadline,
        toggleDeadlineStatus,
        deleteDeadline,
        addHearing,
        updateHearing,
        deleteHearing,
        addFeeAgreement,
        registerInstallmentPayment,
        exportDataJson,
        importDataJson,
        resetAllData,
      }}
    >
      {children}
    </LegalContext.Provider>
  );
};

export const useLegal = () => {
  const context = useContext(LegalContext);
  if (!context) {
    throw new Error('useLegal must be used within LegalProvider');
  }
  return context;
};
