export const jwtConfig = {
  secret: process.env['JWT_SECRET'] ?? 'sams-dev-secret-change-in-production',
  expiresIn: process.env['JWT_EXPIRES_IN'] ?? '24h',
};
