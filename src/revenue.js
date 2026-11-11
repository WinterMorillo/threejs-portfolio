// ------------------------------------------------------------
// revenue.js — 3D bar grid: months (X axis) × regions (Z axis).
// Bar height = revenue. Data comes from /public/data/revenue.json,
// which imitates the JSON a SQL query would return.
// ------------------------------------------------------------
import * as THREE from 'three';
import { createScene, createLabel } from './common/scene.js';
import { enableTooltips, money } from './common/tooltip.js';

const REGION_COLORS = ['#60a5fa', '#34d399', '#fbbf24', '#f472b6', '#a78bfa'];
const SPACING = 1.3;     // distance between bar centers
const MAX_HEIGHT = 6;    // height of the tallest bar in 3D units

const { scene, camera, renderer, controls } = createScene(document.getElementById('app'));
const bars = []; // we keep every bar here so the tooltip can check them

async function main() {
  // 1. Load the data (same as calling an API endpoint)
  const response = await fetch('/data/revenue.json');
  const rows = await response.json(); // [{ region, month, revenue }, ...]

  // 2. Get the unique lists of months and regions (like SELECT DISTINCT)
  const months = [...new Set(rows.map((r) => r.month))];
  const regions = [...new Set(rows.map((r) => r.region))];
  const maxRevenue = Math.max(...rows.map((r) => r.revenue));

  // Offsets so the whole grid is centered at (0, 0, 0)
  const offsetX = ((months.length - 1) * SPACING) / 2;
  const offsetZ = ((regions.length - 1) * SPACING) / 2;

  // 3. ONE geometry shared by all bars (a 1×1×1 box). Each bar just
  //    stretches it with .scale — cheaper than creating 60 geometries.
  const boxGeometry = new THREE.BoxGeometry(0.9, 1, 0.9);

  // 4. Create one bar per data row
  rows.forEach((row) => {
    const x = months.indexOf(row.month) * SPACING - offsetX;
    const z = regions.indexOf(row.region) * SPACING - offsetZ;
    const height = (row.revenue / maxRevenue) * MAX_HEIGHT;

    // Each bar gets its own material so we can highlight it alone on hover
    const material = new THREE.MeshStandardMaterial({
      color: REGION_COLORS[regions.indexOf(row.region) % REGION_COLORS.length],
      roughness: 0.5,
    });

    const bar = new THREE.Mesh(boxGeometry, material);
    bar.scale.y = height;          // stretch the 1-unit box to the real height
    bar.position.set(x, height / 2, z); // boxes grow from their center, so lift by half
    bar.userData = row;            // store the data row on the bar (used by the tooltip)

    scene.add(bar);
    bars.push(bar);
  });

  // 5. Floor grid so the bars don't float in space
  const size = Math.max(months.length, regions.length) * SPACING + 2;
  const grid = new THREE.GridHelper(size, Math.round(size), '#334155', '#1e293b');
  scene.add(grid);

  // 6. Axis labels: months in front, regions on the right side
  months.forEach((m, i) => {
    const label = createLabel(m, { size: 0.45 });
    label.position.set(i * SPACING - offsetX, 0.3, offsetZ + 1.4);
    scene.add(label);
  });
  regions.forEach((r, i) => {
    const label = createLabel(r, { size: 0.5 });
    label.position.set(offsetX + 2.2, 0.3, i * SPACING - offsetZ);
    scene.add(label);
  });

  // 7. Legend in the HTML panel (normal DOM, not 3D)
  document.getElementById('legend').innerHTML = regions
    .map((r, i) => `<span><i style="background:${REGION_COLORS[i]}"></i>${r}</span>`)
    .join('');

  // 8. Point the camera at the middle of the chart
  camera.position.set(13, 15, 17); // high enough to see over the front row
  controls.target.set(0, MAX_HEIGHT / 3, 0);

  // 9. Tooltip text for a hovered bar
  enableTooltips({ camera, renderer }, () => bars, (d) =>
    `<b>${d.region}</b> · ${d.month} 2025<br>Revenue: <b>${money(d.revenue)}</b>`
  );
}

main();
