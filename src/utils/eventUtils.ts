// frontend/src/utils/eventUtils.ts

import { DeviceDefinition } from '../data/deviceDefinitions'

// Function to generate action text based on device classification and action
export const generateActionText = (device: DeviceDefinition, action: string): string => {
  switch (action) {
    case 'turned_on':
      if (device.classification === 'always_connected') {
        return `${device.label} was turned on`
      } else if (device.classification === 'charging') {
        return `${device.label} started charging`
      }
      // Fallback if classification doesn't match
      return `Performed an action on ${device.label}`
      
    case 'turned_off':
      if (device.classification === 'always_connected') {
        return `${device.label} was turned off`
      } else if (device.classification === 'charging') {
        return `${device.label} stopped charging`
      }
      // Fallback if classification doesn't match
      return `Performed an action on ${device.label}`
      
    case 'started_charging':
      return `${device.label} started charging`
      
    case 'stopped_charging':
      return `${device.label} stopped charging`
      
    default:
      return `Performed an action on ${device.label}`
  }
}
