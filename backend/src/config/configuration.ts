export default () => ({
  app: {
    nodeEnv: process.env.NODE_ENV ?? 'development',
    port: Number.parseInt(process.env.PORT ?? '3000', 10),
    frontendOrigin: process.env.FRONTEND_ORIGIN ?? 'http://localhost:5173',
  },
  aws: {
    bucketName: process.env.AWS_BUCKET_NAME ?? '',
    region: process.env.AWS_REGION ?? '',
    accessKey: process.env.AWS_ACCESS_KEY ?? '',
    secretKey: process.env.AWS_SECRET_KEY ?? '',
    publicBaseUrl: process.env.AWS_ENDPOINT ?? '',
  },
  database: {
    url: process.env.DATABASE_URL ?? '',
  },
  jwt: {
    accessSecret: process.env.JWT_SECRET ?? '',
    refreshSecret: process.env.JWT_REFRESH_SECRET ?? '',
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
  },
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID ?? '',
  },
});
