import * as dotenv from 'dotenv';
dotenv.config();

export const application = {
  environment: process.env.ENVIRONMENT || 'local',
  urlPrefix: process.env.URL_PREFIX || '/api',
  secretCronjob:
    process.env.SECRET_CRONJOB || '27dfa083-4675-4aae-88f5-194054da69f6',
  serverPort: +process.env.SERVER_PORT || 3000,
  baseUrl: process.env.BASE_URL || 'http://localhost:3000/',
};

export const token = {
  expireTime: process.env.ACCESS_TOKEN_EXPIRE_TIME || '30d',
  secretKey:
    process.env.ACCESS_TOKEN_SECRET_KEY ||
    '5239955f-4e01-4873-aca9-5183816ae4a9',

  rfExpireTime: process.env.REFRESH_TOKEN_EXPIRE_TIME || '90d',
  rfSecretKey:
    process.env.REFRESH_TOKEN_SECRET_KEY ||
    'f23e4ace-dd6b-419f-8e29-2419504e14c5',
};

export const aws = {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'AWS_ACCESS_KEY_ID',
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'AWS_SECRET_ACCESS_KEY',
  bucket: process.env.AWS_BUCKET || 'AWS_BUCKET',
  s3Region: process.env.S3_REGION || 'S3_REGION',
};

export const redis = {
  host: process.env.REDIS_HOST || 'localhost',
  port: +process.env.REDIS_PORT || 6379,
  keyPrefix: process.env.PREFIX_KEY || '',
  password: process.env.REDIS_PASSWORD || '',
  db: +process.env.REDIS_DB || 0,
};

export const postgresql = {
  host: process.env.POSTGRES_HOST || 'localhost',
  port: +process.env.POSTGRES_PORT || 5432,
  username: process.env.POSTGRES_USERNAME || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'password',
  database: process.env.POSTGRES_DATABASE || 'base',
};

export const mysql = {
  host: process.env.MYSQL_HOST || 'localhost',
  port: +process.env.MYSQL_PORT || 3306,
  username: process.env.MYSQL_USERNAME || 'mysql',
  password: process.env.MYSQL_PASSWORD || 'password',
  database: process.env.MYSQL_DATABASE || 'base',
};

export const emailSender = {
  secretKeySendGmail:
    process.env.SECRET_KEY_SEND_GMAIL || '57ec1978-ddad-48b6-8db7-88123a8da5c2',
  otpTimeExpire: +process.env.OTP_TIME_EXPIRE || 300,
  email: process.env.ADMIN_EMAIL || 'example@adamosoft.com',
  password: process.env.ADMIN_PASSWORD_EMAIL || 'abc+=123',
  name: process.env.ADMIN_EMAIL_NAME || 'abc+=123',
};
