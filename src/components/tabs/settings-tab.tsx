import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent } from "@/components/ui/card"
import { User, Zap, MapPin, Settings } from 'lucide-react'
import { useData, UserData } from '@/context/DataContext'
import { Toaster } from "@/components/ui/toaster"
import { useToast } from '@/hooks/use-toast'

interface SettingsTabProps {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

export default function ImprovedSettingsTab({ isDarkMode, toggleDarkMode }: SettingsTabProps) {
  const [activeTab, setActiveTab] = useState('account');
  const { userData, updateUserData } = useData();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    email: '',
    energyProvider: '',
    baseRatePerKWh: '',
    peakRatePerKWh: '',
    offPeakRatePerKWh: '',
    city: '',
    state: '',
    country: '',
    timeZone: ''
  });

  useEffect(() => {
    if (userData) {
      setFormData({
        email: userData.email || '',
        energyProvider: userData.energyProvider || '',
        baseRatePerKWh: userData.baseRatePerKWh?.toString() || '',
        peakRatePerKWh: userData.peakRatePerKWh?.toString() || '',
        offPeakRatePerKWh: userData.offPeakRatePerKWh?.toString() || '',
        city: userData.city || '',
        state: userData.state || '',
        country: userData.country || '',
        timeZone: userData.timeZone || ''
      });
    }
  }, [userData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSave = async () => {
    const updates: Partial<Record<keyof UserData, string>> = {};
    
    if (userData) {
      Object.entries(formData).forEach(([key, value]) => {
        const typedKey = key as keyof typeof formData;
        if (value !== userData[typedKey]?.toString()) {
          if (['baseRatePerKWh', 'peakRatePerKWh', 'offPeakRatePerKWh'].includes(key)) {
            updates[typedKey as keyof UserData] = value;
          } else {
            updates[typedKey as keyof UserData] = value;
          }
        }
      });
    }

    if (Object.keys(updates).length > 0) {
      console.log('Sending updates to API:', { userId: 'user1', ...updates });
      try {
        await updateUserData(updates as Partial<UserData>);
        toast({
          title: "Settings Updated",
          description: "Your changes have been saved successfully.",
          duration: 3000,
        });
      } catch (error) {
        console.error('Failed to update user data:', error);
        toast({
          title: "Update Failed",
          description: "There was an error saving your changes. Please try again.",
          variant: "destructive",
          duration: 3000,
        });
      }
    }
  };

  const menuItems = [
    { name: 'account', label: 'Account', icon: <User className="w-5 h-5" /> },
    { name: 'energy', label: 'Energy Info', icon: <Zap className="w-5 h-5" /> },
    { name: 'location', label: 'Location', icon: <MapPin className="w-5 h-5" /> },
    { name: 'preferences', label: 'Preferences', icon: <Settings className="w-5 h-5" /> },
  ]

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
                  className={`w-full justify-start ${activeTab === item.name ? (isDarkMode ? 'bg-gray-700' : 'bg-gray-200') : ''}`}
                  onClick={() => setActiveTab(item.name)}
                >
                  {item.icon}
                  <span className="ml-2">{item.label}</span>
                </Button>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 p-8 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">{menuItems.find(item => item.name === activeTab)?.label}</h1>
          {activeTab !== 'preferences' && (
            <Button variant="outline" onClick={handleSave}>Save changes</Button>
          )}
        </div>

        <Card className={isDarkMode ? 'bg-gray-800' : 'bg-white'}>
          <CardContent className="p-6">
            {activeTab === 'account' && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    value={formData.email}
                    onChange={handleInputChange}
                    className={isDarkMode ? 'bg-gray-700 text-white' : ''} 
                  />
                </div>
                <div>
                  <Label htmlFor="userId">User ID</Label>
                  <Input id="userId" disabled value="user1" className={isDarkMode ? 'bg-gray-700 text-white' : ''} />
                </div>
              </div>
            )}

            {activeTab === 'energy' && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="energyProvider">Energy Provider</Label>
                  <Input 
                    id="energyProvider"
                    value={formData.energyProvider}
                    onChange={handleInputChange}
                    className={isDarkMode ? 'bg-gray-700 text-white' : ''} 
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="baseRatePerKWh">Base Rate (per kWh)</Label>
                    <Input 
                      id="baseRatePerKWh"
                      type="number"
                      step="0.01"
                      value={formData.baseRatePerKWh}
                      onChange={handleInputChange}
                      className={isDarkMode ? 'bg-gray-700 text-white' : ''} 
                    />
                  </div>
                  <div>
                    <Label htmlFor="peakRatePerKWh">Peak Rate (per kWh)</Label>
                    <Input 
                      id="peakRatePerKWh"
                      type="number"
                      step="0.01"
                      value={formData.peakRatePerKWh}
                      onChange={handleInputChange}
                      className={isDarkMode ? 'bg-gray-700 text-white' : ''} 
                    />
                  </div>
                  <div>
                    <Label htmlFor="offPeakRatePerKWh">Off-Peak Rate (per kWh)</Label>
                    <Input 
                      id="offPeakRatePerKWh"
                      type="number"
                      step="0.01"
                      value={formData.offPeakRatePerKWh}
                      onChange={handleInputChange}
                      className={isDarkMode ? 'bg-gray-700 text-white' : ''} 
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'location' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input 
                      id="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className={isDarkMode ? 'bg-gray-700 text-white' : ''} 
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Input 
                      id="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      className={isDarkMode ? 'bg-gray-700 text-white' : ''} 
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="country">Country</Label>
                  <Input 
                    id="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    className={isDarkMode ? 'bg-gray-700 text-white' : ''} 
                  />
                </div>
                <div>
                  <Label htmlFor="timeZone">Time Zone</Label>
                  <Input 
                    id="timeZone"
                    value={formData.timeZone}
                    onChange={handleInputChange}
                    className={isDarkMode ? 'bg-gray-700 text-white' : ''} 
                  />
                </div>
              </div>
            )}

            {activeTab === 'preferences' && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="darkMode"
                    checked={isDarkMode}
                    onCheckedChange={toggleDarkMode}
                  />
                  <Label htmlFor="darkMode">Dark Mode</Label>
                </div>
                {/* Add more preference options here if needed */}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      <Toaster />
    </div>
  )
}

