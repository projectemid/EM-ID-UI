// frontend/src/data/deviceDefinitions.ts

import React from 'react'
import { Zap, Tv, AirVent, Thermometer, Microwave, Tablet } from 'lucide-react'

// Define the possible classifications for devices
export type DeviceClassification = 'always_connected' | 'charging'

// Define the structure for each device
export interface DeviceDefinition {
  id: string
  label: string
  classification: DeviceClassification
icon: React.ReactNode
  current: number // Energy consumption in Watts
  alwaysOn?: number // Optional property for devices that are always ont
}

// Centralized device definitions
export const deviceDefinitions: DeviceDefinition[] = [
  {
    id: "lightbulb_augusto",
    label: "Augusto's Light Bulb",
    classification: 'always_connected',
    icon: <Tv />, // Replace with a more appropriate icon if available
    current: 8,
  },
  {
    id: "mac_luca",
    label: "Luca's MacBook",
    classification: 'always_connected',
    icon: <AirVent />, // Replace with a more appropriate icon if available
    current: 30,
  },
  {
    id: "laptop_juan",
    label: "Juan's Laptop",
    classification: 'always_connected',
    icon: <Zap />, // Replace with a more appropriate icon if available
    current: 80,
  },
  {
    id: "ipad_off_augusto",
    label: "Augusto's iPad",
    classification: 'charging',
    icon: <Tablet />, // Replace with a more appropriate icon if available
    current: 15,
  },
  // Devices used in recent events
  {
    id: "air_conditioner",
    label: "Air Conditioner",
    classification: 'always_connected',
    icon: <AirVent />,
    current: 541,
  },
  {
    id: "block_heater",
    label: "Block Heater",
    classification: 'always_connected',
    icon: <Thermometer />,
    current: 448,
  },
  {
    id: "oven",
    label: "Oven",
    classification: 'always_connected',
    icon: <Microwave />,
    current: 286,
  },
  {
    id: "playstation_5",
    label: "Playstation 5",
    classification: 'always_connected',
    icon: <Tv />, // Replace with a more appropriate icon if available
    current: 197,
  },
  {
    id: "air_fryer",
    label: "Air Fryer",
    classification: 'always_connected',
    icon: <Microwave />,
    current: 82,
  },
  // Add more devices as needed
]
