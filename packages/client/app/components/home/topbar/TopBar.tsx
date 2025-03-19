'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import NavBar from './navbar/NavBar';
import GetStarted from './GetStartedButton/GetStarted';

const TopBar = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      if (offset > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <header
      className={`
        fixed top-0 left-0 w-full z-50 transition-all duration-500
        ${
          scrolled
            ? 'bg-white/70 shadow-lg shadow-slate-200/20 backdrop-blur-md py-2'
            : 'bg-transparent py-5'
        }
      `}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* logo*/}
        <Link href="/" className="group flex items-center gap-3 relative">
          <div className="relative overflow-hidden">
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
            <Image
              className="relative z-10 transition-all duration-500 "
              src="/Logo.svg"
              alt="Arte.ai"
              height={42}
              width={42}
              priority
            />
          </div>

          <div className="flex flex-col">
            <span className="font-bold text-lg text-slate-800 leading-tight">
              Arte<span className="text-blue-600">.ai</span>
            </span>
            <span className="text-xs text-slate-500 hidden sm:block -mt-1">
              Skill Gap Analysis
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-4">
          <NavBar />
          <GetStarted />
        </div>
      </div>
    </header>
  );
};

export default TopBar;
