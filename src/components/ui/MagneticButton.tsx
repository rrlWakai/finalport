import { useRef, type ReactNode } from 'react';

interface MagneticButtonProps {
  children: ReactNode;
  variant?: 'primary' | 'ghost';
  className?: string;
  type?: 'button' | 'submit';
}

export function MagneticButton({ children, variant = 'ghost', className = '', type = 'button' }: MagneticButtonProps) {
  const btnRef = useRef<HTMLButtonElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const btn = btnRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    btn.style.transform = `translate(${x * 0.35}px, ${y * 0.45}px)`;
  };

  const handleMouseLeave = () => {
    const btn = btnRef.current;
    if (!btn) return;
    btn.style.transform = 'translate(0px, 0px)';
  };

  const baseClasses = 'inline-block transition-transform duration-300 ease-out cursor-pointer';

  const variantClasses = {
    primary:
      'bg-primary text-on-primary px-10 py-4 rounded-lg font-label-caps text-label-caps uppercase hover:shadow-[0_0_20px_rgba(255,193,116,0.3)]',
    ghost:
      'border border-black/10 px-10 py-4 rounded-lg font-label-caps text-label-caps uppercase hover:bg-black/5',
  };

  return (
    <button
      ref={btnRef}
      type={type}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </button>
  );
}

export function BookCallButton() {
  return (
    <button
      className="magnetic-btn bg-primary-container text-on-primary-container px-6 py-2 rounded-full font-label-caps text-label-caps uppercase active:scale-95"
    >
      Book a Call
    </button>
  );
}
