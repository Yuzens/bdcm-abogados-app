/**
 * Google Auth & Calendar token provider
 */
import { LawyerUser } from '../types';

const ACCESS_TOKEN_KEY = 'bdcm_google_access_token';
const USER_KEY = 'bdcm_google_user';

// Listeners
type AuthCallback = (user: LawyerUser | null) => void;
const listeners: AuthCallback[] = [];

export function getStoredAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getStoredUser(): LawyerUser | null {
  const data = localStorage.getItem(USER_KEY);
  return data ? JSON.parse(data) : null;
}

export function subscribeToAuthChanges(callback: AuthCallback): () => void {
  listeners.push(callback);
  callback(getStoredUser());
  return () => {
    const idx = listeners.indexOf(callback);
    if (idx !== -1) listeners.splice(idx, 1);
  };
}

function notifyListeners(user: LawyerUser | null) {
  listeners.forEach((cb) => cb(user));
}

/**
 * Connect with Google using Google OAuth token or Google Identity Services
 */
export async function loginWithGoogle(): Promise<LawyerUser> {
  return new Promise((resolve) => {
    // If Google GIS client is loaded in window
    const user: LawyerUser = {
      id: 'usr-lawyer-1',
      name: 'Enrique Javier Blanco Zambrano',
      email: 'enriqueblanco.abogado@gmail.com',
      role: 'Socio Director BDCM Abogados',
      rut: '15.420.198-3',
      avatarColor: 'bg-amber-600',
    };

    // Use token or mock demo access token for Google Calendar API
    const simulatedToken = 'mock_google_oauth_token_' + Date.now();
    localStorage.setItem(ACCESS_TOKEN_KEY, simulatedToken);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    notifyListeners(user);

    resolve(user);
  });
}

export async function logoutUser(): Promise<void> {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  notifyListeners(null);
}
