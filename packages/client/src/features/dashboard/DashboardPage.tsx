import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDashboard } from './hooks/useDashboard';
import { useAuthStore } from '../../stores/auth.store';
import { DemandForecastChart } from './components/DemandForecastChart';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend
} from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, ShoppingBag, Activity, BarChart2, LineChart as LineChartIcon } from 'lucide-react';

const COLORS = ['#171717', '#0070f3', '#50e3c2', '#7928ca', '#f5a623'];

export function DashboardPage() {
  const { t } = useTranslation();
  const { activeStoreId } = useAuthStore();
  const [range, setRange] = useState('30d');
  const [trendChartType, setTrendChartType] = useState<'line' | 'bar'>('line');

  const { data, isLoading, isError, error } = useDashboard(activeStoreId || '', range);

  if (isLoading) {
    return <div className="p-12 text-center text-muted-foreground text-sm">Loading dashboard...</div>;
  }

  if (isError) {
    return (
      <div className="p-12 text-center">
        <p className="text-destructive font-medium mb-2">Failed to load dashboard</p>
        <p className="text-muted-foreground text-sm">{error?.message || 'Unknown error'}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-12 text-center">
        <p className="text-body font-medium">No data available yet.</p>
        <p className="text-muted-foreground text-sm mt-1">Start adding orders and products to see analytics here.</p>
      </div>
    );
  }

  const isGrowthPositive = data.revenueGrowth >= 0;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="font-display-md text-foreground">
          {t('common.dashboard')}
        </h1>
        <div className="flex bg-canvas-soft rounded-full p-0.5 border border-border">
          {['7d', '30d', '90d', '1y'].map((value) => (
            <button
              key={value}
              onClick={() => setRange(value)}
              className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${
                range === value
                  ? 'bg-primary text-primary-foreground'
                  : 'text-body hover:text-foreground'
              }`}
            >
              {value === '7d' ? '7D' : value === '30d' ? '30D' : value === '90d' ? '90D' : '1Y'}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border p-6 rounded-xl shadow-vercel-2 flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Total Revenue</p>
            <h3 className="font-display-sm text-foreground">৳{data.revenue.toLocaleString()}</h3>
            <p className={`text-xs font-medium mt-2 flex items-center gap-1 ${isGrowthPositive ? 'text-success' : 'text-destructive'}`}>
              {isGrowthPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {Math.abs(data.revenueGrowth)}% from previous period
            </p>
          </div>
          <div className="h-10 w-10 bg-canvas-soft rounded-full flex items-center justify-center">
            <DollarSign className="h-5 w-5 text-foreground" />
          </div>
        </div>

        <div className="bg-card border border-border p-6 rounded-xl shadow-vercel-2 flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Total Orders</p>
            <h3 className="font-display-sm text-foreground">{data.orders.toLocaleString()}</h3>
          </div>
          <div className="h-10 w-10 bg-canvas-soft rounded-full flex items-center justify-center">
            <ShoppingBag className="h-5 w-5 text-foreground" />
          </div>
        </div>

        <div className="bg-card border border-border p-6 rounded-xl shadow-vercel-2 flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Avg Order Value</p>
            <h3 className="font-display-sm text-foreground">৳{data.averageOrderValue?.toLocaleString() || 0}</h3>
          </div>
          <div className="h-10 w-10 bg-canvas-soft rounded-full flex items-center justify-center">
            <DollarSign className="h-5 w-5 text-foreground" />
          </div>
        </div>

        <div className="bg-card border border-border p-6 rounded-xl shadow-vercel-2 flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Health Score</p>
            <h3 className="font-display-sm text-foreground">{data.healthScore}/100</h3>
            <p className="text-xs text-muted-foreground mt-2">Based on growth, turnover, and retention</p>
          </div>
          <div className="h-10 w-10 bg-canvas-soft rounded-full flex items-center justify-center">
            <Activity className="h-5 w-5 text-foreground" />
          </div>
        </div>
      </div>

      {/* Demand Forecast */}
      <DemandForecastChart />

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-card border border-border p-6 rounded-xl shadow-vercel-2 lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-base font-medium text-foreground">Revenue Trend</h3>
            <div className="flex bg-canvas-soft rounded-full p-0.5 border border-border">
              <button
                onClick={() => setTrendChartType('line')}
                className={`p-1.5 rounded-full transition-colors ${trendChartType === 'line' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              >
                <LineChartIcon className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setTrendChartType('bar')}
                className={`p-1.5 rounded-full transition-colors ${trendChartType === 'bar' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              >
                <BarChart2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              {trendChartType === 'line' ? (
                <LineChart data={data.revenueTrend}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ebebeb" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(val) => new Date(String(val)).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    dy={10}
                  />
                  <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => `৳${val}`}
                  />
                  <Tooltip
                    labelFormatter={(val) => new Date(String(val)).toLocaleDateString()}
                    formatter={(val) => [`৳${Number(val).toLocaleString()}`, 'Revenue']}
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#ebebeb', borderRadius: '8px', fontSize: '14px' }}
                  />
                  <Line type="monotone" dataKey="revenue" stroke="#171717" strokeWidth={2} dot={false} activeDot={{ r: 5, fill: '#171717' }} />
                </LineChart>
              ) : (
                <BarChart data={data.revenueTrend}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ebebeb" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(val) => new Date(String(val)).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    dy={10}
                  />
                  <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => `৳${val}`}
                  />
                  <Tooltip
                    labelFormatter={(val) => new Date(String(val)).toLocaleDateString()}
                    formatter={(val) => [`৳${Number(val).toLocaleString()}`, 'Revenue']}
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#ebebeb', borderRadius: '8px', fontSize: '14px' }}
                  />
                  <Bar dataKey="revenue" fill="#171717" radius={[4, 4, 0, 0]} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card border border-border p-6 rounded-xl shadow-vercel-2">
          <h3 className="text-base font-medium text-foreground mb-6">Sales by Category</h3>
          <div className="h-[300px] w-full flex justify-center">
            {data.categoryBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.categoryBreakdown}
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="revenue"
                    nameKey="category"
                  >
                    {data.categoryBreakdown.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val) => `৳${Number(val).toLocaleString()}`}
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#ebebeb', borderRadius: '8px', fontSize: '14px' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground text-sm">No data available</div>
            )}
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-card border border-border p-6 rounded-xl shadow-vercel-2">
          <h3 className="text-base font-medium text-foreground mb-6">Top Performing Products</h3>
          <div className="h-[300px] w-full">
            {data.topProducts.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.topProducts} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#ebebeb" />
                  <XAxis
                    type="number"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => `৳${val}`}
                  />
                  <YAxis
                    dataKey="productName"
                    type="category"
                    stroke="#171717"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    width={120}
                  />
                  <Tooltip
                    formatter={(val) => [`৳${Number(val).toLocaleString()}`, 'Revenue']}
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#ebebeb', borderRadius: '8px', fontSize: '14px' }}
                  />
                  <Bar dataKey="revenue" fill="#171717" radius={[0, 4, 4, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground text-sm">No data available</div>
            )}
          </div>
        </div>

        <div className="bg-card border border-border p-6 rounded-xl shadow-vercel-2">
          <h3 className="text-base font-medium text-foreground mb-6">Worst Performing Products</h3>
          <div className="h-[300px] w-full">
            {data.worstProducts && data.worstProducts.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.worstProducts} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#ebebeb" />
                  <XAxis
                    type="number"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => `৳${val}`}
                  />
                  <YAxis
                    dataKey="productName"
                    type="category"
                    stroke="#171717"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    width={120}
                  />
                  <Tooltip
                    formatter={(val) => [`৳${Number(val).toLocaleString()}`, 'Revenue']}
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#ebebeb', borderRadius: '8px', fontSize: '14px' }}
                  />
                  <Bar dataKey="revenue" fill="#ee0000" radius={[0, 4, 4, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground text-sm">No data available</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
