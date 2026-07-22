/**
 * server.js — ASET TRONICS API entry point (Express.js).
 */
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const api = require("./routes/api");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.json({
    name: "ASET TRONICS — AI CNC Programming & Tool Optimization API",
    version: "1.0.0",
    docs: "/api/health",
  });
});

app.use("/api", api);

// 404
app.use((req, res) =>
  res.status(404).json({ error: "not found", path: req.originalUrl }),
);

// error handler
app.use((err, req, res, next) => {
  console.error(err);
  res
    .status(500)
    .json({ error: "internal server error", message: err.message });
});

app.listen(PORT, () => {
  console.log(`\n  ASET TRONICS API running on http://localhost:${PORT}`);
  console.log(`  Health:  http://localhost:${PORT}/api/health\n`);
});

module.exports = app;
