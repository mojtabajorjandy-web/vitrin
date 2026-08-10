const express = require("express");
const prisma = require("../db");
const { requireAuth, requireAdmin } = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth, requireAdmin);

router.get("/stats", async (req, res) => {
  const [totalAds, featuredAds, totalUsers, pendingPayments] = await Promise.all([
    prisma.ad.count({ where: { status: "active" } }),
    prisma.ad.count({ where: { featured: true } }),
    prisma.user.count(),
    prisma.payment.count({ where: { status: "pending" } }),
  ]);
  res.json({ totalAds, featuredAds, totalUsers, pendingPayments });
});

router.get("/ads", async (req, res) => {
  const ads = await prisma.ad.findMany({
    orderBy: { createdAt: "desc" },
    include: { seller: { select: { phone: true } } },
  });
  res.json({ ads });
});

router.patch("/ads/:id/feature", async (req, res) => {
  const ad = await prisma.ad.findUnique({ where: { id: req.params.id } });
  if (!ad) return res.status(404).json({ error: "آگهی یافت نشد." });
  const updated = await prisma.ad.update({ where: { id: req.params.id }, data: { featured: !ad.featured } });
  res.json({ ad: updated });
});

router.delete("/ads/:id", async (req, res) => {
  await prisma.ad.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
});

router.get("/payments/pending", async (req, res) => {
  const payments = await prisma.payment.findMany({
    where: { status: "pending", method: "card_to_card" },
    include: { user: { select: { phone: true } }, ad: { select: { title: true } } },
    orderBy: { createdAt: "desc" },
  });
  res.json({ payments });
});

router.post("/payments/:id/approve", async (req, res) => {
  const payment = await prisma.payment.findUnique({ where: { id: req.params.id } });
  if (!payment) return res.status(404).json({ error: "پرداخت یافت نشد." });

  await prisma.payment.update({ where: { id: payment.id }, data: { status: "success" } });

  if (payment.adId) {
    const boostType = payment.purpose.replace("boost_", "");
    const data = { boostType };
    if (boostType === "featured") data.featured = true;
    if (boostType === "bump") data.createdAt = new Date();
    await prisma.ad.update({ where: { id: payment.adId }, data });
  }

  res.json({ ok: true });
});

router.post("/payments/:id/reject", async (req, res) => {
  await prisma.payment.update({ where: { id: req.params.id }, data: { status: "rejected" } });
  res.json({ ok: true });
});

module.exports = router;
