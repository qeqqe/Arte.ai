'use client';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import {
  RiBookReadLine,
  RiGithubFill,
  RiInformationLine,
  RiMenuLine,
  RiCloseLine,
  RiArrowRightUpLine,
} from '@remixicon/react';
import { NavItem, NavItemProps } from './NavItem';
import MobileMenu from './MobileMenu';

const navItems: NavItemProps[] = [
  {
    label: 'Docs',
    href: '/docs',
    icon: <RiBookReadLine className="w-4 h-4" />,
    description: 'Learn how to use the platform',
  },
  {
    label: 'GitHub',
    href: 'https://github.com/qeqqe/skill-gap-analyzer',
    icon: <RiGithubFill className="w-4 h-4" />,
    description: 'View our open source code',
    isExternal: true,
  },
  {
    label: 'About',
    href: '/about',
    icon: <RiInformationLine className="w-4 h-4" />,
    description: 'Our mission and team',
  },
];

const NavBar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

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

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden lg:block">
        <div
          className={`
          transition-all duration-500
          ${
            scrolled
              ? 'bg-white/80 backdrop-blur-md shadow-sm'
              : 'bg-white/10 backdrop-blur-sm'
          } 
          rounded-full px-1 py-1 flex items-center gap-1
        `}
        >
          {navItems.map((item, index) => (
            <NavItem
              key={item.label}
              label={item.label}
              href={item.href}
              icon={item.icon}
              description={item.description}
              isExternal={item.isExternal}
              isActive={pathname === item.href}
              isFirst={index === 0}
              isLast={index === navItems.length - 1}
            />
          ))}
        </div>
      </nav>

      {/* Mobile Menu Button */}
      <div className="lg:hidden">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className={`
            relative p-2 rounded-full transition-all duration-300
            ${
              scrolled
                ? 'bg-white/90 shadow-sm hover:bg-white'
                : 'bg-white/20 hover:bg-white/40'
            }
          `}
          aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
        >
          {isMobileMenuOpen ? (
            <RiCloseLine className="w-5 h-5 text-slate-700" />
          ) : (
            <RiMenuLine className="w-5 h-5 text-slate-700" />
          )}
        </button>
      </div>

      {/* Mobile Navigation Menu */}
      <MobileMenu isOpen={isMobileMenuOpen} navItems={navItems} />
    </>
  );
};

export default NavBar;
