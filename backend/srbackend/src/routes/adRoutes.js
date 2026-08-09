const express = require("express");
const prisma = require("../db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.get("/", async (req, res) => {
  const { category, city, q } = req.query;
  const where = {
    status: "active",
    ...(category && category !== "all" ? { category } : {}),
    ...(city ? { city } : {}),
    ...(q ? { OR: [{ title: { contains: q } }, { description: { contains: q } }] } : {}),
  };

  const ads = await prisma.ad.findMany({
    where,
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    include: { seller: { select: { id: true, phone: true, name: true } } },
  });
  res.json({ ads });
});

router.get("/:id", async (req, res) => {
  const ad = await prisma.ad.findUnique({
    where: { id: req.params.id },
    include: { seller: { select: { id: true, phone: true, name: true } } },
  });
  if (!ad) return res.status(404).json({ error: "آگهی یافت نشد." });
  res.json({ ad });
});

router.post("/", requireAuth, async (req, res) => {
  const { title, description, price, negotiable, category, city, images } = req.body;
  if (!title || !description || !category || !city) {
    return res.status(400).json({ error: "اطلاعات آگهی ناقص است." });
  }

  const ad = await prisma.ad.create({
    data: {
      title,
      description,
      price: negotiable ? null : Number(price) || null,
      negotiable: !!negotiable,
      category,
      city,
      images: images ? JSON.stringify(images) : null,
      sellerId: req.user.id,
    },
  });
  res.status(201).json({ ad });
});

router.put("/:id", requireAuth, async (req, res) => {
  const ad = await prisma.ad.findUnique({ where: { id: req.params.id } });
  if (!ad) return res.status(404).json({ error: "آگهی یافت نشد." });
  if (ad.sellerId !== req.user.id && !req.user.isAdmin) {
    return res.status(403).json({ error: "شما مالک این آگهی نیستید." });
  }

  const updated = await prisma.ad.update({
    where: { id: req.params.id },
    data: req.body,
  });
  res.json({ ad: updated });
});

router.delete("/:id", requireAuth, async (req, res) => {
  const ad = await prisma.ad.findUnique({ where: { id: req.params.id } });
  if (!ad) return res.status(404).json({ error: "آگهی یافت نشد." });
  if (ad.sellerId !== req.user.id && !req.user.isAdmin) {
    return res.status(403).json({ error: "شما مالک این آگهی نیستید." });
  }

  await prisma.ad.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
});

router.get("/mine/list", requireAuth, async (req, res) => {
  const ads = await prisma.ad.findMany({
    where: { sellerId: req.user.id },
    orderBy: { createdAt: "desc" },
  });
  res.json({ ads });
});

module.exports = router;
