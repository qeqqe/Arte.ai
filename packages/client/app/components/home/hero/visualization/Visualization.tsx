'use client';
import React, { useEffect, useRef, useState } from 'react';
import { RiLightbulbLine, RiRocketLine } from '@remixicon/react';

const skills = [
  { id: 1, name: 'React', level: 85, color: '#61dafb', category: 'Frontend' },
  {
    id: 2,
    name: 'TypeScript',
    level: 72,
    color: '#3178c6',
    category: 'Languages',
  },
  { id: 3, name: 'Node.js', level: 68, color: '#68a063', category: 'Backend' },
  { id: 4, name: 'AWS', level: 45, color: '#ff9900', category: 'DevOps' },
  { id: 5, name: 'Docker', level: 52, color: '#2496ed', category: 'DevOps' },
  { id: 6, name: 'GraphQL', level: 63, color: '#e535ab', category: 'API' },
];

const Visualization = () => {
  const [isVisible, setIsVisible] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rotation, setRotation] = useState(0);

  // animation to reveal skills gradually when component mounts
  useEffect(() => {
    setIsVisible(true);

    // set up rotation animation
    const rotationInterval = setInterval(() => {
      setRotation((prev) => (prev + 0.1) % 360);
    }, 50);

    return () => clearInterval(rotationInterval);
  }, []);

  // canvas animation for the particles
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

    const particlesArray: Particle[] = [];
    for (let i = 0; i < 30; i++) {
      particlesArray.push(new Particle());
    }

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
    <div className="relative">
      {/* Main container */}
      <div className="aspect-square max-w-md mx-auto bg-gradient-to-br from-slate-50/80 to-white/50 backdrop-blur-md rounded-3xl p-6 border border-white/20 shadow-xl">
        {/* bg canvas for particles effect */}
        <canvas ref={canvasRef} className="absolute inset-0 z-0 rounded-3xl" />

        <div className="relative h-full w-full rounded-2xl bg-white/80 backdrop-blur-md overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative transform -translate-y-2">
              {/* Outer rings */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full border-4 border-dashed border-slate-200 opacity-60 animate-[spin_60s_linear_infinite]"></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full border-2 border-slate-300"></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-36 h-36 rounded-full border-4 border-slate-200/80"></div>

              {/* Inner target/bullseye */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500/30 to-purple-500/30 flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                    <div className="w-3 h-3 rounded-full bg-red-800/60 animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* skill nodes positioned around the bullseye */}
          <div
            className="absolute inset-0"
            style={{
              transform: `rotate(${rotation}deg)`,
              transition: 'transform 0.1s linear',
            }}
          >
            {skills.map((skill, index) => {
              // calculate position around the center
              const angle =
                (index * (360 / skills.length) + rotation) * (Math.PI / 180);
              const radius = 110 + (skill.level / 100) * 30;
              const x = 50 + (Math.cos(angle) * radius) / 2;
              const y = 50 + (Math.sin(angle) * radius) / 2;

              return (
                <div
                  key={skill.id}
                  className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-1000 opacity-0 ${isVisible ? 'opacity-100' : ''}`}
                  style={{
                    left: `${x}%`,
                    top: `${y}%`,
                    transitionDelay: `${index * 100}ms`,
                    transform: `translate(-50%, -50%) rotate(${-rotation}deg)`,
                  }}
                >
                  {/* Skill node */}
                  <div
                    className="flex flex-col items-center"
                    style={{
                      opacity: 0.7 + (skill.level / 100) * 0.3, // Higher level skills are more opaque
                    }}
                  >
                    {/* Skill badge */}
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center shadow-md mb-1.5"
                      style={{
                        backgroundColor: `${skill.color}20`,
                        borderColor: skill.color,
                        borderWidth: '2px',
                      }}
                    >
                      <div
                        className="w-6 h-6 rounded-full"
                        style={{ backgroundColor: skill.color }}
                      ></div>
                    </div>

                    {/* Skill name and level */}
                    <div className="bg-white/90 backdrop-blur-sm rounded-md px-2 py-0.5 shadow-sm">
                      <div className="text-xs font-medium text-center">
                        {skill.name}
                      </div>
                      <div className="w-full bg-slate-200 h-1 rounded-full mt-1">
                        <div
                          className="h-1 rounded-full"
                          style={{
                            width: `${skill.level}%`,
                            backgroundColor: skill.color,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Line connecting to center */}
                  <div
                    className="absolute top-1/2 left-1/2 h-px origin-center opacity-30"
                    style={{
                      width: `${radius}px`,
                      backgroundColor: skill.color,
                      transform: `rotate(${angle * (180 / Math.PI)}deg)`,
                    }}
                  ></div>
                </div>
              );
            })}
          </div>

          <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg shadow-md px-3 py-2 text-xs">
            <div className="font-medium text-slate-700">Current Position</div>
            <div className="flex items-center gap-1.5 mt-1">
              <div className="w-2 h-2 rounded-full bg-amber-400"></div>
              <span className="text-slate-500">Junior Developer</span>
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span className="text-slate-500">Goal: Senior Developer</span>
            </div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2">
              <div
                className="h-1.5 rounded-full bg-gradient-to-r from-amber-400 to-green-400"
                style={{ width: '45%' }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute -top-4 -right-4 bg-white rounded-lg shadow-md px-3 py-2 flex items-center gap-2">
        <RiLightbulbLine className="text-amber-500" />
        <span className="text-sm font-medium">AI-Powered</span>
      </div>
      <div className="absolute -bottom-4 -left-4 bg-white rounded-lg shadow-md px-3 py-2 flex items-center gap-2">
        <RiRocketLine className="text-blue-500" />
        <span className="text-sm font-medium">Career Growth</span>
      </div>
    </div>
  );
};

export default Visualization;
