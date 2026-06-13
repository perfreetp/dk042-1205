import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useUserStore } from '@/store/useUserStore';
import { cn } from '@/utils';

export default function Layout() {
  const { sidebarCollapsed } = useUserStore();

  return (
    <div className="min-h-screen bg-dark-bg-900 bg-grid">
      <div className="absolute inset-0 bg-radial-glow pointer-events-none" />
      <Sidebar />
      <div
        className={cn('transition-all duration-300', sidebarCollapsed ? 'ml-16' : 'ml-60')}
      >
        <Header />
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
