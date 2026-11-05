/**
 * Google Calendar API helper for BDCM Abogados
 * Creates and deletes calendar events for hearings and fatal deadlines.
 */

export interface GoogleCalendarEventInput {
  title: string;
  description?: string;
  location?: string;
  startDateTime: string; // ISO string
  endDateTime: string;   // ISO string
}

export async function createGoogleCalendarEvent(
  accessToken: string,
  event: GoogleCalendarEventInput
): Promise<{ success: boolean; eventId?: string; htmlLink?: string; error?: string }> {
  try {
    const body = {
      summary: event.title,
      description: event.description || '',
      location: event.location || '',
      start: {
        dateTime: event.startDateTime,
        timeZone: 'America/Santiago',
      },
      end: {
        dateTime: event.endDateTime,
        timeZone: 'America/Santiago',
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'popup', minutes: 60 * 24 }, // 1 day before
          { method: 'popup', minutes: 60 * 2 },  // 2 hours before
          { method: 'popup', minutes: 30 },      // 30 min before
        ],
      },
    };

    const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      const msg = errData.error?.message || `HTTP ${res.status}`;
      return { success: false, error: msg };
    }

    const data = await res.json();
    return {
      success: true,
      eventId: data.id,
      htmlLink: data.htmlLink,
    };
  } catch (err: any) {
    return { success: false, error: err.message || 'Error al conectar con Google Calendar' };
  }
}

export async function deleteGoogleCalendarEvent(
  accessToken: string,
  eventId: string
): Promise<boolean> {
  try {
    const res = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return res.status === 204 || res.ok;
  } catch (err) {
    console.error('Failed to delete Google Calendar event', err);
    return false;
  }
}
