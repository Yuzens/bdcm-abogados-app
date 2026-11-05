export type ClientType = 'PERSONA_NATURAL' | 'PERSONA_JURIDICA';

export interface Client {
  id: string;
  rut: string;
  name: string;
  clientType: ClientType;
  email: string;
  phone: string;
  address: string;
  commune: string;
  region: string;
  representativeName?: string;
  representativeRut?: string;
  notes?: string;
  createdAt: string;
}

export type CourtType =
  | 'CIVIL'
  | 'LABORAL'
  | 'FAMILIA'
  | 'GARANTIA'
  | 'TOP'
  | 'CORTE_APELACIONES'
  | 'CORTE_SUPREMA'
  | 'POLICIA_LOCAL'
  | 'ARBITRAL';

export type LegalSubject =
  | 'Civil'
  | 'Laboral'
  | 'Familia'
  | 'Penal'
  | 'Comercial'
  | 'Inmobiliario'
  | 'Policía Local'
  | 'Constitucional'
  | 'Cobranza Judicial'
  | 'Corporativo';

export type ClientRole =
  | 'DEMANDANTE'
  | 'DEMANDADO'
  | 'QUERELLANTE'
  | 'IMPUTADO'
  | 'RECURRENTE'
  | 'RECURRIDO'
  | 'SOLICITANTE'
  | 'TERCERO';

export type CaseStatus =
  | 'TRAMITACION'
  | 'CITACION_SENTENCIA'
  | 'EN_ACUERDO'
  | 'SUSPENDIDA'
  | 'APELACION'
  | 'ARCHIVADA'
  | 'TERMINADA';

export interface CaseEvent {
  id: string;
  date: string;
  title: string;
  description: string;
  actor: string;
  documentName?: string;
}

export interface LegalCase {
  id: string;
  rol: string;
  caratula: string;
  court: string;
  courtType: CourtType;
  subject: LegalSubject;
  clientId: string;
  clientRole: ClientRole;
  opposingParty: string;
  opposingLawyer?: string;
  status: CaseStatus;
  assignedLawyer: string;
  currency: 'CLP' | 'UF';
  amount?: number;
  pjudLink?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  timeline: CaseEvent[];
}

export type DeadlineDaysType = 'HABILES_CIVIL' | 'HABILES_LABORAL' | 'CORRIDOS';

export interface CaseDeadline {
  id: string;
  caseId: string;
  title: string;
  deadlineDate: string;
  deadlineTime: string;
  isFatal: boolean;
  daysType: DeadlineDaysType;
  daysCount?: number;
  status: 'PENDIENTE' | 'CUMPLIDO' | 'VENCIDO';
  priority: 'ALTA' | 'MEDIA' | 'BAJA';
  alertDaysBefore: number;
  notes?: string;
  syncedToCalendar?: boolean;
  googleEventId?: string;
  createdAt: string;
}

export type HearingType =
  | 'PREPARATORIA'
  | 'JUICIO_ORAL'
  | 'CONCILIACION'
  | 'MEDIDAS_CAUTELARES'
  | 'ALEGATOS'
  | 'REUNION_CLIENTE'
  | 'DECLARACION'
  | 'OTRA';

export interface Hearing {
  id: string;
  caseId?: string;
  title: string;
  type: HearingType;
  date: string;
  startTime: string;
  endTime: string;
  modality: 'PRESENCIAL' | 'TELEMATICA_ZOOM' | 'GOOGLE_MEET' | 'OTRA';
  courtRoomOrLink: string;
  attendees: string;
  notes?: string;
  status: 'PROGRAMADA' | 'REALIZADA' | 'SUSPENDIDA' | 'CANCELADA';
  syncedToCalendar?: boolean;
  googleEventId?: string;
}

export type FeeType = 'FIJO' | 'CUOTA_LITIS' | 'MIXTO' | 'MENSUAL';

export interface FeeAgreement {
  id: string;
  caseId: string;
  clientId: string;
  feeType: FeeType;
  currency: 'CLP' | 'UF';
  totalAmount: number;
  installmentsCount: number;
  notes?: string;
  createdAt: string;
}

export interface FeeInstallment {
  id: string;
  feeAgreementId: string;
  caseId: string;
  clientId: string;
  installmentNumber: number;
  totalInstallments: number;
  dueDate: string;
  amount: number;
  currency: 'CLP' | 'UF';
  status: 'PENDIENTE' | 'PAGADA' | 'ATRASADA';
  paidDate?: string;
  paymentMethod?: 'TRANSFERENCIA' | 'VALE_VISTA' | 'CHEQUE' | 'WEBPAY' | 'EFECTIVO';
  receiptFolio?: string;
  notes?: string;
}

export interface LawyerUser {
  id: string;
  name: string;
  email: string;
  role: string;
  rut?: string;
  avatarColor?: string;
}
