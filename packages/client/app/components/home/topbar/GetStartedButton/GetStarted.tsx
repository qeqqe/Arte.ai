'use client';
import { RiArrowRightLine } from '@remixicon/react';
import { useGetStartedHandler } from './HandleGetStartedClick';

const GetStarted = () => {
  const { handleGetStartedClick, isLoading } = useGetStartedHandler();

  return (
    <button
      onClick={handleGetStartedClick}
      disabled={isLoading}
      className="group relative flex items-center gap-2 px-5 py-2.5 rounded-lg overflow-hidden bg-slate-800 text-white hover:bg-slate-700 transition-all duration-300"
    >
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-900 to-slate-600 opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>

      {/* Button content */}
      <span className="relative z-10 text-sm font-medium">Get Started</span>
      <RiArrowRightLine className="relative z-10 w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />

      {/* Loading spinner */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-800 bg-opacity-70">
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </button>
  );
};

export default GetStarted;
