

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Zap, Tv, AirVent, Lightbulb, Sprout, Thermometer, Microwave, Refrigerator } from 'lucide-react'
interface EnergyData {
  name: string
  alwaysOn?: number
  current: number
  icon: React.ReactNode
}

const energyData: EnergyData[] = [
  { name: "Computer", alwaysOn: 53, current: 323, icon: <Tv /> },
  { name: "Air Conditioner", alwaysOn: 32, current: 541, icon: <AirVent /> },
  { name: "Standby Devices", current: 197, icon: <Zap /> },
  { name: "Oven", alwaysOn: 40, current: 286, icon: <Microwave /> },
  { name: "Block Heater", current: 448, icon: <Thermometer /> },
  { name: "Freezer", current: 82, icon: <Refrigerator /> },
]


const recentEvents = [
  { time: "07:28 pm", event: "Air Conditioner was on 3 times, now off" },
  { time: "04:59 pm", event: "Block Heater turned on" },
  { time: "03:59 pm", event: "Oven was on 2 times, now off" },
  { time: "03:58 pm", event: "Playstation 5 turned off" },
  { time: "02:57 pm", event: "Air Fryer was on 2 times, now off" },
]

interface HomeTabProps {
  isDarkMode: boolean
}

export default function HomeTab({ isDarkMode }: HomeTabProps) {
  const [hoveredDevice, setHoveredDevice] = useState<EnergyData | null>(null)
  const totalEnergy = energyData.reduce((sum, device) => sum + device.current, 0)
  const maxEnergy = Math.max(...energyData.map(device => device.current))

  return (
    <div className={`flex h-full ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-800'}`}>
      {/* Sidebar */}
      <aside className={`w-64 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-md overflow-y-auto`}>
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-6">TODAY</h2>
          <div className="space-y-6">
            {recentEvents.map((event, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="w-3 h-3 mt-1.5 rounded-full bg-yellow-500 flex-shrink-0" />
                <div>
                  <p className="text-base font-medium">{event.time}</p>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mt-1`}>{event.event}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="p-6">
          <p className={`text-xl ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Current Total Energy Usage: {totalEnergy.toLocaleString()} W
          </p>
        </header>
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {energyData.map((device) => (
              <EnergyOrb
                key={device.name}
                device={device}
                maxEnergy={maxEnergy}
                isDarkMode={isDarkMode}
                onHover={setHoveredDevice}
              />
            ))}
          </div>
        </main>
        {hoveredDevice && (
          <footer className={`p-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <h2 className="text-lg font-semibold">{hoveredDevice.name}</h2>
            <p>Current Usage: {hoveredDevice.current.toLocaleString()} W</p>
            {hoveredDevice.alwaysOn && <p>Always On: {hoveredDevice.alwaysOn} W</p>}
          </footer>
        )}
      </div>
    </div>
  )
}

interface EnergyOrbProps {
  device: EnergyData
  maxEnergy: number
  isDarkMode: boolean
  onHover: (device: EnergyData | null) => void
}

function EnergyOrb({ device, maxEnergy, isDarkMode, onHover }: EnergyOrbProps) {
  const energyRatio = device.current / maxEnergy
  const size = 100 + energyRatio * 100 // Size ranges from 100px to 200px
  const glowIntensity = 10 + energyRatio * 20 // Glow intensity ranges from 10 to 30

  const getColor = (ratio: number) => {
    if (ratio < 0.25) return '#3B82F6' // blue
    if (ratio < 0.5) return '#10B981' // green
    if (ratio < 0.75) return '#F59E0B' // yellow
    return '#EF4444' // red
  }

  const color = getColor(energyRatio)

  return (
    <motion.div
      className="flex flex-col items-center justify-center cursor-pointer"
      onMouseEnter={() => onHover(device)}
      onMouseLeave={() => onHover(null)}
      whileHover={{ scale: 1.1 }}
    >
      <motion.div
        className="rounded-full flex items-center justify-center relative"
        style={{
          width: size,
          height: size,
          backgroundColor: color,
          boxShadow: `0 0 ${glowIntensity}px ${color}`,
        }}
        animate={{
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          repeatType: "reverse",
        }}
      >
        <div className={`text-4xl ${isDarkMode ? 'text-gray-800' : 'text-white'}`}>
          {device.icon}
        </div>
      </motion.div>
      <p className={`mt-2 text-center ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
        {device.name}
      </p>
      <p className={`text-sm font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
        {device.current}W
      </p>
    </motion.div>
  )
}