import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { useScrollProgress } from '../../hooks/useScrollProgress';
import { navLinks } from '../../data';
import { BookCallButton } from '../ui/MagneticButton';
import { scrollToSection } from '../../lib/scroll';

export function Navbar() {
  const { activeSection } = useScrollProgress();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="fixed top-0 w-full bg-background/80 backdrop-blur-xl border-b border-black/10 z-50">
      <nav className="flex justify-between items-center w-full px-5 lg:px-margin-desktop py-6 max-w-container-max mx-auto">
        <button onClick={() => scrollToSection('hero')} className="font-display-xl text-body-lg font-bold tracking-tighter text-on-surface hover:text-primary transition-colors">
          RHEN LUMBO
        </button>

        <div className="hidden md:flex gap-8">
          {navLinks.map((link) => (
            <button
              key={link.href}
              onClick={() => scrollToSection(link.href.slice(1))}
              className={`font-body-md text-body-md transition-colors duration-300 ${
                activeSection === link.href.slice(1)
                  ? 'text-primary font-bold'
                  : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              {link.label}
            </button>
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
            <button
              key={link.href}
              onClick={() => { scrollToSection(link.href.slice(1)); setMobileOpen(false); }}
              className={`block font-body-md text-body-md transition-colors duration-300 w-full text-left ${
                activeSection === link.href.slice(1)
                  ? 'text-primary font-bold'
                  : 'text-on-surface-variant'
              }`}
            >
              {link.label}
            </button>
          ))}
          <BookCallButton />
        </div>
      )}
    </header>
  );
}
