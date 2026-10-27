"use strict";

const canvas = document.createElement("canvas");
canvas.id = "quantum-canvas";
document.body.appendChild(canvas);

const ctx = canvas.getContext("2d");

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

window.addEventListener("resize", resize);
resize();

const particles = Array.from({ length: 120 }, () => ({
  x: Math.random() * canvas.width,
  y: Math.random() * canvas.height,
  r: Math.random() * 2 + 1,
  v: Math.random() * 0.4 + 0.1
}));

function frame() {
  ctx.fillStyle = "#050b12";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  particles.forEach(p => {
    p.y -= p.v;

    if (p.y < -10) {
      p.y = canvas.height + 10;
      p.x = Math.random() * canvas.width;
    }

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(120,220,255,.7)";
    ctx.fill();
  });

  requestAnimationFrame(frame);
}

frame();

console.log("QUANTUM_RENDER_LOOP_ONLINE");
