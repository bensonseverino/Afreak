/**
 * Lets non-React modules drive router navigation.
 *
 * `lib/api.js` reacts to a `403 PASSWORD_CHANGE_REQUIRED` response by sending the
 * visitor to the change-password page, but it has no access to `useNavigate`.
 * `RouterBridge` (inside the router, in `App.jsx`) registers the router's
 * navigation function here at startup.
 */
let navigateFn = null;

export function setAppNavigate(fn) {
  navigateFn = fn;
}

export function appNavigate(to, options) {
  if (navigateFn) {
    navigateFn(to, options);
    return;
  }
  // Fallback for the brief window before the router registers.
  if (typeof window !== 'undefined') window.location.assign(to);
}
