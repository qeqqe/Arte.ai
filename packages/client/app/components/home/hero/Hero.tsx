'use client';
import TypoGraphy from './typography/TypoGraphy';
import Link from 'next/link';
import { RiArrowRightLine, RiCheckboxCircleLine } from '@remixicon/react';
import { useGetStartedHandler } from '../topbar/GetStartedButton/HandleGetStartedClick';
import Visualization from './visualization/Visualization';

const Hero = () => {
  const { handleGetStartedClick, isLoading } = useGetStartedHandler();
  return (
    <div className="relative min-h-[90vh] overflow-hidden">
      {/* Abstract background elements */}
      <div className="absolute top-20 left-[10%] w-64 h-64 rounded-full bg-blue-400/10 blur-3xl"></div>
      <div className="absolute bottom-20 right-[5%] w-80 h-80 rounded-full bg-purple-400/10 blur-3xl"></div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-5 gap-8 items-center">
          {/* Left side: Main content */}
          <div className="md:col-span-3 space-y-8">
            {/* Eyebrow text */}
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full">
              <span className="animate-pulse relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-sm font-medium text-slate-700">
                Skill Gap Analysis
              </span>
            </div>

            {/* Main headline */}
            <div className="space-y-4">
              <TypoGraphy
                variant="hero"
                className="!text-4xl sm:!text-5xl md:!text-6xl !leading-tight max-w-md"
              >
                Visualize your{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600">
                  career standing
                </span>{' '}
                in a new way
              </TypoGraphy>

              <TypoGraphy
                variant="body"
                className="text-slate-600 text-lg max-w-md"
              >
                Arte.ai analyzes your professional profile against real-time
                market jobs to create your personalized skill development
                roadmap and your standing.
              </TypoGraphy>
            </div>

            {/* CTA section */}
            <div className="flex flex-wrap gap-4 items-center">
              <div
                className="group flex items-center gap-2 px-6 py-3 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors cursor-pointer"
                onClick={handleGetStartedClick}
              >
                <span className="font-medium">Start Your Analysis</span>
                <RiArrowRightLine className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </div>

              <Link
                href="/demo"
                className="px-6 py-3 text-slate-700 border border-slate-300 rounded-lg hover:bg-white/50 transition-colors"
              >
                <span className="font-medium">See Demo</span>
              </Link>
            </div>

            <div className="pt-8 border-t border-slate-200/30">
              <TypoGraphy variant="caption" className="text-slate-500 mb-3">
                Trusted by professionals from
              </TypoGraphy>
              <div className="flex flex-wrap gap-6 items-center opacity-60">
                <div className="">My friend circle 😛</div>
              </div>
            </div>
          </div>

          {/* Right side: Visualization */}
          <div className="md:col-span-2">
            <Visualization />
          </div>
        </div>

        {/* Bottom feature strip */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 bg-white/10 backdrop-blur-sm rounded-xl p-1">
          {[
            {
              icon: <RiCheckboxCircleLine className="w-5 h-5 text-blue-500" />,
              text: 'Multi-source data collection',
            },
            {
              icon: (
                <RiCheckboxCircleLine className="w-5 h-5 text-purple-500" />
              ),
              text: 'Intelligent Skill extraction',
            },
            {
              icon: <RiCheckboxCircleLine className="w-5 h-5 text-green-500" />,
              text: 'Personalized learning paths',
            },
          ].map((feature, index) => (
            <div
              key={index}
              className="flex items-center gap-3 bg-white/30 backdrop-blur-sm rounded-lg px-4 py-3 hover:bg-white/50 transition-colors"
            >
              {feature.icon}
              <span className="text-sm font-medium text-slate-700">
                {feature.text}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Hero;
