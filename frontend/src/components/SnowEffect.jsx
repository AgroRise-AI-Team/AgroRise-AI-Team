import React, { useEffect, useRef } from 'react';

/**
 * Exact Atmospheric Shader Effect from neram-chi.vercel.app
 * Uses hardware-accelerated WebGL with domain-warped 4-octave fBm value noise
 * for drifting white mist/snow/fog dynamics.
 */
export default function SnowEffect() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl', {
      alpha: true,
      antialias: false,
      powerPreference: 'high-performance',
    });

    if (!gl) {
      console.warn('WebGL not supported for atmospheric effect');
      return;
    }

    // Vertex Shader: Fullscreen quad
    const vsSource = `
      attribute vec2 position;
      varying vec2 vUv;
      void main() {
        vUv = position * 0.5 + 0.5;
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `;

    // Fragment Shader: Exact neram-chi.vercel.app shader logic
    const fsSource = `
      precision highp float;
      uniform float uTime;
      uniform float uScroll;
      uniform float uDensity;
      uniform float uRainMode;
      varying vec2 vUv;

      // ── Value noise ──────────────────────────────────────────────────────────
      float hash(vec2 p) {
        p = fract(p * vec2(127.1, 311.7));
        p += dot(p, p + 74.3);
        return fract(p.x * p.y);
      }

      float vnoise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0); // quintic
        return mix(
          mix(hash(i),               hash(i + vec2(1,0)), u.x),
          mix(hash(i + vec2(0,1)),   hash(i + vec2(1,1)), u.x),
          u.y
        );
      }

      // 4-octave fBm (optimized from 6)
      float fbm(vec2 p) {
        float v = 0.0, a = 0.52;
        mat2 rot = mat2(0.8660, 0.5, -0.5, 0.8660); // 30° rotation
        for (int i = 0; i < 4; i++) {
          v += a * vnoise(p);
          p  = rot * p * 2.05;
          a *= 0.49;
        }
        return v;
      }

      void main() {
        // ── 1. Large-scale UVs & Rain Stretching ───────────────────────────────
        vec2 baseUv = vUv * 0.7;
        vec2 rainUv = vUv * vec2(2.5, 0.05);
        vec2 uv = mix(baseUv, rainUv, uRainMode);

        // ── 2. Wind Dynamics ───────────────────────────────────────────────────
        // Fog: slow horizontal drift
        vec2 fogWind1 = vec2(uTime * 0.25, sin(uTime * 0.05) * 0.02);
        vec2 fogWind2 = vec2(uTime * 0.35, sin(uTime * 0.08) * 0.015);
        
        // Rain: fast vertical falling, slight slant
        vec2 rainWind1 = vec2(uTime * -0.3, uTime * -3.5);
        vec2 rainWind2 = vec2(uTime * -0.5, uTime * -4.5);
        
        vec2 wind1 = mix(fogWind1, rainWind1, uRainMode);
        vec2 wind2 = mix(fogWind2, rainWind2, uRainMode);

        // ── 3. Optimized double domain-warp fBm ────────────────────────────────
        float q1 = fbm(uv + wind1);
        float f1 = fbm(uv + vec2(q1 * 0.8) + wind1);

        float q2 = fbm(uv * 1.3 + wind2);
        float f2 = fbm(uv * 1.3 + vec2(q2 * 0.7) + wind2);

        float fog = f1 * 0.70 + f2 * 0.30;

        // ── 4. Fog/Storm Colour ────────────────────────────────────────────────
        vec3 baseFogColor = vec3(0.85, 0.90, 0.88); // Crisp white/mist tone
        vec3 stormColor = vec3(0.25, 0.3, 0.35);
        vec3 fogColor = mix(baseFogColor, stormColor, uRainMode);

        // ── 5. Alpha & Dynamics ────────────────────────────────────────────────
        float alpha = smoothstep(0.1, 0.95, fog) * (0.85 + uRainMode * 0.5);
        
        // Denser at the top / horizon
        float topDensity = smoothstep(0.35, 1.0, vUv.y);
        alpha = max(alpha, topDensity * fog * 1.6);
        
        // Overall density
        alpha *= uDensity;

        // Fade out smoothly when scrolled down deeply
        alpha *= 1.0 - clamp((uScroll - 700.0) / 900.0, 0.0, 1.0);

        gl_FragColor = vec4(fogColor, clamp(alpha, 0.0, 0.85));
      }
    `;

    // Helper: Compile shader
    function createShader(gl, type, source) {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader compile error:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    }

    const vs = createShader(gl, gl.VERTEX_SHADER, vsSource);
    const fs = createShader(gl, gl.FRAGMENT_SHADER, fsSource);
    if (!vs || !fs) return;

    const program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program link error:', gl.getProgramInfoLog(program));
      return;
    }

    gl.useProgram(program);

    // Full-screen quad buffer
    const positionLocation = gl.getAttribLocation(program, 'position');
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
        -1.0, -1.0,
         1.0, -1.0,
        -1.0,  1.0,
        -1.0,  1.0,
         1.0, -1.0,
         1.0,  1.0,
      ]),
      gl.STATIC_DRAW
    );
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    // Uniform locations
    const uTimeLoc = gl.getUniformLocation(program, 'uTime');
    const uScrollLoc = gl.getUniformLocation(program, 'uScroll');
    const uDensityLoc = gl.getUniformLocation(program, 'uDensity');
    const uRainModeLoc = gl.getUniformLocation(program, 'uRainMode');

    // Scroll tracking
    let targetScroll = window.scrollY;
    let currentScroll = targetScroll;
    const handleScroll = () => {
      targetScroll = window.scrollY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Resize handling
    const resize = () => {
      const parent = canvas.parentElement;
      const width = parent ? parent.clientWidth : window.innerWidth;
      const height = parent ? parent.clientHeight : window.innerHeight;
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        gl.viewport(0, 0, width, height);
      }
    };
    resize();
    window.addEventListener('resize', resize);

    // Animation loop matching neram's dynamic density calculation
    let animationId;
    const startTime = performance.now();

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    const render = (time) => {
      resize();

      // Smooth lerp scroll
      const delta = 0.016;
      currentScroll += (targetScroll - currentScroll) * Math.min(delta * 2.5, 1.0);

      // Density calculation matching neram logic
      const s = window.innerHeight;
      const c = Math.abs(currentScroll - s * 1.4);
      const density = 0.9 + Math.max(0.0, 1.0 - c / (s * 0.8)) * 0.5;

      const elapsed = (time - startTime) * 0.001;

      gl.uniform1f(uTimeLoc, elapsed);
      gl.uniform1f(uScrollLoc, currentScroll);
      gl.uniform1f(uDensityLoc, density);
      gl.uniform1f(uRainModeLoc, 0.0); // Clean ambient white mist / snow mode

      gl.clearColor(0.0, 0.0, 0.0, 0.0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.drawArrays(gl.TRIANGLES, 0, 6);

      animationId = requestAnimationFrame(render);
    };

    animationId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationId);
      gl.deleteBuffer(positionBuffer);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="neram-exact-fog-canvas"
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
