import React from 'react';

interface PositionIndicatorProps {
  currentPosition: string;
  goalPosition: string;
  progress: number;
}

const PositionIndicator: React.FC<PositionIndicatorProps> = ({
  currentPosition,
  goalPosition,
  progress,
}) => {
  return (
    <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg shadow-md px-3 py-2 text-xs">
      <div className="font-medium text-slate-700">Current Position</div>
      <div className="flex items-center gap-1.5 mt-1">
        <div className="w-2 h-2 rounded-full bg-amber-400"></div>
        <span className="text-slate-500">{currentPosition}</span>
      </div>
      <div className="flex items-center gap-1.5 mt-0.5">
        <div className="w-2 h-2 rounded-full bg-green-500"></div>
        <span className="text-slate-500">Goal: {goalPosition}</span>
      </div>
      <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2">
        <div
          className="h-1.5 rounded-full bg-gradient-to-r from-amber-400 to-green-400"
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
        <span>Current</span>
        <span>{`${progress}% Complete`}</span>
        <span>Goal</span>
      </div>
    </div>
  );
};

export default PositionIndicator;
