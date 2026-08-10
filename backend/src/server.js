const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const config = require("./config");

const authRoutes = require("./routes/authRoutes");
const adRoutes = require("./routes/adRoutes");
const chatRoutes = require("./routes/chatRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();

app.use(cors({ origin: config.frontendUrl, credentials: true }));
app.use(express.json());
app.use(morgan("dev"));

app.get("/health", (req, res) => res.json({ ok: true, service: "vitrine-backend" }));

app.use("/auth", authRoutes);
app.use("/ads", adRoutes);
app.use("/chat", chatRoutes);
app.use("/payments", paymentRoutes);
app.use("/admin", adminRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "خطای داخلی سرور." });
});

if (require.main === module) {
  app.listen(config.port, () => {
    console.log(`✅ Vitrine backend running on http://localhost:${config.port}`);
  });
}

module.exports = app;
