import dotenv from "dotenv";
dotenv.config();

export const config = {
  // Server Configuration
  server: {
    port: parseInt(process.env.PORT || "5000", 10),
    nodeEnv: process.env.NODE_ENV || "development",
  },

  // API URL Configuration
  apiUrl: process.env.API_URL || "http://localhost:5000",

  // Database Configuration
  database: {
    url:
      process.env.DATABASE_URL || "postgresql://postgres:postgres@127.0.0.1:5432/trippz",
  },

  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET || "your_jwt_secret_key",
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "1h",
    refreshSecret: process.env.JWT_REFRESH_SECRET || "your_jwt_refresh_secret_key",
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "90d",
    resetPasswordSecret:
      process.env.JWT_RESET_PASSWORD_SECRET || "your_jwt_reset_password_secret",
    emailVerificationSecret:
      process.env.JWT_EMAIL_VERIFICATION_SECRET || "your_jwt_email_verification_secret",
    phoneVerificationSecret:
      process.env.JWT_PHONE_VERIFICATION_SECRET || "your_jwt_phone_verification_secret",
  },

  // Authentication Configuration
  auth: {
    useCookieAuth: process.env.USE_COOKIE_AUTH === "true",
  },

  // Resend Configuration
  resend: {
    apiKey: process.env.RESEND_API_KEY || "re_damNkYN2_6P5U5ymxKbU4zmAZ9k2cKa6a",
    receiverEmail: process.env.RESEND_RECEIVER_EMAIL || "ashikur@orangetoolz.com",
    fromEmail: process.env.RESEND_FROM_EMAIL || "Trippz <onboarding@resend.dev>",
  },

  // Frontend URL Configuration
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:5000",

  // Cloudinary Configuration
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || "asikur",
    apiKey: process.env.CLOUDINARY_API_KEY || "153184895483919",
    apiSecret: process.env.CLOUDINARY_API_SECRET || "dMhjWvJnZGfJrwqHtA_waOtbo9g",
  },

  // Twilio Configuration
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID || "ACb91ec6cedfcea7564d52133fe066e57b",
    authToken: process.env.TWILIO_AUTH_TOKEN || "5b33768b33041115167e980a8fc5e72e",
    phoneNumber: process.env.TWILIO_PHONE_NUMBER || "+13863878119",
  },

  // Stripe Configuration
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY || "your_stripe_secret_key",
  },

  // OAuth Configuration
  oauth: {
    google: {
      clientId:
        process.env.GOOGLE_CLIENT_ID ||
        "275370166773-u6ic09g5ov9nigero28vj5tkh9a33895.apps.googleusercontent.com",
      clientSecret:
        process.env.GOOGLE_CLIENT_SECRET || "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",
    },
    facebook: {
      appId: process.env.FACEBOOK_APP_ID || "your_facebook_app_id",
      appSecret: process.env.FACEBOOK_APP_SECRET || "your_facebook_app_secret",
    },
    apple: {
      clientId: process.env.APPLE_CLIENT_ID || "your_apple_client_id",
      clientSecret: process.env.APPLE_CLIENT_SECRET || "your_apple_client_secret",
      keyId: process.env.APPLE_KEY_ID || "your_apple_key_id",
      teamId: process.env.APPLE_TEAM_ID || "your_apple_team_id",
    },
  },
};
