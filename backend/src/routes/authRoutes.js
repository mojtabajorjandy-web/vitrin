const express = require("express");
const jwt = require("jsonwebtoken");
const prisma = require("../db");
const config = require("../config");
const smsService = require("../services/smsService");
const { generateOtp } = require("../utils/otp");

const router = express.Router();
const PHONE_REGEX = /^09\d{9}$/;

router.post("/send-otp", async (req, res) => {
  const { phone } = req.body;
  if (!phone || !PHONE_REGEX.test(phone)) {
    return res.status(400).json({ error: "شماره موبایل معتبر نیست." });
  }

  const code = generateOtp();
  const expiresAt = new Date(Date.now() + 2 * 60 * 1000);

  await prisma.otpCode.create({ data: { phone, code, expiresAt } });
  await smsService.sendOtp(phone, code);

  res.json({ ok: true, message: "کد تایید ارسال شد." });
});

router.post("/verify-otp", async (req, res) => {
  const { phone, code } = req.body;
  if (!phone || !code) return res.status(400).json({ error: "شماره و کد الزامی است." });

  const otp = await prisma.otpCode.findFirst({
    where: { phone, code, verified: false },
    orderBy: { createdAt: "desc" },
  });

  if (!otp) return res.status(400).json({ error: "کد نامعتبر است." });
  if (otp.expiresAt < new Date()) return res.status(400).json({ error: "کد منقضی شده است." });

  await prisma.otpCode.update({ where: { id: otp.id }, data: { verified: true } });

  let user = await prisma.user.findUnique({ where: { phone } });
  if (!user) {
    user = await prisma.user.create({
      data: { phone, isAdmin: phone === config.adminPhone },
    });
  }

  const token = jwt.sign({ userId: user.id }, config.jwtSecret, { expiresIn: config.jwtExpiresIn });
  res.json({ ok: true, token, user: { id: user.id, phone: user.phone, isAdmin: user.isAdmin } });
});

module.exports = router;
