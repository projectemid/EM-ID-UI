import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Info, Plus, User, Bell, Zap, Settings, HelpCircle } from 'lucide-react'
import { useData } from '@/context/DataContext';

interface SettingsTabProps {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

export default function SettingsTab({ isDarkMode, toggleDarkMode }: SettingsTabProps) {
  const { updateUserData } = useData();
  const [defaultCost, setDefaultCost] = useState('9')
  const [billingCycleStart, setBillingCycleStart] = useState('6')
  const [showCost, setShowCost] = useState(false)
  const [activeMenu, setActiveMenu] = useState('Electricity Info')

  const menuItems = [
    { name: 'Account', icon: <User className="w-5 h-5" /> },
    { name: 'Notifications', icon: <Bell className="w-5 h-5" /> },
    { name: 'Electricity Info', icon: <Zap className="w-5 h-5" /> },
    { name: 'General', icon: <Settings className="w-5 h-5" /> },
    { name: 'Help', icon: <HelpCircle className="w-5 h-5" /> },
  ]

  const handleDarkModeToggle = async () => {
    try {
      await updateUserData({ darkMode: !isDarkMode });
      toggleDarkMode(); // Local state update
    } catch (error) {
      console.error('Error updating dark mode:', error);
    }
  };

  return (
    <div className={`flex h-full ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-800'}`}>
      {/* Sidebar */}
      <aside className={`w-64 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'} p-4`}>
        <nav>
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.name}>
                <Button
                  variant="ghost"
                  className={`w-full justify-start ${activeMenu === item.name ? (isDarkMode ? 'bg-gray-700' : 'bg-gray-200') : ''}`}
                  onClick={() => setActiveMenu(item.name)}
                >
                  {item.icon}
                  <span className="ml-2">{item.name}</span>
                </Button>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 p-8 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">{activeMenu}</h1>
          <Button variant="outline">Save changes</Button>
        </div>

        {activeMenu === 'Electricity Info' && (
          <>
            <div className="flex space-x-4 mb-6">
              <Info className="w-5 h-5" />
              <span className="text-sm">Learn how to set your rates</span>
            </div>

            <div className="grid grid-cols-2 gap-8">
              {/* Billing Section */}
              <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <h2 className="text-lg font-semibold mb-4">Billing</h2>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="default-cost">Default Electricity Cost (¢ / kWh)</Label>
                    <Input
                      id="default-cost"
                      value={defaultCost}
                      onChange={(e) => setDefaultCost(e.target.value)}
                      className={isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-800 border-gray-300'}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="show-cost"
                      checked={showCost}
                      onCheckedChange={setShowCost}
                      className={isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}
                    />
                    <Label htmlFor="show-cost">Show cost</Label>
                  </div>
                  <div>
                    <Label htmlFor="billing-cycle">Billing Cycle Start</Label>
                    <Input
                      id="billing-cycle"
                      value={billingCycleStart}
                      onChange={(e) => setBillingCycleStart(e.target.value)}
                      className={isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-800 border-gray-300'}
                    />
                  </div>
                </div>
              </div>

              {/* Time of Use Rate Zones Section */}
              <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <h2 className="text-lg font-semibold mb-4">Time of Use Rate Zones</h2>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-4`}>
                  These will override the default electricity cost during the specified time period.
                </p>
                <Button variant="outline" className="w-full justify-start">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Rate Zone
                </Button>
              </div>
            </div>
          </>
        )}

        {activeMenu === 'General' && (
          <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h2 className="text-lg font-semibold mb-4">Theme</h2>
            <div className="flex items-center space-x-2">
              <Switch
                id="dark-mode"
                checked={isDarkMode}
                onCheckedChange={handleDarkModeToggle}
                className={isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}
              />
              <Label htmlFor="dark-mode">Dark Mode</Label>
            </div>
          </div>
        )}

        {/* Add placeholder content for other menu items */}
        {(activeMenu === 'Account' || activeMenu === 'Notifications' || activeMenu === 'Help') && (
          <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h2 className="text-lg font-semibold mb-4">{activeMenu} Settings</h2>
            <p>This is a placeholder for {activeMenu.toLowerCase()} settings. Implement the necessary fields and options here.</p>
          </div>
        )}
      </main>
    </div>
  )
}