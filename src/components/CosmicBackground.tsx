import React, { useEffect, useRef } from 'react';

interface CosmicBackgroundProps {
  showCustomCursor?: boolean;
}

export const CosmicBackground: React.FC<CosmicBackgroundProps> = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    const handleMouseMove = (e: MouseEvent) => {
      // Normalize mouse offset (-1 to 1)
      mouseRef.current.targetX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.targetY = (e.clientY / window.innerHeight) * 2 - 1;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Create stars array with 3 parallax layers
    interface Star {
      x: number;
      y: number;
      z: number; // Layer depth (1 to 3)
      size: number;
      alpha: number;
      baseAlpha: number;
      twinkleSpeed: number;
      color: string;
    }

    const stars: Star[] = [];
    const starCount = Math.floor((width * height) / 4500); // Responsive star density

    const colors = [
      '#ffffff',
      '#ffe5a0',
      '#d8a848',
      '#fff2c8',
      '#9f8d73',
    ];

    for (let i = 0; i < starCount; i++) {
      const z = Math.random() * 2.5 + 0.5; // Depth factor
      const baseAlpha = Math.random() * 0.7 + 0.2;
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        z,
        size: Math.random() * (3.5 / z) + 0.4,
        alpha: baseAlpha,
        baseAlpha,
        twinkleSpeed: Math.random() * 0.03 + 0.005,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    // Render loop
    let time = 0;
    const render = () => {
      time += 0.015;

      // Smooth interpolation for mouse parallax
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.05;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.05;

      const mouseX = mouseRef.current.x;
      const mouseY = mouseRef.current.y;

      ctx.clearRect(0, 0, width, height);

      // Draw background space gradient
      const gradient = ctx.createRadialGradient(
        width * 0.7,
        height * 0.3,
        50,
        width * 0.5,
        height * 0.5,
        Math.max(width, height) * 0.8
      );
      gradient.addColorStop(0, 'rgba(38, 22, 8, 0.35)');
      gradient.addColorStop(0.4, 'rgba(12, 10, 16, 0.85)');
      gradient.addColorStop(1, '#020204');

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Draw nebula ambient glow
      const nebula1 = ctx.createRadialGradient(
        width * 0.2 + mouseX * 20,
        height * 0.7 + mouseY * 20,
        10,
        width * 0.2 + mouseX * 20,
        height * 0.7 + mouseY * 20,
        width * 0.35
      );
      nebula1.addColorStop(0, 'rgba(113, 25, 36, 0.12)');
      nebula1.addColorStop(1, 'transparent');
      ctx.fillStyle = nebula1;
      ctx.fillRect(0, 0, width, height);

      // Draw stars with parallax offset
      for (let i = 0; i < stars.length; i++) {
        const star = stars[i];

        // Twinkle logic
        star.alpha = star.baseAlpha + Math.sin(time * star.twinkleSpeed * 50 + i) * 0.25;
        const currentAlpha = Math.max(0.1, Math.min(1, star.alpha));

        // Parallax position
        const offsetX = mouseX * (30 / star.z);
        const offsetY = mouseY * (30 / star.z);

        let renderX = star.x + offsetX;
        let renderY = star.y + offsetY;

        // Wrap around screen boundaries
        if (renderX < 0) renderX += width;
        if (renderX > width) renderX -= width;
        if (renderY < 0) renderY += height;
        if (renderY > height) renderY -= height;

        ctx.save();
        ctx.globalAlpha = currentAlpha;
        ctx.fillStyle = star.color;
        ctx.beginPath();
        ctx.arc(renderX, renderY, star.size, 0, Math.PI * 2);
        ctx.fill();

        // Extra outer glow for larger bright golden stars
        if (star.size > 1.8 && star.color === '#ffe5a0') {
          ctx.shadowBlur = 10;
          ctx.shadowColor = 'rgba(216, 168, 72, 0.8)';
          ctx.beginPath();
          ctx.arc(renderX, renderY, star.size * 0.8, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ background: '#030304' }}
    />
  );
};
