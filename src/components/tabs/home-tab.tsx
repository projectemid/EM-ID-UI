// frontend/src/components/HomeTab.tsx

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import axios from 'axios'
import { DeviceDefinition } from '@/types'
import NewDeviceModal from '../new-device-modal'
import { getIconByClassification } from '@/utils/classificationIconMapping'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { getDeviceById, setDevices, addDevice } from '@/utils/deviceUtils'


interface DeviceFromAPI {
  name: string;
  probability: number;
  timestamp: string;
}

interface RecentEvent {
  time: string;
  deviceId: string;
  text: string;
}

const recentEvents: RecentEvent[] = [
  { time: "07:28 pm", deviceId: "air_conditioner", text: "Augusto's iPad was charging for 34 minutes." },
  { time: "07:11 pm", deviceId: "block_heater", text: "Floor Lamp was turned on for 7 minutes" },
  { time: "06:59 pm", deviceId: "oven", text: "Luca's MacBook was charging for 54 minutes" },
]

interface HomeTabProps {
  isDarkMode: boolean
}

export default function HomeTab({ isDarkMode }: HomeTabProps) {
  // State to hold device definitions fetched from API
  const [deviceDefinitions, setDeviceDefinitionsState] = useState<DeviceDefinition[]>([]);
  // State to hold the filtered devices to display
  const [displayEnergyData, setDisplayEnergyData] = useState<DeviceDefinition[]>([])
  // State to manage total energy and max energy
  const [totalEnergy, setTotalEnergy] = useState<number>(0)
  const [maxEnergy, setMaxEnergy] = useState<number>(0)

  // State to manage hovered device for the footer
  const [hoveredDevice, setHoveredDevice] = useState<DeviceDefinition | null>(null)
  // State variables for handling unknown devices
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [unknownDevice, setUnknownDevice] = useState<{ deviceId: string; label?: string; current?: number; classification?: string } | null>(null);

  // Fetch device definitions from API
  useEffect(() => {
    const fetchDeviceDefinitions = async () => {
      try {
        const apiUrl = 'https://gjs2qqxydb.execute-api.us-east-1.amazonaws.com/alpha/get-devices';
        const response = await axios.get<{ devices: DeviceDefinition[] }>(apiUrl);
        const devicesFromAPI = response.data.devices;

        // Map API data to DeviceDefinition
        const mappedDevices: DeviceDefinition[] = devicesFromAPI.map(device => ({
          id: device.id,
          label: device.label,
          classification: device.classification,
          power: device.power,
          alwaysOn: device.alwaysOn,
          // probability and timestamp will be added from live data
        }));

        setDeviceDefinitionsState(mappedDevices);
        setDevices(mappedDevices); // Update the global device list

        console.log('Fetched Device Definitions:', mappedDevices);
      } catch (error) {
        console.error('Error fetching device definitions from API:', error);
      }
    };

    fetchDeviceDefinitions();
  }, []);

  useEffect(() => {
    // Function to fetch devices from the API
    const fetchAndFilterDevices = async () => {
      try {
        const apiUrl = 'https://07ukjb4hd6.execute-api.us-east-1.amazonaws.com/alpha/devices';
        const response = await axios.get<{ devices: DeviceFromAPI[] }>(apiUrl);
        const devicesFromAPI = response.data.devices;

        console.log('Fetched Devices from API:', devicesFromAPI);

        // Map devicesFromAPI by name for easier access
        const devicesMap: { [key: string]: DeviceFromAPI } = {};
        devicesFromAPI.forEach(device => {
          devicesMap[device.name] = device;
        });

        // Identify unknown devices with probability >= 0.9
        const unknownDevices = devicesFromAPI.filter(
          device => device.probability >= 0.9 && !deviceDefinitions.find(def => def.id === device.name)
        );
        if (unknownDevices.length > 0 && !isModalOpen) {
          // Take the first unknown device to prompt the modal
          const firstUnknown = unknownDevices[0];
          setUnknownDevice({
            deviceId: firstUnknown.name,
          });
          setIsModalOpen(true);
        }

        // Filter deviceDefinitions based on devices from API with probability > 0.9
        const filteredDevices: DeviceDefinition[] = deviceDefinitions.filter(device => {
          const deviceAPI = devicesMap[device.id];
          if (deviceAPI && deviceAPI.probability >= 0.9) {
            return true;
          }
          return false;
        });

        // Merge live data with device definitions
        const mergedDevices: DeviceDefinition[] = filteredDevices.map(device => ({
          ...device,
          probability: devicesMap[device.id].probability,
          timestamp: devicesMap[device.id].timestamp,
        }));

        setDisplayEnergyData(mergedDevices);

        // Calculate totalEnergy and maxEnergy based on filtered devices
        const newTotalEnergy = mergedDevices.reduce((sum, device) => sum + device.power, 0);
        const newMaxEnergy = mergedDevices.length > 0 ? Math.max(...mergedDevices.map(d => d.power)) : 0;

        setTotalEnergy(newTotalEnergy);
        setMaxEnergy(newMaxEnergy);

        // Log updated states for debugging
        console.log('Updated displayEnergyData:', mergedDevices);
        console.log('Updated Total Energy:', newTotalEnergy);
        console.log('Updated Max Energy:', newMaxEnergy);
      } catch (error) {
        console.error('Error fetching devices from API:', error);
      }
    };

    if (deviceDefinitions.length > 0) {
      // Initial fetch
      fetchAndFilterDevices();

      // Set up polling to fetch data every 5 seconds
      const interval = setInterval(fetchAndFilterDevices, 5000);

      // Clean up the interval on component unmount
      return () => clearInterval(interval);
    }
  }, [deviceDefinitions, isModalOpen]);

  // Handle adding a new device via the modal
  const handleAddNewDevice = async (deviceData: { deviceName: string; averageWatts: number; deviceType: string }) => {
    if (!unknownDevice) return;

    try {
      const apiUrl = 'https://gjs2qqxydb.execute-api.us-east-1.amazonaws.com/alpha/add-new-device'; // Updated POST endpoint

      const newDevice: DeviceDefinition = {
        id: unknownDevice.deviceId, // Using deviceId as the id
        label: deviceData.deviceName,
        classification: deviceData.deviceType.toLowerCase().replace(/\s+/g, '_'), // Normalize classification
        power: deviceData.averageWatts,
        // 'alwaysOn' can be added if applicable
      };

      // Prepare the payload according to the Lambda function's expectations
      const payload = {
        id: newDevice.id,
        label: newDevice.label,
        classification: newDevice.classification,
        power: newDevice.power,
        // 'standby': newDevice.alwaysOn, // Uncomment if you have this field
      };

      await axios.post(apiUrl, payload, {
        headers: {
          'Content-Type': 'application/json',
          // 'x-api-key': 'YOUR_API_KEY', // Uncomment if your API requires an API key
        },
      });

      // Update deviceDefinitions state with the new device and update deviceUtils
      setDeviceDefinitionsState(prev => {
        const updated = [...prev, newDevice];
        addDevice(newDevice); // Update the global device list
        return updated;
      });

      // Optionally, you can re-fetch devices or update displayEnergyData here if needed

      // Close the modal and reset unknownDevice
      setIsModalOpen(false);
      setUnknownDevice(null);
    } catch (error) {
      console.error('Error adding new device:', error);
      // Optionally, display an error message to the user
      alert('Failed to add the new device. Please try again.');
    }
  };

  return (
    <div className={`flex h-full ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-800'}`}>
      <aside className={`w-64 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-md overflow-y-auto`}>
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-6">TODAY</h2>
          <div className="space-y-6">
            {recentEvents.map((event, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="w-3 h-3 mt-1.5 rounded-full bg-yellow-500 flex-shrink-0" />
                <div>
                  <p className="text-base font-medium">{event.time}</p>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mt-1`}>
                    {event.text}
                  </p>
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
            <p>Current Usage: {hoveredDevice.power.toLocaleString()} W</p>
            {hoveredDevice.alwaysOn && <p>Always On: {hoveredDevice.alwaysOn} W</p>}
          </footer>
        )}

        {/* New Device Modal */}
        <NewDeviceModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setUnknownDevice(null);
          }}
          onConfirm={handleAddNewDevice}
        />
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
  const energyRatio = maxEnergy > 0 ? device.power / maxEnergy : 0;
  const size = 100 + energyRatio * 100; // Size ranges from 100px to 200px
  const glowIntensity = 10 + energyRatio * 20; // Glow intensity ranges from 10 to 30

  const getColor = (ratio: number) => {
    if (ratio < 0.25) return '#3B82F6'; // blue
    if (ratio < 0.5) return '#10B981'; // green
    if (ratio < 0.75) return '#F59E0B'; // yellow
    return '#EF4444'; // red
  };

  const color = getColor(energyRatio);
  const iconComponent = getIconByClassification(device.classification);

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
          {iconComponent}
        </div>
      </motion.div>
      <p className={`mt-2 text-center ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
        {device.label}
      </p>
      <p className={`text-sm font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
        {device.power} W
      </p>
    </motion.div>
  )
}
