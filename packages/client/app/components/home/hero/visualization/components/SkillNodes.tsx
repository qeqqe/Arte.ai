'use client';
import React, { useState, useEffect } from 'react';
import { Skill } from '../../visualization/types';

// Sample skills data - in a real app, this would come from your API
const skills: Skill[] = [
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

const SkillNodes = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [skillPositions, setSkillPositions] = useState<
    Array<{
      angle: number;
      radius: number;
      speed: number;
      eccentricity: number;
      phaseOffset: number;
    }>
  >([]);

  // Initialize each skill with unique orbital parameters
  useEffect(() => {
    const initialPositions = skills.map((_, index) => {
      return {
        angle: Math.random() * 360, // Random starting angle
        radius: 5 + Math.random() * 3, // EXTREMELY REDUCED: Small radius (5-8)
        speed: 0.1 + Math.random() * 0.2, // INCREASED: Faster speed for more noticeable movement
        eccentricity: Math.random() * 0.1, // Reduced eccentricity for tighter orbits
        phaseOffset: Math.random() * Math.PI * 2,
      };
    });

    setSkillPositions(initialPositions);
  }, []);

  //animation to reveal skills gradually when component mounts
  useEffect(() => {
    setIsVisible(true);

    // set up rotation animation with unique trajectories
    const animationFrame = requestAnimationFrame(function animate() {
      setRotation((prev) => (prev + 0.1) % 360);

      // update each skill's position with its unique parameters
      setSkillPositions((prev) =>
        prev.map((pos, idx) => {
          const skill = skills[idx];
          const maxRadius = 7; // Maximum radius (very small)
          const minRadius = 3; // Minimum radius (very small)

          // Calculate new angle based on unique speed
          const newAngle = (pos.angle + pos.speed) % 360;

          // Calculate radius with slight oscillation based on skill level
          const oscillation =
            Math.sin(newAngle * (Math.PI / 180) + pos.phaseOffset) *
            pos.eccentricity;
          const baseRadius =
            minRadius + (skill.level / 100) * (maxRadius - minRadius);
          const newRadius = baseRadius + baseRadius * oscillation * 0.3;

          return {
            ...pos,
            angle: newAngle,
            radius: newRadius,
          };
        })
      );

      requestAnimationFrame(animate);
    });

    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, []);

  return (
    <div className="absolute inset-0 flex items-center justify-center">
      {/* Center point marker - helps visualize the center */}
      <div className="absolute w-2 h-2 rounded-full bg-red-500 z-10"></div>

      {skills.map((skill, index) => {
        // Get this skill's current position data
        const position = skillPositions[index] || { angle: 0, radius: 3 };

        // Calculate position using the skill's unique orbital parameters
        const angleInRadians = position.angle * (Math.PI / 180);

        // Calculate x and y position with a consistent multiplier
        const multiplier = 20;
        const x = Math.cos(angleInRadians) * position.radius * multiplier;
        const y = Math.sin(angleInRadians) * position.radius * multiplier;

        return (
          <div
            key={skill.id}
            className={`absolute transform transition-all duration-300 opacity-0 ${isVisible ? 'opacity-100' : ''}`}
            style={{
              left: `${x}px`,
              top: `${y}px`,
              transitionDelay: `${index * 100}ms`,
              transform: `translate(-50%, -50%) rotate(0deg)`,
            }}
          >
            {/* skill node */}
            <div
              className="flex flex-col items-center"
              style={{
                opacity: 0.7 + (skill.level / 100) * 0.3,
              }}
            >
              {/* skill badge */}
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center shadow-md mb-1"
                style={{
                  backgroundColor: `${skill.color}20`,
                  borderColor: skill.color,
                  borderWidth: '2px',
                }}
              >
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: skill.color }}
                ></div>
              </div>

              {/* skill name and level */}
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

            {/* line connecting to center */}
            <div
              className="absolute top-0 left-0 h-px origin-left opacity-30"
              style={{
                width: `${Math.sqrt(x * x + y * y)}px`,
                backgroundColor: skill.color,
                transform: `rotate(${Math.atan2(y, x)}rad)`,
              }}
            ></div>
          </div>
        );
      })}
    </div>
  );
};

export default SkillNodes;
