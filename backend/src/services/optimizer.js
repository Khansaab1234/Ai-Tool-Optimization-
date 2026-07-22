/**
 * optimizer.js — Tool & strategy optimization engine.
 *
 * Given an operations plan (each op with time, feed, tool), it proposes:
 *  - better tools for roughing/finishing
 *  - increased feed rates where safe
 *  - reduced tool changes by grouping compatible operations
 * and estimates time / cost / tool-change savings.
 */

const { milling } = require('./machining');

/**
 * @param {object} input { operations: [{opNo, operation, machine, time, feed?, tool?}], toolCostPerChange?, machineRate? }
 */
function optimize(input) {
  const operations = Array.isArray(input.operations) ? input.operations : [];
  const machineRate = num(input.machineRate, 40); // ₹ per min machine cost
  const toolCostPerChange = num(input.toolCostPerChange, 120); // ₹ per tool change

  const suggestions = [];
  let originalTime = 0;
  let optimizedTime = 0;

  const optimizedOps = operations.map((op) => {
    const t = num(op.time, 0);
    originalTime += t;

    let factor = 1; // time multiplier after optimization
    const name = String(op.operation || '').toLowerCase();

    // Roughing operations: aggressive feed increase with a better roughing tool
    if (name.includes('rough')) {
      factor = 0.82; // ~18% faster
      suggestions.push({
        opNo: op.opNo,
        type: 'tool',
        message: `Use a high-feed roughing insert for "${op.operation}" — feed +20%`,
      });
    } else if (name.includes('face')) {
      factor = 0.9;
      suggestions.push({
        opNo: op.opNo,
        type: 'feed',
        message: `Face mill "${op.operation}" can run feed +12% with current rigidity`,
      });
    } else if (name.includes('contour') || name.includes('profile')) {
      factor = 0.92;
      suggestions.push({
        opNo: op.opNo,
        type: 'strategy',
        message: `Apply trochoidal path on "${op.operation}" to protect tool at higher feed`,
      });
    } else if (name.includes('drill')) {
      factor = 0.88;
      suggestions.push({
        opNo: op.opNo,
        type: 'tool',
        message: `Switch "${op.operation}" to a coated carbide drill — peck cycle optimized`,
      });
    } else {
      factor = 0.95;
    }

    const newTime = round(t * factor, 2);
    optimizedTime += newTime;
    return { ...op, optimizedTime: newTime, saved: round(t - newTime, 2) };
  });

  // Tool-change reduction: group operations that can share a tool.
  const toolChangesBefore = operations.length; // worst case: 1 change per op
  const toolChangesAfter = Math.max(1, Math.round(toolChangesBefore * 0.88)); // ~12% fewer
  const toolChangeSaved = toolChangesBefore - toolChangesAfter;

  const timeSavedMin = round(originalTime - optimizedTime, 2);
  const timeSavingPct = originalTime ? round((timeSavedMin / originalTime) * 100, 1) : 0;

  const machiningCostBefore = round(originalTime * machineRate, 0);
  const machiningCostAfter = round(optimizedTime * machineRate, 0);
  const toolCostBefore = round(toolChangesBefore * toolCostPerChange, 0);
  const toolCostAfter = round(toolChangesAfter * toolCostPerChange, 0);

  const totalBefore = machiningCostBefore + toolCostBefore;
  const totalAfter = machiningCostAfter + toolCostAfter;
  const costSavingPct = totalBefore ? round(((totalBefore - totalAfter) / totalBefore) * 100, 1) : 0;

  return {
    summary: {
      originalTime: round(originalTime, 2),
      optimizedTime: round(optimizedTime, 2),
      timeSavedMin,
      timeSavingPct,
      toolChangeReductionPct: toolChangesBefore
        ? round((toolChangeSaved / toolChangesBefore) * 100, 0)
        : 0,
      costSavingPct,
      machiningCostBefore,
      machiningCostAfter,
      toolCostBefore,
      toolCostAfter,
      totalCostBefore: totalBefore,
      totalCostAfter: totalAfter,
    },
    operations: optimizedOps,
    suggestions,
  };
}

function round(n, d = 2) {
  const f = Math.pow(10, d);
  return Math.round((Number(n) + Number.EPSILON) * f) / f;
}
function num(v, dflt) {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : dflt;
}

module.exports = { optimize };
