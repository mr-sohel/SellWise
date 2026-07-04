import React from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { User, Users } from 'lucide-react';

export function SettingsLayout() {
  const location = useLocation();

  const tabs = [
    { name: 'Profile', path: '/settings/profile', icon: User },
    { name: 'Staff Management', path: '/settings/staff', icon: Users },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account and store preferences.</p>
      </div>

      <div className="border-b border-border">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = location.pathname.startsWith(tab.path);
            return (
              <NavLink
                key={tab.name}
                to={tab.path}
                className={`
                  whitespace-nowrap flex py-4 px-1 border-b-2 font-medium text-sm
                  ${isActive 
                    ? 'border-primary text-primary' 
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                  }
                `}
              >
                <Icon className={`mr-2 h-5 w-5 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                {tab.name}
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="pt-4">
        <Outlet />
      </div>
    </div>
  );
}
