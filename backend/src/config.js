require("dotenv").config();

module.exports = {
  port: process.env.PORT || 4000,
  nodeEnv: process.env.NODE_ENV || "development",
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:3000",
  jwtSecret: process.env.JWT_SECRET || "dev-secret-change-me",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "30d",
  adminPhone: process.env.ADMIN_PHONE || "09120000000",
  kavenegar: {
    apiKey: process.env.KAVENEGAR_API_KEY || "",
    sender: process.env.KAVENEGAR_SENDER || "",
    template: process.env.KAVENEGAR_OTP_TEMPLATE || "verify",
  },
  zarinpal: {
    merchantId: process.env.ZARINPAL_MERCHANT_ID || "",
    sandbox: (process.env.ZARINPAL_SANDBOX || "true") === "true",
    callbackUrl: process.env.ZARINPAL_CALLBACK_URL || "http://localhost:3000/payment/callback",
  },
  bankCard: {
    number: process.env.BANK_CARD_NUMBER || "6274-1211-XXXX-XXXX",
    owner: process.env.BANK_CARD_OWNER || "صاحب حساب",
    bank: process.env.BANK_NAME || "بانک",
  },
};
