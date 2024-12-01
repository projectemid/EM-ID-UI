// frontend/src/utils/classificationIconMapping.tsx
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Tablet, Laptop, Tv, AirVent, Thermometer, Microwave, Speaker, Zap, WashingMachine, LampFloor, LampDesk, Lamp, Lightbulb, Gamepad2, Monitor, Computer, Refrigerator } from 'lucide-react';
import React from 'react';

// Define a type for classification names
type ClassificationName =
  | 'air_conditioner'
  | 'tablet'
  | 'phone'
  | 'laptop'
  | 'lights'
  | 'console'
  | 'tv'
  | 'monitor'
  | 'computer'
  | 'cooking_appliance'
  | 'speaker'
  | 'washing_machine'
  | 'dryer'
  | 'floor_lamp'
  | 'desk_lamp'
  | 'lamp'
  | 'fridge'
  | 'freezer'
  | 'other';

// Map classification names to React components
export const classificationIconMap: { [key in ClassificationName]: React.ReactNode } = {
  air_conditioner: <AirVent />,
  tablet: <Tablet />,
  phone: <Zap />, // Replace with an appropriate icon if available
  laptop: <Laptop />,
  lights: <Lightbulb />, // Replace with an appropriate icon if available
  console: <Gamepad2 />, // Replace with an appropriate icon if available
  tv: <Tv />,
  monitor: <Monitor />, // Replace with an appropriate icon if available
  computer: <Computer />, // Replace with an appropriate icon if available
  cooking_appliance: <Microwave />,
  speaker: <Speaker />,
  washing_machine: <WashingMachine />,
  dryer: <WashingMachine />,
  floor_lamp: <LampFloor/>,
  desk_lamp: <LampDesk />,
  lamp: <Lamp />,
  fridge: <Refrigerator />,
  freezer: <Refrigerator />,
  other: <Zap />, // Default icon
};

// Function to get the icon component by classification
export const getIconByClassification = (classification: string): React.ReactNode => {
  // Normalize classification string to match keys
  const key = classification.toLowerCase().replace(/\s+/g, '_') as ClassificationName;
  return classificationIconMap[key] || <Zap />; // Default to Zap if not found
};
