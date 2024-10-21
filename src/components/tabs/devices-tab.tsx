"use client"

import React, { useState, useMemo } from 'react'
import { Zap, Settings, Tv, Sprout, Thermometer, RefreshCcw, ChevronLeft, ChevronRight, Microwave } from 'lucide-react'
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts'

interface Device {
  id: string
  name: string
  icon: React.ReactNode
  current: number
  location?: string
  isOn: boolean
}

interface TimelineEvent {
  time: string
  event: string
  power: number
}

interface DeviceDetails {
  average: number
  cost: number
  stats: {
    estimatedKwhYear: number
    averageUsage: number
    averageTimesOnPerMonth: number
    averageRunTime: string
    averageCostPerMonth: number
  }
  usageData: { date: string; usage: number }[]
  totalUsage: number
  totalCost: number
  timesOn: number
  totalTimeOn: string
  timeline: TimelineEvent[]
}

const devices: Device[] = [
  { id: '1', name: 'Oven', icon: <Microwave />, current: 286, isOn: true },
  { id: '2', name: 'Air Conditioner', icon: <Zap />, current: 541, isOn: false },
  { id: '3', name: 'Computer', icon: <Tv />, current: 323, isOn: true },
  { id: '4', name: 'Block Heater', icon: <Sprout />, current: 448, isOn: false },
  { id: '5', name: 'Standby Devices', icon: <RefreshCcw />, current: 174, isOn: true },
  { id: '6', name: 'Downstairs Freezer', icon: <Thermometer />, current: 82, isOn: true },
]

const deviceDetails: Record<string, DeviceDetails> = {
  '1': {
    average: 3500,
    cost: 47,
    stats: {
      estimatedKwhYear: 378,
      averageUsage: 3500,
      averageTimesOnPerMonth: 18,
      averageRunTime: '29m 34s',
      averageCostPerMonth: 5,
    },
    usageData: Array.from({ length: 31 }, (_, i) => ({ date: (i + 1).toString(), usage: Math.random() * 5 })),
    totalUsage: 31.5,
    totalCost: 3.78,
    timesOn: 18,
    totalTimeOn: '9h',
    timeline: [
      { time: '02:00 PM', event: 'Turned On', power: 3500 },
      { time: '02:30 PM', event: 'Turned Off', power: 0 },
      { time: '08:04 PM', event: 'Turned On', power: 3500 },
      { time: '08:34 PM', event: 'Turned Off', power: 0 },
    ]
  },
  // Add more device details as needed
}

interface DevicesTabProps {
  isDarkMode: boolean
}

export default function DevicesTab({ isDarkMode }: DevicesTabProps) {
  const [selectedDevice, setSelectedDevice] = useState<Device>(devices[0])

  const sortedDevices = useMemo(() => {
    return [...devices].sort((a, b) => {
      if (a.isOn === b.isOn) {
        return 0
      }
      return a.isOn ? -1 : 1
    })
  }, [])

  return (
    <div className={`flex h-full ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      {/* Sidebar */}
      <aside className={`w-64 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-md overflow-y-auto`}>
        <div className="p-4">
          {sortedDevices.map((device) => (
            <button
              key={device.id}
              className={`flex items-center w-full p-2 rounded-lg mb-2 ${
                selectedDevice.id === device.id 
                  ? isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                  : isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
              }`}
              onClick={() => setSelectedDevice(device)}
            >
              <div className={`mr-3 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>{device.icon}</div>
              <div className="flex-1 text-left">
                <div className="font-medium">{device.name}</div>
                <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{device.current}W</div>
              </div>
              {device.isOn && <div className="w-2 h-2 rounded-full bg-green-400"></div>}
            </button>
          ))}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6">
        <DeviceDetails device={selectedDevice} details={deviceDetails[selectedDevice.id]} isDarkMode={isDarkMode} />
      </main>
    </div>
  )
}

interface DeviceDetailsProps {
  device: Device
  details: DeviceDetails
  isDarkMode: boolean
}

function DeviceDetails({ device, details, isDarkMode }: DeviceDetailsProps) {
  if (!details) {
    return (
      <div className={`text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mt-10`}>
        No details available for this device.
      </div>
    );
  }

  return (
    <div>
      <header className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className={`mr-4 p-3 ${isDarkMode ? 'bg-blue-600' : 'bg-blue-500'} rounded-full text-white`}>{device.icon}</div>
          <div>
            <h1 className="text-2xl font-bold">{device.name}</h1>
            {device.location && <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>{device.location}</p>}
          </div>
        </div>
        <button className={`p-2 rounded-full ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}>
          <Settings className={`w-6 h-6 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
        </button>
      </header>

      <div className="grid grid-cols-3 gap-6 mb-6">
        <InfoCard title="AVERAGE" value={`${details.average}W`} subtitle="while on" isDarkMode={isDarkMode} />
        <InfoCard title="COST" value={`$${details.cost}/yr`} subtitle="Based on last season" isDarkMode={isDarkMode} />
        <UsageChart 
          data={details.usageData}
          totalUsage={details.totalUsage}
          totalCost={details.totalCost}
          timesOn={details.timesOn}
          totalTimeOn={details.totalTimeOn}
          isDarkMode={isDarkMode}
        />
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <StatsCard stats={details.stats} isDarkMode={isDarkMode} />
        <TimelineCard timeline={details.timeline} isDarkMode={isDarkMode} />
      </div>
    </div>
  )
}

interface InfoCardProps {
  title: string
  value: string
  subtitle: string
  isDarkMode: boolean
}

function InfoCard({ title, value, subtitle, isDarkMode }: InfoCardProps) {
  return (
    <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-4 shadow`}>
      <h3 className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mb-2`}>{title}</h3>
      <p className="text-2xl font-bold mb-1">{value}</p>
      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{subtitle}</p>
    </div>
  )
}

interface UsageChartProps {
  data: { date: string; usage: number }[]
  totalUsage: number
  totalCost: number
  timesOn: number
  totalTimeOn: string
  isDarkMode: boolean
}

function UsageChart({ data, totalUsage, totalCost, timesOn, totalTimeOn, isDarkMode }: UsageChartProps) {
  const [selectedPeriod, setSelectedPeriod] = useState('Month')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [currentDate, setCurrentDate] = useState('Last Month')
  const timePeriods = ['Day', 'Week', 'Month', 'Year', 'Bill']

  return (
    <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-4 shadow col-span-3`}>
      <div className="flex justify-between items-center mb-4">
        <h2 className={`text-xl font-bold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>USAGE</h2>
        <button className={`${isDarkMode ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-700'} text-sm`}>Export</button>
      </div>

      <div className="flex justify-between items-center mb-4">
        <div className="flex space-x-4">
          {timePeriods.map((period) => (
            <button
              key={period}
              className={`px-3 py-1 rounded ${
                selectedPeriod === period 
                  ? isDarkMode ? 'bg-gray-700 text-white' : 'bg-blue-100 text-blue-800'
                  : isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-800'
              }`}
              onClick={() => setSelectedPeriod(period)}
            >
              {period}
            </button>
          ))}
        </div>
        <div className="flex items-center space-x-2">
          <button className={`p-1 rounded-full ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}>
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-sm">{currentDate}</span>
          <button className={`p-1 rounded-full ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}>
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="h-64 mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
            <XAxis dataKey="date" tick={{ fill: isDarkMode ? '#9CA3AF' : '#4B5563', fontSize: 12 }} />
            <YAxis 
              tick={{ fill: isDarkMode ? '#9CA3AF' : '#4B5563', fontSize: 12 }} 
              label={{ value: 'kWh', angle: -90, position: 'insideLeft', fill: isDarkMode ? '#9CA3AF' : '#4B5563' }}
            />
            <Bar dataKey="usage" fill={isDarkMode ? '#10B981' : '#3B82F6'} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-4 gap-4 text-center">
        <div>
          <p className="text-2xl font-bold">{totalUsage} kWh</p>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Usage</p>
        </div>
        <div>
          <p className="text-2xl font-bold">${totalCost}</p>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Est. Cost</p>
        </div>
        <div>
          <p className="text-2xl font-bold">{timesOn}x</p>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Times On</p>
        </div>
        <div>
          <p className="text-2xl font-bold">{totalTimeOn}</p>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Time On</p>
        </div>
      </div>
    </div>
  )
}

interface StatsCardProps {
  stats: DeviceDetails['stats']
  isDarkMode: boolean
}

function StatsCard({ stats, isDarkMode }: StatsCardProps) {
  return (
    <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-4 shadow`}>
      <h3 className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mb-4`}>STATS</h3>
      <div className="space-y-2">
        <StatItem label="Estimated kWh/year" value={stats.estimatedKwhYear.toFixed(1)} isDarkMode={isDarkMode} />
        <StatItem label="Average usage" value={`${stats.averageUsage}w`} isDarkMode={isDarkMode} />
        <StatItem label="Average Times On per Month" value={stats.averageTimesOnPerMonth.toString()}   isDarkMode={isDarkMode} />
        <StatItem label="Average Run Time" value={stats.averageRunTime} isDarkMode={isDarkMode} />
        <StatItem label="Average Cost per Month" value={`$${stats.averageCostPerMonth}`} isDarkMode={isDarkMode} />
      </div>
    </div>
  )
}

interface StatItemProps {
  label: string
  value: string
  isDarkMode: boolean
}

function StatItem({ label, value, isDarkMode }: StatItemProps) {
  return (
    <div className="flex justify-between">
      <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  )
}

interface TimelineCardProps {
  timeline: TimelineEvent[]
  isDarkMode: boolean
}

function TimelineCard({ timeline, isDarkMode }: TimelineCardProps) {
  return (
    <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-4 shadow`}>
      <h3 className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mb-4`}>TIMELINE (today)</h3>
      <div className="space-y-4">
        {timeline.map((event, index) => (
          <div key={index} className="flex items-start">
            <div className={`w-2 h-2 mt-2 rounded-full ${isDarkMode ? 'bg-blue-400' : 'bg-blue-600'} mr-3`}></div>
            <div>
              <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} font-medium`}>{event.time}</p>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{event.event}</p>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{event.power}W</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}