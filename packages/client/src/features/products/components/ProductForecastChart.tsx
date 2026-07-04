import { useState } from 'react';
import { useProductForecast } from '../hooks/useProducts';
import {
  Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, ComposedChart
} from 'recharts';

export function ProductForecastChart({ storeId, productId }: { storeId: string, productId: string }) {
  const [days, setDays] = useState<number>(30);
  const { data: forecasts, isLoading, isError } = useProductForecast(storeId, productId, days);

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground bg-card border border-border rounded-xl shadow-vercel-2 text-sm">Loading forecast...</div>;
  }

  if (isError) {
    return <div className="p-8 text-center text-destructive bg-card border border-border rounded-xl shadow-vercel-2">Failed to load forecast data.</div>;
  }

  if (!forecasts || forecasts.length === 0) {
    return (
      <div className="p-8 text-center bg-card border border-border rounded-xl shadow-vercel-2">
        <p className="text-body font-medium text-sm">No forecast data available.</p>
        <p className="text-sm text-muted-foreground mt-1">
          Forecasting requires at least 7 days of sales history.
        </p>
      </div>
    );
  }

  const modelUsed = forecasts[0]?.model_used === 'prophet' ? 'Prophet ML' : 'Simple Moving Average';

  return (
    <div className="bg-card border border-border p-6 rounded-xl shadow-vercel-2">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-base font-medium text-foreground">Demand Forecast</h3>
          <p className="text-sm text-muted-foreground">Generated using {modelUsed}</p>
        </div>
        <div className="flex bg-canvas-soft rounded-full p-0.5 border border-border">
          {[7, 14, 30].map((value) => (
            <button
              key={value}
              onClick={() => setDays(value)}
              className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                days === value
                  ? 'bg-primary text-primary-foreground'
                  : 'text-body hover:text-foreground'
              }`}
            >
              {value}D
            </button>
          ))}
        </div>
      </div>

      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={forecasts}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ebebeb" />
            <XAxis
              dataKey="forecast_date"
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
            />
            <Tooltip
              labelFormatter={(val) => new Date(String(val)).toLocaleDateString()}
              formatter={(value, name) => [value, name === 'predicted_qty' ? 'Predicted Demand' : name === 'upper_bound' ? 'Best Case' : 'Worst Case']}
              contentStyle={{ backgroundColor: '#ffffff', borderColor: '#ebebeb', borderRadius: '8px', fontSize: '14px' }}
            />
            {/* Confidence Interval Background */}
            <Area
              type="monotone"
              dataKey="upper_bound"
              stroke="none"
              fill="#171717"
              fillOpacity={0.08}
            />
            <Area
              type="monotone"
              dataKey="lower_bound"
              stroke="none"
              fill="#fafafa"
              fillOpacity={1}
            />

            <Line
              type="monotone"
              dataKey="predicted_qty"
              stroke="#171717"
              strokeWidth={2}
              dot={{ r: 4, fill: '#171717' }}
              activeDot={{ r: 5, fill: '#171717' }}
              name="predicted_qty"
            />
            <Line
              type="monotone"
              dataKey="lower_bound"
              stroke="#a1a1a1"
              strokeDasharray="5 5"
              strokeWidth={1}
              dot={false}
              name="lower_bound"
            />
            <Line
              type="monotone"
              dataKey="upper_bound"
              stroke="#a1a1a1"
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
