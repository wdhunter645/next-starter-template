export const JOIN_ROUTE = '/join';
export const LOGIN_LEGACY_ROUTE = '/login';
export const AUTH_LEGACY_ROUTE = '/auth';
export const POST_LOGIN_ROUTE = '/fanclub';
export const POST_LOGOUT_ROUTE = '/';
export const LOGIN_TAB_ROUTE = '/join?mode=login';
export const STORE_URL = 'https://www.bonfire.com/store/lou-gehrig-fan-club/';

export function isValidEmail(value: string): boolean {
  const email = value.trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
