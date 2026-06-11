import { socialLinks } from '../../data';

export function Footer() {
  return (
    <footer className="w-full py-section-gap border-t border-black/5 bg-surface-container-lowest">
      <div className="flex flex-col items-center justify-center space-y-8 px-5 lg:px-margin-desktop">
        <div className="font-display-xl text-headline-lg text-on-surface">
          RHEN LUMBO
        </div>
        <p className="font-body-md text-on-surface-variant">
          Web Developer — Booking Systems for Resorts, Villas & Hotels
        </p>
        <div className="flex gap-12">
          {socialLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-on-surface-variant font-body-md hover:text-primary hover:translate-y-[-2px] transition-all duration-300"
            >
              {link.label}
            </a>
          ))}
        </div>
        <div className="flex gap-6">
          <a
            href="#"
            className="font-body-md text-on-surface-variant hover:text-primary transition-colors duration-300"
          >
            Download Resume
          </a>
        </div>
        <p className="font-body-md text-on-surface-variant opacity-50">
          &copy; 2026 Rhen Lumbo. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
