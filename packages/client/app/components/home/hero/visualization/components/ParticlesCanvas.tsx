'use client';
import React, { useEffect, useRef } from 'react';

const ParticlesCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    // store the context in a variable that TypeScript knows is non-null
    const ctx = context;

    // set canvas size to match parent with device pixel ratio for sharpness
    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;

      const dpr = window.devicePixelRatio || 1;
      canvas.width = parent.clientWidth * dpr;
      canvas.height = parent.clientHeight * dpr;
      canvas.style.width = `${parent.clientWidth}px`;
      canvas.style.height = `${parent.clientHeight}px`;
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener('resize', resize);

    // get the canvas dimensions for use in Particle class
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    const dpr = window.devicePixelRatio || 1;

    // particles for the flowing effect
    class Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      color: string;
      opacity: number;

      constructor() {
        this.x = (Math.random() * canvasWidth) / dpr;
        this.y = (Math.random() * canvasHeight) / dpr;
        this.size = Math.random() * 3 + 1;
        this.speedX = (Math.random() - 0.5) * 0.5;
        this.speedY = (Math.random() - 0.5) * 0.5;
        this.color = `hsl(${Math.random() * 60 + 200}, 70%, 60%)`;
        this.opacity = Math.random() * 0.5 + 0.2;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        // Wrap around edges
        if (this.x < 0) this.x = canvasWidth / dpr;
        if (this.x > canvasWidth / dpr) this.x = 0;
        if (this.y < 0) this.y = canvasHeight / dpr;
        if (this.y > canvasHeight / dpr) this.y = 0;
      }

      draw() {
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.opacity;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    }

    // create particles
    const particlesArray: Particle[] = [];
    for (let i = 0; i < 30; i++) {
      particlesArray.push(new Particle());
    }

    // connect particles with lines if they're close enough
    const connectParticles = () => {
      for (let i = 0; i < particlesArray.length; i++) {
        for (let j = i; j < particlesArray.length; j++) {
          const dx = particlesArray[i].x - particlesArray[j].x;
          const dy = particlesArray[i].y - particlesArray[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 100) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(100, 120, 255, ${0.15 - distance / 1000})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(particlesArray[i].x, particlesArray[i].y);
            ctx.lineTo(particlesArray[j].x, particlesArray[j].y);
            ctx.stroke();
          }
        }
      }
    };

    // loop
    const animate = () => {
      ctx.clearRect(0, 0, canvasWidth / dpr, canvasHeight / dpr);

      // update and draw particles
      particlesArray.forEach((particle) => {
        particle.update();
        particle.draw();
      });

      connectParticles();
      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas ref={canvasRef} className="absolute inset-0 z-0 rounded-3xl" />
  );
};

export default ParticlesCanvas;
