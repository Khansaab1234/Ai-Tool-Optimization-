/**
 * seed.js — Initial demo data for ASET TRONICS.
 * Numbers mirror the product dashboard (Housing part, 7 operations, 95.85 min).
 */

module.exports = {
  meta: {
    company: 'ASET TRONICS',
    tagline: 'AI Powered Manufacturing Excellence',
    currency: '₹',
    version: '1.0.0',
  },

  projects: [
    {
      id: 1,
      partNo: 'P-1001',
      partName: 'Housing',
      material: 'Aluminum 6061',
      orderQty: 50,
      machine: 'VMX 850',
      status: 'In Progress',
      progress: 65,
      startDate: '2025-07-22',
      dueDate: '2025-07-29',
    },
    {
      id: 2,
      partNo: 'P-1002',
      partName: 'Cover Plate',
      material: 'EN8',
      orderQty: 30,
      machine: 'VMX 850',
      status: 'Planned',
      progress: 20,
      startDate: '2025-07-23',
      dueDate: '2025-07-30',
    },
    {
      id: 3,
      partNo: 'P-1003',
      partName: 'Shaft Coupling',
      material: 'Alloy Steel',
      orderQty: 100,
      machine: 'CNC Lathe TL-2',
      status: 'Completed',
      progress: 100,
      startDate: '2025-07-15',
      dueDate: '2025-07-21',
    },
  ],

  operations: [
    { id: 1, projectId: 1, opNo: 10, operation: 'Face Milling', machine: 'VMX 850', time: 12.45, tool: 'T01', feed: 800, rpm: 2000, vc: 180, d: 63 },
    { id: 2, projectId: 1, opNo: 20, operation: 'Rough Milling', machine: 'VMX 850', time: 25.30, tool: 'T02', feed: 900, rpm: 2292, vc: 180, d: 25 },
    { id: 3, projectId: 1, opNo: 30, operation: 'Contour Milling', machine: 'VMX 850', time: 18.20, tool: 'T03', feed: 700, rpm: 3000, vc: 200, d: 16 },
    { id: 4, projectId: 1, opNo: 40, operation: 'Pocket Milling', machine: 'VMX 850', time: 15.10, tool: 'T04', feed: 750, rpm: 3200, vc: 200, d: 12 },
    { id: 5, projectId: 1, opNo: 50, operation: 'Drilling', machine: 'VMX 850', time: 10.35, tool: 'T05', feed: 120, rpm: 1200, vc: 90, d: 10 },
    { id: 6, projectId: 1, opNo: 60, operation: 'Reaming', machine: 'VMX 850', time: 8.15, tool: 'T06', feed: 100, rpm: 800, vc: 40, d: 10 },
    { id: 7, projectId: 1, opNo: 70, operation: 'Tapping', machine: 'VMX 850', time: 6.30, tool: 'T07', feed: 150, rpm: 500, vc: 25, d: 8 },
  ],

  tools: [
    { id: 1, code: 'AT-CUT-ER32-25', name: 'Shoulder Milling Cutter', type: 'End Mill', diameter: 25, flutes: 4, material: 'Carbide', coating: 'AlTiN', recommended: true, stock: 8, price: 3200 },
    { id: 2, code: 'AT-FM-63', name: 'Face Mill 63mm', type: 'Face Mill', diameter: 63, flutes: 5, material: 'Carbide', coating: 'TiAlN', recommended: false, stock: 4, price: 8500 },
    { id: 3, code: 'AT-EM-16', name: 'End Mill 16mm', type: 'End Mill', diameter: 16, flutes: 4, material: 'Carbide', coating: 'AlTiN', recommended: false, stock: 12, price: 1900 },
    { id: 4, code: 'AT-EM-12', name: 'End Mill 12mm', type: 'End Mill', diameter: 12, flutes: 3, material: 'Carbide', coating: 'TiN', recommended: false, stock: 15, price: 1500 },
    { id: 5, code: 'AT-DR-10', name: 'Coated Drill 10mm', type: 'Drill', diameter: 10, flutes: 2, material: 'Carbide', coating: 'TiAlN', recommended: false, stock: 20, price: 950 },
    { id: 6, code: 'AT-RM-10', name: 'Reamer 10mm H7', type: 'Reamer', diameter: 10, flutes: 6, material: 'HSS-Co', coating: 'None', recommended: false, stock: 6, price: 1400 },
    { id: 7, code: 'AT-TAP-M8', name: 'Spiral Tap M8', type: 'Tap', diameter: 8, flutes: 3, material: 'HSS-E', coating: 'TiN', recommended: false, stock: 10, price: 700 },
    { id: 8, code: 'AT-HF-20', name: 'High-Feed Mill 20mm', type: 'End Mill', diameter: 20, flutes: 4, material: 'Carbide', coating: 'AlCrN', recommended: true, stock: 5, price: 4100 },
  ],

  part: {
    id: 1,
    partNo: 'P-1001',
    name: 'Housing',
    material: 'Aluminum 6061',
    dimensions: { x: 120, y: 90, z: 45 },
    weight: 0.86,
    features: ['Top pocket', '4x M8 tapped holes', 'Contour profile', '10mm reamed bores'],
  },

  dashboard: {
    totalCycleTime: 95.85,
    cycleTimeOptimizedPct: 18.6,
    totalToolCost: 4850,
    toolCostOptimizedPct: 15.4,
    totalMachiningCost: 7680,
    machiningCostOptimizedPct: 16.2,
    overallEfficiency: 87.3,
    efficiencyImprovedPct: 12.8,
    machineUtilization: { running: 68, idle: 18, setup: 10, down: 4 },
    aiHighlights: [
      'Tool change reduced by 12%',
      'Better tool for Roughing operation',
      'Feed rate increased in 2 operations',
      'Overall cost saving: 15.4%',
    ],
    estimatedCycleReductionPct: 18.6,
  },
};
