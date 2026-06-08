interface TechTagProps {
  label: string;
}

export function TechTag({ label }: TechTagProps) {
  return (
    <span className="px-3 py-1 bg-primary/10 text-primary font-label-caps text-[10px] rounded-full uppercase">
      {label}
    </span>
  );
}
