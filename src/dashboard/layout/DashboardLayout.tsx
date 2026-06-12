import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';

export function DashboardLayout() {
  return (
    <div className="min-h-screen bg-background font-body-md">
      <Sidebar />
      <main className="pl-56">
        <div className="max-w-[1200px] mx-auto px-6 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
