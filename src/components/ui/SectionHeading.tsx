interface SectionHeadingProps {
  label: string;
  className?: string;
}

export function SectionHeading({ label, className = '' }: SectionHeadingProps) {
  return (
    <h2 className={`font-label-caps text-label-caps text-primary uppercase tracking-widest ${className}`}>
      {label}
    </h2>
  );
}
