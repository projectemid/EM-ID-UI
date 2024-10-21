"use client"

import React, { useState } from 'react'
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface UsageData {
  date: string
  usage: number
}

interface UsageChartProps {
  data: UsageData[]
  totalUsage: number
  totalCost: number
  timesOn: number
  totalTimeOn: string
}

const timePeriods = ['Day', 'Week', 'Month', 'Year', 'Bill']

export default function UsageChart({ data, totalUsage, totalCost, timesOn, totalTimeOn }: UsageChartProps) {
  const [selectedPeriod, setSelectedPeriod] = useState('Month')
  const [currentDate, setCurrentDate] = useState('Last Month')

  return (
    <div className="bg-gray-800 text-white p-6 rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-200">USAGE</h2>
        <button className="text-red-500 hover:text-red-400 text-sm">Export</button>
      </div>

      <div className="flex justify-between items-center mb-4">
        <div className="flex space-x-4">
          {timePeriods.map((period) => (
            <button
              key={period}
              className={`px-3 py-1 rounded ${
                selectedPeriod === period ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'
              }`}
              onClick={() => setSelectedPeriod(period)}
            >
              {period}
            </button>
          ))}
        </div>
        <div className="flex items-center space-x-2">
          <button className="p-1 rounded-full bg-gray-700 hover:bg-gray-600">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-sm">{currentDate}</span>
          <button className="p-1 rounded-full bg-gray-700 hover:bg-gray-600">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="h-64 mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
            <XAxis dataKey="date" tick={{ fill: '#9CA3AF', fontSize: 12 }} />
            <YAxis 
              tick={{ fill: '#9CA3AF', fontSize: 12 }} 
              label={{ value: 'kWh', angle: -90, position: 'insideLeft', fill: '#9CA3AF' }}
            />
            <Bar dataKey="usage" fill="#10B981" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-4 gap-4 text-center">
        <div>
          <p className="text-2xl font-bold">{totalUsage} kWh</p>
          <p className="text-sm text-gray-400">Total Usage</p>
        </div>
        <div>
          <p className="text-2xl font-bold">${totalCost}</p>
          <p className="text-sm text-gray-400">Total Est. Cost</p>
        </div>
        <div>
          <p className="text-2xl font-bold">{timesOn}x</p>
          <p className="text-sm text-gray-400">Times On</p>
        </div>
        <div>
          <p className="text-2xl font-bold">{totalTimeOn}</p>
          <p className="text-sm text-gray-400">Total Time On</p>
        </div>
      </div>
    </div>
  )
}