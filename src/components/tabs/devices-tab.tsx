"use client"

import React, { useState, useEffect } from 'react'
import { deviceDefinitions, type DeviceDefinition } from '@/data/deviceDefinitions'
import { Settings } from 'lucide-react'
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts'

interface DeviceDetailsData {
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
  timeline: Array<{
    time: string
    event: string
    power: number
  }>
}

// Mock device details - in a real app, this would come from your backend
const deviceDetails: Record<string, DeviceDetailsData> = {
  "smart_bulb_augusto": {
    average: 8,
    cost: 12,
    stats: {
      estimatedKwhYear: 70,
      averageUsage: 8,
      averageTimesOnPerMonth: 300,
      averageRunTime: "8h 20m",
      averageCostPerMonth: 1
    },
    usageData: Array.from({ length: 31 }, (_, i) => ({ 
      date: (i + 1).toString(), 
      usage: Math.random() * 0.5 
    })),
    totalUsage: 5.2,
    totalCost: 0.62,
    timesOn: 31,
    totalTimeOn: "248h",
    timeline: [
      { time: "07:00 AM", event: "Turned On", power: 8 },
      { time: "11:00 PM", event: "Turned Off", power: 0 }
    ]
  }
  // Add more device details as needed
}

interface DevicesTabProps {
  isDarkMode: boolean
}

// Extend DeviceDefinition to include isOn property
interface ExtendedDeviceDefinition extends DeviceDefinition {
  isOn: boolean
}

export default function DevicesTab({ isDarkMode }: DevicesTabProps) {
  const [devices, setDevices] = useState<ExtendedDeviceDefinition[]>([])
  const [selectedDevice, setSelectedDevice] = useState<ExtendedDeviceDefinition | null>(null)
  const [editingDevice, setEditingDevice] = useState<ExtendedDeviceDefinition | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    // Simulate fetching devices and their status
    const fetchDevices = () => {
      const extendedDevices = deviceDefinitions.map(device => ({
        ...device,
        isOn: Math.random() < 0.5 // Randomly set devices as on or off
      }))
      
      // Sort devices: on devices first, then by name
      extendedDevices.sort((a, b) => {
        if (a.isOn === b.isOn) {
          return a.label.localeCompare(b.label)
        }
        return a.isOn ? -1 : 1
      })

      setDevices(extendedDevices)
      setSelectedDevice(extendedDevices[0])
    }

    fetchDevices()
    // In a real app, you might want to set up an interval to periodically fetch device status
    // const interval = setInterval(fetchDevices, 60000) // Fetch every minute
    // return () => clearInterval(interval)
  }, [])

  const handleUpdateDevice = (updatedDevice: Partial<ExtendedDeviceDefinition>) => {
    const newDevices = devices.map(device => 
      device.id === selectedDevice?.id 
        ? { ...device, ...updatedDevice }
        : device
    )
    setDevices(newDevices)
    setSelectedDevice(prev => prev ? { ...prev, ...updatedDevice } : null)
    setEditingDevice(null)
    setIsDialogOpen(false)
  }

  if (!selectedDevice) {
    return <div>Loading...</div>
  }

  return (
    <div className={`flex h-full ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      {/* Sidebar */}
      <div className={`w-64 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-md overflow-y-auto`}>
        <div className="p-4">
          {devices.map((device) => (
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
                <div className="font-medium">{device.label}</div>
                <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {device.current}W
                </div>
              </div>
              {device.isOn && (
                <div className="w-2 h-2 rounded-full bg-green-400"></div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className={`mr-4 p-3 ${isDarkMode ? 'bg-blue-600' : 'bg-blue-500'} rounded-full text-white`}>
              {selectedDevice.icon}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{selectedDevice.label}</h1>
              <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                {selectedDevice.classification === 'always_connected' ? 'Always Connected' : 'Charging'}
              </p>
            </div>
          </div>
          
          <button
            className={`p-2 rounded-full ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
            onClick={() => {
              setEditingDevice(selectedDevice)
              setIsDialogOpen(true)
            }}
          >
            <Settings className={`w-6 h-6 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
          </button>
        </div>

        {deviceDetails[selectedDevice.id] ? (
          <DeviceContent 
            device={selectedDevice} 
            details={deviceDetails[selectedDevice.id]} 
            isDarkMode={isDarkMode} 
          />
        ) : (
          <div className="text-center mt-10">No details available for this device.</div>
        )}

        {isDialogOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg w-96`}>
              <h2 className="text-xl font-bold mb-4">Device Settings</h2>
              <div className="mb-4">
                <label className="block mb-2">Device Name</label>
                <input
                  type="text"
                  className={`w-full p-2 rounded ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-100'}`}
                  value={editingDevice?.label || ''}
                  onChange={(e) => setEditingDevice(prev => prev ? {...prev, label: e.target.value} : null)}
                />
              </div>
              <div className="mb-4">
                <label className="block mb-2">Power Consumption (Watts)</label>
                <input
                  type="number"
                  className={`w-full p-2 rounded ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-100'}`}
                  value={editingDevice?.current || 0}
                  onChange={(e) => setEditingDevice(prev => prev ? {...prev, current: Number(e.target.value)} : null)}
                />
              </div>
              {editingDevice?.classification === 'always_connected' && (
                <div className="mb-4">
                  <label className="block mb-2">Always-On Power (Watts)</label>
                  <input
                    type="number"
                    className={`w-full p-2 rounded ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-100'}`}
                    value={editingDevice?.alwaysOn || 0}
                    onChange={(e) => setEditingDevice(prev => prev ? {...prev, alwaysOn: Number(e.target.value)} : null)}
                  />
                </div>
              )}
              <div className="flex justify-end space-x-2">
                <button
                  className={`px-4 py-2 rounded ${isDarkMode ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-200 hover:bg-gray-300'}`}
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </button>
                <button
                  className={`px-4 py-2 rounded ${isDarkMode ? 'bg-blue-600 hover:bg-blue-500' : 'bg-blue-500 hover:bg-blue-400'} text-white`}
                  onClick={() => editingDevice && handleUpdateDevice(editingDevice)}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

interface DeviceContentProps {
  device: ExtendedDeviceDefinition
  details: DeviceDetailsData
  isDarkMode: boolean
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function DeviceContent({ device, details, isDarkMode }: DeviceContentProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-6">
        <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <h3 className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>AVERAGE</h3>
          <p className="text-2xl font-bold mt-2">{details.average}W</p>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>while on</p>
        </div>
        
        <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <h3 className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>COST</h3>
          <p className="text-2xl font-bold mt-2">${details.cost}/yr</p>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Based on last season</p>
        </div>

        <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <h3 className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>USAGE</h3>
          <div className="h-40 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={details.usageData}>
                <XAxis dataKey="date" />
                <YAxis />
                <Bar dataKey="usage" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <h3 className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mb-4`}>STATS</h3>
          <div className="space-y-4">
            {Object.entries(details.stats).map(([key, value]) => (
              <div key={key} className="flex justify-between">
                <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                  {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                </span>
                <span>{value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <h3 className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mb-4`}>TIMELINE</h3>
          <div className="space-y-4">
            {details.timeline.map((event, index) => (
              <div key={index} className="flex items-start">
                <div className={`w-2 h-2 mt-2 rounded-full ${isDarkMode ? 'bg-blue-400' : 'bg-blue-600'} mr-3`} />
                <div>
                  <p className="font-medium">{event.time}</p>
                  <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                    {event.event} - {event.power}W
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}