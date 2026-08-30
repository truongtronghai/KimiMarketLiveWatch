import { useEffect, useRef } from 'react';

interface AiOrbProps {
  state: 'scan' | 'orbit';
}

interface Particle {
  angle: number;
  radius: number;
  speed: number;
  size: number;
}

function buildParticles(count: number): Particle[] {
  const particles: Particle[] = [];
  for (let index = 0; index < count; index += 1) {
    const phase = index * 2.399963229728653; // golden angle to spread orbits evenly
    particles.push({
      angle: phase,
      radius: 6 + (index % 3) * 2,
      speed: 0.02 + (index % 3) * 0.008,
      size: 1.2 + (index % 2) * 0.5,
    });
  }
  return particles;
}

export function AiOrb({ state }: AiOrbProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);
  const particlesRef = useRef<Particle[]>(buildParticles(5));
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    const context = canvas.getContext('2d');
    if (!context) {
      return;
    }
    const devicePixelRatio = window.devicePixelRatio || 1;
    const size = canvas.offsetWidth || 16;
    canvas.width = size * devicePixelRatio;
    canvas.height = size * devicePixelRatio;
    context.scale(devicePixelRatio, devicePixelRatio);

    const accent =
      getComputedStyle(document.documentElement)
        .getPropertyValue('--accent')
        .trim() || '#3080ff';

    const draw = (time: number): void => {
      if (!canvasRef.current) {
        return;
      }
      context.clearRect(0, 0, size, size);
      const centerX = size / 2;
      const centerY = size / 2;

      if (stateRef.current === 'scan') {
        const pulse = 1.4 + Math.sin(time / 180) * 0.5;
        context.beginPath();
        context.fillStyle = accent;
        context.globalAlpha = 0.9;
        context.arc(
          centerX,
          centerY,
          2.1 + Math.sin(time / 240) * 0.4,
          0,
          Math.PI * 2,
        );
        context.fill();

        context.beginPath();
        context.strokeStyle = accent;
        context.globalAlpha = 0.35;
        context.lineWidth = 1;
        context.arc(centerX, centerY, pulse + 2.4, 0, Math.PI * 2);
        context.stroke();
        context.globalAlpha = 1;
      } else {
        context.beginPath();
        context.fillStyle = accent;
        context.globalAlpha = 0.95;
        context.arc(centerX, centerY, 1.7, 0, Math.PI * 2);
        context.fill();

        particlesRef.current.forEach((particle, index) => {
          const x = centerX + Math.cos(particle.angle) * particle.radius;
          const y = centerY + Math.sin(particle.angle) * particle.radius;
          context.globalAlpha = 0.55 + (index % 2) * 0.3;
          context.beginPath();
          context.fillStyle = accent;
          context.arc(x, y, particle.size, 0, Math.PI * 2);
          context.fill();

          const orbitStartX =
            centerX + Math.cos(particle.angle + 1.2) * particle.radius;
          const orbitStartY =
            centerY + Math.sin(particle.angle + 1.2) * particle.radius;
          context.globalAlpha = 0.18;
          context.beginPath();
          context.moveTo(orbitStartX, orbitStartY);
          context.lineTo(x, y);
          context.strokeStyle = accent;
          context.lineWidth = 0.7;
          context.stroke();
        });
        context.globalAlpha = 1;
      }

      particlesRef.current.forEach((particle, index) => {
        const isOrbiting = stateRef.current === 'orbit';
        particle.angle +=
          particle.speed *
          (1 + (isOrbiting ? Math.sin(time / 900 + index) * 0.1 : 0));
      });

      frameRef.current = requestAnimationFrame(draw);
    };

    frameRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frameRef.current);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="orb"
      data-testid="ai-orb"
      aria-hidden="true"
    />
  );
}
