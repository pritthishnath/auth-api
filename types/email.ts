// types/email.ts

import { Transporter } from "nodemailer";

/**
 * User information required for sending email
 */
export interface UserInfo {
  email: string;
  [key: string]: any;
}

/**
 * Function type for sending login OTP emails
 */
export type SendLoginOtpEmailFn = (
  mailTransporter: Transporter,
  foundedUser: UserInfo,
  username: string,
  regeneratedOtp: string
) => Promise<void>;

/**
 * Function type for sending registration OTP emails
 */
export type SendRegistrationOtpEmailFn = (
  mailTransporter: Transporter,
  userEmail: string,
  username: string,
  regeneratedOtp: string
) => Promise<void>;

/**
 * Email template data for OTP emails
 */
export interface OtpEmailTemplateData {
  username: string;
  otp: string;
  currentYear: number;
}

/**
 * Configuration for email sending
 */
export interface EmailConfig {
  from: string;
  subject: {
    login: string;
    registration: string;
  };
  expiryMinutes: number;
}
