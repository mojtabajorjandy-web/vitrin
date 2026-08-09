const jwt = require("jsonwebtoken");
const config = require("../config");
const prisma = require("../db");

async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) return res.status(401).json({ error: "توکن احراز هویت ارسال نشده است." });

    const payload = jwt.verify(token, config.jwtSecret);
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user) return res.status(401).json({ error: "کاربر یافت نشد." });

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: "توکن نامعتبر یا منقضی شده است." });
  }
}

function requireAdmin(req, res, next) {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ error: "دسترسی فقط برای مدیر مجاز است." });
  }
  next();
}

module.exports = { requireAuth, requireAdmin };
