// Roles come from a custom claim that the Auth0 login rule adds to the user profile.
export const ROLES_CLAIM = 'https://example-api/role';

export const ROLE = {
  ADMIN: 'Admin',
  PROF: 'Prof',
};

export const getRoles = (user) => (user && user[ROLES_CLAIM]) || [];

export const hasAnyRole = (user, ...roles) => getRoles(user).some((role) => roles.includes(role));

// Admins and teachers can see every reservation, edit them and approve them.
// UI hint only: the API must enforce this too.
export const canManageReservations = (user) => hasAnyRole(user, ROLE.ADMIN, ROLE.PROF);
