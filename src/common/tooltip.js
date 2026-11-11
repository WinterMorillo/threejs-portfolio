// ------------------------------------------------------------
// tooltip.js — shows information when the mouse is over a bar.
// A Raycaster shoots an invisible "ray" from the camera through the
// mouse position and tells us which 3D objects it touches.
// ------------------------------------------------------------
import * as THREE from 'three';

export function enableTooltips({ camera, renderer }, getObjects, formatText) {
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  const tooltip = document.getElementById('tooltip');
  let hovered = null; // the bar currently under the mouse

  renderer.domElement.addEventListener('pointermove', (event) => {
    // Convert mouse pixels to "normalized" coordinates (-1 to +1), which Three.js expects
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const hits = raycaster.intersectObjects(getObjects());
    const bar = hits.length ? hits[0].object : null; // closest object hit

    // Un-highlight the previous bar if the mouse moved away from it
    if (hovered && hovered !== bar) {
      hovered.material.emissive.set('#000000');
      hovered = null;
    }

    if (bar) {
      hovered = bar;
      bar.material.emissive.set('#333333'); // make it glow a little
      tooltip.innerHTML = formatText(bar.userData); // userData = the data row we stored on the bar
      tooltip.style.display = 'block';
      tooltip.style.left = event.clientX + 14 + 'px';
      tooltip.style.top = event.clientY + 14 + 'px';
      renderer.domElement.style.cursor = 'pointer';
    } else {
      tooltip.style.display = 'none';
      renderer.domElement.style.cursor = 'default';
    }
  });
}

// Formats numbers as money: 125000 -> "$125,000"
export const money = (n) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
