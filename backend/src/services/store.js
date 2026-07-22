/**
 * store.js — Lightweight JSON-file data store (no external DB required).
 * Loads seed data on first run, persists to db.json on write.
 * Modular: replace this module with a Mongoose/Prisma layer later without
 * touching the routes.
 */

const fs = require('fs');
const path = require('path');
const seed = require('../data/seed');

const DB_PATH = path.join(__dirname, '..', 'data', 'db.json');

let db;

function load() {
  if (db) return db;
  try {
    if (fs.existsSync(DB_PATH)) {
      db = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
    } else {
      db = JSON.parse(JSON.stringify(seed));
      persist();
    }
  } catch (e) {
    console.error('store load failed, using seed:', e.message);
    db = JSON.parse(JSON.stringify(seed));
  }
  return db;
}

function persist() {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
  } catch (e) {
    console.error('store persist failed:', e.message);
  }
}

function getAll(collection) {
  load();
  return db[collection] || [];
}

function getById(collection, id) {
  return getAll(collection).find((x) => String(x.id) === String(id));
}

function insert(collection, item) {
  load();
  if (!db[collection]) db[collection] = [];
  const id = item.id || nextId(collection);
  const record = { ...item, id, createdAt: new Date().toISOString() };
  db[collection].push(record);
  persist();
  return record;
}

function update(collection, id, patch) {
  load();
  const list = db[collection] || [];
  const idx = list.findIndex((x) => String(x.id) === String(id));
  if (idx === -1) return null;
  list[idx] = { ...list[idx], ...patch, id: list[idx].id };
  persist();
  return list[idx];
}

function remove(collection, id) {
  load();
  const list = db[collection] || [];
  const idx = list.findIndex((x) => String(x.id) === String(id));
  if (idx === -1) return false;
  list.splice(idx, 1);
  persist();
  return true;
}

function meta() {
  load();
  return db.meta || {};
}

function nextId(collection) {
  const list = getAll(collection);
  const max = list.reduce((m, x) => Math.max(m, parseInt(x.id, 10) || 0), 0);
  return max + 1;
}

function reset() {
  db = JSON.parse(JSON.stringify(seed));
  persist();
  return db;
}

module.exports = { getAll, getById, insert, update, remove, meta, reset };
