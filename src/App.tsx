import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Lenis from 'lenis';
import { ToastProvider } from './lib/toast';
import { AuthProvider } from './dashboard/lib/auth';
import { ProtectedRoute } from './dashboard/components/ProtectedRoute';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { Home } from './pages/Home';
import { ConversationPortal } from './pages/ConversationPortal';
import { Login } from './dashboard/pages/Login';
import { DashboardLayout } from './dashboard/layout/DashboardLayout';
import { Overview } from './dashboard/pages/Overview';
import { Consultations } from './dashboard/pages/Consultations';
import { CalendarPage } from './dashboard/pages/Calendar';
import { Leads } from './dashboard/pages/Leads';
import { Messages } from './dashboard/pages/Messages';
import { AvailabilityPage } from './dashboard/pages/Availability';
import { EmailTemplates } from './dashboard/pages/EmailTemplates';
import { Settings } from './dashboard/pages/Settings';

function App() {
  const location = useLocation();
  const isDashboard = location.pathname.startsWith('/dashboard');

  useEffect(() => {
    if (isDashboard) return;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);
    return () => lenis.destroy();
  }, [isDashboard]);

  return (
    <AuthProvider>
      <ToastProvider>
        <Routes>
          <Route path="/messages/:token" element={<ConversationPortal />} />
          <Route path="/admin/login" element={<Login />} />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
            <Route index element={<Overview />} />
            <Route path="consultations" element={<Consultations />} />
            <Route path="calendar" element={<CalendarPage />} />
            <Route path="leads" element={<Leads />} />
            <Route path="messages" element={<Messages />} />
            <Route path="availability" element={<AvailabilityPage />} />
            <Route path="email-templates" element={<EmailTemplates />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
        {!isDashboard && location.pathname !== '/admin/login' && !location.pathname.startsWith('/messages/') && (
          <>
            <Navbar />
            <Home />
            <Footer />
          </>
        )}
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
