import { useState } from 'react';
import { useDemandForecast } from '../hooks/useDashboard';
import { useAuthStore } from '../../../stores/auth.store';
import {
  AreaChart, Area, ResponsiveContainer, Tooltip, XAxis, YAxis
} from 'recharts';
import { TrendingUp, Package } from 'lucide-react';

const COLORS = ['var(--color-chart-1)', 'var(--color-chart-2)', 'var(--color-chart-3)', 'var(--color-chart-4)', 'var(--color-chart-5)'];

const DAY_OPTIONS = [
  { value: 7, label: '7D' },
  { value: 15, label: '15D' },
  { value: 30, label: '30D' },
] as const;

export function DemandForecastChart() {
  const { activeStoreId } = useAuthStore();
  const [days, setDays] = useState<number>(30);
  const { data: products, isLoading, isError } = useDemandForecast(activeStoreId || '', 5, days);

  if (isLoading) {
    return (
      <div className="glass-panel border-white/5 p-6 rounded-xl shadow-vercel-2 h-full">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-medium text-foreground">Demand Forecast</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-48 bg-canvas-soft rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (isError || !products || products.length === 0) {
    return (
      <div className="glass-panel border-white/5 p-6 rounded-xl shadow-vercel-2 h-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-foreground">Demand Forecast</h3>
        </div>
        <div className="h-40 flex items-center justify-center text-muted-foreground text-sm">
          No forecast data available. Forecasts are generated nightly.
        </div>
      </div>
    );
  }

  return (
    <div className="glass-panel border-white/5 p-6 rounded-xl shadow-vercel-2 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-medium text-foreground">Demand Forecast</h3>
          <p className="text-sm text-muted-foreground mt-0.5">Predicted demand for top selling products</p>
        </div>
        <div className="flex bg-canvas-soft rounded-full p-0.5 border border-border">
          {DAY_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setDays(opt.value)}
              className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                days === opt.value
                  ? 'bg-foreground text-primary-foreground'
                  : 'text-body hover:text-foreground'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Product cards grid — sorted by total predicted demand */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...products]
          .map(p => ({
            ...p,
            _totalDemand: p.forecasts.reduce((sum, f) => sum + Number(f.predicted_qty), 0),
          }))
          .sort((a, b) => b._totalDemand - a._totalDemand)
          .map((product, i) => {
            const totalDemand = product._totalDemand;
            const avgDaily = product.forecasts.length > 0 ? totalDemand / product.forecasts.length : 0;
          const color = COLORS[i % COLORS.length];

          return (
            <div
              key={product.product_id}
              className="relative p-4 rounded-xl border border-white/10 bg-background/50 hover:bg-background/80 hover:border-white/20 transition-all shadow-sm"
            >
              {/* Rank badge */}
              <div className="absolute -top-2 -left-2 bg-foreground text-primary-foreground text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {i + 1}
              </div>

              {/* Product info */}
              <div className="flex items-start justify-between mb-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground truncate">{product.product_name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{product.category}</p>
                </div>
                <div
                  className="w-3 h-3 rounded-full shrink-0 mt-1"
                  style={{ backgroundColor: color }}
                />
              </div>

              {/* Mini sparkline chart */}
              <div className="h-20 w-full mb-3">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={product.forecasts}>
                    <defs>
                      <linearGradient id={`grad-${product.product_id}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={color} stopOpacity={0.2} />
                        <stop offset="100%" stopColor={color} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="forecast_date" hide />
                    <YAxis hide />
                    <Tooltip
                      labelFormatter={(val) => new Date(String(val)).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      formatter={(val) => [`${Math.round(Number(val))} units`, 'Demand']}
                      contentStyle={{
                        backgroundColor: 'var(--color-card)',
                        borderColor: 'var(--color-border)',
                        borderRadius: '12px',
                        fontSize: '12px',
                        padding: '8px 12px',
                        color: 'var(--color-foreground)',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="predicted_qty"
                      stroke={color}
                      strokeWidth={2}
                      fill={`url(#grad-${product.product_id})`}
                      dot={false}
                      activeDot={{ r: 3, fill: color }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Stats row */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <TrendingUp className="h-3 w-3 text-muted-foreground" />
                  <span className="text-foreground font-medium">{Math.round(totalDemand)}</span>
                  <span className="text-muted-foreground">units / {days}d</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Package className="h-3 w-3 text-muted-foreground" />
                  <span className="text-foreground">
                    {product.current_stock}
                  </span>
                  <span className="text-muted-foreground">in stock</span>
                </div>
              </div>

              {/* Daily average */}
              <p className="text-[10px] text-muted-foreground mt-2">
                ~{avgDaily.toFixed(1)} units/day
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
