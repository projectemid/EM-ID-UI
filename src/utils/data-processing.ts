// data-processing.ts

import { AggregatedDataEntry, ChartDataPoint, DeviceStatistics } from '@/types/data';
import { Device } from '@/context/DataContext';

export function calculateKwhFromSeconds(wattage: number, seconds: number): number {
  return (wattage * seconds) / (1000 * 3600)
}

export function calculateCost(kwh: number, rate: number): number {
  return kwh * rate
}

function getDateArray(start: Date, end: Date): string[] {
  const arr = []
  const dt = new Date(start.getFullYear(), start.getMonth(), start.getDate())
  const endDate = new Date(end.getFullYear(), end.getMonth(), end.getDate())

  while (dt <= endDate) {
    const year = dt.getFullYear()
    const month = String(dt.getMonth() + 1).padStart(2, '0')
    const day = String(dt.getDate()).padStart(2, '0')
    const dateStr = `${year}-${month}-${day}`
    arr.push(dateStr)
    dt.setDate(dt.getDate() + 1)
  }
  return arr
}

function getMonthArray(start: Date, end: Date): string[] {
  const arr = []
  const dt = new Date(start.getFullYear(), start.getMonth(), 1)
  const endDt = new Date(end.getFullYear(), end.getMonth(), 1)
  while (dt <= endDt) {
    const year = dt.getFullYear()
    const month = String(dt.getMonth() + 1).padStart(2, '0')
    const monthKey = `${year}-${month}`
    arr.push(monthKey)
    dt.setMonth(dt.getMonth() + 1)
  }
  return arr
}

export function processChartData(
  // @typescript-eslint/no-explicit-any
  aggregatedData: any[],
  devices: any[],
  baseRate: number,
  displayMode: 'kwh' | 'cost',
  period: 'week' | 'month' | 'year',
  dateRange: { start: Date; end: Date }
): ChartDataPoint[] {
  if (period === 'month') {
    return aggregateDataByDay(aggregatedData, devices, baseRate, displayMode, dateRange)
  } else if (period === 'year') {
    return aggregateDataByMonthForYear(aggregatedData, devices, baseRate, displayMode, dateRange)
  }

  // Handle other periods if necessary
  return []
}

function aggregateDataByDay(
  // @typescript-eslint/no-explicit-any
  data: any[],
  devices: any[],
  baseRate: number,
  displayMode: 'kwh' | 'cost',
  dateRange: { start: Date; end: Date }
) {
  const dailyData: { [key: string]: number } = {}

  // Initialize dailyData with all dates in dateRange, set to 0
  const allDates = getDateArray(dateRange.start, dateRange.end)
  allDates.forEach(dateStr => {
    dailyData[dateStr] = 0
  })

  const startStr = dateRange.start.toISOString().split('T')[0]
  const endStr = dateRange.end.toISOString().split('T')[0]

  // Process entries
  data.forEach(entry => {
    const [entryGranularity, entryDateStr] = entry.period.split('#')
    if (entryGranularity !== 'day') {
      return // Skip entries that are not 'day' granularity
    }

    const dateStr = entryDateStr

    if (dateStr < startStr || dateStr > endStr) return

    const device = devices.find((d) => d.deviceId === entry.deviceId)
    if (!device) return

    const kwh = calculateKwhFromSeconds(device.wattageOn, entry.total_time_on)
    const value = displayMode === 'kwh' ? kwh : calculateCost(kwh, baseRate)

    dailyData[dateStr] += value
  })

  // Prepare chart data
  const chartData = allDates.map(dateStr => ({
    date: dateStr,
    value: Number(dailyData[dateStr].toFixed(2))
  }))

  return chartData
}

function aggregateDataByMonthForYear(
  // @typescript-eslint/no-explicit-any
  data: any[],
  devices: any[],
  baseRate: number,
  displayMode: 'kwh' | 'cost',
  dateRange: { start: Date; end: Date }
) {
  const monthlyData: { [key: string]: number } = {}

  // Initialize monthlyData with all months in dateRange, set to 0
  const allMonths = getMonthArray(dateRange.start, dateRange.end)
  allMonths.forEach(monthKey => {
    monthlyData[monthKey] = 0
  })

  // Process entries
  data.forEach(entry => {
    const [entryGranularity, entryDateStr] = entry.period.split('#')

    let monthKey: string
    if (entryGranularity === 'month') {
      monthKey = entryDateStr // 'YYYY-MM'
    } else {
      return // Skip entries that are not 'month' granularity for year aggregation
    }

    if (!monthlyData.hasOwnProperty(monthKey)) return

    const device = devices.find((d) => d.deviceId === entry.deviceId)
    if (!device) return

    const kwh = calculateKwhFromSeconds(device.wattageOn, entry.total_time_on)
    const value = displayMode === 'kwh' ? kwh : calculateCost(kwh, baseRate)

    monthlyData[monthKey] += value
  })

  // Prepare chart data
  const chartData = allMonths.map(monthKey => ({
    date: monthKey,
    value: Number(monthlyData[monthKey].toFixed(2))
  }))

  return chartData
}

export function processTableData(
  aggregatedData: AggregatedDataEntry[],
  devices: Device[],
  baseRate: number,
  displayMode: 'kwh' | 'cost',
  dateRange: { start: Date; end: Date }
): DeviceStatistics[] {
  const deviceStats = devices.map((device) => {
    let kwh = 0

    if (
      dateRange.start.getFullYear() === dateRange.end.getFullYear() &&
      dateRange.start.getMonth() === dateRange.end.getMonth()
    ) {
      // For 'month' period, use 'month#YYYY-MM' entries
      const monthStr = `${dateRange.start.getFullYear()}-${String(
        dateRange.start.getMonth() + 1
      ).padStart(2, '0')}`
      const periodStr = `month#${monthStr}`

      const entry = aggregatedData.find(
        (e) => e.deviceId === device.deviceId && e.period === periodStr
      )

      if (entry) {
        kwh = calculateKwhFromSeconds(device.wattageOn, entry.total_time_on)
      }
    } else if (dateRange.start.getFullYear() === dateRange.end.getFullYear()) {
      // For 'year' period, use 'year#YYYY' entries
      const yearStr = `${dateRange.start.getFullYear()}`
      const periodStr = `year#${yearStr}`

      const entry = aggregatedData.find(
        (e) => e.deviceId === device.deviceId && e.period === periodStr
      )

      if (entry) {
        kwh = calculateKwhFromSeconds(device.wattageOn, entry.total_time_on)
      }
    } else {
      // For other periods, sum over entries in dateRange
      const deviceData = aggregatedData.filter((entry) => {
        if (entry.deviceId !== device.deviceId) return false

        const [entryGranularity, entryDateStr] = entry.period.split('#')
        let entryDate: Date

        if (entryGranularity === 'month') {
          entryDate = new Date(`${entryDateStr}-01`)
        } else if (entryGranularity === 'day') {
          entryDate = new Date(entryDateStr)
        } else {
          // Unknown granularity, skip
          return false
        }

        return entryDate >= dateRange.start && entryDate <= dateRange.end
      })

      kwh = deviceData.reduce((acc, entry) => {
        const kwhEntry = calculateKwhFromSeconds(device.wattageOn, entry.total_time_on)
        return acc + kwhEntry
      }, 0)
    }

    const cost = calculateCost(kwh, baseRate)
    const value = displayMode === 'kwh' ? kwh : cost

    return {
      deviceId: device.deviceId,
      name: device.label,
      type: device.category,
      kwh: Number(kwh.toFixed(2)),
      cost: Number(cost.toFixed(2)),
      value: Number(value.toFixed(2))
    }
  })

  const totalValue = deviceStats.reduce((sum, stat) => sum + stat.value, 0)

  return deviceStats
    .map((stat) => ({
      ...stat,
      percentage: totalValue > 0 ? Number(((stat.value / totalValue) * 100).toFixed(1)) : 0
    }))
    .sort((a, b) => b.value - a.value)
}
