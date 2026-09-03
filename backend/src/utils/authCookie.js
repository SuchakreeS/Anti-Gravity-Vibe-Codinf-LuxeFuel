export const AUTH_COOKIE_NAME = 'token';
const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;

/**
 * Options for the httpOnly auth cookie. `rememberMe` controls whether it's a
 * persistent cookie (survives browser restarts) or a session cookie (cleared
 * when the browser closes) — mirrors the old client-side rememberMe toggle,
 * now enforced server-side since the client can no longer read the token.
 */
export const authCookieOptions = (rememberMe) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  ...(rememberMe ? { maxAge: THREE_DAYS_MS } : {}),
});

export const clearAuthCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
});
