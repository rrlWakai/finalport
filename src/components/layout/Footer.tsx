import { socialLinks } from '../../data';
import { scrollToSection } from '../../lib/scroll';

export function Footer() {
  return (
    <footer className="w-full py-section-gap border-t border-black/5 bg-surface-container-lowest">
      <div className="flex flex-col items-center justify-center space-y-8 px-5 lg:px-margin-desktop">
        <button onClick={() => scrollToSection('hero')} className="font-display-xl text-headline-lg text-on-surface hover:text-primary transition-colors">
          RHEN LUMBO
        </button>

        <nav className="flex gap-8 flex-wrap justify-center" aria-label="Footer navigation">
          <button onClick={() => scrollToSection('case-study')} className="font-body-md text-on-surface-variant hover:text-primary transition-colors">
            Case Study
          </button>
          <button onClick={() => scrollToSection('services')} className="font-body-md text-on-surface-variant hover:text-primary transition-colors">
            Services
          </button>
          <button onClick={() => scrollToSection('projects')} className="font-body-md text-on-surface-variant hover:text-primary transition-colors">
            Projects
          </button>
          <button onClick={() => scrollToSection('faq')} className="font-body-md text-on-surface-variant hover:text-primary transition-colors">
            FAQ
          </button>
          <button onClick={() => scrollToSection('contact')} className="font-body-md text-on-surface-variant hover:text-primary transition-colors">
            Contact
          </button>
        </nav>

        <p className="font-body-md text-on-surface-variant">
          Web Developer — Booking Systems for Resorts, Villas & Hotels
        </p>

        <div className="flex gap-12">
          {socialLinks.map((link) => {
            const label = link.label;
            return (
              <a
                key={label}
                href={link.href}
                target={link.href.startsWith('mailto:') ? undefined : '_blank'}
                rel={link.href.startsWith('mailto:') ? undefined : 'noopener noreferrer'}
                aria-label={label === 'Email' ? `Send email to ${link.href.replace('mailto:', '')}` : `Visit ${label} profile`}
                className="text-on-surface-variant font-body-md hover:text-primary hover:translate-y-[-2px] transition-all duration-300"
              >
                {label}
              </a>
            );
          })}
        </div>

        <p className="font-body-md text-on-surface-variant opacity-50">
          &copy; 2026 Rhen Lumbo. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
