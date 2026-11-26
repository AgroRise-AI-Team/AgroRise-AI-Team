import React, { useEffect, useRef } from 'react';

/**
 * SnowEffect Component
 * Renders smooth, gentle falling white snow/mist particles using HTML5 Canvas,
 * matching the atmospheric aesthetic of modern cinematic sites like neram-chi.vercel.app.
 */
export default function SnowEffect({ count = 95 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const getDimensions = () => {
      const parent = canvas.parentElement;
      return {
        w: parent ? parent.clientWidth : window.innerWidth,
        h: parent ? parent.clientHeight : window.innerHeight,
      };
    };

    let { w, h } = getDimensions();
    canvas.width = w;
    canvas.height = h;

    // Initialize snowflake particles
    const flakes = [];
    for (let i = 0; i < count; i++) {
      flakes.push({
        x: Math.random() * w,
        y: Math.random() * h,
        radius: Math.random() * 2.8 + 0.8, // 0.8px to 3.6px
        speedY: Math.random() * 0.95 + 0.35, // fall speed
        speedX: Math.random() * 0.35 - 0.17, // slight horizontal drift
        opacity: Math.random() * 0.65 + 0.3, // opacity between 0.3 and 0.95
        swayAmplitude: Math.random() * 1.4 + 0.4,
        swaySpeed: Math.random() * 0.018 + 0.006,
        angle: Math.random() * Math.PI * 2,
      });
    }

    const handleResize = () => {
      if (!canvas) return;
      const dims = getDimensions();
      w = canvas.width = dims.w;
      h = canvas.height = dims.h;
    };

    window.addEventListener('resize', handleResize);

    const render = () => {
      ctx.clearRect(0, 0, w, h);

      for (let i = 0; i < flakes.length; i++) {
        const flake = flakes[i];

        // Draw soft glowing snowflake
        ctx.beginPath();
        ctx.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2, false);
        ctx.fillStyle = `rgba(255, 255, 255, ${flake.opacity})`;
        ctx.shadowBlur = flake.radius > 2 ? 6 : 2;
        ctx.shadowColor = 'rgba(255, 255, 255, 0.75)';
        ctx.fill();

        // Update coordinates
        flake.angle += flake.swaySpeed;
        flake.y += flake.speedY;
        flake.x += Math.sin(flake.angle) * flake.swayAmplitude * 0.35 + flake.speedX;

        // Wrap around smoothly when snowflake leaves viewport
        if (flake.y > h + 10) {
          flake.y = -10;
          flake.x = Math.random() * w;
        }
        if (flake.x > w + 10) {
          flake.x = -10;
        } else if (flake.x < -10) {
          flake.x = w + 10;
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [count]);

  return (
    <canvas
      ref={canvasRef}
      className="snow-canvas-overlay"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 2,
      }}
    />
  );
}
