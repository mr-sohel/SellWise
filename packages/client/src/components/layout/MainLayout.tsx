import React, { useState, useEffect, useRef } from 'react';
import { Outlet, Navigate, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/auth.store';
import { LogOut, Home, Box, ShoppingCart, Users, Receipt, BarChart3, Settings, Bell, Menu, X, Search, PanelLeftClose, PanelLeftOpen, ArrowRight } from 'lucide-react';
import { Footer } from './Footer';
import { useProducts } from '../../features/products/hooks/useProducts';
import { useCustomers } from '../../features/customers/hooks/useCustomers';
import { useOrders } from '../../features/orders/hooks/useOrders';
import { useDebounce } from '../../hooks/useDebounce';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '../ui/breadcrumbs';

export function MainLayout() {
  const { isAuthenticated, store, logout, user } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);

  const { data: products } = useProducts(store?.id || '', { page: 1, search: debouncedSearch, limit: 3 });
  const { data: customers } = useCustomers(store?.id || '', { page: 1, search: debouncedSearch, limit: 3 });
  const { data: orders } = useOrders(store?.id || '', { page: 1, search: debouncedSearch, limit: 3 });

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchFocused(false);
        setSearchQuery('');
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

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

  const pathSegments = location.pathname.split('/').filter(Boolean);

  const hasResults = searchQuery.length > 1 && (
    (products?.data?.length ?? 0) > 0 ||
    (customers?.data?.length ?? 0) > 0 ||
    (orders?.data?.length ?? 0) > 0
  );

  const showDropdown = isSearchFocused && searchQuery.length > 0;

  const handleSelect = (path: string) => {
    navigate(path);
    setIsSearchFocused(false);
    setSearchQuery('');
  };

  return (
    <div className="min-h-screen flex w-full bg-background text-foreground overflow-hidden">

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 glass-sidebar flex flex-col shrink-0 transition-all duration-300 ease-in-out md:translate-x-0 md:static md:my-4 md:ml-4 md:h-[calc(100vh-2rem)] md:rounded-2xl ${
          isMobileMenuOpen ? 'translate-x-0 m-4 h-[calc(100vh-2rem)] rounded-2xl' : '-translate-x-full'
        } ${isSidebarCollapsed ? 'w-20' : 'w-64'}`}
      >
        <div className="h-16 flex items-center justify-between px-4 border-b border-border overflow-hidden">
          <Link to="/dashboard" className={`flex items-center gap-2 overflow-hidden transition-all duration-300 ${isSidebarCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-violet flex items-center justify-center shrink-0 shadow-glow">
              <Box size={18} className="text-primary-foreground" />
            </div>
            <span className="text-xl font-display-sm tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-primary to-cyan truncate">
              SellWise
            </span>
          </Link>
          <div className="flex items-center">
            <button
              className="hidden md:flex p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground rounded-md transition-colors"
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isSidebarCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
            </button>
            <button
              className="md:hidden p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground rounded-md"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <X size={20} />
            </button>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto overflow-x-hidden scrollbar-thin">
          {navItems.map(({ to, label, icon: Icon }) => {
            const isActive = location.pathname === to || location.pathname.startsWith(`${to}/`);
            return (
              <Link
                key={to}
                to={to}
                title={isSidebarCollapsed ? label : undefined}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl text-base font-medium transition-all group ${
                  isActive
                    ? 'bg-primary/15 text-primary shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                } ${isSidebarCollapsed ? 'justify-center' : 'justify-start'}`}
              >
                <Icon size={18} strokeWidth={isActive ? 2.5 : 2} className={`shrink-0 transition-transform ${isActive ? 'scale-110' : 'group-hover:scale-110 group-hover:text-primary'}`} />
                {!isSidebarCollapsed && (
                  <span className="truncate">{label}</span>
                )}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden bg-transparent">
        {/* Header */}
        <header className="h-16 border-b md:border border-white/5 glass-panel sticky top-0 md:top-4 flex items-center justify-between px-4 md:px-6 shrink-0 z-30 transition-all duration-300 md:rounded-2xl md:mx-6 lg:mx-8 shadow-vercel-3">
          <div className="flex items-center gap-4 flex-1">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden text-muted-foreground hover:text-foreground p-1"
            >
              <Menu size={20} />
            </button>

            {/* Breadcrumbs */}
            <div className="hidden sm:block">
              <Breadcrumb>
                <BreadcrumbList>
                  {pathSegments.length === 0 ? (
                    <BreadcrumbItem>
                      <BreadcrumbPage>Dashboard</BreadcrumbPage>
                    </BreadcrumbItem>
                  ) : (
                    pathSegments.map((segment, index) => {
                      const isLast = index === pathSegments.length - 1;
                      const path = `/${pathSegments.slice(0, index + 1).join('/')}`;
                      const label = segment.length > 20 || segment.includes('-') && segment.length > 10
                        ? 'Details'
                        : segment.charAt(0).toUpperCase() + segment.slice(1);

                      return (
                        <React.Fragment key={path}>
                          <BreadcrumbItem>
                            {isLast ? (
                              <BreadcrumbPage>{label}</BreadcrumbPage>
                            ) : (
                              <BreadcrumbLink to={path}>{label}</BreadcrumbLink>
                            )}
                          </BreadcrumbItem>
                          {!isLast && <BreadcrumbSeparator />}
                        </React.Fragment>
                      );
                    })
                  )}
                </BreadcrumbList>
              </Breadcrumb>
            </div>

            <h1 className="text-base font-medium capitalize text-foreground truncate max-w-[150px] sm:hidden">
              {pathSegments[0] || 'Dashboard'}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Inline Search */}
            <div ref={searchRef} className="relative hidden md:block shrink-0">
              <div className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-xl transition-all w-56 lg:w-64 ${
                isSearchFocused
                  ? 'bg-card border border-border/50 shadow-sm'
                  : 'bg-muted/50 hover:bg-muted border border-transparent'
              }`}>
                <Search size={15} className="shrink-0 text-muted-foreground" />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && hasResults) {
                      const firstProduct = products?.data?.[0];
                      const firstCustomer = customers?.data?.[0];
                      const firstOrder = orders?.data?.[0];
                      if (firstProduct) {
                        handleSelect(`/products/${firstProduct.id}/edit`);
                      } else if (firstCustomer) {
                        handleSelect('/customers');
                      } else if (firstOrder) {
                        handleSelect('/orders');
                      }
                    }
                    if (e.key === 'Escape') {
                      setIsSearchFocused(false);
                      setSearchQuery('');
                      inputRef.current?.blur();
                    }
                  }}
                  className="flex-1 min-w-0 bg-transparent outline-none ring-0 focus:ring-0 focus-visible:ring-0 placeholder:text-muted-foreground/60 text-sm"
                />
                <kbd className="pointer-events-none shrink-0 inline-flex h-5 select-none items-center gap-1 rounded-md bg-muted border border-border/50 px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                  <span className="text-xs">⌘</span>K
                </kbd>
              </div>

              {/* Search Results Dropdown */}
              {showDropdown && (
                <div className="absolute top-full right-0 mt-2 w-80 bg-card rounded-xl shadow-lg overflow-hidden z-50">
                  <div className="max-h-[400px] overflow-y-auto p-2">
                    {searchQuery.length > 1 ? (
                      <>
                        {/* Products */}
                        {(products?.data?.length ?? 0) > 0 && (
                          <div className="mb-2">
                            <p className="px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Products</p>
                            {products?.data.map(p => (
                              <button
                                key={p.id}
                                onClick={() => handleSelect(`/products/${p.id}/edit`)}
                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-colors text-left"
                              >
                                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 shrink-0">
                                  <Box className="h-4 w-4 text-primary" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium truncate text-sm">{p.name}</p>
                                  <p className="text-xs text-muted-foreground">SKU: {p.sku}</p>
                                </div>
                                <div className="flex flex-col items-end shrink-0 ml-2">
                                  <span className="text-sm font-semibold">৳{p.selling_price}</span>
                                  <span className={`text-xs font-medium ${p.stock_quantity <= p.low_stock_threshold ? 'text-destructive' : 'text-success'}`}>
                                    {p.stock_quantity} in stock
                                  </span>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Customers */}
                        {(customers?.data?.length ?? 0) > 0 && (
                          <div className="mb-2">
                            <p className="px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Customers</p>
                            {customers?.data.map(c => (
                              <button
                                key={c.id}
                                onClick={() => handleSelect('/customers')}
                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-colors text-left"
                              >
                                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 shrink-0">
                                  <Users className="h-4 w-4 text-primary" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium truncate text-sm">{c.name}</p>
                                  <p className="text-xs text-muted-foreground">{c.phone}</p>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Orders */}
                        {(orders?.data?.length ?? 0) > 0 && (
                          <div className="mb-2">
                            <p className="px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Orders</p>
                            {orders?.data.map(o => (
                              <button
                                key={o.id}
                                onClick={() => handleSelect('/orders')}
                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-colors text-left"
                              >
                                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 shrink-0">
                                  <ShoppingCart className="h-4 w-4 text-primary" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-sm">#{o.order_number}</p>
                                  <p className="text-xs text-muted-foreground capitalize">{o.status}</p>
                                </div>
                                <span className="text-sm font-semibold shrink-0 ml-2">৳{o.total}</span>
                              </button>
                            ))}
                          </div>
                        )}

                        {/* View All Results */}
                        <button
                          onClick={() => handleSelect(`/products?search=${searchQuery}`)}
                          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-muted/50 hover:bg-muted transition-colors text-sm font-medium text-muted-foreground"
                        >
                          View all results
                          <ArrowRight size={14} />
                        </button>
                      </>
                    ) : (
                      <div className="py-8 text-center text-sm text-muted-foreground">
                        Type to search products, customers, orders...
                      </div>
                    )}
                  </div>

                  {/* Quick Links Footer */}
                  <div className="border-t border-border/30 p-2">
                    <p className="px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Quick Links</p>
                    <div className="flex flex-wrap gap-1 px-2">
                      {navItems.slice(0, 5).map(item => (
                        <button
                          key={item.to}
                          onClick={() => handleSelect(item.to)}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-muted transition-colors text-xs font-medium text-muted-foreground hover:text-foreground"
                        >
                          <item.icon size={12} />
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Search */}
            <button
              onClick={() => navigate('/products')}
              className="md:hidden p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors"
            >
              <Search size={18} />
            </button>

            {/* Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-br from-primary/20 to-violet/20 border border-primary/20 text-primary font-medium hover:opacity-80 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring hover:shadow-glow">
                  {user?.email?.charAt(0)?.toUpperCase() || 'U'}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 mt-1 glass-panel border-white/10 rounded-xl">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none text-foreground">{store?.name || 'My Store'}</p>
                    <p className="text-xs leading-none text-muted-foreground truncate mt-1">{user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/settings" className="w-full cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => logout()}
                  className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto relative flex flex-col items-center scrollbar-thin">
          <div className="w-full max-w-[1600px] flex-1 flex flex-col">
            <Outlet />
          </div>
          <div className="w-full max-w-[1600px] mt-12">
            <Footer />
          </div>
        </div>
      </main>
    </div>
  );
}
