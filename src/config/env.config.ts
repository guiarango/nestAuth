export const EnvConfiguration = () => ({
  mongodb: process.env.MONGO_DB,
  port: +(process.env.PORT ?? 3001),
  defaultLimit: +(process.env.DEFAULT_LIMIT ?? 10),
  defaultPage: +(process.env.DEFAULT_PAGE ?? 1),
  tokenExpiry: +(process.env.JWT_TOKEN_EXPIRY ?? 0),
  refreshTokenExpiry: +(process.env.JWT_REFRESH_TOKEN_EXPIRY ?? 0),
  sfxClientId: process.env.SFX_CLIENT_ID,
  jwtSecret: process.env.JWT_SECRET,
});
