import React from 'react';
import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/auth.store';
import { LogOut, Home, Box, ShoppingCart, Users, Receipt, BarChart3 } from 'lucide-react';

export function MainLayout() {
  const { isAuthenticated, logout, user } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: Home },
    { to: '/products', label: 'Products', icon: Box },
    { to: '/orders', label: 'Orders', icon: ShoppingCart },
    { to: '/customers', label: 'Customers', icon: Users },
    { to: '/expenses', label: 'Expenses', icon: Receipt },
    { to: '/reports', label: 'Reports', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen flex w-full bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card flex flex-col">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-primary">SellWise</h2>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          {navItems.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className={`flex items-center space-x-3 px-3 py-2 rounded-md transition-colors ${
                location.pathname === to
                  ? 'bg-primary/10 text-primary'
                  : 'hover:bg-muted text-muted-foreground'
              }`}
            >
              <Icon size={20} />
              <span>{label}</span>
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-border">
          <button
            onClick={logout}
            className="flex items-center space-x-3 w-full px-3 py-2 text-destructive hover:bg-destructive/10 rounded-md transition-colors"
          >
            <LogOut size={20} />
            <span>Log out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-16 border-b border-border bg-card flex items-center justify-between px-8">
          <h1 className="text-xl font-semibold">Dashboard</h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-foreground">{user?.email}</span>
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