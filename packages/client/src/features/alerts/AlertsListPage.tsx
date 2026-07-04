import React, { useState } from 'react';
import { useAuthStore } from '../../stores/auth.store';
import { useAlerts, useMarkAlertAsRead, useMarkAllAlertsAsRead, useTriggerAlerts } from './hooks/useAlerts';
import { AlertCircle, AlertTriangle, CheckCircle, Info, RefreshCw, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../../components/ui/page-header';

export function AlertsListPage() {
  const { activeStoreId } = useAuthStore();
  const storeId = activeStoreId || '';

  const [unreadOnly, setUnreadOnly] = useState(false);

  const { data: alerts, isLoading } = useAlerts(storeId, unreadOnly);
  const { mutate: markAsRead } = useMarkAlertAsRead(storeId);
  const { mutate: markAllAsRead, isPending: isMarkingAll } = useMarkAllAlertsAsRead(storeId);
  const { mutate: triggerAlerts, isPending: isTriggering } = useTriggerAlerts(storeId);

  const SEVERITY_CONFIG: Record<string, { icon: React.ReactNode; borderColor: string; bgColor: string; textColor: string }> = {
    critical: {
      icon: <AlertCircle className="h-4 w-4 text-destructive" />,
      borderColor: 'border-l-destructive',
      bgColor: 'bg-error-soft/30',
      textColor: 'text-destructive',
    },
    warning: {
      icon: <AlertTriangle className="h-4 w-4 text-warning" />,
      borderColor: 'border-l-warning',
      bgColor: 'bg-warning-soft/30',
      textColor: 'text-warning-deep',
    },
    info: {
      icon: <Info className="h-4 w-4 text-link" />,
      borderColor: 'border-l-link',
      bgColor: 'bg-link-bg-soft/30',
      textColor: 'text-link',
    },
  };
  const DEFAULT_SEVERITY = {
    icon: <CheckCircle className="h-4 w-4 text-success" />,
    borderColor: 'border-l-success',
    bgColor: 'bg-canvas-soft',
    textColor: 'text-foreground',
  };

  const getIcon = (severity: string) => (SEVERITY_CONFIG[severity] ?? DEFAULT_SEVERITY).icon;
  const getSeverityStyle = (severity: string) => (SEVERITY_CONFIG[severity] ?? DEFAULT_SEVERITY);

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-8">
      <PageHeader
        title="Inventory Alerts"
        description="Smart recommendations based on predicted demand and sales velocity."
        action={
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <button
              onClick={() => triggerAlerts()}
              disabled={isTriggering}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-border bg-card text-foreground rounded-full text-sm font-medium hover:bg-muted transition-colors disabled:opacity-50 w-full sm:w-auto"
            >
              <RefreshCw className={`h-4 w-4 ${isTriggering ? 'animate-spin' : ''}`} />
              Scan Inventory
            </button>
            <button
              onClick={() => markAllAsRead()}
              disabled={isMarkingAll || !alerts?.some(a => !a.is_read)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-full text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 w-full sm:w-auto"
            >
              <Check className="h-4 w-4" />
              Mark All Read
            </button>
          </div>
        }
      />

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

      <div className="space-y-3">
        {isLoading ? (
          <div className="p-12 text-center text-muted-foreground bg-card border border-border rounded-xl shadow-vercel-2 text-sm">
            Loading alerts...
          </div>
        ) : alerts?.length === 0 ? (
          <div className="p-12 text-center bg-card border border-border rounded-xl shadow-vercel-2">
            <CheckCircle className="h-10 w-10 text-success mx-auto mb-3" />
            <h3 className="text-base font-medium text-foreground">All Good!</h3>
            <p className="text-sm text-muted-foreground mt-1">No alerts found. Your inventory is optimal.</p>
          </div>
        ) : (
          alerts?.map((alert) => {
            const severity = getSeverityStyle(alert.severity);
            return (
              <div
                key={alert.id}
                className={`flex flex-col sm:flex-row items-start gap-4 p-4 rounded-xl border-l-4 border border-border shadow-vercel-1 transition-colors ${
                  !alert.is_read ? `${severity.borderColor} ${severity.bgColor}` : 'bg-card border-border border-l-border opacity-75'
                }`}
              >
                <div className="mt-0.5 flex-shrink-0 hidden sm:block">
                  {getIcon(alert.severity)}
                </div>

                <div className="flex-1 min-w-0 w-full">
                  <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-1 sm:gap-4 mb-2 sm:mb-0">
                    <div>
                      <h4 className="text-sm font-medium capitalize flex items-center gap-2">
                        <span className="sm:hidden">{getIcon(alert.severity)}</span>
                        {alert.alert_type.replace('_', ' ')}
                        {!alert.is_read && (
                          <span className="inline-flex h-1.5 w-1.5 rounded-full bg-primary shrink-0"></span>
                        )}
                      </h4>
                      <Link to={`/products/${alert.product_id}/edit`} className="text-sm text-link hover:underline underline-offset-4 font-medium">
                        {alert.product_name}
                      </Link>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(alert.created_at).toLocaleString()}
                    </span>
                  </div>

                  <p className="mt-1.5 text-sm text-body">
                    {alert.message}
                  </p>

                  {!alert.is_read && (
                    <div className="mt-3 flex gap-3">
                      <button
                        onClick={() => markAsRead(alert.id)}
                        className="text-xs font-medium text-muted-foreground hover:text-foreground uppercase tracking-wider hover:underline transition-colors"
                      >
                        Dismiss
                      </button>
                      {alert.alert_type === 'low_stock' && (
                        <Link
                          to={`/products/${alert.product_id}/edit`}
                          className="text-xs font-medium text-link uppercase tracking-wider hover:underline transition-colors"
                        >
                          Restock Now
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
