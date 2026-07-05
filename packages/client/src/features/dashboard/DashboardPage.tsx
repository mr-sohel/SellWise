import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDashboard } from './hooks/useDashboard';
import { useAuthStore } from '../../stores/auth.store';
import { DemandForecastChart } from './components/DemandForecastChart';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell
} from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, ShoppingBag, Activity, CalendarDays } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Skeleton } from '../../components/ui/skeleton';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '../../components/ui/chart';

const chartConfig = {
  revenue: { label: "Revenue", color: "var(--color-primary)" },
  category: { label: "Category" },
};

const COLORS = ['var(--color-chart-1)', 'var(--color-chart-2)', 'var(--color-chart-3)', 'var(--color-chart-4)', 'var(--color-chart-5)'];

export function DashboardPage() {
  useTranslation();
  const { activeStoreId } = useAuthStore();
  const [range, setRange] = useState('30d');

  const { data, isLoading, isError, error } = useDashboard(activeStoreId || '', range);

  if (isLoading) {
    return (
      <div className="w-full space-y-4 max-w-[1600px] mx-auto pb-12 animate-pulse">
        <div className="flex justify-between items-end mb-6">
          <div className="space-y-2">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-[300px] rounded-full" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <Skeleton className="md:col-span-6 xl:col-span-3 h-32 rounded-xl" />
          <Skeleton className="md:col-span-6 xl:col-span-3 h-32 rounded-xl" />
          <Skeleton className="md:col-span-12 xl:col-span-6 xl:row-span-2 h-72 rounded-xl" />
          <Skeleton className="md:col-span-6 xl:col-span-3 h-32 rounded-xl" />
          <Skeleton className="md:col-span-6 xl:col-span-3 h-32 rounded-xl" />
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 mt-4">
          <Skeleton className="xl:col-span-8 h-[400px] rounded-xl" />
          <Skeleton className="xl:col-span-4 h-[400px] rounded-xl" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
        <Activity className="h-12 w-12 text-destructive/50 mb-4" />
        <p className="text-destructive font-medium mb-2">Failed to load dashboard</p>
        <p className="text-muted-foreground text-sm">{error?.message || 'Unknown error'}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
        <ShoppingBag className="h-12 w-12 text-muted-foreground/30 mb-4" />
        <p className="text-body font-medium">No data available yet.</p>
        <p className="text-muted-foreground text-sm mt-1">Start adding orders and products to see analytics here.</p>
      </div>
    );
  }

  const isGrowthPositive = data.revenueGrowth >= 0;
  const maxTopProductRevenue = Math.max(...data.topProducts.map(p => Number(p.revenue)), 1);
  const maxWorstProductRevenue = Math.max(...(data.worstProducts?.map(p => Number(p.revenue)) || []), 1);

  return (
    <div className="w-full max-w-[1600px] mx-auto pb-12 animate-fade-in-up">
      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-display-md tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-foreground to-foreground/70 mb-2">
            Overview
          </h1>
          <p className="text-muted-foreground flex items-center gap-2 text-sm">
            <CalendarDays className="h-4 w-4" />
            Store performance for the last {range.toUpperCase()}
          </p>
        </div>

        <div className="glass-panel p-1 rounded-full border border-white/5 shadow-sm">
          <Tabs value={range} onValueChange={setRange}>
            <TabsList className="grid w-full grid-cols-4 rounded-full bg-transparent h-9">
              <TabsTrigger value="7d" className="rounded-full data-[state=active]:bg-background data-[state=active]:shadow-sm text-xs sm:text-sm">7D</TabsTrigger>
              <TabsTrigger value="30d" className="rounded-full data-[state=active]:bg-background data-[state=active]:shadow-sm text-xs sm:text-sm">30D</TabsTrigger>
              <TabsTrigger value="90d" className="rounded-full data-[state=active]:bg-background data-[state=active]:shadow-sm text-xs sm:text-sm">90D</TabsTrigger>
              <TabsTrigger value="1y" className="rounded-full data-[state=active]:bg-background data-[state=active]:shadow-sm text-xs sm:text-sm">1Y</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Bento Grid Container */}
      <div className="flex flex-col gap-4">

        {/* Top Bento Section */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">

          {/* Revenue KPI */}
          <Card className="md:col-span-6 xl:col-span-3 glass-panel hover:shadow-vercel-4 hover:border-border/80 transition-all duration-300 relative overflow-hidden rounded-xl animate-fade-in-up delay-100">
            <div className="absolute right-0 top-0 w-32 h-32 bg-chart-1/5 rounded-full blur-3xl opacity-50 transition-opacity duration-500" />
            <CardContent className="p-6 h-full flex flex-col justify-between relative z-10">
              <div className="flex justify-between items-start mb-4">
                <p className="text-sm text-muted-foreground font-medium">Total Revenue</p>
                <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${isGrowthPositive ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
                  {isGrowthPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {Math.abs(data.revenueGrowth)}%
                </div>
              </div>
              <h3 className="text-3xl xl:text-4xl font-bold tracking-tight text-foreground">
                ৳{Number(data.revenue).toLocaleString()}
              </h3>
            </CardContent>
          </Card>

          {/* Orders KPI */}
          <Card className="md:col-span-6 xl:col-span-3 glass-panel hover:shadow-vercel-4 hover:border-border/80 transition-all duration-300 relative overflow-hidden rounded-xl animate-fade-in-up delay-100">
            <div className="absolute right-0 top-0 w-32 h-32 bg-cyan/5 rounded-full blur-3xl opacity-50 transition-opacity duration-500" />
            <CardContent className="p-6 h-full flex flex-col justify-between relative z-10">
              <div className="flex justify-between items-start mb-4">
                <p className="text-sm text-muted-foreground font-medium">Total Orders</p>
                <div className="h-8 w-8 bg-cyan/10 rounded-xl flex items-center justify-center border border-cyan/20">
                  <ShoppingBag className="h-4 w-4 text-cyan" />
                </div>
              </div>
              <h3 className="text-3xl xl:text-4xl font-bold tracking-tight text-foreground">
                {Number(data.orders).toLocaleString()}
              </h3>
            </CardContent>
          </Card>

          {/* Revenue Trend Chart (Spans 2 rows on XL) */}
          <Card className="md:col-span-12 xl:col-span-6 xl:row-span-2 glass-panel hover:shadow-vercel-4 hover:border-border/80 transition-all duration-300 flex flex-col overflow-hidden rounded-xl animate-fade-in-up delay-200">
            <CardHeader className="pb-0">
              <CardTitle className="text-lg">Revenue Trend</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-0 mt-4 h-64 xl:h-auto w-full relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-violet/5 pointer-events-none" />
              <ChartContainer config={chartConfig} className="w-full h-full">
                <AreaChart data={data.revenueTrend} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" opacity={0.4} />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(val) => new Date(String(val)).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    stroke="var(--color-muted-foreground)"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    dy={10}
                    minTickGap={30}
                  />
                  <YAxis
                    stroke="var(--color-muted-foreground)"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => `৳${Intl.NumberFormat('en-US', { notation: 'compact', compactDisplay: 'short', maximumFractionDigits: 1 }).format(val)}`}
                    width={55}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="var(--color-primary)"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                    activeDot={{ r: 6, strokeWidth: 0, fill: "var(--color-primary)" }}
                  />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* AOV KPI */}
          <Card className="md:col-span-6 xl:col-span-3 glass-panel hover:shadow-vercel-4 hover:border-border/80 transition-all duration-300 relative overflow-hidden rounded-xl animate-fade-in-up delay-200">
            <div className="absolute right-0 top-0 w-32 h-32 bg-violet/5 rounded-full blur-3xl opacity-50 transition-opacity duration-500" />
            <CardContent className="p-6 h-full flex flex-col justify-between relative z-10">
              <div className="flex justify-between items-start mb-4">
                <p className="text-sm text-muted-foreground font-medium">Avg Order Value</p>
                <div className="h-8 w-8 bg-violet/10 rounded-xl flex items-center justify-center border border-violet/20">
                  <DollarSign className="h-4 w-4 text-violet" />
                </div>
              </div>
              <h3 className="text-3xl xl:text-4xl font-bold tracking-tight text-foreground">
                ৳{Number(data.averageOrderValue || 0).toLocaleString() || 0}
              </h3>
            </CardContent>
          </Card>

          {/* Health Score KPI */}
          <Card className="md:col-span-6 xl:col-span-3 glass-panel hover:shadow-vercel-4 hover:border-border/80 transition-all duration-300 relative overflow-hidden rounded-xl animate-fade-in-up delay-200">
            <div className="absolute right-0 top-0 w-32 h-32 bg-success/5 rounded-full blur-3xl opacity-50 transition-opacity duration-500" />
            <CardContent className="p-6 h-full flex flex-col justify-between relative z-10">
              <div className="flex justify-between items-start mb-4">
                <p className="text-sm text-muted-foreground font-medium">Health Score</p>
                <div className="h-8 w-8 bg-success/10 rounded-xl flex items-center justify-center border border-success/20">
                  <Activity className="h-4 w-4 text-success" />
                </div>
              </div>
              <div className="flex items-end gap-1">
                <h3 className="text-3xl xl:text-4xl font-bold tracking-tight text-foreground">{data.healthScore}</h3>
                <span className="text-muted-foreground font-medium mb-1.5">/100</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Middle Bento Section */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">

          {/* Demand Forecast (Wider in Bento) */}
          <div className="xl:col-span-8 flex flex-col animate-fade-in-up delay-300">
            <DemandForecastChart />
          </div>

          {/* Category Pie Chart */}
          <Card className="xl:col-span-4 glass-panel hover:shadow-vercel-4 hover:border-border/80 transition-all duration-300 rounded-xl flex flex-col overflow-hidden relative animate-fade-in-up delay-300">
            <div className="absolute right-0 top-0 w-32 h-32 bg-chart-1/5 rounded-full blur-3xl opacity-50 transition-opacity duration-500" />
            <CardHeader className="pb-2 relative z-10">
              <CardTitle className="text-lg">Sales by Category</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col items-center justify-center pb-6 relative z-10">
              <div className="h-[220px] w-full relative flex items-center justify-center">
                {data.categoryBreakdown.length > 0 ? (
                  <>
                    <ChartContainer config={chartConfig} className="w-full h-full absolute inset-0">
                      <PieChart>
                        <defs>
                          {COLORS.map((color, index) => (
                            <linearGradient key={`grad-${index}`} id={`pieGrad-${index}`} x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor={color} stopOpacity={1} />
                              <stop offset="100%" stopColor={color} stopOpacity={0.7} />
                            </linearGradient>
                          ))}
                        </defs>
                        <Pie
                          data={data.categoryBreakdown}
                          innerRadius={65}
                          outerRadius={85}
                          paddingAngle={6}
                          dataKey="revenue"
                          nameKey="category"
                          stroke="transparent"
                          cornerRadius={8}
                        >
                          {data.categoryBreakdown.map((_entry, index) => (
                            <Cell key={`cell-${index}`} fill={`url(#pieGrad-${index % COLORS.length})`} className="hover:opacity-80 transition-opacity" />
                          ))}
                        </Pie>
                        <ChartTooltip content={<ChartTooltipContent />} />
                      </PieChart>
                    </ChartContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Total</span>
                      <span className="text-xl font-bold text-foreground mt-0.5">
                        ৳{data.categoryBreakdown.reduce((sum, item) => sum + Number(item.revenue), 0).toLocaleString(undefined, { notation: 'compact', maximumFractionDigits: 1 })}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground text-sm">No data available</div>
                )}
              </div>

              {/* Custom Legend */}
              {data.categoryBreakdown.length > 0 && (
                <div className="w-full mt-4 px-2 grid grid-cols-2 gap-x-2 gap-y-3">
                  {data.categoryBreakdown.slice(0, 4).map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-medium text-foreground truncate" title={item.category}>{item.category}</span>
                        <span className="text-[10px] text-muted-foreground">
                          {Math.round((item.revenue / (data.categoryBreakdown.reduce((s, i) => s + Number(i.revenue), 0) || 1)) * 100)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Bottom Bento Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Top Products */}
          <Card className="glass-panel hover:shadow-vercel-4 hover:border-border/80 transition-all duration-300 rounded-xl relative overflow-hidden animate-fade-in-up delay-400">
            <div className="absolute left-0 top-0 w-64 h-32 bg-chart-1/5 rounded-full blur-3xl opacity-30 pointer-events-none" />
            <CardHeader className="pb-4 relative z-10">
              <CardTitle className="text-lg flex items-center gap-2">
                Top Performers
                <span className="flex items-center justify-center bg-primary/10 text-primary text-[10px] uppercase font-bold px-2 py-0.5 rounded-full tracking-wider border border-primary/20">High Momentum</span>
              </CardTitle>
              <CardDescription>Highest revenue generating items</CardDescription>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="space-y-3">
                {data.topProducts.length > 0 ? (
                  data.topProducts.slice(0, 5).map((item, i) => {
                    // Ranking colors for top 3
                    const rankColors = [
                      'bg-amber-500/10 text-amber-600 border border-amber-500/20', // 1st Gold
                      'bg-slate-400/10 text-slate-500 border border-slate-400/20', // 2nd Silver
                      'bg-orange-700/10 text-orange-600 border border-orange-700/20', // 3rd Bronze
                    ];
                    const rankStyle = i < 3 ? rankColors[i] : 'bg-canvas-soft text-muted-foreground border border-transparent';

                    return (
                      <div key={i} className="flex items-center gap-4 group/item p-2 -mx-2 rounded-xl hover:bg-muted/50 transition-colors">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-mono font-bold shadow-sm transition-all ${rankStyle}`}>
                          #{i + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between mb-1.5 items-end">
                            <span className="text-sm font-medium text-foreground truncate pr-4 group-hover/item:text-primary transition-colors">{item.productName}</span>
                            <span className="text-sm font-bold text-foreground whitespace-nowrap">৳{Number(item.revenue).toLocaleString()}</span>
                          </div>
                          <div className="h-1.5 w-full bg-canvas-soft rounded-full overflow-hidden shadow-inner">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-primary to-cyan shadow-[0_0_10px_rgba(var(--color-primary),0.5)] transition-all duration-1000 ease-out"
                              style={{ width: `${(item.revenue / maxTopProductRevenue) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center text-muted-foreground text-sm py-10">No data available</div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Worst Products */}
          <Card className="glass-panel hover:shadow-vercel-4 hover:border-border/80 transition-all duration-300 rounded-xl relative overflow-hidden animate-fade-in-up delay-400">
            <div className="absolute left-0 top-0 w-64 h-32 bg-destructive/5 rounded-full blur-3xl opacity-30 pointer-events-none" />
            <CardHeader className="pb-4 relative z-10">
              <CardTitle className="text-lg flex items-center gap-2">
                Needs Attention
                <span className="flex items-center justify-center bg-destructive/10 text-destructive text-[10px] uppercase font-bold px-2 py-0.5 rounded-full tracking-wider border border-destructive/20">At Risk</span>
              </CardTitle>
              <CardDescription>Lowest revenue generating items</CardDescription>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="space-y-3">
                {data.worstProducts && data.worstProducts.length > 0 ? (
                  data.worstProducts.slice(0, 5).map((item, i) => (
                    <div key={i} className="flex items-center gap-4 group/item p-2 -mx-2 rounded-xl hover:bg-muted/50 transition-colors">
                      <div className="w-8 h-8 rounded-xl bg-canvas-soft border border-transparent flex items-center justify-center text-xs text-muted-foreground font-mono font-bold group-hover/item:bg-destructive/5 group-hover/item:text-destructive group-hover/item:border-destructive/20 transition-all shadow-sm">
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between mb-1.5 items-end">
                          <span className="text-sm font-medium text-foreground truncate pr-4 group-hover/item:text-destructive transition-colors">{item.productName}</span>
                          <span className="text-sm font-bold text-foreground whitespace-nowrap">৳{Number(item.revenue).toLocaleString()}</span>
                        </div>
                        <div className="h-1.5 w-full bg-canvas-soft rounded-full overflow-hidden shadow-inner">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-destructive to-orange-500 shadow-[0_0_10px_rgba(var(--color-destructive),0.5)] transition-all duration-1000 ease-out"
                            style={{ width: `${(item.revenue / maxWorstProductRevenue) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-muted-foreground text-sm py-10">No data available</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
