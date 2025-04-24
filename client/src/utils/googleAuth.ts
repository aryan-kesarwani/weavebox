export interface GoogleUser {
  accessToken: string;
  name?: string;
  email?: string;
  picture?: string;
}

export const getGoogleToken = (): string | null => {
  return localStorage.getItem('google_access_token');
};

export const isGoogleConnected = (): boolean => {
  return localStorage.getItem('google_connected') === 'true';
};

export const disconnectGoogle = (): void => {
  localStorage.removeItem('google_access_token');
  localStorage.removeItem('google_token_timestamp');
  localStorage.removeItem('google_connected');
};

export const getGoogleUser = (): GoogleUser | null => {
  const accessToken = getGoogleToken();
  if (!accessToken) return null;
  
  return {
    accessToken
  };
};