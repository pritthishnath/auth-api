import { Transporter } from "nodemailer";

/**
 * Sends a login OTP email to the user
 * @param mailTransporter - Nodemailer transport object
 * @param foundedUser - User object containing email and other user information
 * @param username - The username to display in the email
 * @param regeneratedOtp - The OTP code to send
 * @returns Promise that resolves when email is sent
 */
export const sendLoginOtpEmail = async (
  mailTransporter: Transporter,
  userEmail: string,
  username: string,
  regeneratedOtp: string
): Promise<void> => {
  // HTML email template with modern design
  const htmlTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Login OTP</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 0;
      background-color: #f9f9f9;
    }
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      padding: 25px;
      background-color: #ffffff;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
    }
    .header {
      text-align: center;
      padding-bottom: 20px;
      border-bottom: 1px solid #eaeaea;
      margin-bottom: 25px;
    }
    .logo {
      font-size: 26px;
      font-weight: bold;
      color: #2c3e50;
    }
    .tagline {
      font-size: 14px;
      color: #7f8c8d;
      margin-top: 5px;
    }
    .otp-container {
      background-color: #f7f9fc;
      border-radius: 6px;
      padding: 20px;
      margin: 25px 0;
      text-align: center;
      border-left: 4px solid #3498db;
    }
    .otp-code {
      font-size: 32px;
      font-weight: bold;
      letter-spacing: 5px;
      color: #2c3e50;
      margin: 15px 0;
    }
    .expiry {
      font-size: 14px;
      color: #e74c3c;
      font-weight: 500;
    }
    .footer {
      font-size: 12px;
      color: #95a5a6;
      text-align: center;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #eaeaea;
    }
    .note {
      background-color: #f8f9fa;
      padding: 15px;
      border-radius: 6px;
      font-size: 13px;
      margin: 20px 0;
      border-left: 4px solid #f1c40f;
    }
    .button {
      display: inline-block;
      background-color: #3498db;
      color: white;
      text-decoration: none;
      padding: 10px 20px;
      border-radius: 4px;
      margin-top: 15px;
      font-weight: 500;
    }
    .app-name {
      color: #3498db;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <div class="logo">Pritthish's</div>
      <div class="tagline">Application Suite</div>
    </div>
    
    <p>Hello ${username},</p>
    
    <p>You've requested to log in to your <span class="app-name">Pritthish's Application Suite</span> account. Please use the verification code below to complete the process:</p>
    
    <div class="otp-container">
      <p>Your verification code is:</p>
      <div class="otp-code">${regeneratedOtp}</div>
      <p class="expiry">Valid for 10 minutes only</p>
    </div>
    
      
    <p>Thank you for using Pritthish's Application Suite!</p>
    
    <div class="footer">
      <p>© ${new Date().getFullYear()} Pritthish Nath </p>
      <p>This is an automated message from the Auth Service. Please do not reply to this email.</p>
    </div>
  </div>
</body>
</html>
  `;

  // Plain text version for email clients that don't support HTML
  const textVersion = `
Hello ${username},

You've requested to log in to your Pritthish's Application Suite account. Please use the verification code below to complete the process:

Your verification code: ${regeneratedOtp}
Valid for 10 minutes only

Security Note: If you didn't request this code, please ignore this email or contact our support team if you have concerns about your account security.

Thank you for using Pritthish's Application Suite!

© ${new Date().getFullYear()} pnath.in
This is an automated message from the Auth Service. Please do not reply to this email.
  `;

  // Send the email
  await mailTransporter.sendMail({
    from: '"Auth service" <no-reply@pnath.in>',
    to: userEmail,
    subject: "Login Verification Code | Pritthish's Application Suite",
    text: textVersion,
    html: htmlTemplate,
  });
};

/**
 * Sends a registration OTP email to the user
 * @param mailTransporter - Nodemailer transport object
 * @param userEmail - The email address of the user
 * @param username - The username to display in the email
 * @param regeneratedOtp - The OTP code to send
 * @returns Promise that resolves when email is sent
 */
export const sendRegistrationOtpEmail = async (
  mailTransporter: Transporter,
  userEmail: string,
  username: string,
  regeneratedOtp: string
): Promise<void> => {
  // HTML email template with modern design
  const htmlTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Registration</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 0;
      background-color: #f9f9f9;
    }
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      padding: 25px;
      background-color: #ffffff;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
    }
    .header {
      text-align: center;
      padding-bottom: 20px;
      border-bottom: 1px solid #eaeaea;
      margin-bottom: 25px;
    }
    .logo {
      font-size: 26px;
      font-weight: bold;
      color: #2c3e50;
    }
    .tagline {
      font-size: 14px;
      color: #7f8c8d;
      margin-top: 5px;
    }
    .otp-container {
      background-color: #f7f9fc;
      border-radius: 6px;
      padding: 20px;
      margin: 25px 0;
      text-align: center;
      border-left: 4px solid #27ae60;
    }
    .otp-code {
      font-size: 32px;
      font-weight: bold;
      letter-spacing: 5px;
      color: #2c3e50;
      margin: 15px 0;
    }
    .expiry {
      font-size: 14px;
      color: #e74c3c;
      font-weight: 500;
    }
    .footer {
      font-size: 12px;
      color: #95a5a6;
      text-align: center;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #eaeaea;
    }
    .note {
      background-color: #f8f9fa;
      padding: 15px;
      border-radius: 6px;
      font-size: 13px;
      margin: 20px 0;
      border-left: 4px solid #f1c40f;
    }
    .welcome {
      background-color: #e8f6f3;
      padding: 15px;
      border-radius: 6px;
      font-size: 14px;
      margin: 20px 0;
      border-left: 4px solid #27ae60;
    }
    .benefits {
      margin: 20px 0;
    }
    .benefit-item {
      margin: 8px 0;
    }
    .app-name {
      color: #27ae60;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <div class="logo">Pritthish's</div>
      <div class="tagline">Application Suite</div>
    </div>
    
    <p>Hello ${username},</p>
    
    <div class="welcome">
      <strong>Welcome to the Pritthish's Application Suite!</strong> We're excited to have you join us. To complete your registration, please verify your email address.
    </div>
    
    <p>Use the verification code below to complete your account registration:</p>
    
    <div class="otp-container">
      <p>Your verification code is:</p>
      <div class="otp-code">${regeneratedOtp}</div>
      <p class="expiry">Valid for 10 minutes only</p>
    </div>
    
    <div class="benefits">
      <p><strong>With your pnath account, you'll have access to:</strong></p>
      <p class="benefit-item">✓ All pnath applications and services</p>
      <p class="benefit-item">✓ Seamless integration between our tools</p>
      <p class="benefit-item">✓ Cloud synchronization of your notes</p>
    </div>
    
      
    <p>We're glad to have you on board!</p>
    
    <div class="footer">
      <p>© ${new Date().getFullYear()} Pritthish Nath </p>
      <p>This is an automated message from the Auth Service. Please do not reply to this email.</p>
    </div>
  </div>
</body>
</html>
  `;

  // Plain text version for email clients that don't support HTML
  const textVersion = `
Hello ${username},

Welcome to the Pritthish's Application Suite! We're excited to have you join us.

To complete your registration, please use the verification code below:

Your verification code: ${regeneratedOtp}
Valid for 10 minutes only

With your pnath account, you'll have access to:
✓ All pnath applications and services
✓ Seamless integration between our tools
✓ Cloud synchronization of your data

Security Note: If you didn't request to create an account with us, please ignore this email or contact our support team.

We're glad to have you on board!

© ${new Date().getFullYear()} pnath.in
This is an automated message from the Auth Service. Please do not reply to this email.
  `;

  // Send the email
  await mailTransporter.sendMail({
    from: '"Auth service" <no-reply@pnath.in>',
    to: userEmail,
    subject: "Verify Your Registration | Pritthish's Application Suite",
    text: textVersion,
    html: htmlTemplate,
  });
};
