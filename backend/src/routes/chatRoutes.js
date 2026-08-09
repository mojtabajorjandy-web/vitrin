const express = require("express");
const prisma = require("../db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.get("/threads", requireAuth, async (req, res) => {
  const messages = await prisma.message.findMany({
    where: {
      OR: [{ senderId: req.user.id }, { recipientPhone: req.user.phone }],
    },
    include: { ad: true, sender: { select: { id: true, phone: true } } },
    orderBy: { createdAt: "asc" },
  });

  const threadsMap = new Map();
  for (const m of messages) {
    if (!threadsMap.has(m.adId)) {
      threadsMap.set(m.adId, { adId: m.adId, adTitle: m.ad.title, messages: [] });
    }
    threadsMap.get(m.adId).messages.push({
      from: m.senderId === req.user.id ? "me" : "them",
      text: m.text,
      createdAt: m.createdAt,
    });
  }

  res.json({ threads: Array.from(threadsMap.values()) });
});

router.get("/:adId/messages", requireAuth, async (req, res) => {
  const messages = await prisma.message.findMany({
    where: { adId: req.params.adId },
    orderBy: { createdAt: "asc" },
  });
  res.json({
    messages: messages.map((m) => ({
      from: m.senderId === req.user.id ? "me" : "them",
      text: m.text,
      createdAt: m.createdAt,
    })),
  });
});

router.post("/:adId/messages", requireAuth, async (req, res) => {
  const { text } = req.body;
  if (!text || !text.trim()) return res.status(400).json({ error: "متن پیام خالی است." });

  const ad = await prisma.ad.findUnique({ where: { id: req.params.adId }, include: { seller: true } });
  if (!ad) return res.status(404).json({ error: "آگهی یافت نشد." });

  const recipientPhone = ad.sellerId === req.user.id ? null : ad.seller.phone;

  const message = await prisma.message.create({
    data: {
      adId: ad.id,
      senderId: req.user.id,
      text: text.trim(),
      recipientPhone: recipientPhone || ad.seller.phone,
    },
  });

  res.status(201).json({ message });
});

module.exports = router;
