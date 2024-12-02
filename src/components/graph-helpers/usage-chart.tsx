// usage-chart.tsx

"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import { processChartData } from "../../utils/data-processing"
import { AggregatedDataEntry, ChartDataPoint } from '@/types/data'
import { Device, UserData } from '@/context/DataContext'

interface UsageChartProps {
  // @typescript-eslint/no-explicit-any
  aggregatedData: any[];
  period: 'week' | 'month' | 'year';
  dateRange: { start: Date; end: Date };
  devices: any[];
  userData: any;
  displayMode: 'kwh' | 'cost';
}

export function UsageChart({
  aggregatedData,
  period,
  dateRange,
  devices,
  userData,
  displayMode
}: UsageChartProps) {
  if (!aggregatedData || !devices || !userData) {
    return (
      <div className="h-[400px] flex items-center justify-center text-gray-400">
        No data available
      </div>
    )
  }

  const chartData = processChartData(
    aggregatedData,
    devices,
    userData.baseRatePerKWh,
    displayMode,
    period,
    dateRange
  )

  const formatXAxis = (tickItem: string) => {
    const date = new Date(tickItem)
    switch (period) {
      case 'week':
        return date.toLocaleDateString('en-US', { weekday: 'short' })
      case 'month':
        return date.getDate().toString()
      case 'year':
        return date.toLocaleDateString('en-US', { month: 'short' })
      default:
        return ''
    }
  }

  const formatTooltipValue = (value: number) => {
    if (displayMode === 'kwh') {
      return `${value.toFixed(1)} kWh`
    }
    return `$${value.toFixed(2)}`
  }

  const formatYAxis = (value: number) => {
    if (displayMode === 'kwh') {
      return `${value.toFixed(1)}`
    }
    return `$${value.toFixed(0)}`
  }

  return (
    <div className="w-full bg-[#1C1C1C] p-4 rounded-lg">
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="rgba(255,255,255,0.1)"
          />
          <XAxis
            dataKey="date"
            tickFormatter={formatXAxis}
            stroke="rgba(255,255,255,0.5)"
            tickLine={false}
          />
          <YAxis
            stroke="rgba(255,255,255,0.5)"
            tickLine={false}
            axisLine={false}
            tickFormatter={formatYAxis}
            label={{
              value: displayMode === 'kwh' ? 'kWh' : '$',
              angle: -90,
              position: 'insideLeft',
              style: { fill: 'rgba(255,255,255,0.5)' }
            }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#2C2C2C',
              border: 'none',
              borderRadius: '8px',
              color: 'white'
            }}
            formatter={(value: number) => formatTooltipValue(value)}
            labelFormatter={(label) => {
              const date = new Date(label)
              return period === 'year'
                ? date.toLocaleDateString('en-US', { month: 'long' })
                : date.toLocaleDateString()
            }}
          />
          <Bar dataKey="value" fill="#10B981" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
