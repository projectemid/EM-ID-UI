// frontend/src/contexts/DevicesContext.tsx

import React, { createContext, useState, useEffect, ReactNode } from 'react'
import { DeviceDefinition, deviceDefinitions as defaultDevices } from '../data/deviceDefinitions'

interface DevicesContextType {
  devices: DeviceDefinition[]
  addDevice: (device: DeviceDefinition) => void
  updateDevice: (updatedDevice: DeviceDefinition) => void
  deleteDevice: (id: string) => void
}

export const DevicesContext = createContext<DevicesContextType | undefined>(undefined)

export const DevicesProvider = ({ children }: { children: ReactNode }) => {
  const [devices, setDevices] = useState<DeviceDefinition[]>([])

  useEffect(() => {
    const storedDevices = localStorage.getItem('devices')
    if (storedDevices) {
      setDevices(JSON.parse(storedDevices))
    } else {
      setDevices(defaultDevices)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('devices', JSON.stringify(devices))
  }, [devices])

  const addDevice = (device: DeviceDefinition) => {
    setDevices((prevDevices) => [...prevDevices, device])
  }

  const updateDevice = (updatedDevice: DeviceDefinition) => {
    setDevices((prevDevices) =>
      prevDevices.map((device) =>
        device.id === updatedDevice.id ? updatedDevice : device
      )
    )
  }

  const deleteDevice = (id: string) => {
    setDevices((prevDevices) => prevDevices.filter((device) => device.id !== id))
  }

  return (
    <DevicesContext.Provider value={{ devices, addDevice, updateDevice, deleteDevice }}>
      {children}
    </DevicesContext.Provider>
  )
}
