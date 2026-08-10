const express = require("express");
const prisma = require("../db");
const config = require("../config");
const { requireAuth } = require("../middleware/auth");
const paymentService = require("../services/paymentService");

const router = express.Router();

const BOOST_PRICES = { bump: 15000, featured: 49000, renew: 9000 };

router.get("/bank-info", (req, res) => {
  res.json({ card: config.bankCard });
});

router.post("/gateway/request", requireAuth, async (req, res) => {
  const { adId, boostType } = req.body;
  const amount = BOOST_PRICES[boostType];
  if (!amount) return res.status(400).json({ error: "نوع ارتقا نامعتبر است." });

  const payment = await prisma.payment.create({
    data: { amount, method: "gateway", purpose: `boost_${boostType}`, userId: req.user.id, adId },
  });

  const result = await paymentService.requestPayment({
    amount,
    description: `پرداخت ${boostType} برای آگهی`,
    mobile: req.user.phone,
  });

  await prisma.payment.update({ where: { id: payment.id }, data: { refId: result.authority } });

  res.json({ paymentUrl: result.paymentUrl, paymentId: payment.id, simulated: result.simulated });
});

router.get("/gateway/callback", async (req, res) => {
  const { Authority, Status } = req.query;
  const payment = await prisma.payment.findFirst({ where: { refId: Authority } });
  if (!payment) return res.status(404).json({ error: "تراکنش یافت نشد." });

  if (Status !== "OK") {
    await prisma.payment.update({ where: { id: payment.id }, data: { status: "failed" } });
    return res.json({ ok: false });
  }

  const verify = await paymentService.verifyPayment({ authority: Authority, amount: payment.amount });
  if (!verify.success) {
    await prisma.payment.update({ where: { id: payment.id }, data: { status: "failed" } });
    return res.json({ ok: false });
  }

  await prisma.payment.update({ where: { id: payment.id }, data: { status: "success", refId: verify.refId } });
  await applyBoostToAd(payment);

  res.json({ ok: true });
});

router.post("/card-to-card", requireAuth, async (req, res) => {
  const { adId, boostType, note } = req.body;
  const amount = BOOST_PRICES[boostType];
  if (!amount) return res.status(400).json({ error: "نوع ارتقا نامعتبر است." });

  const payment = await prisma.payment.create({
    data: {
      amount,
      method: "card_to_card",
      purpose: `boost_${boostType}`,
      userId: req.user.id,
      adId,
      refId: note || null,
      status: "pending",
    },
  });

  res.status(201).json({ payment, message: "رسید شما ثبت شد و پس از تایید مدیریت، آگهی ارتقا می‌یابد." });
});

async function applyBoostToAd(payment) {
  if (!payment.adId) return;
  const boostType = payment.purpose.replace("boost_", "");
  const data = { boostType };
  if (boostType === "featured") data.featured = true;
  if (boostType === "renew") data.boostExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  if (boostType === "bump") data.createdAt = new Date();

  await prisma.ad.update({ where: { id: payment.adId }, data });
}

module.exports = router;
