import { useState, useRef, useEffect } from 'react';
import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/auth.store';
import { LogOut, Home, Box, ShoppingCart, Users, Receipt, BarChart3, Settings, ChevronDown, Bell } from 'lucide-react';

export function MainLayout() {
  const { isAuthenticated, store, logout, user } = useAuthStore();
  const location = useLocation();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Redirect to onboarding if business_type is not set
  if (!store?.business_type && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: Home },
    { to: '/products', label: 'Products', icon: Box },
    { to: '/orders', label: 'Orders', icon: ShoppingCart },
    { to: '/customers', label: 'Customers', icon: Users },
    { to: '/expenses', label: 'Expenses', icon: Receipt },
    { to: '/reports', label: 'Reports', icon: BarChart3 },
    { to: '/alerts', label: 'Alerts', icon: Bell },
  ];

  return (
    <div className="min-h-screen flex w-full bg-background text-foreground">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card flex flex-col shrink-0">
        <div className="h-16 flex items-center px-6 border-b border-border">
          <Link to="/dashboard" className="text-lg font-semibold tracking-tight text-primary">
            SellWise
          </Link>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ to, label, icon: Icon }) => {
            const isActive = location.pathname === to || location.pathname.startsWith(`${to}/`);
            return (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-3 px-3 py-2 rounded-full text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-body hover:bg-muted hover:text-foreground'
                }`}
              >
                <Icon size={16} strokeWidth={isActive ? 2 : 1.5} />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 border-b border-border bg-card flex items-center justify-between px-8 shrink-0">
          <h1 className="text-base font-medium capitalize text-foreground">
            {location.pathname.split('/')[1] || 'Dashboard'}
          </h1>
          <div className="flex items-center relative" ref={dropdownRef}>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2 text-sm text-body hover:text-foreground px-3 py-1.5 rounded-full hover:bg-muted transition-colors"
            >
              <span className="max-w-[160px] truncate">{user?.email}</span>
              <ChevronDown size={14} className="text-muted-foreground" />
            </button>

            {/* Dropdown Menu */}
            {isProfileOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-card border border-border rounded-lg shadow-vercel-5 py-1 z-50">
                <Link
                  to="/settings"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors w-full text-left"
                >
                  <Settings size={14} className="text-muted-foreground" />
                  <span>Settings</span>
                </Link>
                <div className="h-px bg-border my-1" />
                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    logout();
                  }}
                  className="flex items-center gap-3 px-4 py-2 text-sm text-destructive hover:bg-destructive/5 transition-colors w-full text-left"
                >
                  <LogOut size={14} />
                  <span>Log out</span>
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 p-8 overflow-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
