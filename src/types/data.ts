export interface AggregatedDataEntry {
  deviceId: string;
  period: string;
  total_time_on: number;
  times_on: number;
}

export interface ChartDataPoint {
  date: string;
  value: number;
}

export interface DeviceStatistics {
  deviceId: string;
  name: string;
  type: string;
  kwh: number;
  cost: number;
  value: number;
  percentage?: number;
} 