import React, { createContext, useContext, useState, ReactNode } from 'react';

interface EnergyContextType {
  selectedDeviceId: string | null;
  setSelectedDeviceId: (id: string | null) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const EnergyContext = createContext<EnergyContextType | undefined>(undefined);

export function EnergyProvider({ children }: { children: ReactNode }) {
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('home');

  return (
    <EnergyContext.Provider value={{ selectedDeviceId, setSelectedDeviceId, activeTab, setActiveTab }}>
      {children}
    </EnergyContext.Provider>
  );
}

export function useEnergy() {
  const context = useContext(EnergyContext);
  if (context === undefined) {
    throw new Error('useEnergy must be used within an EnergyProvider');
  }
  return context;
}