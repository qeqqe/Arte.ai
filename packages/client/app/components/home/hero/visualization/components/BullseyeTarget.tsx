'use client';
import React, { useState, useEffect, useRef } from 'react';

interface BullseyeTargetProps {
  onActivate: () => void;
  onHoverChange: (isHovering: boolean) => void;
}

const BullseyeTarget: React.FC<BullseyeTargetProps> = ({
  onActivate,
  onHoverChange,
}) => {
  const [isHovering, setIsHovering] = useState(false);
  const [activating, setActivating] = useState(false);
  const hoverTimer = useRef<NodeJS.Timeout | null>(null);
  const HOVER_DURATION = 4000; // 4 seconds

  // Handle hover state and inform parent component
  const handleMouseEnter = () => {
    setIsHovering(true);
    onHoverChange(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    onHoverChange(false);
  };

  // Manage hover state and timing
  useEffect(() => {
    if (isHovering) {
      hoverTimer.current = setTimeout(() => {
        setActivating(true);
        onActivate();
      }, HOVER_DURATION);
    } else {
      if (hoverTimer.current) {
        clearTimeout(hoverTimer.current);
        hoverTimer.current = null;
      }
      setActivating(false);
    }

    return () => {
      if (hoverTimer.current) {
        clearTimeout(hoverTimer.current);
      }
    };
  }, [isHovering, onActivate]);

  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="relative transform -translate-y-2 z-10">
        {/* Outer rings */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full border-4 border-dashed border-slate-200 opacity-60 animate-[spin_60s_linear_infinite]"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full border-2 border-slate-300"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-36 h-36 rounded-full border-4 border-slate-200/80"></div>

        <div
          className={`
            absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 
            rounded-full transition-all duration-300 cursor-pointer
            ${isHovering ? 'scale-110 shadow-lg shadow-red-500/20' : ''}
            ${activating ? 'animate-ping bg-red-600/20' : 'bg-gradient-to-br from-blue-500/20 to-purple-500/20'}
          `}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div className="w-full h-full rounded-full flex items-center justify-center">
            <div
              className={`
                w-16 h-16 rounded-full flex items-center justify-center
                transition-all duration-300
                ${isHovering ? 'bg-gradient-to-br from-red-500/40 to-red-600/40' : 'bg-gradient-to-br from-blue-500/30 to-purple-500/30'}
              `}
            >
              <div
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center
                  transition-all duration-300
                  ${
                    isHovering
                      ? 'bg-gradient-to-br from-red-500 to-red-600 animate-pulse'
                      : 'bg-gradient-to-br from-blue-600 to-purple-600'
                  }
                `}
              >
                <div
                  className={`w-3 h-3 rounded-full ${
                    isHovering
                      ? 'bg-white animate-[pulse_0.5s_ease-in-out_infinite]'
                      : 'bg-white animate-pulse'
                  }`}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Instruction text */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-12 bg-white/80 backdrop-blur-sm px-4 py-1.5 rounded-full shadow-sm">
          <span className="text-xs font-medium text-slate-700">
            {isHovering ? 'Hold to Activate...' : 'Hover to Start'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default BullseyeTarget;
