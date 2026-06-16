import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CarouselControlsProps {
  total: number;
  active: number;
  onPrev: () => void;
  onNext: () => void;
  onGoTo: (index: number) => void;
}

export function CarouselControls({
  total,
  active,
  onPrev,
  onNext,
  onGoTo,
}: CarouselControlsProps) {
  return (
    <div className="flex items-center justify-center gap-5 mt-8">
      <button
        onClick={onPrev}
        className="w-9 h-9 rounded-full flex items-center justify-center text-[#0a0a0a]/25 hover:text-[#0a0a0a]/60 transition-colors duration-300 focus:outline-none"
        aria-label="Previous project"
      >
        <ChevronLeft size={15} />
      </button>

      <div className="flex items-center gap-2">
        {Array.from({ length: total }, (_, i) => (
          <button
            key={i}
            onClick={() => onGoTo(i)}
            className={`transition-all duration-300 rounded-full focus:outline-none ${
              i === active
                ? 'w-5 h-1 bg-[#0a0a0a]/60'
                : 'w-1 h-1 bg-[#0a0a0a]/15 hover:bg-[#0a0a0a]/30'
            }`}
            aria-label={`Go to project ${i + 1}`}
          />
        ))}
      </div>

      <button
        onClick={onNext}
        className="w-9 h-9 rounded-full flex items-center justify-center text-[#0a0a0a]/25 hover:text-[#0a0a0a]/60 transition-colors duration-300 focus:outline-none"
        aria-label="Next project"
      >
        <ChevronRight size={15} />
      </button>
    </div>
  );
}
