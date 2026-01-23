import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { cn } from '@/lib';

interface LayoutProps {
  className?: string;
}

export function Layout({ className }: LayoutProps) {
  return (
    <div className={cn('min-h-screen flex flex-col bg-background', className)}>
      <Header />

      <main className="flex-1">
        <div className="max-w-[1100px] mx-auto px-4 py-6">
          <Outlet />
        </div>
      </main>

      <Footer />
    </div>
  );
}
