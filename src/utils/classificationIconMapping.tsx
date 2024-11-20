// frontend/src/utils/classificationIconMapping.tsx
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Tablet, Laptop, Tv, AirVent, Thermometer, Microwave, Speaker, Zap } from 'lucide-react';
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
  | 'other';

// Map classification names to React components
export const classificationIconMap: { [key in ClassificationName]: React.ReactNode } = {
  air_conditioner: <AirVent />,
  tablet: <Tablet />,
  phone: <Zap />, // Replace with an appropriate icon if available
  laptop: <Laptop />,
  lights: <Zap />, // Replace with an appropriate icon if available
  console: <Zap />, // Replace with an appropriate icon if available
  tv: <Tv />,
  monitor: <Tv />, // Replace with an appropriate icon if available
  computer: <Laptop />, // Replace with an appropriate icon if available
  cooking_appliance: <Microwave />,
  speaker: <Speaker />,
  other: <Zap />, // Default icon
};

// Function to get the icon component by classification
export const getIconByClassification = (classification: string): React.ReactNode => {
  // Normalize classification string to match keys
  const key = classification.toLowerCase().replace(/\s+/g, '_') as ClassificationName;
  return classificationIconMap[key] || <Zap />; // Default to Zap if not found
};
