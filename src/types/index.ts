// frontend/src/types/index.ts

export type DeviceClassification = 'always_connected' | 'charging';

// Define the structure for each device in the frontend
export interface DeviceDefinition {
    id: string;
    label: string;
    classification: string; // e.g., 'tablet', 'laptop'
    power: number;
    alwaysOn?: number;
  }
export type DeviceAction = 'turned_on' | 'turned_off' | 'started_charging' | 'stopped_charging';

export interface RecentEvent {
    time: string;
    deviceId: string;
    action: DeviceAction;
}
