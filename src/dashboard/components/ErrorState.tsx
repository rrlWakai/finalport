import { Button } from './ui/button';

export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="py-12 text-center rounded-xl border border-dashed border-error/40">
      <h3 className="font-display-xl text-sm font-semibold text-on-surface mb-1">
        Failed to load data
      </h3>
      <p className="text-xs text-on-surface-variant mb-4">
        {message || 'Please check your internet connection or try again later.'}
      </p>
      <Button variant="outline" size="sm" onClick={onRetry}>
        Retry
      </Button>
    </div>
  );
}
