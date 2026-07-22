/**
 * cncGenerator.js — Generates a simple ISO G-code program from a part + operations.
 * This is a teaching/demo generator (not a full CAM post-processor) but produces
 * valid, readable ISO G-code blocks similar to a real controller program.
 */

const { spindleSpeed } = require('./machining');

const OP_TEMPLATES = {
  face: { g: 'FACE MILL', tool: 'T01', code: (ctx) => faceBlocks(ctx) },
  rough: { g: 'ROUGH MILL', tool: 'T02', code: (ctx) => pocketBlocks(ctx, 'ROUGH') },
  contour: { g: 'CONTOUR MILL', tool: 'T03', code: (ctx) => contourBlocks(ctx) },
  pocket: { g: 'POCKET MILL', tool: 'T04', code: (ctx) => pocketBlocks(ctx, 'POCKET') },
  drill: { g: 'DRILL', tool: 'T05', code: (ctx) => drillBlocks(ctx) },
  ream: { g: 'REAM', tool: 'T06', code: (ctx) => drillBlocks(ctx, 'REAM') },
  tap: { g: 'TAP', tool: 'T07', code: (ctx) => tapBlocks(ctx) },
};

function generate(input) {
  const programNo = input.programNo || 'O1001';
  const partName = (input.partName || 'PART').toUpperCase();
  const operations = Array.isArray(input.operations) ? input.operations : defaultOps();
  const material = input.material || 'Aluminum 6061';

  const lines = [];
  let n = 10;
  const push = (txt) => {
    lines.push({ n: pad(n), text: txt });
    n += 10;
  };

  push('%');
  push(`${programNo} (${partName} CNC PROGRAM)`);
  push('G21 G17 G90 G40 G80'); // metric, XY plane, absolute, cancel comp/cycles
  push('G91 G28 Z0 (HOME Z)');
  push('G90 G54');

  operations.forEach((op, idx) => {
    const key = matchTemplate(op.operation);
    const tpl = OP_TEMPLATES[key] || OP_TEMPLATES.rough;
    const tool = op.tool || tpl.tool;
    const rpm = op.rpm || Math.round(spindleSpeed(op.vc || 180, op.d || 25) / 10) * 10 || 2000;
    const feed = op.feed || 800;

    push(`(--- OP ${op.opNo || (idx + 1) * 10}: ${String(op.operation || tpl.g).toUpperCase()} ---)`);
    push(`${tool} M06`);
    push(`S${rpm} M03`);
    push('G54 G00 X0 Y0');
    push('G43 H' + tool.replace(/\D/g, '') + ' Z25.0 M08');

    tpl.code({ push, feed, rpm }).forEach(push);

    push('M09');
    push('M05');
  });

  push('G91 G28 Z0');
  push('G90');
  push('M30');
  push('%');

  const text = lines.map((l) => `${l.n} ${l.text}`).join('\n');
  return { programNo, partName, material, lineCount: lines.length, lines, text };
}

function faceBlocks() {
  return [
    'G00 Z5.0',
    'G01 Z-2.0 F250',
    'G01 X100.0 Y0 F800',
    'G01 X100.0 Y80.0',
    'G01 X0 Y80.0',
    'G01 X0 Y0',
    'G00 Z5.0',
  ];
}
function pocketBlocks(ctx, tag) {
  return [
    `(${tag} PASS)`,
    'G00 Z5.0',
    'G01 Z-3.0 F200',
    'G01 X80.0 Y0 F900',
    'G01 X80.0 Y60.0',
    'G01 X10.0 Y60.0',
    'G01 X10.0 Y10.0',
    'G00 Z10.0',
  ];
}
function contourBlocks() {
  return [
    'G00 Z5.0',
    'G41 D01 X-5.0 Y-5.0',
    'G01 Z-4.0 F150',
    'G01 X105.0 F700',
    'G01 Y85.0',
    'G01 X-5.0',
    'G01 Y-5.0',
    'G40 G00 Z10.0',
  ];
}
function drillBlocks(ctx, mode) {
  const cyc = mode === 'REAM' ? 'G85' : 'G83';
  return [
    'G00 Z5.0',
    `${cyc} Z-20.0 R2.0 Q4.0 F120`,
    'X30.0 Y20.0',
    'X70.0 Y20.0',
    'X70.0 Y60.0',
    'X30.0 Y60.0',
    'G80 G00 Z10.0',
  ];
}
function tapBlocks() {
  return [
    'G00 Z5.0',
    'G84 Z-18.0 R3.0 F150 (RIGID TAP)',
    'X30.0 Y20.0',
    'X70.0 Y60.0',
    'G80 G00 Z10.0',
  ];
}

function matchTemplate(name) {
  const s = String(name || '').toLowerCase();
  if (s.includes('face')) return 'face';
  if (s.includes('rough')) return 'rough';
  if (s.includes('contour') || s.includes('profile')) return 'contour';
  if (s.includes('pocket')) return 'pocket';
  if (s.includes('ream')) return 'ream';
  if (s.includes('tap')) return 'tap';
  if (s.includes('drill')) return 'drill';
  return 'rough';
}
function pad(n) {
  return String(n).padStart(4, '0');
}
function defaultOps() {
  return [
    { opNo: 10, operation: 'Face Milling' },
    { opNo: 20, operation: 'Rough Milling' },
    { opNo: 30, operation: 'Contour Milling' },
    { opNo: 40, operation: 'Pocket Milling' },
    { opNo: 50, operation: 'Drilling' },
    { opNo: 60, operation: 'Reaming' },
    { opNo: 70, operation: 'Tapping' },
  ];
}

module.exports = { generate };
