import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { useScrollProgress } from '../../hooks/useScrollProgress';
import { navLinks } from '../../data';
import { BookCallButton } from '../ui/MagneticButton';

export function Navbar() {
  const { activeSection } = useScrollProgress();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="fixed top-0 w-full bg-background/80 backdrop-blur-xl border-b border-black/10 z-50">
      <nav className="flex justify-between items-center w-full px-5 lg:px-margin-desktop py-6 max-w-container-max mx-auto">
        <a href="#" className="font-display-xl text-body-lg font-bold tracking-tighter text-on-surface">
          RHEN LUMBO
        </a>

        <div className="hidden md:flex gap-8">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={`font-body-md text-body-md transition-colors duration-300 ${
                activeSection === link.href.slice(1)
                  ? 'text-primary font-bold'
                  : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden md:block">
          <BookCallButton />
        </div>

        <button
          className="md:hidden text-on-surface"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </nav>

      {mobileOpen && (
        <div className="md:hidden bg-surface-container border-t border-black/10 px-5 py-6 space-y-4">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={`block font-body-md text-body-md transition-colors duration-300 ${
                activeSection === link.href.slice(1)
                  ? 'text-primary font-bold'
                  : 'text-on-surface-variant'
              }`}
            >
              {link.label}
            </a>
          ))}
          <BookCallButton />
        </div>
      )}
    </header>
  );
}
