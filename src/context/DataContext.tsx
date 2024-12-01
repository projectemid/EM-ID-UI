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

interface UserData {
  city: string;
  energyProvider: string;
  userId: string;
  baseRatePerKWh: number;
  offPeakRatePerKWh: number;
  peakRatePerKWh: number;
  email: string;
  country: string;
  darkMode: boolean;
  timeZone: string;
  state: string;
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
    const intervalId = setInterval(fetchDevicesOn, 5000);

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  const fetchDevices = async () => {
    try {
      const response = await fetch('https://thpjgw8n89.execute-api.us-east-1.amazonaws.com/prod/getDevices');
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

  return (
    <DataContext.Provider value={{ 
      devices, 
      devicesOn, 
      userData, 
      setDevicesOn,  // Provide setDevicesOn here
      fetchDevices, 
      fetchDevicesOn, 
      fetchUserData,
      updateUserData
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