import React, { useState } from 'react';
import { useAuthStore } from '../../stores/auth.store';
import { useAlerts, useMarkAlertAsRead, useMarkAllAlertsAsRead, useTriggerAlerts } from './hooks/useAlerts';
import { AlertCircle, AlertTriangle, CheckCircle, Info, RefreshCw, Check } from 'lucide-react';
import { Link } from 'react-router-dom';

export function AlertsListPage() {
  const { activeStoreId } = useAuthStore();
  const storeId = activeStoreId || '';
  
  const [unreadOnly, setUnreadOnly] = useState(false);

  const { data: alerts, isLoading } = useAlerts(storeId, unreadOnly);
  const { mutate: markAsRead } = useMarkAlertAsRead(storeId);
  const { mutate: markAllAsRead, isPending: isMarkingAll } = useMarkAllAlertsAsRead(storeId);
  const { mutate: triggerAlerts, isPending: isTriggering } = useTriggerAlerts(storeId);

  const SEVERITY_CONFIG: Record<string, { icon: React.ReactNode; style: string }> = {
    critical: {
      icon: <AlertCircle className="h-5 w-5 text-destructive" />,
      style: 'bg-destructive/10 border-destructive/20 text-destructive',
    },
    warning: {
      icon: <AlertTriangle className="h-5 w-5 text-yellow-500" />,
      style: 'bg-yellow-100 border-yellow-200 text-yellow-800 dark:bg-yellow-900/30 dark:border-yellow-800/50 dark:text-yellow-500',
    },
    info: {
      icon: <Info className="h-5 w-5 text-blue-500" />,
      style: 'bg-blue-100 border-blue-200 text-blue-800 dark:bg-blue-900/30 dark:border-blue-800/50 dark:text-blue-400',
    },
  };
  const DEFAULT_SEVERITY = {
    icon: <CheckCircle className="h-5 w-5 text-green-500" />,
    style: 'bg-card border-border',
  };

  const getIcon = (severity: string) => (SEVERITY_CONFIG[severity] ?? DEFAULT_SEVERITY).icon;
  const getSeverityStyle = (severity: string) => (SEVERITY_CONFIG[severity] ?? DEFAULT_SEVERITY).style;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Inventory Alerts</h1>
          <p className="text-muted-foreground text-sm mt-1">Smart recommendations based on predicted demand and sales velocity.</p>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={() => triggerAlerts()}
            disabled={isTriggering}
            className="inline-flex items-center px-4 py-2 border border-border bg-card hover:bg-muted rounded-md shadow-sm text-sm font-medium transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isTriggering ? 'animate-spin' : ''}`} />
            Scan Inventory
          </button>
          
          <button
            onClick={() => markAllAsRead()}
            disabled={isMarkingAll || !alerts?.some(a => !a.is_read)}
            className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground hover:opacity-90 rounded-md shadow-sm text-sm font-medium transition-opacity disabled:opacity-50"
          >
            <Check className="mr-2 h-4 w-4" />
            Mark All Read
          </button>
        </div>
      </div>

      <div className="flex items-center gap-4 border-b border-border pb-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input 
            type="checkbox" 
            checked={unreadOnly} 
            onChange={(e) => setUnreadOnly(e.target.checked)}
            className="rounded border-input text-primary focus:ring-primary h-4 w-4"
          />
          <span className="text-sm font-medium text-foreground">Show unread only</span>
        </label>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="p-12 text-center text-muted-foreground bg-card border border-border rounded-lg shadow-sm">
            Loading alerts...
          </div>
        ) : alerts?.length === 0 ? (
          <div className="p-12 text-center bg-card border border-border rounded-lg shadow-sm">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground">All Good!</h3>
            <p className="text-muted-foreground mt-1">No alerts found. Your inventory is optimal.</p>
          </div>
        ) : (
          alerts?.map((alert) => (
            <div 
              key={alert.id} 
              className={`flex items-start gap-4 p-4 rounded-lg border shadow-sm transition-colors ${
                !alert.is_read ? getSeverityStyle(alert.severity) : 'bg-card border-border opacity-75'
              }`}
            >
              <div className="mt-1 flex-shrink-0">
                {getIcon(alert.severity)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-base font-semibold capitalize flex items-center gap-2">
                      {alert.alert_type.replace('_', ' ')}
                      {!alert.is_read && (
                        <span className="inline-flex h-2 w-2 rounded-full bg-primary"></span>
                      )}
                    </h4>
                    <Link to={`/products/${alert.product_id}/edit`} className="text-sm font-medium hover:underline">
                      {alert.product_name}
                    </Link>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap ml-4">
                    {new Date(alert.created_at).toLocaleString()}
                  </span>
                </div>
                
                <p className="mt-2 text-sm">
                  {alert.message}
                </p>
                
                {!alert.is_read && (
                  <div className="mt-4 flex gap-3">
                    <button
                      onClick={() => markAsRead(alert.id)}
                      className="text-xs font-medium uppercase tracking-wider hover:underline"
                    >
                      Dismiss
                    </button>
                    {alert.alert_type === 'low_stock' && (
                      <Link
                        to={`/products/${alert.product_id}/edit`}
                        className="text-xs font-medium uppercase tracking-wider underline font-semibold"
                      >
                        Restock Now
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
