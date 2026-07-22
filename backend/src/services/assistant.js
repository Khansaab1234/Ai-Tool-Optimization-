/**
 * assistant.js — Rule-based machining assistant.
 * Understands intents around calculators, optimization, tools and operations
 * and returns a helpful answer plus optional structured data.
 */

const machining = require('./machining');
const store = require('./store');

function ask(message) {
  const q = String(message || '').toLowerCase().trim();

  if (!q) {
    return reply("Namaste! Main aapka CNC assistant hoon. Poochiye: 'rpm for 25mm aluminum', 'optimize', 'tool for roughing', ya 'cycle time'.");
  }

  // Spindle speed / RPM
  if (q.includes('rpm') || q.includes('spindle') || q.includes('speed')) {
    const d = extractNumber(q, ['mm', 'dia', 'diameter', 'd']) || 25;
    const vc = extractAfter(q, 'vc') || guessVc(q);
    const n = machining.spindleSpeed(vc, d);
    return reply(
      `For Ø${d} mm at Vc ${vc} m/min, spindle speed N ≈ ${Math.round(n)} rpm  (N = Vc×1000 / (π×D)).`,
      { spindleSpeed: Math.round(n), d, vc }
    );
  }

  // Optimization
  if (q.includes('optim') || q.includes('faster') || q.includes('reduce') || q.includes('save')) {
    const d = store.getAll('dashboard');
    return reply(
      'Optimization tips: (1) use high-feed roughing inserts (+18% MRR), (2) apply trochoidal paths on contours to raise feed safely, (3) group operations to cut tool changes ~12%, (4) use coated carbide drills with peck cycles. Estimated cycle-time saving ~18% and cost saving ~15%.'
    );
  }

  // Tool recommendation
  if (q.includes('tool') || q.includes('cutter') || q.includes('insert')) {
    if (q.includes('rough')) {
      return reply('For roughing: a 4-flute AlCrN-coated high-feed mill (e.g. AT-HF-20) gives the best MRR on aluminium and steel. Increase feed ~20% vs a standard end mill.');
    }
    if (q.includes('finish') || q.includes('contour')) {
      return reply('For finishing/contour: a fine-pitch AlTiN end mill (e.g. AT-CUT-ER32-25) with trochoidal strategy gives good surface finish at higher feed.');
    }
    const tools = store.getAll('tools').filter((t) => t.recommended);
    return reply(
      `Recommended tools right now: ${tools.map((t) => `${t.code} (${t.name})`).join(', ')}.`,
      { tools }
    );
  }

  // MRR
  if (q.includes('mrr') || q.includes('material removal')) {
    return reply('MRR (milling) = ap × ae × Vf / 1000 in cm³/min. Higher MRR means faster stock removal but more spindle power — check power stays within machine limits.');
  }

  // Cycle time / cost
  if (q.includes('cycle') || q.includes('time') || q.includes('cost')) {
    const d = store.getAll('dashboard')[0] || require('../data/seed').dashboard;
    const db = require('../data/seed').dashboard;
    return reply(
      `Current plan: total cycle time ${db.totalCycleTime} min (optimized ${db.cycleTimeOptimizedPct}%), tool cost ₹${db.totalToolCost}, machining cost ₹${db.totalMachiningCost}, efficiency ${db.overallEfficiency}%.`,
      { dashboard: db }
    );
  }

  // Feed
  if (q.includes('feed')) {
    return reply('Feed rate Vf (mm/min) = fz × Z × N for milling, or f × N for turning/drilling. Raise fz gradually and watch tool deflection and surface finish.');
  }

  return reply(
    "Main in cheezon mein madad kar sakta hoon: cutting calculator (rpm, feed, MRR, power), tool recommendation, operation optimization, aur CNC program. Thoda aur detail se poochiye — jaise 'rpm for 12mm end mill in EN8'."
  );
}

function reply(answer, data) {
  return { answer, data: data || null, ts: new Date().toISOString() };
}
function extractNumber(q, hints) {
  const m = q.match(/(\d+(\.\d+)?)\s*mm/) || q.match(/ø\s*(\d+(\.\d+)?)/) || q.match(/(\d+(\.\d+)?)/);
  return m ? parseFloat(m[1]) : null;
}
function extractAfter(q, key) {
  const m = q.match(new RegExp(key + '\\s*(\\d+(\\.\\d+)?)'));
  return m ? parseFloat(m[1]) : null;
}
function guessVc(q) {
  if (q.includes('steel') || q.includes('en8')) return 120;
  if (q.includes('stainless')) return 80;
  if (q.includes('titanium')) return 50;
  return 180; // aluminum default
}

module.exports = { ask };
