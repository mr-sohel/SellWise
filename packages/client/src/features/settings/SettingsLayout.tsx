import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { User, Users } from 'lucide-react';
import { useAuthStore } from '../../stores/auth.store';

export function SettingsLayout() {
  const location = useLocation();
  const { role } = useAuthStore();

  const tabs = [
    { name: 'Profile', path: '/settings/profile', icon: User },
  ];

  if (role === 'owner') {
    tabs.push({ name: 'Staff Management', path: '/settings/staff', icon: Users });
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="font-display-md text-foreground">Settings</h1>
        <p className="text-sm text-body mt-1">Manage your account and store preferences.</p>
      </div>

      <div className="border-b border-border">
        <nav className="-mb-px flex space-x-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = location.pathname.startsWith(tab.path);
            return (
              <NavLink
                key={tab.name}
                to={tab.path}
                className={`
                  whitespace-nowrap flex items-center gap-2 py-3 px-4 text-sm font-medium rounded-t-lg transition-colors
                  ${isActive
                    ? 'bg-card border border-border border-b-card text-foreground -mb-px'
                    : 'text-muted-foreground hover:text-foreground'
                  }
                `}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-foreground' : 'text-muted-foreground'}`} />
                {tab.name}
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="pt-2">
        <Outlet />
      </div>
    </div>
  );
}
