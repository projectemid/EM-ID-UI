// frontend/src/components/energy-monitor.tsx

'use client'

import React, { useState, useEffect } from 'react'
import { Home, Activity, BarChart2, Cpu, Settings } from 'lucide-react'
import HomeTab from './tabs/home-tab'
import AnalyticsTab from './tabs/analytics-tab'
import MeterTab from './tabs/meter-tab'
import DevicesTab from './tabs/devices-tab'
import SettingsTab from './tabs/settings-tab'
import { DevicesProvider } from '../contexts/DevicesContext' // Adjusted path
import { EventsProvider } from '../contexts/EventsContext'   // Adjusted path

type NavItem = 'home' | 'analytics' | 'meter' | 'devices' | 'settings'

export default function EnergyMonitor() {
  const [activeNav, setActiveNav] = useState<NavItem>('home')
  const [isDarkMode, setIsDarkMode] = useState(false)

  useEffect(() => {
    // Apply dark mode class to the body
    if (isDarkMode) {
      document.body.classList.add('dark')
    } else {
      document.body.classList.remove('dark')
    }
  }, [isDarkMode])

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
  }

  return (
    // Wrap the entire application within DevicesProvider and EventsProvider
    <DevicesProvider>
      <EventsProvider>
        <div
          className={`flex flex-col h-screen ${
            isDarkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-100 text-gray-800'
          }`}
        >
          {/* Top Navbar */}
          <nav className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
            <div className="w-full px-4 sm:px-6 lg:px-8">
              <div className="flex h-16">
                <div className="flex">
                  <NavButton
                    icon={<Home className="w-5 h-5" />}
                    label="Home"
                    isActive={activeNav === 'home'}
                    onClick={() => setActiveNav('home')}
                    isDarkMode={isDarkMode}
                  />
                  <NavButton
                    icon={<Activity className="w-5 h-5" />}
                    label="Analytics"
                    isActive={activeNav === 'analytics'}
                    onClick={() => setActiveNav('analytics')}
                    isDarkMode={isDarkMode}
                  />
                  <NavButton
                    icon={<BarChart2 className="w-5 h-5" />}
                    label="Meter"
                    isActive={activeNav === 'meter'}
                    onClick={() => setActiveNav('meter')}
                    isDarkMode={isDarkMode}
                  />
                  <NavButton
                    icon={<Cpu className="w-5 h-5" />}
                    label="Devices"
                    isActive={activeNav === 'devices'}
                    onClick={() => setActiveNav('devices')}
                    isDarkMode={isDarkMode}
                  />
                  <NavButton
                    icon={<Settings className="w-5 h-5" />}
                    label="Settings"
                    isActive={activeNav === 'settings'}
                    onClick={() => setActiveNav('settings')}
                    isDarkMode={isDarkMode}
                  />
                </div>
              </div>
            </div>
          </nav>

          {/* Main Content */}
          <div className="flex-1 overflow-hidden">
            {activeNav === 'home' && <HomeTab isDarkMode={isDarkMode} />}
            {activeNav === 'analytics' && <AnalyticsTab isDarkMode={isDarkMode} />}
            {activeNav === 'meter' && <MeterTab isDarkMode={isDarkMode} />}
            {activeNav === 'devices' && <DevicesTab isDarkMode={isDarkMode} />}
            {activeNav === 'settings' && (
              <SettingsTab isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
            )}
          </div>
        </div>
      </EventsProvider>
    </DevicesProvider>
  )
}

function NavButton({
  icon,
  label,
  isActive,
  onClick,
  isDarkMode,
}: {
  icon: React.ReactNode
  label: string
  isActive: boolean
  onClick: () => void
  isDarkMode: boolean
}) {
  return (
    <button
      className={`flex items-center px-4 py-2 text-sm font-medium ${
        isActive
          ? isDarkMode
            ? 'text-white border-b-2 border-white'
            : 'text-gray-900 border-b-2 border-gray-900'
          : isDarkMode
          ? 'text-gray-300 hover:text-white hover:border-gray-300'
          : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
      }`}
      onClick={onClick}
    >
      {icon}
      <span className="ml-2">{label}</span>
    </button>
  )
}
