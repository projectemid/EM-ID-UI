"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChevronLeft, ChevronRight, Download } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { UsageChart } from '@/components/graph-helpers/usage-chart'
import { DeviceTable } from '@/components/graph-helpers/device-table'
import { useData } from "@/context/DataContext"

type Period = 'week' | 'month' | 'year'
type DisplayMode = 'kwh' | 'cost'

export default function AnalyticsTab({ isDarkMode }: { isDarkMode: boolean }) {
  const { devices, userData } = useData()
  const [period, setPeriod] = useState<Period>('month')
  const [displayMode, setDisplayMode] = useState<DisplayMode>('kwh')
  // @typescript-eslint/no-explicit-any
  const [aggregatedData, setAggregatedData] = useState<any[]>([])
  const [dateRange, setDateRange] = useState<{ start: Date; end: Date }>({
    start: new Date(),
    end: new Date()
  })

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    updateDateRange(period, dateRange.start)
  }, [period])

  useEffect(() => {
    fetchAggregatedData()
  }, [dateRange])

  const fetchAggregatedData = async () => {
    try {
      const response = await fetch('/data/AggregatedDeviceData.json')
      const data = await response.json()
      setAggregatedData(data)
    } catch (error) {
      console.error('Error loading aggregated data:', error)
    }
  }

  const formatDateRange = (start: Date, end: Date, period: Period): string => {
    if (period === 'week') {
      const options: Intl.DateTimeFormatOptions = {
        month: 'short',
        day: 'numeric'
      }
      return `${start.toLocaleDateString(undefined, options)} - ${end.toLocaleDateString(
        undefined,
        options
      )}`
    }

    if (period === 'month') {
      return start.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    }

    if (period === 'year') {
      return start.getFullYear().toString()
    }

    return ''
  }

  const handlePeriodChange = (newPeriod: Period) => {
    setPeriod(newPeriod)
    updateDateRange(newPeriod, dateRange.start)
  }

  const updateDateRange = (currentPeriod: Period, currentDate: Date) => {
    let start: Date
    let end: Date

    switch (currentPeriod) {
      case 'week':
        start = new Date(currentDate)
        start.setDate(currentDate.getDate() - currentDate.getDay())
        end = new Date(start)
        end.setDate(start.getDate() + 6)
        break
      case 'month':
        start = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
        end = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
        break
      case 'year':
        start = new Date(currentDate.getFullYear(), 0, 1)
        end = new Date(currentDate.getFullYear(), 11, 31)
        break
      default:
        start = new Date()
        end = new Date()
    }

    // Remove time components to avoid timezone issues
    start = new Date(start.getFullYear(), start.getMonth(), start.getDate())
    end = new Date(end.getFullYear(), end.getMonth(), end.getDate())

    setDateRange({ start, end })
  }

  const handleNavigation = (direction: 'prev' | 'next') => {
    let newDate: Date

    switch (period) {
      case 'week':
        newDate = new Date(dateRange.start)
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7))
        break
      case 'month':
        newDate = new Date(
          dateRange.start.getFullYear(),
          dateRange.start.getMonth() + (direction === 'next' ? 1 : -1),
          1
        )
        break
      case 'year':
        newDate = new Date(dateRange.start.getFullYear() + (direction === 'next' ? 1 : -1), 0, 1)
        break
      default:
        newDate = new Date()
    }

    updateDateRange(period, newDate)
  }

  const handleExport = () => {
    // Implement export functionality here
  }

  const bgColor = isDarkMode ? 'bg-gray-800' : 'bg-white'
  const textColor = isDarkMode ? 'text-white' : 'text-black'

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      <Card className={`w-full h-full border-none ${bgColor} flex flex-col`}>
        <CardHeader className="sticky top-0 z-10 bg-inherit shrink-0">
          <div className="flex items-center justify-between">
            <Tabs
              defaultValue={period}
              onValueChange={(v) => handlePeriodChange(v as Period)}
              className="w-full max-w-[600px] justify-center"
            >
              <TabsList className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} p-1`}>
                <TabsTrigger value="week">Week</TabsTrigger>
                <TabsTrigger value="month">Month</TabsTrigger>
                <TabsTrigger value="year">Year</TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => handleNavigation('prev')}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium min-w-[120px] text-center">
                {formatDateRange(dateRange.start, dateRange.end, period)}
              </span>
              <Button variant="ghost" size="icon" onClick={() => handleNavigation('next')}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => setDisplayMode(displayMode === 'kwh' ? 'cost' : 'kwh')}
              >
                Show {displayMode === 'kwh' ? 'Est. Cost' : 'kWh'}
              </Button>
              <Button variant="ghost" size="icon" onClick={handleExport}>
                <Download className="h-4 w-4" />
                <span className="sr-only">Export data</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto min-h-0">
          <div className="space-y-6">
            <UsageChart
              aggregatedData={aggregatedData}
              period={period}
              dateRange={dateRange}
              devices={devices}
              userData={userData}
              displayMode={displayMode}
            />
            <DeviceTable
              aggregatedData={aggregatedData}
              period={period}
              dateRange={dateRange}
              devices={devices}
              userData={userData}
              displayMode={displayMode}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

