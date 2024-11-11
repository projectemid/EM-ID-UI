// frontend/src/utils/deviceUtils.ts

import { deviceDefinitions, DeviceDefinition } from '../data/deviceDefinitions'

// Function to retrieve device definition by ID
export const getDeviceById = (id: string): DeviceDefinition | undefined => {
  return deviceDefinitions.find(device => device.id === id)
}
