// frontend/src/components/HomeTab.tsx

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { getIconByClassification } from '@/utils/classificationIconMapping';
import { useData, Device} from '@/context/DataContext';

interface RecentEvent {
  time: string;
  deviceId: string;
  text: string;
}

const recentEvents: RecentEvent[] = [
  // Example events can be added here
];

interface HomeTabProps {
  isDarkMode: boolean;
}

export default function HomeTab({ isDarkMode }: HomeTabProps) {
  const { devices, devicesOn } = useData();
  const [hoveredDevice, setHoveredDevice] = useState<Device | null>(null);

  const totalEnergy = devices
    .filter(device => devicesOn.includes(device.deviceId))
    .reduce((sum, device) => sum + device.wattageOn, 0);

  const maxEnergy = Math.max(
    ...devices
      .filter(device => devicesOn.includes(device.deviceId))
      .map(device => device.wattageOn),
    0
  );

  return (
    <div className={`flex h-full ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-800'}`}>
      <aside className={`w-64 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-md overflow-y-auto`}>
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-6">Today&apos;s Notifications</h2>
          {recentEvents.length > 0 ? (
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
          ) : (
            <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              <p>No notifications to display.</p>
              <p className="mt-2">To receive device notifications, please set them up in each device&apos;s settings.</p>
            </div>
          )}
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
          {devicesOn.length === 0 ? (
            <p>No active devices currently.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {devices
                .filter(device => devicesOn.includes(device.deviceId))
                .map(device => (
                  <EnergyOrb
                    key={device.deviceId}
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
            <p>Current Usage: {hoveredDevice.wattageOn.toLocaleString()} W</p>
          </footer>
        )}
      </div>
    </div>
  );
}

interface EnergyOrbProps {
  device: Device;
  maxEnergy: number;
  isDarkMode: boolean;
  onHover: (device: Device | null) => void;
}

function EnergyOrb({ device, maxEnergy, isDarkMode, onHover }: EnergyOrbProps) {
  const energyRatio = maxEnergy > 0 ? device.wattageOn / maxEnergy : 0;
  const size = 100 + energyRatio * 100; // Size ranges from 100px to 200px
  const glowIntensity = 10 + energyRatio * 20; // Glow intensity ranges from 10 to 30

  const getColor = (ratio: number) => {
    if (ratio < 0.25) return '#3B82F6'; // blue
    if (ratio < 0.5) return '#10B981'; // green
    if (ratio < 0.75) return '#F59E0B'; // yellow
    return '#EF4444'; // red
  };

  const color = getColor(energyRatio);
  const iconComponent = getIconByClassification(device.category.toLowerCase().replace(/\s+/g, '_'));

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
        {device.wattageOn} W
      </p>
    </motion.div>
  );
}