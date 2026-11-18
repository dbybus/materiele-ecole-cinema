// Auth facade: every component imports useAuth0 / withAuthenticationRequired from here
// instead of '@auth0/auth0-react' directly.
//
// Set REACT_APP_AUTH_DISABLED=true (in .env) to run locally without any Auth0 setup:
// you are automatically "logged in" as a fake Admin user and the API skips token checks.
import * as Auth0 from '@auth0/auth0-react';

export const AUTH_DISABLED = process.env.REACT_APP_AUTH_DISABLED === 'true';

// Module-level constants so references stay stable across renders
// (components use `user` as a useEffect dependency).
const devUser = {
  name: 'Dev User',
  email: 'dev@example.com', // must look like a real address: the reservation form validates emails
  picture: 'https://www.gravatar.com/avatar/?d=mp',
  'https://example-api/role': ['Admin'],
};

const devAuth = {
  user: devUser,
  isAuthenticated: true,
  isLoading: false,
  error: undefined,
  getAccessTokenSilently: () => Promise.resolve('dev-token'),
  loginWithRedirect: () => Promise.resolve(),
  logout: () => {},
};

export const useAuth0 = AUTH_DISABLED ? () => devAuth : Auth0.useAuth0;

export const withAuthenticationRequired = AUTH_DISABLED
  ? (component) => component
  : Auth0.withAuthenticationRequired;
