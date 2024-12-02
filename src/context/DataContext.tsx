import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Device {
  deviceId: string;
  label: string;
  category: string;
  showTimeline: boolean;
  wattageOn: number;
  wattageStandby: number;
  brand: string;
  model: string;
  room?: string;
}

export interface UserData {
  email: string;
  energyProvider: string;
  baseRatePerKWh: number;
  peakRatePerKWh: number;
  offPeakRatePerKWh: number;
  city: string;
  state: string;
  country: string;
  timeZone: string;
  darkMode: boolean;
}

interface DataContextType {
  devices: Device[];
  devicesOn: string[];
  userData: UserData | null;
  setDevicesOn: React.Dispatch<React.SetStateAction<string[]>>;  // Correctly define setDevicesOn
  fetchDevices: () => void;
  fetchDevicesOn: () => void;
  fetchUserData: () => void;
  updateUserData: (updates: Partial<UserData>) => Promise<void>;
  updateDevice: (deviceId: string, updates: Partial<Device>) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [devicesOn, setDevicesOn] = useState<string[]>([]);
  const [userData, setUserData] = useState<UserData | null>(null);

  useEffect(() => {
    fetchDevices();
    fetchUserData();
    fetchDevicesOn(); // Initial fetch

    // Polling for devicesOn data every 30 seconds
    const intervalId = setInterval(fetchDevicesOn, 10000000000000000);

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  const fetchDevices = async () => {
    try {
      const response = await fetch('https://thpjgw8n89.execute-api.us-east-1.amazonaws.com/prod/getDevices');
      // @typescript-eslint/no-explicit-any
      const data = await response.json();
      setDevices(data);
      console.log('devices', data);
    } catch (error) {
      console.error('Error fetching devices:', error);
    }
  };

  const fetchDevicesOn = async () => {
    try {
      const response = await fetch('https://thpjgw8n89.execute-api.us-east-1.amazonaws.com/prod/getDevicesOn');
      const data = await response.json();
      console.log('devicesOn', data.devices_on);
      setDevicesOn(data.devices_on);
    } catch (error) {
      console.error('Error fetching devices on:', error);
    }
  };

  const fetchUserData = async () => {
    try {
      const response = await fetch('https://thpjgw8n89.execute-api.us-east-1.amazonaws.com/prod/getUserData?userId=user1');
      const data = await response.json();
      console.log('userData', data.data);
      setUserData(data.data);
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const updateUserData = async (updates: Partial<UserData>) => {
    try {
      const response = await fetch('https://thpjgw8n89.execute-api.us-east-1.amazonaws.com/prod/editUserInfo', {
        method: 'POST',
        body: JSON.stringify({
          userId: 'user1',
          ...updates
        })
      });
      
      if (response.ok) {
        // Refresh user data after successful update
        await fetchUserData();
      }
    } catch (error) {
      console.error('Error updating user data:', error);
    }
  };

  const updateDevice = async (deviceId: string, updates: Partial<Device>) => {
    try {
      // Create a clean request body with only the fields we want to update
      const requestBody: Record<string, string | number | boolean> = {
        userId: 'user1',
        deviceId,
        ...Object.entries(updates).reduce((acc, [key, value]) => {
          if (value != null) {
            acc[key] = value;
          }
          return acc;
        }, {} as Record<string, string | number | boolean>)
      };

      console.log('Final request body:', JSON.stringify(requestBody));

      const response = await fetch('https://thpjgw8n89.execute-api.us-east-1.amazonaws.com/prod/editDeviceData', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();
      console.log('API Response:', data);
      
      if (!response.ok) {
        throw new Error(data.message || data.error || 'Failed to update device');
      }

      await fetchDevices();
    } catch (error) {
      console.error('Error updating device:', error);
      throw error;
    }
  };

  return (
    <DataContext.Provider value={{ 
      devices, 
      devicesOn, 
      userData, 
      setDevicesOn,  // Provide setDevicesOn here
      fetchDevices, 
      fetchDevicesOn, 
      fetchUserData,
      updateUserData,
      updateDevice  // Add the new function
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};