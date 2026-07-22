/**
 * machining.js — Core machining/cutting formula engine.
 *
 * All formulas follow standard ISO metal-cutting relationships.
 * Verified against reference case: D=25, Z=4, Vc=180, fz=0.12, ap=2.5, ae=20
 *   => N ≈ 2292 rpm, Vf ≈ 1100 mm/min, MRR = 55.0 cm³/min
 */

const PI = Math.PI;

/** Specific cutting force kc (N/mm²) by material — used for power/force. */
const MATERIALS = {
  'Aluminum 6061': { kc: 800, vcMill: 400, vcTurn: 300, vcDrill: 90 },
  'Aluminum 7075': { kc: 850, vcMill: 350, vcTurn: 280, vcDrill: 85 },
  Brass: { kc: 700, vcMill: 250, vcTurn: 200, vcDrill: 70 },
  Bronze: { kc: 900, vcMill: 200, vcTurn: 180, vcDrill: 60 },
  Copper: { kc: 750, vcMill: 220, vcTurn: 180, vcDrill: 60 },
  'Cast Iron': { kc: 1100, vcMill: 150, vcTurn: 120, vcDrill: 40 },
  EN8: { kc: 2000, vcMill: 120, vcTurn: 180, vcDrill: 30 },
  'Mild Steel': { kc: 1900, vcMill: 110, vcTurn: 160, vcDrill: 28 },
  'Alloy Steel': { kc: 2200, vcMill: 90, vcTurn: 130, vcDrill: 22 },
  'Stainless Steel': { kc: 2300, vcMill: 80, vcTurn: 120, vcDrill: 18 },
  'Tool Steel': { kc: 2500, vcMill: 60, vcTurn: 90, vcDrill: 15 },
  Titanium: { kc: 1400, vcMill: 50, vcTurn: 60, vcDrill: 12 },
  Inconel: { kc: 2800, vcMill: 30, vcTurn: 40, vcDrill: 8 },
};

const MACHINE_EFFICIENCY = 0.8; // spindle/drive efficiency η

function round(n, d = 2) {
  const f = Math.pow(10, d);
  return Math.round((Number(n) + Number.EPSILON) * f) / f;
}

/** Spindle speed N (rpm) from cutting speed Vc (m/min) and diameter D (mm). */
function spindleSpeed(vc, d) {
  if (!d) return 0;
  return (vc * 1000) / (PI * d);
}

/** Cutting speed Vc (m/min) from spindle speed N (rpm) and diameter D (mm). */
function cuttingSpeed(n, d) {
  return (PI * d * n) / 1000;
}

/**
 * MILLING
 * @param {object} p { d, z, vc, fz, ap, ae, material }
 */
function milling(p) {
  const d = num(p.d, 25);
  const z = num(p.z, 4);
  const vc = num(p.vc, 180);
  const fz = num(p.fz, 0.12);
  const ap = num(p.ap, 2.5);
  const ae = num(p.ae, 20);
  const kc = materialKc(p.material);

  const n = spindleSpeed(vc, d); // rpm
  const vf = fz * z * n; // mm/min
  const mrr = (ap * ae * vf) / 1000; // cm³/min
  const powerKw = (ap * ae * vf * kc) / (60 * 1e6); // net cutting power kW
  const motorKw = powerKw / MACHINE_EFFICIENCY;
  const torque = n > 0 ? (powerKw * 9550) / n : 0; // Nm

  return {
    inputs: { d, z, vc, fz, ap, ae, material: p.material || 'Aluminum 6061' },
    results: {
      spindleSpeed: round(n, 0), // N (rpm)
      feedRate: round(vf, 0), // Vf (mm/min)
      mrr: round(mrr, 1), // cm³/min
      cuttingPower: round(powerKw, 2), // kW (net)
      motorPower: round(motorKw, 2), // kW (at motor)
      torque: round(torque, 2), // Nm
      chipThickness: round(fz * (ae / d < 0.5 ? 1 : 1), 3),
    },
    units: {
      spindleSpeed: 'rpm',
      feedRate: 'mm/min',
      mrr: 'cm³/min',
      cuttingPower: 'kW',
      motorPower: 'kW',
      torque: 'Nm',
    },
  };
}

/**
 * TURNING
 * @param {object} p { d, vc, f, ap, material }
 */
function turning(p) {
  const d = num(p.d, 50);
  const vc = num(p.vc, 200);
  const f = num(p.f, 0.2); // feed mm/rev
  const ap = num(p.ap, 1.5);
  const kc = materialKc(p.material);

  const n = spindleSpeed(vc, d); // rpm
  const vf = f * n; // mm/min
  const mrr = vc * ap * f; // cm³/min
  const powerKw = (mrr * kc) / (60 * 1e6 / 1000); // = mrr(cm³/min)*kc/60000 kW
  const motorKw = powerKw / MACHINE_EFFICIENCY;
  const cutForce = ap * f * kc; // N (tangential)

  return {
    inputs: { d, vc, f, ap, material: p.material || 'EN8' },
    results: {
      spindleSpeed: round(n, 0),
      feedRate: round(vf, 0),
      mrr: round(mrr, 1),
      cuttingPower: round(powerKw, 2),
      motorPower: round(motorKw, 2),
      cuttingForce: round(cutForce, 0),
    },
    units: {
      spindleSpeed: 'rpm',
      feedRate: 'mm/min',
      mrr: 'cm³/min',
      cuttingPower: 'kW',
      motorPower: 'kW',
      cuttingForce: 'N',
    },
  };
}

/**
 * DRILLING
 * @param {object} p { d, vc, f, material }
 */
function drilling(p) {
  const d = num(p.d, 10);
  const vc = num(p.vc, 30);
  const f = num(p.f, 0.15); // feed mm/rev
  const kc = materialKc(p.material);

  const n = spindleSpeed(vc, d); // rpm
  const vf = f * n; // mm/min
  const mrr = (PI / 4) * d * d * (vf / 1000); // cm³/min
  const powerKw = (mrr * kc) / 60000; // kW
  const motorKw = powerKw / MACHINE_EFFICIENCY;
  const torque = (kc * f * d * d) / 8000; // Nm (approx)
  const thrust = 0.5 * kc * f * d; // N (approx)

  return {
    inputs: { d, vc, f, material: p.material || 'Aluminum 6061' },
    results: {
      spindleSpeed: round(n, 0),
      feedRate: round(vf, 0),
      mrr: round(mrr, 2),
      cuttingPower: round(powerKw, 2),
      motorPower: round(motorKw, 2),
      torque: round(torque, 2),
      thrustForce: round(thrust, 0),
    },
    units: {
      spindleSpeed: 'rpm',
      feedRate: 'mm/min',
      mrr: 'cm³/min',
      cuttingPower: 'kW',
      motorPower: 'kW',
      torque: 'Nm',
      thrustForce: 'N',
    },
  };
}

function materialKc(material) {
  return (MATERIALS[material] && MATERIALS[material].kc) || 800;
}
function num(v, dflt) {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : dflt;
}

module.exports = {
  MATERIALS,
  MACHINE_EFFICIENCY,
  spindleSpeed,
  cuttingSpeed,
  milling,
  turning,
  drilling,
  round,
};
