import React, { useState, useEffect } from 'react';
import { Outlet, Navigate, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/auth.store';
import { LogOut, Home, Box, ShoppingCart, Users, Receipt, BarChart3, Settings, Bell, Menu, X, Search, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { Footer } from './Footer';
import { useProducts } from '../../features/products/hooks/useProducts';
import { useCustomers } from '../../features/customers/hooks/useCustomers';
import { useOrders } from '../../features/orders/hooks/useOrders';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator
} from '../ui/command';

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

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: products } = useProducts(store?.id || '', { search: searchQuery, limit: 3 });
  const { data: customers } = useCustomers(store?.id || '', { search: searchQuery, limit: 3 });
  const { data: orders } = useOrders(store?.id || '', { search: searchQuery, limit: 3 });

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setIsCommandOpen((open) => !open)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

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

  // Generate breadcrumbs from path
  const pathSegments = location.pathname.split('/').filter(Boolean);

  return (
    <div className="min-h-screen flex w-full bg-background text-foreground overflow-hidden">

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - Desktop & Mobile */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 bg-card/90 backdrop-blur-md border border-border/50 shadow-vercel-3 rounded-2xl flex flex-col shrink-0 transition-all duration-300 ease-in-out md:translate-x-0 md:static md:my-4 md:ml-4 md:h-[calc(100vh-2rem)] ${
          isMobileMenuOpen ? 'translate-x-0 m-4 h-[calc(100vh-2rem)]' : '-translate-x-full'
        } ${isSidebarCollapsed ? 'w-20' : 'w-64'}`}
      >
        <div className="h-16 flex items-center justify-between px-4 border-b border-border overflow-hidden">
          <Link to="/dashboard" className={`flex items-center gap-2 overflow-hidden transition-all duration-300 ${isSidebarCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
            <span className="text-lg font-bold tracking-tight text-primary truncate">
              SellWise
            </span>
          </Link>
          <div className="flex items-center">
            {/* Desktop Collapse Toggle */}
            <button
              className="hidden md:flex p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground rounded-md transition-colors"
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isSidebarCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
            </button>
            {/* Mobile Close */}
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
                className={`flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium transition-all ${
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-body hover:bg-muted hover:text-foreground'
                } ${isSidebarCollapsed ? 'justify-center' : 'justify-start'}`}
              >
                <Icon size={18} strokeWidth={isActive ? 2.5 : 2} className="shrink-0" />
                {!isSidebarCollapsed && (
                  <span className="truncate">{label}</span>
                )}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden bg-background">
        {/* Header */}
        <header className="h-16 border-b md:border border-border/50 bg-card/70 backdrop-blur-md sticky top-0 md:top-4 flex items-center justify-between px-4 md:px-6 shrink-0 z-30 shadow-sm md:shadow-vercel-3 transition-all duration-300 md:rounded-2xl md:mx-6 lg:mx-8">
          <div className="flex items-center gap-4 flex-1">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden text-muted-foreground hover:text-foreground p-1"
            >
              <Menu size={20} />
            </button>

            {/* Breadcrumbs (Desktop) */}
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
                      // Check for UUID/ID-like segments to simplify breadcrumbs
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

            {/* Page Title (Mobile only) */}
            <h1 className="text-base font-medium capitalize text-foreground truncate max-w-[150px] sm:hidden">
              {pathSegments[0] || 'Dashboard'}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Command Palette Trigger */}
            <button
              onClick={() => setIsCommandOpen(true)}
              className="hidden md:flex items-center gap-2 px-3 py-2 text-base text-muted-foreground bg-muted/50 hover:bg-muted border border-border rounded-md transition-colors w-48 lg:w-64"
            >
              <Search size={14} />
              <span className="flex-1 text-left">Search...</span>
              <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-border bg-card px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                <span className="text-xs">⌘</span>K
              </kbd>
            </button>
            <button
              onClick={() => setIsCommandOpen(true)}
              className="md:hidden p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors"
            >
              <Search size={18} />
            </button>

            {/* Profile Dropdown (Radix UI) */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-medium hover:bg-primary/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  {user?.email?.charAt(0)?.toUpperCase() || 'U'}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 mt-1">
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

      {/* Command Palette */}
      <CommandDialog open={isCommandOpen} onOpenChange={setIsCommandOpen}>
        <CommandInput 
          placeholder="Type a command or search products, customers..." 
          value={searchQuery}
          onValueChange={setSearchQuery}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
               const firstProduct = products?.data?.[0];
               const firstOrder = orders?.data?.[0];
               if (firstProduct && (firstProduct.sku === searchQuery || firstProduct.name.toLowerCase().includes(searchQuery.toLowerCase()))) {
                 navigate(`/products/${firstProduct.id}/edit`);
                 setIsCommandOpen(false);
               } else if (firstOrder && (firstOrder.order_number === searchQuery || firstOrder.total.toString() === searchQuery)) {
                 navigate(`/orders`);
                 setIsCommandOpen(false);
               }
            }
          }}
        />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          
          {searchQuery.length > 1 && (products?.data?.length ?? 0) > 0 && (
            <CommandGroup heading="Products (Database)">
              {products?.data.map(p => (
                <CommandItem key={p.id} value={`product ${p.name} ${p.sku}`} onSelect={() => { navigate(`/products/${p.id}/edit`); setIsCommandOpen(false); }}>
                  <Box className="mr-2 h-4 w-4 text-primary shrink-0" />
                  <span className="flex-1 truncate">{p.name}</span>
                  <div className="flex flex-col items-end shrink-0 ml-4">
                    <span className="text-foreground text-sm font-medium">৳{p.selling_price}</span>
                    <span className={`text-xs font-medium ${p.stock_quantity <= p.low_stock_threshold ? 'text-destructive' : 'text-success'}`}>
                      {p.stock_quantity} in stock
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {searchQuery.length > 1 && (customers?.data?.length ?? 0) > 0 && (
            <CommandGroup heading="Customers (Database)">
              {customers?.data.map(c => (
                <CommandItem key={c.id} value={`customer ${c.name} ${c.phone}`} onSelect={() => { navigate(`/customers`); setIsCommandOpen(false); }}>
                  <Users className="mr-2 h-4 w-4 text-primary" />
                  <span className="flex-1">{c.name}</span>
                  <span className="text-muted-foreground text-xs">{c.phone}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {searchQuery.length > 1 && (orders?.data?.length ?? 0) > 0 && (
            <CommandGroup heading="Orders (Database)">
              {orders?.data.map(o => (
                <CommandItem key={o.id} value={`order ${o.order_number} ${o.total}`} onSelect={() => { navigate(`/orders`); setIsCommandOpen(false); }}>
                  <ShoppingCart className="mr-2 h-4 w-4 text-primary shrink-0" />
                  <span className="flex-1 truncate">#{o.order_number}</span>
                  <div className="flex flex-col items-end shrink-0 ml-4">
                    <span className="text-foreground text-sm font-medium">৳{o.total}</span>
                    <span className="text-muted-foreground text-xs capitalize">{o.status}</span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          <CommandGroup heading="Navigation">
            {navItems.map(item => (
              <CommandItem
                key={item.to}
                onSelect={() => {
                  navigate(item.to);
                  setIsCommandOpen(false);
                }}
              >
                <item.icon className="mr-2 h-4 w-4" />
                <span>{item.label}</span>
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Quick Actions">
            <CommandItem onSelect={() => { navigate('/products/new'); setIsCommandOpen(false); }}>
              <Box className="mr-2 h-4 w-4" />
              <span>Add new product</span>
            </CommandItem>
            <CommandItem onSelect={() => { navigate('/orders/new'); setIsCommandOpen(false); }}>
              <ShoppingCart className="mr-2 h-4 w-4" />
              <span>Create order</span>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Settings">
            <CommandItem onSelect={() => { navigate('/settings/profile'); setIsCommandOpen(false); }}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Profile Settings</span>
            </CommandItem>
            <CommandItem onSelect={() => { logout(); setIsCommandOpen(false); }}>
              <LogOut className="mr-2 h-4 w-4 text-destructive" />
              <span className="text-destructive">Log out</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </div>
  );
}