'use client';
import { usePathname } from 'next/navigation';
import { NavItemProps } from './NavItem';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { RiArrowRightUpLine } from '@remixicon/react';

interface MobileMenuProps {
  isOpen: boolean;
  navItems: NavItemProps[];
}

const MobileMenu = ({ isOpen, navItems }: MobileMenuProps) => {
  const pathname = usePathname();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
          className="absolute top-full right-4 mt-2 w-56 bg-white rounded-2xl shadow-lg py-2 lg:hidden border border-slate-100"
        >
          <div className="flex flex-col">
            {navItems.map((item) => {
              const isActive = pathname === item.href;

              const itemContent = (
                <div
                  className={`
                  flex items-center gap-3 px-4 py-3 transition-all
                  ${isActive ? 'bg-blue-50/50' : 'hover:bg-slate-50'}
                `}
                >
                  <div
                    className={`
                    p-2 rounded-full 
                    ${isActive ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}
                  `}
                  >
                    {item.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-1">
                      <p
                        className={`
                        text-sm font-medium
                        ${isActive ? 'text-blue-700' : 'text-slate-700'}
                      `}
                      >
                        {item.label}
                      </p>
                      {item.isExternal && (
                        <RiArrowRightUpLine className="w-3 h-3 text-slate-400" />
                      )}
                    </div>
                    {item.description && (
                      <p className="text-xs text-slate-500">
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>
              );

              if (item.isExternal) {
                return (
                  <a
                    key={item.label}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="no-underline"
                  >
                    {itemContent}
                  </a>
                );
              }

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className="no-underline"
                >
                  {itemContent}
                </Link>
              );
            })}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MobileMenu;
