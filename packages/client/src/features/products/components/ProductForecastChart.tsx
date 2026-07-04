import React, { useState } from 'react';
import { useProductForecast } from '../hooks/useProducts';
import {
  Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, ComposedChart
} from 'recharts';

export function ProductForecastChart({ storeId, productId }: { storeId: string, productId: string }) {
  const [days, setDays] = useState<number>(30);
  const { data: forecasts, isLoading, isError } = useProductForecast(storeId, productId, days);

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground bg-card border border-border rounded-xl">Loading forecast...</div>;
  }

  if (isError) {
    return <div className="p-8 text-center text-destructive bg-card border border-border rounded-xl">Failed to load forecast data.</div>;
  }

  if (!forecasts || forecasts.length === 0) {
    return (
      <div className="p-8 text-center bg-card border border-border rounded-xl">
        <p className="text-muted-foreground font-medium">No forecast data available.</p>
        <p className="text-sm text-muted-foreground mt-1">
          Forecasting requires at least 7 days of sales history.
        </p>
      </div>
    );
  }

  const modelUsed = forecasts[0]?.model_used === 'prophet' ? 'Prophet ML' : 'Simple Moving Average';

  return (
    <div className="bg-card border border-border p-6 rounded-xl shadow-sm mt-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-medium text-foreground">Demand Forecast</h3>
          <p className="text-sm text-muted-foreground">Generated using {modelUsed}</p>
        </div>
        <select
          value={days}
          onChange={(e) => setDays(Number(e.target.value))}
          className="px-3 py-2 bg-background border border-border rounded-md shadow-sm text-sm outline-none"
        >
          <option value={7}>Next 7 Days</option>
          <option value={14}>Next 14 Days</option>
          <option value={30}>Next 30 Days</option>
        </select>
      </div>
      
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={forecasts}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
            <XAxis
              dataKey="forecast_date"
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
            />
            <Tooltip
              labelFormatter={(val) => new Date(val).toLocaleDateString()}
              formatter={(value: number, name: string) => [value, name === 'predicted_qty' ? 'Predicted Demand' : name === 'upper_bound' ? 'Best Case' : 'Worst Case']}
              contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
            />
            {/* Confidence Interval Background */}
            <Area 
              type="monotone" 
              dataKey="upper_bound" 
              stroke="none" 
              fill="hsl(var(--primary))" 
              fillOpacity={0.1} 
            />
            <Area 
              type="monotone" 
              dataKey="lower_bound" 
              stroke="none" 
              fill="hsl(var(--background))" 
              fillOpacity={1} 
            />
            
            <Line 
              type="monotone" 
              dataKey="predicted_qty" 
              stroke="hsl(var(--primary))" 
              strokeWidth={3} 
              dot={{ r: 4 }} 
              activeDot={{ r: 6 }} 
              name="predicted_qty"
            />
            <Line 
              type="monotone" 
              dataKey="lower_bound" 
              stroke="hsl(var(--muted-foreground))" 
              strokeDasharray="5 5"
              strokeWidth={1} 
              dot={false}
              name="lower_bound"
            />
            <Line 
              type="monotone" 
              dataKey="upper_bound" 
              stroke="hsl(var(--muted-foreground))" 
              strokeDasharray="5 5"
              strokeWidth={1} 
              dot={false}
              name="upper_bound"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
