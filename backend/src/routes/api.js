/**
 * api.js — All REST endpoints for ASET TRONICS.
 */
const express = require("express");
const router = express.Router();

const store = require("../services/store");
const machining = require("../services/machining");
const optimizer = require("../services/optimizer");
const cnc = require("../services/cncGenerator");
const assistant = require("../services/assistant");
const seed = require("../data/seed");

// ---- health ----
router.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "aset-tronics-api",
    time: new Date().toISOString(),
  });
});

router.get("/meta", (req, res) => res.json(store.meta()));

// ---- dashboard ----
router.get("/dashboard", (req, res) => {
  const projects = store.getAll("projects");
  const operations = store.getAll("operations");
  const totalTime = round(
    operations.reduce((s, o) => s + Number(o.time || 0), 0),
    2,
  );
  res.json({
    ...seed.dashboard,
    totalCycleTime: totalTime || seed.dashboard.totalCycleTime,
    projectCount: projects.length,
    operationCount: operations.length,
    recommendedTool: store.getAll("tools").find((t) => t.recommended) || null,
    operations,
    projects,
  });
});

// ---- projects ----
router.get("/projects", (req, res) => res.json(store.getAll("projects")));
router.get("/projects/:id", (req, res) => {
  const p = store.getById("projects", req.params.id);
  if (!p) return res.status(404).json({ error: "project not found" });
  const operations = store
    .getAll("operations")
    .filter((o) => String(o.projectId) === String(p.id));
  res.json({ ...p, operations });
});
router.post("/projects", (req, res) => {
  const { partNo, partName, material, orderQty } = req.body || {};
  if (!partName) return res.status(400).json({ error: "partName is required" });
  const created = store.insert("projects", {
    partNo: partNo || "P-" + Date.now().toString().slice(-4),
    partName,
    material: material || "Aluminum 6061",
    orderQty: Number(orderQty) || 1,
    machine: req.body.machine || "VMX 850",
    status: "Planned",
    progress: 0,
    startDate: req.body.startDate || new Date().toISOString().slice(0, 10),
    dueDate: req.body.dueDate || "",
  });
  res.status(201).json(created);
});
router.put("/projects/:id", (req, res) => {
  const updated = store.update("projects", req.params.id, req.body || {});
  if (!updated) return res.status(404).json({ error: "project not found" });
  res.json(updated);
});
router.delete("/projects/:id", (req, res) => {
  const ok = store.remove("projects", req.params.id);
  res.status(ok ? 204 : 404).end();
});

// ---- operations ----
router.get("/operations", (req, res) => {
  let ops = store.getAll("operations");
  if (req.query.projectId)
    ops = ops.filter(
      (o) => String(o.projectId) === String(req.query.projectId),
    );
  const totalTime = round(
    ops.reduce((s, o) => s + Number(o.time || 0), 0),
    2,
  );
  res.json({ operations: ops, totalTime });
});
router.post("/operations", (req, res) => {
  const created = store.insert("operations", req.body || {});
  res.status(201).json(created);
});

// ---- tools ----
router.get("/tools", (req, res) => {
  let tools = store.getAll("tools");
  const { q, type, recommended } = req.query;
  if (q)
    tools = tools.filter((t) =>
      (t.code + " " + t.name + " " + t.type)
        .toLowerCase()
        .includes(String(q).toLowerCase()),
    );
  if (type)
    tools = tools.filter(
      (t) => t.type.toLowerCase() === String(type).toLowerCase(),
    );
  if (recommended === "true") tools = tools.filter((t) => t.recommended);
  res.json(tools);
});
router.post("/tools", (req, res) =>
  res.status(201).json(store.insert("tools", req.body || {})),
);

// ---- part ----
router.get("/part", (req, res) => res.json(seed.part));

// ---- calculator ----
router.get("/calculator/materials", (req, res) => {
  res.json(
    Object.keys(machining.MATERIALS).map((name) => ({
      name,
      ...machining.MATERIALS[name],
    })),
  );
});
router.post("/calculator/milling", (req, res) =>
  res.json(machining.milling(req.body || {})),
);
router.post("/calculator/turning", (req, res) =>
  res.json(machining.turning(req.body || {})),
);
router.post("/calculator/drilling", (req, res) =>
  res.json(machining.drilling(req.body || {})),
);

// ---- optimization ----
router.post("/optimize", (req, res) => {
  let operations = (req.body && req.body.operations) || null;
  if (!operations) operations = store.getAll("operations");
  res.json(optimizer.optimize({ ...req.body, operations }));
});

// ---- cnc ----
router.post("/cnc/generate", (req, res) => {
  let payload = req.body || {};
  if (!payload.operations) payload.operations = store.getAll("operations");
  if (!payload.partName) payload.partName = seed.part.name;
  res.json(cnc.generate(payload));
});

// ---- ppc ----
router.get("/ppc", (req, res) => {
  const projects = store.getAll("projects");
  const byStatus = projects.reduce((acc, p) => {
    acc[p.status] = (acc[p.status] || 0) + 1;
    return acc;
  }, {});
  res.json({ plans: projects, summary: byStatus, total: projects.length });
});

// ---- assistant ----
router.post("/assistant", (req, res) => {
  res.json(assistant.ask((req.body && req.body.message) || ""));
});

// ---- reports ----
router.get("/reports", (req, res) => {
  const operations = store.getAll("operations");
  const projects = store.getAll("projects");
  const totalTime = round(
    operations.reduce((s, o) => s + Number(o.time || 0), 0),
    2,
  );
  const opt = optimizer.optimize({ operations });
  res.json({
    generatedAt: new Date().toISOString(),
    part: seed.part,
    kpis: {
      totalOperations: operations.length,
      totalCycleTime: totalTime,
      projects: projects.length,
      ...seed.dashboard,
    },
    optimization: opt.summary,
  });
});

// ---- admin: reset db ----
router.post("/admin/reset", (req, res) => {
  store.reset();
  res.json({ status: "reset", ...store.meta() });
});

function round(n, d = 2) {
  const f = Math.pow(10, d);
  return Math.round((Number(n) + Number.EPSILON) * f) / f;
}

module.exports = router;
