import { useRef, useEffect, useState } from 'react';

interface AuroraProps {
  colorStart?: string;     // Primary glowing light green hue
  colorMiddle?: string;    // Soft sage / forest tone
  colorEnd?: string;       // Very soft highlight tint
  speed?: number;          // Wave animation speed multiplier
  amplitude?: number;      // Curvature height of the curtains
  layerCount?: number;     // Number of overlapping flowing bands
  opacity?: number;        // Global opacity of the rendering
  followMouse?: boolean;   // Interactive drag influence
  verticalAnchor?: number; // Y-anchor fraction (0 = absolute top, 1 = bottom)
  className?: string;
}

export const Aurora = ({
  colorStart = '#a2d9b1',   // Soft glowing mint green
  colorMiddle = '#6fa17c',  // Elegant sage green matching theme-natural-tones
  colorEnd = '#cbf3d6',     // Translucent highlight emerald
  speed = 1.0,
  amplitude = 120,
  layerCount = 5,
  opacity = 0.55,
  followMouse = true,
  verticalAnchor = 0.15,    // Concentrated at the top
  className = ''
}: AuroraProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.05 }
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible || !containerRef.current) return;

    // Create Canvas dynamically inside the ref
    const canvas = document.createElement('canvas');
    canvas.className = 'w-full h-full block absolute inset-0 pointer-events-none';
    canvasRef.current = canvas;
    
    // Clear and append
    while (containerRef.current.firstChild) {
      containerRef.current.removeChild(containerRef.current.firstChild);
    }
    containerRef.current.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let width = 0;
    let height = 0;

    const updateSize = () => {
      if (!containerRef.current || !canvas) return;
      const rect = containerRef.current.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    };

    updateSize();
    const resizeObserver = new ResizeObserver(updateSize);
    resizeObserver.observe(containerRef.current);

    // Mouse movement track inside section
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      // Normalized coordinates
      mouseRef.current.targetX = (e.clientX - rect.left) / width;
      mouseRef.current.targetY = (e.clientY - rect.top) / height;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Aurora Wave State Tracker
    let time = 0;

    const draw = () => {
      if (!ctx || width === 0 || height === 0) return;

      ctx.clearRect(0, 0, width, height);

      // Smooth mouse coordinates interpolation
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.05;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.05;

      // Draw flowing organic atmospheric layers
      for (let i = 0; i < layerCount; i++) {
        // Stagger variables to separate paths organically
        const factor = i / (layerCount - 1);
        const waveOffset = factor * Math.PI * 2.5;
        const currentSpeed = speed * (0.002 + factor * 0.001);
        const phase = time * currentSpeed + waveOffset;

        // Gradient representing the magical atmospheric glow of Aurora Borealis
        const grad = ctx.createLinearGradient(0, 0, width, height);
        
        // Dynamic shifting opacities based on layered offsets
        const alphaHexStart = Math.floor((0.15 + (1 - factor) * 0.25) * opacity * 255).toString(16).padStart(2, '0');
        const alphaHexMiddle = Math.floor((0.08 + factor * 0.18) * opacity * 255).toString(16).padStart(2, '0');
        
        grad.addColorStop(0, colorStart + alphaHexStart);
        grad.addColorStop(0.5, colorMiddle + alphaHexMiddle);
        grad.addColorStop(1, colorEnd + '00'); // Fades to complete transparency

        ctx.fillStyle = grad;
        ctx.beginPath();

        // Canvas composite screen blends overlapping glows beautifully
        ctx.globalCompositeOperation = 'screen';

        ctx.moveTo(0, height);

        // Generate points for the organic smooth curve representing Aurora ribbons
        const steps = 14;
        for (let xStep = 0; xStep <= steps; xStep++) {
          const xRatio = xStep / steps;
          const x = xRatio * width;

          // Sine waves superimposed for highly naturalistic noise simulation
          const sine1 = Math.sin(xRatio * Math.PI * 2.2 + phase);
          const sine2 = Math.cos(xRatio * Math.PI * 4.0 - phase * 0.8);
          let rawHeight = (verticalAnchor + factor * 0.15) * height; // Vertical anchor

          // Interactive mouse vertical deflection
          if (followMouse) {
            const distanceToMouse = Math.abs(xRatio - mouseRef.current.x);
            const mouseEffect = Math.max(0, 1 - distanceToMouse * 3.5);
            rawHeight += mouseEffect * (mouseRef.current.y - 0.5) * height * 0.4;
          }

          const y = rawHeight + (sine1 * 0.6 + sine2 * 0.4) * amplitude * (0.4 + factor * 0.6);

          if (xStep === 0) {
            ctx.lineTo(x, y);
          } else {
            // Cubic curve points interpolation for maximum rendering visual smoothness
            const prevX = ((xStep - 1) / steps) * width;
            const prevSine1 = Math.sin((xStep - 1) / steps * Math.PI * 2.2 + phase);
            const prevSine2 = Math.cos((xStep - 1) / steps * Math.PI * 4.0 - phase * 0.8);
            
            let prevRawHeight = (verticalAnchor + factor * 0.15) * height;
            if (followMouse) {
              const prevDist = Math.abs(((xStep - 1) / steps) - mouseRef.current.x);
              const prevMouseEffect = Math.max(0, 1 - prevDist * 3.5);
              prevRawHeight += prevMouseEffect * (mouseRef.current.y - 0.5) * height * 0.4;
            }

            const prevY = prevRawHeight + (prevSine1 * 0.6 + prevSine2 * 0.4) * amplitude * (0.4 + factor * 0.6);
            const cpX = prevX + (x - prevX) / 2;

            ctx.bezierCurveTo(cpX, prevY, cpX, y, x, y);
          }
        }

        ctx.lineTo(width, height);
        ctx.closePath();
        ctx.fill();
      }

      time += 16.666; // Standard animation frame increment
      animationId = requestAnimationFrame(draw);
    };

    animationId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animationId);
      resizeObserver.disconnect();
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isVisible, colorStart, colorMiddle, colorEnd, speed, amplitude, layerCount, opacity, followMouse, verticalAnchor]);

  return <div ref={containerRef} className={`absolute inset-0 overflow-hidden pointer-events-none select-none z-0 ${className}`} />;
};

export default Aurora;
