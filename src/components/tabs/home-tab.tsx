// frontend/src/components/HomeTab.tsx

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import axios from 'axios' // Ensure axios is installed: npm install axios

import { deviceDefinitions, DeviceDefinition } from '@/data/deviceDefinitions'
import { getDeviceById } from '@/utils/deviceUtils'
import { generateActionText } from '@/utils/eventUtils'

// Define the interface for the devices fetched from devices.json
interface DeviceFromJSON {
  name: string
  probability: number
  timestamp: string;
}

// Define interface for recent events
interface RecentEvent {
  time: string
  deviceId: string
  action: 'turned_on' | 'turned_off' | 'started_charging' | 'stopped_charging'
}

// Static recentEvents array
const recentEvents: RecentEvent[] = [
  { time: "07:28 pm", deviceId: "air_conditioner", action: 'turned_on' },
  { time: "04:59 pm", deviceId: "block_heater", action: 'turned_on' },
  { time: "03:59 pm", deviceId: "oven", action: 'turned_on' },
  { time: "03:58 pm", deviceId: "playstation_5", action: 'turned_off' },
  { time: "02:57 pm", deviceId: "air_fryer", action: 'turned_on' },
]

interface HomeTabProps {
  isDarkMode: boolean
}

export default function HomeTab({ isDarkMode }: HomeTabProps) {
  // State to hold the filtered devices to display
  const [displayEnergyData, setDisplayEnergyData] = useState<DeviceDefinition[]>([])

  // State to manage total energy and max energy
  const [totalEnergy, setTotalEnergy] = useState<number>(0)
  const [maxEnergy, setMaxEnergy] = useState<number>(0)

  // State to manage hovered device for the footer
  const [hoveredDevice, setHoveredDevice] = useState<DeviceDefinition | null>(null)

  useEffect(() => {
    // Function to fetch devices from the API
    const fetchAndFilterDevices = async () => {
      try {
        // Replace with your actual API endpoint
        const apiUrl = 'https://07ukjb4hd6.execute-api.us-east-1.amazonaws.com/alpha/devices';
  
        const response = await axios.get<{ devices: DeviceFromJSON[] }>(apiUrl);
        const devicesFromAPI = response.data.devices;
  
        console.log('Fetched Devices from API:', devicesFromAPI);
  
        // Map devicesFromAPI by name for easier access
        const devicesMap: { [key: string]: DeviceFromJSON } = {};
        devicesFromAPI.forEach(device => {
          devicesMap[device.name] = device;
        });
  
        // Filter deviceDefinitions based on devices from API
        const filteredDevices: DeviceDefinition[] = deviceDefinitions.filter(device => {
          const deviceAPI = devicesMap[device.id]; // device.id corresponds to deviceAPI.name
          if (deviceAPI) {
            // Log the probability
            console.log(`Device: ${deviceAPI.name}, Probability: ${deviceAPI.probability}`);
            return true;
          }
          return false;
        });
  
        // Update the state with filtered devices
        setDisplayEnergyData(filteredDevices);
  
        // Calculate totalEnergy and maxEnergy based on filtered devices
        const newTotalEnergy = filteredDevices.reduce((sum, device) => sum + device.current, 0);
        const newMaxEnergy = filteredDevices.length > 0 ? Math.max(...filteredDevices.map(d => d.current)) : 0;
  
        setTotalEnergy(newTotalEnergy);
        setMaxEnergy(newMaxEnergy);
  
        // Log updated states for debugging
        console.log('Updated displayEnergyData:', filteredDevices);
        console.log('Updated Total Energy:', newTotalEnergy);
        console.log('Updated Max Energy:', newMaxEnergy);
      } catch (error) {
        console.error('Error fetching devices from API:', error);
      }
    };
  
    // Initial fetch
    fetchAndFilterDevices();
  
    // Set up polling to fetch data every 5 seconds
    const interval = setInterval(fetchAndFilterDevices, 5000);
  
    // Clean up the interval on component unmount
    return () => clearInterval(interval);
  }, []);
  

  return (
    <div className={`flex h-full ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-800'}`}>
      {/* Sidebar */}
      <aside className={`w-64 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-md overflow-y-auto`}>
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-6">TODAY</h2>
          <div className="space-y-6">
            {recentEvents.map((event, index) => {
              // Find device definition by deviceId
              const deviceDef = getDeviceById(event.deviceId)

              if (!deviceDef) {
                // If device definition not found, skip or display raw event
                return (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-3 h-3 mt-1.5 rounded-full bg-yellow-500 flex-shrink-0" />
                    <div>
                      <p className="text-base font-medium">{event.time}</p>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mt-1`}>
                        Unknown device action
                      </p>
                    </div>
                  </div>
                )
              }

              // Generate event sentence based on classification and action
              const actionText = generateActionText(deviceDef, event.action)

              return (
                <div key={index} className="flex items-start space-x-3">
                  <div className="w-3 h-3 mt-1.5 rounded-full bg-yellow-500 flex-shrink-0" />
                  <div>
                    <p className="text-base font-medium">{event.time}</p>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mt-1`}>
                      {actionText}
                    </p>
                  </div>
                </div>
              )
            })}
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
          {displayEnergyData.length === 0 ? (
            <p>No active devices currently.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {displayEnergyData.map((device) => (
                <EnergyOrb
                  key={device.id}
                  device={device}
                  maxEnergy={maxEnergy}
                  isDarkMode={isDarkMode}
                  onHover={setHoveredDevice}
                />
              ))}
            </div>
          )}
        </main>
        {hoveredDevice && (
          <footer className={`p-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <h2 className="text-lg font-semibold">
              {hoveredDevice.label}
            </h2>
            <p>Current Usage: {hoveredDevice.current.toLocaleString()} W</p>
            {hoveredDevice.alwaysOn && <p>Always On: {hoveredDevice.alwaysOn} W</p>}
          </footer>
        )}
      </div>
    </div>
  )
}

interface EnergyOrbProps {
  device: DeviceDefinition
  maxEnergy: number
  isDarkMode: boolean
  onHover: (device: DeviceDefinition | null) => void
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
        {device.label}
      </p>
      <p className={`text-sm font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
        {device.current}W
      </p>
    </motion.div>
  )
}
