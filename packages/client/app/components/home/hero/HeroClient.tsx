'use client';
import { useGetStartedHandler } from '../topbar/GetStartedButton/HandleGetStartedClick';
import { RiArrowRightLine } from '@remixicon/react';

interface HeroClientProps {
  className?: string;
}

const HeroClient = ({ className }: HeroClientProps) => {
  const { handleGetStartedClick } = useGetStartedHandler();

  return (
    <div
      className={`group flex items-center gap-2 px-6 py-3 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors cursor-pointer ${className}`}
      onClick={handleGetStartedClick}
    >
      <span className="font-medium">Start Your Analysis</span>
      <RiArrowRightLine className="w-4 h-4 transition-transform group-hover:translate-x-1" />
    </div>
  );
};

export default HeroClient;
