import React, { useEffect, useRef } from 'react';

// ---- Constants ---------------------------------------------------------------
const TOTAL_FRAMES      = 240;
const TRANS_START       = 114;
const TRANS_END         = 212;
const PARTICLE_START    = 170;
const DISSOLVE_START    = 203;
const DISSOLVE_END      = 212;
const SCROLL_PX         = 2400;
const ZOOM_START        = 1.0;
const ZOOM_END          = 1.55;
const LIFT_END_FRAC     = 0.28;
const MAX_PARTICLES     = 220;
const DOT_STEP          = 6;

const RAW_P_AT_203  = (DISSOLVE_START - TRANS_START) / (TRANS_END - TRANS_START);

// Final 20-frame fade section: frame 193 → 212
const FADE_START    = 193;
const RAW_P_AT_193  = (FADE_START - TRANS_START) / (TRANS_END - TRANS_START);

// ---- Types -------------------------------------------------------------------
interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  size: number; alpha: number; decay: number;
}
interface PixelDot {
  x: number; y: number;
  r: number; g: number; b: number;
  dx: number; dy: number;
}

// ---- Helpers -----------------------------------------------------------------
function clamp(v: number, lo: number, hi: number) {
  return v < lo ? lo : v > hi ? hi : v;
}
function easeInOut(t: number) {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}
function easeIn(t: number) {
  return t * t;
}
function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

// ---- Component ---------------------------------------------------------------
interface Props { children: React.ReactNode; }

export default function LogoIntroTransition({ children }: Props) {
  const baseCanvasRef = useRef<HTMLCanvasElement>(null);
  const dustCanvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef    = useRef<HTMLDivElement>(null);
  const containerRef  = useRef<HTMLDivElement>(null);

  const frames        = useRef<(HTMLImageElement | null)[]>(new Array(TOTAL_FRAMES + 1).fill(null));
  const lastGoodImg   = useRef<HTMLImageElement | null>(null);
  const particles     = useRef<Particle[]>([]);
  const pixelDots     = useRef<PixelDot[]>([]);
  const dotsSampledSize = useRef<{ w: number; h: number } | null>(null);

  // ── Preload all frames ───────────────────────────────────────────────────
  useEffect(() => {
    for (let i = 1; i <= TOTAL_FRAMES; i++) {
      const img = new Image();
      img.src = `/logo_animation/frame_${i.toString().padStart(4, '0')}.jpg`;
      frames.current[i] = img;
    }
  }, []);

  // ── Resize both canvases ─────────────────────────────────────────────────
  useEffect(() => {
    const resize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      if (baseCanvasRef.current) { baseCanvasRef.current.width = w; baseCanvasRef.current.height = h; }
      if (dustCanvasRef.current) { dustCanvasRef.current.width = w; dustCanvasRef.current.height = h; }
      dotsSampledSize.current = null; // invalidate sample on resize
    };
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  // ── Main rAF loop ────────────────────────────────────────────────────────
  useEffect(() => {
    let rafId: number;
    let crashed = false;

    // Sample logo pixels from frame 203 into a dot grid
    const sampleLogoPixels = (img203: HTMLImageElement, cw: number, ch: number) => {
      try {
        const easedAt203 = easeInOut(RAW_P_AT_203);
        const zoom203    = lerp(ZOOM_START, ZOOM_END, easedAt203);
        const lift203    = lerp(0, LIFT_END_FRAC, easedAt203);

        const tmp    = document.createElement('canvas');
        tmp.width    = cw;
        tmp.height   = ch;
        const tCtx   = tmp.getContext('2d');
        if (!tCtx) return;

        const baseScale = Math.min(cw / img203.naturalWidth, ch / img203.naturalHeight);
        const drawW  = img203.naturalWidth  * baseScale * zoom203;
        const drawH  = img203.naturalHeight * baseScale * zoom203;
        const dx     = (cw - drawW) / 2;
        const dy     = (ch - drawH) / 2 - ch * lift203;

        tCtx.drawImage(img203, dx, dy, drawW, drawH);

        const imgData = tCtx.getImageData(0, 0, cw, ch);
        const data    = imgData.data;
        const dots: PixelDot[] = [];
        const half    = DOT_STEP / 2;

        for (let y = half; y < ch; y += DOT_STEP) {
          for (let x = half; x < cw; x += DOT_STEP) {
            const i = (Math.floor(y) * cw + Math.floor(x)) * 4;
            const r = data[i], g = data[i + 1], b = data[i + 2];
            if (r + g + b < 35) continue; // skip near-black background
            const angle = Math.random() * Math.PI * 2;
            const dist  = 40 + Math.random() * 110;
            dots.push({
              x, y, r, g, b,
              dx: Math.cos(angle) * dist,
              dy: -Math.abs(Math.sin(angle)) * dist * 0.85 - 20,
            });
          }
        }

        pixelDots.current       = dots;
        dotsSampledSize.current = { w: cw, h: ch };
      } catch (e) {
        console.warn('LogoIntroTransition: pixel sampling failed, skipping dissolution', e);
        dotsSampledSize.current = { w: cw, h: ch }; // mark as attempted so we don't loop
      }
    };

    // Spawn ambient dust particles (frames 170-212)
    const spawnParticles = (
      particleP: number,
      logoCX: number, logoCY: number,
      logoW: number, logoH: number,
    ) => {
      const targetCount = Math.floor(particleP * MAX_PARTICLES);
      if (particles.current.length > targetCount) particles.current.splice(targetCount);
      const toSpawn = targetCount - particles.current.length;
      for (let i = 0; i < toSpawn; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 0.15 + Math.random() * 0.5;
        particles.current.push({
          x:     logoCX + (Math.random() - 0.5) * logoW * 0.85,
          y:     logoCY + (Math.random() - 0.5) * logoH * 0.85,
          vx:    Math.cos(angle) * speed,
          vy:   -Math.abs(Math.sin(angle)) * speed - 0.1,
          size:  0.6 + Math.random() * 2.0,
          alpha: 0.55 + Math.random() * 0.45,
          decay: 0.003 + Math.random() * 0.005,
        });
      }
    };

    const render = () => {
      try {
        const scrollY = window.scrollY;
        const rawP    = clamp(scrollY / SCROLL_PX, 0, 1);
        const done    = rawP >= 1;

        // Frame selection (114 → 212)
        const frameF   = lerp(TRANS_START, TRANS_END, rawP);
        const frameIdx = clamp(Math.round(frameF), TRANS_START, TRANS_END);

        // Hold last good frame — never show blank
        const img = frames.current[frameIdx];
        if (img && img.complete && img.naturalWidth > 0) lastGoodImg.current = img;
        const drawImg = lastGoodImg.current;

        // Transform params
        const easedP   = easeInOut(rawP);
        const zoom     = lerp(ZOOM_START, ZOOM_END, easedP);
        const liftFrac = lerp(0, LIFT_END_FRAC, easedP);

        // Logo opacity: 1.0 down to 0.70 by the time dissolution starts
        const logoFadeStart = 0.50;
        const logoOpacity   =
          rawP <= logoFadeStart ? 1 :
          rawP >= RAW_P_AT_203 ? 0.70 :
          lerp(1, 0.70, (rawP - logoFadeStart) / (RAW_P_AT_203 - logoFadeStart));

        // Ambient dust progress (frames 170 → 212)
        const pFrame    = lerp(TRANS_START, TRANS_END, rawP);
        const particleP = pFrame < PARTICLE_START
          ? 0
          : clamp((pFrame - PARTICLE_START) / (TRANS_END - PARTICLE_START), 0, 1);

        // Pixel dissolution progress (frames 203 → 212)
        const dissolveProg = frameIdx < DISSOLVE_START
          ? 0
          : clamp((frameIdx - DISSOLVE_START) / (DISSOLVE_END - DISSOLVE_START), 0, 1);

        // ── BASE CANVAS ──────────────────────────────────────────────────────
        const bc   = baseCanvasRef.current;
        const bCtx = bc ? bc.getContext('2d') : null;
        if (bc && bCtx && drawImg) {
          const cw = bc.width, ch = bc.height;
          bCtx.clearRect(0, 0, cw, ch);

          if (dissolveProg > 0) {
            // Ensure pixels sampled
            const sr = dotsSampledSize.current;
            if (!sr || sr.w !== cw || sr.h !== ch) {
              const f203 = frames.current[DISSOLVE_START];
              if (f203 && f203.complete && f203.naturalWidth > 0) {
                sampleLogoPixels(f203, cw, ch);
              }
            }

            const dp   = easeIn(dissolveProg);
            const dots = pixelDots.current;
            const maxR = DOT_STEP / 2;

            for (let i = 0; i < dots.length; i++) {
              const d      = dots[i];
              const ox     = d.x + d.dx * dp;
              const oy     = d.y + d.dy * dp;
              const radius = maxR * Math.pow(1 - dp, 0.7);
              if (radius < 0.2) continue;
              const dotAlpha = logoOpacity * Math.pow(1 - dp, 1.6);
              if (dotAlpha < 0.01) continue;
              bCtx.globalAlpha = dotAlpha;
              bCtx.fillStyle   = `rgb(${d.r},${d.g},${d.b})`;
              bCtx.beginPath();
              bCtx.arc(ox, oy, radius, 0, Math.PI * 2);
              bCtx.fill();
            }
            bCtx.globalAlpha = 1;
          } else {
            // Normal frame rendering
            const baseScale = Math.min(cw / drawImg.naturalWidth, ch / drawImg.naturalHeight);
            const drawW = drawImg.naturalWidth  * baseScale * zoom;
            const drawH = drawImg.naturalHeight * baseScale * zoom;
            bCtx.globalAlpha = logoOpacity;
            bCtx.drawImage(drawImg, (cw - drawW) / 2, (ch - drawH) / 2 - ch * liftFrac, drawW, drawH);
            bCtx.globalAlpha = 1;
          }
        }

        // ── DUST CANVAS ──────────────────────────────────────────────────────
        const dc   = dustCanvasRef.current;
        const dCtx = dc ? dc.getContext('2d') : null;
        if (dc && dCtx) {
          const cw = dc.width, ch = dc.height;
          dCtx.clearRect(0, 0, cw, ch);
          if (particleP > 0 && drawImg) {
            const baseScale = Math.min(cw / drawImg.naturalWidth, ch / drawImg.naturalHeight);
            const drawW  = drawImg.naturalWidth  * baseScale * zoom;
            const drawH  = drawImg.naturalHeight * baseScale * zoom;
            spawnParticles(particleP, cw / 2, ch / 2 - ch * liftFrac, drawW * 0.75, drawH * 0.75);
            const alive: Particle[] = [];
            for (const pt of particles.current) {
              pt.x    += pt.vx;
              pt.y    += pt.vy;
              pt.alpha = Math.max(0, pt.alpha - pt.decay);
              if (pt.alpha <= 0) continue;
              dCtx.globalAlpha = pt.alpha * particleP;
              dCtx.fillStyle   = 'rgba(255,245,220,1)';
              dCtx.beginPath();
              dCtx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
              dCtx.fill();
              alive.push(pt);
            }
            dCtx.globalAlpha  = 1;
            particles.current = alive;
          } else if (particleP === 0) {
            particles.current = [];
          }
        }

        // ── OVERLAY background ────────────────────────────────────────────────
        // finalFadeProg: 0 at frame 193, 1 at frame 212
        const finalFadeProg = clamp((rawP - RAW_P_AT_193) / (1.0 - RAW_P_AT_193), 0, 1);
        if (overlayRef.current) {
          if (done) {
            overlayRef.current.style.display = 'none';
          } else {
            const overlayAlpha = clamp(1 - rawP * 1.15, 0, 1);
            overlayRef.current.style.display          = 'block';
            overlayRef.current.style.backgroundColor  = `rgba(0,0,0,${overlayAlpha})`;
            // CSS opacity fades the ENTIRE overlay (both canvases + background) 100%→0%
            // across the final 20 frames, while the existing particle/dot effects remain.
            overlayRef.current.style.opacity          = String(1 - finalFadeProg);
          }
        }

        // ── CONTENT container ─────────────────────────────────────────────────
        if (containerRef.current) {
          if (done) {
            containerRef.current.style.transform = 'none';
            containerRef.current.style.opacity   = '1';
          } else if (rawP < RAW_P_AT_193) {
            // Before frame 193 — keep content hidden below the viewport
            containerRef.current.style.transform = `translateY(${SCROLL_PX * (1 - rawP)}px)`;
            containerRef.current.style.opacity   = '0';
          } else {
            // Final 20 frames (193 → 212):
            // Dashboard rises from 1 viewport-height below its natural position to 0
            // and opacity goes from 5% → 100%.
            const fp      = finalFadeProg; // 0 at frame 193, 1 at frame 212
            const yOffset = (1 - fp) * window.innerHeight;
            containerRef.current.style.transform = `translateY(${yOffset}px)`;
            containerRef.current.style.opacity   = String(0.05 + 0.95 * fp);
          }
        }

      } catch (e) {
        console.error('LogoIntroTransition rAF error:', e);
        // Fallback: make sure the app is still visible
        if (overlayRef.current)   overlayRef.current.style.display   = 'none';
        if (containerRef.current) {
          containerRef.current.style.transform = 'none';
          containerRef.current.style.opacity   = '1';
        }
        crashed = true;
      }

      if (!crashed) rafId = requestAnimationFrame(render);
    };

    rafId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(rafId);
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', overflowX: 'hidden' }}>
      {/* Scroll spacer — drives the entire transition */}
      <div style={{ height: `${SCROLL_PX}px`, width: '100%', pointerEvents: 'none' }} />

      {/* App content — revealed as transition completes */}
      <div
        ref={containerRef}
        style={{
          position:   'absolute',
          top:        `${SCROLL_PX}px`,
          left:       0,
          width:      '100%',
          minHeight:  '100vh',
          willChange: 'transform, opacity',
          opacity:    0,
        }}
      >
        {children}
      </div>

      {/* Fixed intro overlay — black background prevents white flash on first paint */}
      <div
        ref={overlayRef}
        style={{
          position:        'fixed',
          top:             0,
          right:           0,
          bottom:          0,
          left:            0,
          zIndex:          9999,
          backgroundColor: '#000',   /* initial solid black — rAF updates it */
          pointerEvents:   'none',
          overflow:        'hidden',
          willChange:      'background-color',
        }}
      >
        <canvas
          ref={baseCanvasRef}
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'block' }}
        />
        <canvas
          ref={dustCanvasRef}
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'block' }}
        />
      </div>
    </div>
  );
}
