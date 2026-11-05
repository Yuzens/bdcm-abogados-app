// Utilidades legales para el ejercicio del derecho en Chile

export function validateRut(rut: string): boolean {
  if (!rut || typeof rut !== 'string') return false;
  
  const cleanRut = rut.replace(/[^0-9kK]/g, '').toUpperCase();
  if (cleanRut.length < 2) return false;

  const body = cleanRut.slice(0, -1);
  const dv = cleanRut.slice(-1);

  if (!/^\d+$/.test(body)) return false;

  let sum = 0;
  let multiplier = 2;

  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body[i], 10) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }

  const expectedDvNumber = 11 - (sum % 11);
  let expectedDv = '';
  if (expectedDvNumber === 11) expectedDv = '0';
  else if (expectedDvNumber === 10) expectedDv = 'K';
  else expectedDv = expectedDvNumber.toString();

  return dv === expectedDv;
}

export function formatRut(rut: string): string {
  if (!rut) return '';
  const clean = rut.replace(/[^0-9kK]/g, '').toUpperCase();
  if (clean.length < 2) return clean;

  const dv = clean.slice(-1);
  const body = clean.slice(0, -1);

  let formattedBody = '';
  for (let i = body.length - 1, j = 1; i >= 0; i--, j++) {
    formattedBody = body[i] + formattedBody;
    if (j % 3 === 0 && i !== 0) {
      formattedBody = '.' + formattedBody;
    }
  }

  return `${formattedBody}-${dv}`;
}

export const validateRutCL = validateRut;
export const formatRutCL = formatRut;

export const REGIONS_CHILE = [
  'Arica y Parinacota',
  'Tarapacá',
  'Antofagasta',
  'Atacama',
  'Coquimbo',
  'Valparaíso',
  'Región Metropolitana',
  'O’Higgins',
  'Maule',
  'Ñuble',
  'Biobío',
  'La Araucanía',
  'Los Ríos',
  'Los Lagos',
  'Aysén',
  'Magallanes y Antártica Chilena',
];

export const CHILEAN_HOLIDAYS_FIXED = [
  '01-01', // Año Nuevo
  '05-01', // Día del Trabajador
  '05-21', // Glorias Navales
  '06-20', // Día Nacional de los Pueblos Indígenas
  '06-29', // San Pedro y San Pablo
  '07-16', // Virgen del Carmen
  '08-15', // Asunción de la Virgen
  '09-18', // Fiestas Patrias
  '09-19', // Glorias del Ejército
  '09-20', // Festivo adicional fiestas patrias
  '10-12', // Encuentro de Dos Mundos
  '10-31', // Día de las Iglesias Evangélicas y Protestantes
  '11-01', // Día de Todos los Santos
  '12-08', // Inmaculada Concepción
  '12-25', // Navidad
];

export const SPECIFIC_HOLIDAYS_LIST = [
  '2024-03-29', '2024-03-30',
  '2025-04-18', '2025-04-19',
  '2026-04-03', '2026-04-04',
  '2027-03-26', '2027-03-27',
];

export function isHolidayInChile(date: Date): boolean {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const dateStr = `${yyyy}-${mm}-${dd}`;
  const monthDay = `${mm}-${dd}`;

  if (CHILEAN_HOLIDAYS_FIXED.includes(monthDay)) return true;
  if (SPECIFIC_HOLIDAYS_LIST.includes(dateStr)) return true;
  return false;
}

export function calculateLegalDeadline(
  startDateStr: string,
  daysCount: number,
  type: 'HABILES_CIVIL' | 'HABILES_LABORAL' | 'CORRIDOS'
): { deadlineDate: string; breakdown: string[] } {
  const [year, month, day] = startDateStr.split('-').map(Number);
  const currentDate = new Date(year, month - 1, day);
  currentDate.setDate(currentDate.getDate() + 1);

  const breakdown: string[] = [];
  let countedDays = 0;

  if (type === 'CORRIDOS') {
    while (countedDays < daysCount) {
      const isSun = currentDate.getDay() === 0;
      const isHol = isHolidayInChile(currentDate);
      const dateStr = currentDate.toISOString().split('T')[0];
      countedDays++;
      breakdown.push(`Día ${countedDays}: ${dateStr} ${isHol ? '(Feriado)' : isSun ? '(Domingo)' : ''}`);
      if (countedDays < daysCount) {
        currentDate.setDate(currentDate.getDate() + 1);
      }
    }
    while (currentDate.getDay() === 0 || isHolidayInChile(currentDate)) {
      currentDate.setDate(currentDate.getDate() + 1);
      breakdown.push(`Prorroga legal por día inhábil: pasa al ${currentDate.toISOString().split('T')[0]}`);
    }
  } else if (type === 'HABILES_CIVIL') {
    while (countedDays < daysCount) {
      const dayOfWeek = currentDate.getDay();
      const isSunday = dayOfWeek === 0;
      const isHol = isHolidayInChile(currentDate);

      if (!isSunday && !isHol) {
        countedDays++;
        breakdown.push(`Día hábil ${countedDays}: ${currentDate.toISOString().split('T')[0]}`);
      } else {
        breakdown.push(`Inhábil saltado (${isSunday ? 'Domingo' : 'Feriado'}): ${currentDate.toISOString().split('T')[0]}`);
      }

      if (countedDays < daysCount) {
        currentDate.setDate(currentDate.getDate() + 1);
      }
    }
  } else if (type === 'HABILES_LABORAL') {
    while (countedDays < daysCount) {
      const dayOfWeek = currentDate.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const isHol = isHolidayInChile(currentDate);

      if (!isWeekend && !isHol) {
        countedDays++;
        breakdown.push(`Día hábil ${countedDays}: ${currentDate.toISOString().split('T')[0]}`);
      } else {
        breakdown.push(`Inhábil saltado (${isWeekend ? (dayOfWeek === 6 ? 'Sábado' : 'Domingo') : 'Feriado'}): ${currentDate.toISOString().split('T')[0]}`);
      }

      if (countedDays < daysCount) {
        currentDate.setDate(currentDate.getDate() + 1);
      }
    }
  }

  const y = currentDate.getFullYear();
  const m = String(currentDate.getMonth() + 1).padStart(2, '0');
  const d = String(currentDate.getDate()).padStart(2, '0');

  return {
    deadlineDate: `${y}-${m}-${d}`,
    breakdown,
  };
}

export function formatCurrency(amount: number, currency: 'CLP' | 'UF' = 'CLP'): string {
  if (isNaN(amount)) return '$ 0';
  if (currency === 'UF') {
    return `${amount.toLocaleString('es-CL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} UF`;
  }
  return `$ ${amount.toLocaleString('es-CL', { maximumFractionDigits: 0 })}`;
}

export function formatDateCL(dateString: string): string {
  if (!dateString) return '-';
  const parts = dateString.split('T')[0].split('-');
  if (parts.length !== 3) return dateString;
  const [year, month, day] = parts;
  return `${day}/${month}/${year}`;
}

export function getDaysRemaining(targetDateStr: string): number {
  const [y, m, d] = targetDateStr.split('-').map(Number);
  const target = new Date(y, m - 1, d);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);

  const diffTime = target.getTime() - today.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

export const CHILEAN_COURTS = [
  '1° Juzgado Civil de Santiago',
  '2° Juzgado Civil de Santiago',
  '3° Juzgado Civil de Santiago',
  '7° Juzgado Civil de Santiago',
  '14° Juzgado Civil de Santiago',
  '22° Juzgado Civil de Santiago',
  '1° Juzgado de Letras del Trabajo de Santiago',
  '2° Juzgado de Letras del Trabajo de Santiago',
  'Juzgado de Cobranza Laboral y Previsional de Santiago',
  '1° Juzgado de Familia de Santiago',
  '2° Juzgado de Familia de Santiago',
  '3° Juzgado de Garantía de Santiago',
  '7° Juzgado de Garantía de Santiago',
  '4° Tribunal de Juicio Oral en lo Penal de Santiago',
  'Corte de Apelaciones de Santiago',
  'Corte de Apelaciones de San Miguel',
  'Corte de Apelaciones de Valparaíso',
  'Corte de Apelaciones de Concepción',
  'Excma. Corte Suprema de Chile',
  '1° Juzgado de Policía Local de Las Condes',
  'Juzgado de Letras y Garantía de Colina',
  '1° Juzgado Civil de Viña del Mar',
  'Tribunal Tributario y Aduanero de la RM',
  'Centro de Arbitraje y Mediación (CAM Santiago)',
];

export function buildGoogleCalendarUrl(params: {
  title: string;
  details: string;
  location?: string;
  startDate: string;
  startTime?: string;
  endDate?: string;
  endTime?: string;
}): string {
  const { title, details, location, startDate, startTime = '09:00', endDate = startDate, endTime = '10:00' } = params;
  
  const startIso = `${startDate.replace(/-/g, '')}T${startTime.replace(/:/g, '')}00`;
  const endIso = `${endDate.replace(/-/g, '')}T${endTime.replace(/:/g, '')}00`;

  const url = new URL('https://calendar.google.com/calendar/render');
  url.searchParams.set('action', 'TEMPLATE');
  url.searchParams.set('text', `[BDCM] ${title}`);
  url.searchParams.set('details', details);
  if (location) {
    url.searchParams.set('location', location);
  }
  url.searchParams.set('dates', `${startIso}/${endIso}`);

  return url.toString();
}

export function downloadIcsFile(params: {
  filename: string;
  title: string;
  description: string;
  location?: string;
  startDate: string;
  startTime?: string;
  endDate?: string;
  endTime?: string;
}): void {
  const { filename, title, description, location = '', startDate, startTime = '09:00', endDate = startDate, endTime = '10:00' } = params;
  const start = `${startDate.replace(/-/g, '')}T${startTime.replace(/:/g, '')}00`;
  const end = `${endDate.replace(/-/g, '')}T${endTime.replace(/:/g, '')}00`;

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//BDCM Abogados//Gestión Jurídica Chile//ES',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `SUMMARY:[BDCM Abogados] ${title}`,
    `DESCRIPTION:${description.replace(/\n/g, '\\n')}`,
    `LOCATION:${location}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.setAttribute('download', `${filename}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
