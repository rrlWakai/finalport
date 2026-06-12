import { useRef, type ReactNode, type MouseEvent } from 'react';
import { Loader2 } from 'lucide-react';

interface MagneticButtonProps {
  children: ReactNode;
  variant?: 'primary' | 'ghost';
  className?: string;
  type?: 'button' | 'submit';
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  loading?: boolean;
  ariaLabel?: string;
}

export function MagneticButton({
  children,
  variant = 'ghost',
  className = '',
  type = 'button',
  onClick,
  disabled,
  loading,
  ariaLabel,
}: MagneticButtonProps) {
  const btnRef = useRef<HTMLButtonElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || loading) return;
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

  const baseClasses =
    'inline-flex items-center justify-center gap-2 transition-all duration-300 ease-out cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/40';

  const variantClasses = {
    primary: `bg-primary text-on-primary px-10 py-4 rounded-lg font-label-caps text-label-caps uppercase hover:shadow-[0_0_20px_rgba(255,193,116,0.3)] ${
      disabled || loading ? 'opacity-60 cursor-not-allowed' : ''
    }`,
    ghost: `border border-black/10 px-10 py-4 rounded-lg font-label-caps text-label-caps uppercase hover:bg-black/5 ${
      disabled || loading ? 'opacity-60 cursor-not-allowed' : ''
    }`,
  };

  return (
    <button
      ref={btnRef}
      type={type}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      disabled={disabled || loading}
      aria-label={ariaLabel}
    >
      {loading && <Loader2 size={14} className="animate-spin" />}
      {children}
    </button>
  );
}

export function BookCallButton() {
  const handleClick = () => {
    const el = document.getElementById('contact');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      history.replaceState(null, '', '/#contact');
    }
  };

  return (
    <button
      onClick={handleClick}
      className="magnetic-btn bg-primary-container text-on-primary-container px-6 py-2 rounded-full font-label-caps text-label-caps uppercase active:scale-95 transition-all duration-200 hover:bg-primary-container/80 focus:outline-none focus:ring-2 focus:ring-primary/40"
      aria-label="Schedule a consultation"
    >
      Schedule Consultation
    </button>
  );
}
