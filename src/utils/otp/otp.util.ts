import { addMinutes } from 'date-fns';

export function generateOtpCode(): { otpCode: string; expiredAt: Date } {
  const otpCode = Math.floor(10000 + Math.random() * 90000)
    .toString()
    .slice(-4);
  const expirationMinutes =
    parseInt(process.env.OTP_EXPIRATION_MINUTES, 10) || 10;
  const expiredAt = addMinutes(new Date(), expirationMinutes);

  return { otpCode, expiredAt };
}
