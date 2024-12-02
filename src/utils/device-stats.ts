import { AggregatedDataEntry } from '@/types/data';

interface DeviceStats {
  totalUsage: number;      // in kWh
  totalCost: number;       // in currency
  timesOn: number;        // count
  totalTimeOn: string;    // formatted string like "4d 21h"
}

export function calculateDeviceStats(
  // @typescript-eslint/no-explicit-any
  aggregatedData: any[],
  deviceId: string,
  period: 'month' | 'year',
  date: Date,
  wattage: number,
  baseRate: number
): DeviceStats {
  // Construct period string (e.g., "year#2024" or "month#2023-11")
  const periodStr = period === 'year' 
    ? `year#${date.getFullYear()}`
    : `month#${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

  // Find matching entry
  const entry = aggregatedData.find(item => 
    item.deviceId === deviceId && item.period === periodStr
  );

  if (!entry) {
    return {
      totalUsage: 0,
      totalCost: 0,
      timesOn: 0,
      totalTimeOn: "0d 0h"
    };
  }

  // Calculate kWh
  const totalUsage = (wattage * entry.total_time_on) / (3600 * 1000);
  
  // Calculate cost
  const totalCost = totalUsage * baseRate;

  // Format time on
  const days = Math.floor(entry.total_time_on / (24 * 3600));
  const hours = Math.floor((entry.total_time_on % (24 * 3600)) / 3600);
  const totalTimeOn = `${days}d ${hours}h`;

  return {
    totalUsage: Number(totalUsage.toFixed(1)),
    totalCost: Number(totalCost.toFixed(2)),
    timesOn: entry.times_on,
    totalTimeOn
  };
}