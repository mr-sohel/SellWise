import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDashboard } from './hooks/useDashboard';
import { useAuthStore } from '../../stores/auth.store';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend
} from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, ShoppingBag, Activity } from 'lucide-react';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#a4de6c'];

export function DashboardPage() {
  const { t } = useTranslation();
  const { activeStoreId } = useAuthStore();
  const [range, setRange] = useState('30d');

  const { data, isLoading, isError, error } = useDashboard(activeStoreId || '', range);

  if (isLoading) {
    return <div className="p-12 text-center text-muted-foreground">Loading dashboard...</div>;
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
        <p className="text-muted-foreground font-medium">No data available yet.</p>
        <p className="text-muted-foreground text-sm mt-1">Start adding orders and products to see analytics here.</p>
      </div>
    );
  }

  const isGrowthPositive = data.revenueGrowth >= 0;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-foreground">
          {t('common.dashboard')}
        </h1>
        <select
          value={range}
          onChange={(e) => setRange(e.target.value)}
          className="px-3 py-2 bg-card border border-border rounded-md shadow-sm text-sm outline-none"
        >
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
          <option value="90d">Last 90 Days</option>
          <option value="1y">Last Year</option>
        </select>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card border border-border p-6 rounded-xl shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Total Revenue</p>
            <h3 className="text-3xl font-bold text-foreground">৳{data.revenue.toLocaleString()}</h3>
            <p className={`text-sm font-medium mt-2 flex items-center ${isGrowthPositive ? 'text-green-600 dark:text-green-400' : 'text-destructive'}`}>
              {isGrowthPositive ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
              {Math.abs(data.revenueGrowth)}% from previous period
            </p>
          </div>
          <div className="h-12 w-12 bg-primary/10 text-primary rounded-full flex items-center justify-center">
            <DollarSign className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-card border border-border p-6 rounded-xl shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Total Orders</p>
            <h3 className="text-3xl font-bold text-foreground">{data.orders.toLocaleString()}</h3>
          </div>
          <div className="h-12 w-12 bg-primary/10 text-primary rounded-full flex items-center justify-center">
            <ShoppingBag className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-card border border-border p-6 rounded-xl shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Health Score</p>
            <h3 className="text-3xl font-bold text-foreground">{data.healthScore}/100</h3>
            <p className="text-sm text-muted-foreground mt-2">Based on growth, turnover, and fulfillment</p>
          </div>
          <div className="h-12 w-12 bg-primary/10 text-primary rounded-full flex items-center justify-center">
            <Activity className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-card border border-border p-6 rounded-xl shadow-sm lg:col-span-2">
          <h3 className="text-lg font-medium text-foreground mb-6">Revenue Trend</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.revenueTrend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  dy={10}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `৳${val}`}
                />
                <Tooltip
                  labelFormatter={(val) => new Date(val).toLocaleDateString()}
                  formatter={(val: number) => [`৳${val.toLocaleString()}`, 'Revenue']}
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                />
                <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card border border-border p-6 rounded-xl shadow-sm">
          <h3 className="text-lg font-medium text-foreground mb-6">Sales by Category</h3>
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
                    {data.categoryBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: number) => `৳${val.toLocaleString()}`}
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">No data available</div>
            )}
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="bg-card border border-border p-6 rounded-xl shadow-sm">
        <h3 className="text-lg font-medium text-foreground mb-6">Top Performing Products</h3>
        <div className="h-[300px] w-full">
          {data.topProducts.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.topProducts} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                <XAxis
                  type="number"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `৳${val}`}
                />
                <YAxis
                  dataKey="productName"
                  type="category"
                  stroke="hsl(var(--foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  width={150}
                />
                <Tooltip
                  formatter={(val: number) => [`৳${val.toLocaleString()}`, 'Revenue']}
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                />
                <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">No data available</div>
          )}
        </div>
      </div>
    </div>
  );
}