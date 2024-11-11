// frontend/src/types/index.ts

export type DeviceClassification = 'always_connected' | 'charging';

export interface DeviceDefinition {
    id: string;
    label: string;
    classification: DeviceClassification;
    icon: string; // Changed from React.ReactNode to string
    current: number;
    alwaysOn?: number;
}

export type DeviceAction = 'turned_on' | 'turned_off' | 'started_charging' | 'stopped_charging';

export interface RecentEvent {
    time: string;
    deviceId: string;
    action: DeviceAction;
}
