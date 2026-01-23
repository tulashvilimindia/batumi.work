import { Link } from 'react-router-dom';
import { cn } from '@/lib';

export function NotFoundPage() {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center',
        'min-h-[50vh] text-center py-12'
      )}
    >
      <div className="text-6xl font-bold text-primary mb-4">404</div>
      <h1 className="text-2xl font-semibold text-text-primary mb-2">
        Page Not Found
      </h1>
      <p className="text-text-secondary mb-6 max-w-md">
        The page you are looking for might have been removed, had its name
        changed, or is temporarily unavailable.
      </p>
      <Link
        to="/"
        className={cn(
          'px-6 py-2 rounded-lg',
          'bg-primary text-text-inverse',
          'hover:bg-primary-hover transition-colors',
          'font-medium'
        )}
      >
        Back to Home
      </Link>
    </div>
  );
}
