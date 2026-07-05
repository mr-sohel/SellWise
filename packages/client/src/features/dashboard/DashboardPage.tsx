import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDashboard } from './hooks/useDashboard';
import { useAuthStore } from '../../stores/auth.store';
import { DemandForecastChart } from './components/DemandForecastChart';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell, Legend
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

const COLORS = ['var(--color-primary)', 'var(--color-success)', 'var(--color-cyan)', 'var(--color-violet)', 'var(--color-warning)'];

export function DashboardPage() {
  const { t } = useTranslation();
  const { activeStoreId } = useAuthStore();
  const [range, setRange] = useState('30d');

  const { data, isLoading, isError, error } = useDashboard(activeStoreId || '', range);

  if (isLoading) {
    return (
      <div className="w-full space-y-8 max-w-[1600px] mx-auto pb-12 animate-pulse">
        <div className="flex justify-between items-end mb-8">
          <div className="space-y-2">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-[300px] rounded-full" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <Skeleton className="lg:col-span-8 h-[400px] rounded-2xl" />
          <div className="lg:col-span-4 flex flex-col gap-6">
            <Skeleton className="flex-1 rounded-2xl" />
            <Skeleton className="flex-1 rounded-2xl" />
            <Skeleton className="flex-1 rounded-2xl" />
          </div>
        </div>
        <Skeleton className="h-[400px] w-full rounded-2xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-[400px] rounded-2xl" />
          <Skeleton className="h-[400px] rounded-2xl" />
          <Skeleton className="h-[400px] rounded-2xl" />
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
  const maxTopProductRevenue = Math.max(...data.topProducts.map(p => p.revenue), 1);
  const maxWorstProductRevenue = Math.max(...(data.worstProducts?.map(p => p.revenue) || []), 1);

  return (
    <div className="w-full space-y-8 max-w-[1600px] mx-auto pb-12">
      {/* Header section with gradient text */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-4xl font-display-md tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-foreground to-foreground/70 mb-2">
            Overview
          </h1>
          <p className="text-muted-foreground flex items-center gap-2">
            <CalendarDays className="h-4 w-4" /> 
            Store performance for the last {range.toUpperCase()}
          </p>
        </div>
        
        <div className="bg-canvas/50 backdrop-blur-xl p-1 rounded-full border border-border/50 shadow-sm">
          <Tabs value={range} onValueChange={setRange}>
            <TabsList className="grid w-full grid-cols-4 rounded-full bg-transparent h-9">
              <TabsTrigger value="7d" className="rounded-full data-[state=active]:bg-background data-[state=active]:shadow-sm">7D</TabsTrigger>
              <TabsTrigger value="30d" className="rounded-full data-[state=active]:bg-background data-[state=active]:shadow-sm">30D</TabsTrigger>
              <TabsTrigger value="90d" className="rounded-full data-[state=active]:bg-background data-[state=active]:shadow-sm">90D</TabsTrigger>
              <TabsTrigger value="1y" className="rounded-full data-[state=active]:bg-background data-[state=active]:shadow-sm">1Y</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Hero Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Main Revenue Hero Card */}
        <Card className="lg:col-span-8 overflow-hidden bg-card/40 backdrop-blur-2xl border-border/60 shadow-vercel-3 group relative flex flex-col">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            <div className="flex items-baseline gap-4 mb-6">
              <h2 className="text-5xl md:text-6xl font-bold tracking-tight text-foreground">
                ৳{data.revenue.toLocaleString()}
              </h2>
              <div className={`flex items-center gap-1 text-sm font-semibold px-2.5 py-1 rounded-full ${isGrowthPositive ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
                {isGrowthPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                {Math.abs(data.revenueGrowth)}%
              </div>
            </div>

            {/* Gorgeous Area Chart embedded in the hero card */}
            <div className="flex-1 w-full -ml-4 mt-auto min-h-[220px]">
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
                    tickFormatter={(val) => `৳${val}`}
                    width={60}
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
            </div>
          </CardContent>
        </Card>

        {/* Secondary Stats Column */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <Card className="flex-1 bg-card/60 backdrop-blur-xl border-border/50 shadow-vercel-2 hover:shadow-vercel-3 transition-all">
            <CardContent className="p-6 flex flex-col justify-center h-full">
              <div className="flex items-center justify-between mb-4">
                <div className="h-12 w-12 bg-cyan/10 rounded-2xl flex items-center justify-center">
                  <ShoppingBag className="h-6 w-6 text-cyan" style={{ color: 'var(--color-cyan)' }} />
                </div>
              </div>
              <p className="text-sm text-muted-foreground font-medium mb-1">Total Orders</p>
              <h3 className="text-4xl font-bold tracking-tight text-foreground">{data.orders.toLocaleString()}</h3>
            </CardContent>
          </Card>

          <Card className="flex-1 bg-card/60 backdrop-blur-xl border-border/50 shadow-vercel-2 hover:shadow-vercel-3 transition-all">
            <CardContent className="p-6 flex flex-col justify-center h-full">
              <div className="flex items-center justify-between mb-4">
                <div className="h-12 w-12 bg-violet/10 rounded-2xl flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-violet" style={{ color: 'var(--color-violet)' }} />
                </div>
              </div>
              <p className="text-sm text-muted-foreground font-medium mb-1">Avg Order Value</p>
              <h3 className="text-4xl font-bold tracking-tight text-foreground">৳{data.averageOrderValue?.toLocaleString() || 0}</h3>
            </CardContent>
          </Card>

          <Card className="flex-1 bg-card/60 backdrop-blur-xl border-border/50 shadow-vercel-2 hover:shadow-vercel-3 transition-all relative overflow-hidden">
            <div className="absolute right-0 top-0 w-32 h-32 bg-success/5 rounded-full blur-3xl" />
            <CardContent className="p-6 flex flex-col justify-center h-full relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="h-12 w-12 bg-success/10 rounded-2xl flex items-center justify-center">
                  <Activity className="h-6 w-6 text-success" />
                </div>
                <span className="text-xs font-semibold text-success bg-success/10 px-2 py-1 rounded-full">Good Standing</span>
              </div>
              <p className="text-sm text-muted-foreground font-medium mb-1">Health Score</p>
              <div className="flex items-end gap-2">
                <h3 className="text-4xl font-bold tracking-tight text-foreground">{data.healthScore}</h3>
                <span className="text-muted-foreground font-medium mb-1.5">/100</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Demand Forecast */}
      <div className="overflow-hidden w-full">
        <DemandForecastChart />
      </div>

      {/* Bottom Grid: Pie Chart & Product Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Sales by Category (Pie) */}
        <Card className="bg-card/40 backdrop-blur-xl border-border/50 shadow-vercel-2">
          <CardHeader>
            <CardTitle className="text-lg">Category Distribution</CardTitle>
            <CardDescription>Revenue split across product types</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full flex justify-center">
              {data.categoryBreakdown.length > 0 ? (
                <ChartContainer config={chartConfig} className="w-full h-full">
                  <PieChart>
                    <Pie
                      data={data.categoryBreakdown}
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={4}
                      dataKey="revenue"
                      nameKey="category"
                      strokeWidth={0}
                    >
                      {data.categoryBreakdown.map((_entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '13px' }} />
                  </PieChart>
                </ChartContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground text-sm">No data available</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Products (Custom UI List) */}
        <Card className="bg-card/40 backdrop-blur-xl border-border/50 shadow-vercel-2">
          <CardHeader>
            <CardTitle className="text-lg">Top Performers</CardTitle>
            <CardDescription>Highest revenue generating items</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-5 mt-2">
              {data.topProducts.length > 0 ? (
                data.topProducts.slice(0, 5).map((item, i) => (
                  <div key={i} className="flex items-center gap-4 group">
                    <div className="w-6 h-6 rounded-full bg-canvas-soft flex items-center justify-center text-xs text-muted-foreground font-mono font-medium group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between mb-1.5 items-end">
                        <span className="text-sm font-medium text-foreground truncate pr-4">{item.productName}</span>
                        <span className="text-sm font-semibold text-foreground whitespace-nowrap">৳{item.revenue.toLocaleString()}</span>
                      </div>
                      <div className="h-1.5 w-full bg-canvas-soft rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-primary" style={{ width: `${(item.revenue / maxTopProductRevenue) * 100}%` }} />
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

        {/* Worst Products (Custom UI List) */}
        <Card className="bg-card/40 backdrop-blur-xl border-border/50 shadow-vercel-2">
          <CardHeader>
            <CardTitle className="text-lg">Needs Attention</CardTitle>
            <CardDescription>Lowest revenue generating items</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-5 mt-2">
              {data.worstProducts && data.worstProducts.length > 0 ? (
                data.worstProducts.slice(0, 5).map((item, i) => (
                  <div key={i} className="flex items-center gap-4 group">
                    <div className="w-6 h-6 rounded-full bg-canvas-soft flex items-center justify-center text-xs text-muted-foreground font-mono font-medium group-hover:bg-destructive/10 group-hover:text-destructive transition-colors">
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between mb-1.5 items-end">
                        <span className="text-sm font-medium text-foreground truncate pr-4">{item.productName}</span>
                        <span className="text-sm font-semibold text-foreground whitespace-nowrap">৳{item.revenue.toLocaleString()}</span>
                      </div>
                      <div className="h-1.5 w-full bg-canvas-soft rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-destructive" style={{ width: `${(item.revenue / maxWorstProductRevenue) * 100}%` }} />
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
  );
}
