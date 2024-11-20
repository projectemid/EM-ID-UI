// frontend/src/utils/deviceUtils.ts

import { DeviceDefinition } from "@/types";

let devices: DeviceDefinition[] = [];

export const setDevices = (fetchedDevices: DeviceDefinition[]) => {
  devices = fetchedDevices;
};

export const addDevice = (newDevice: DeviceDefinition) => {
  devices = [...devices, newDevice];
};

export const getDeviceById = (id: string): DeviceDefinition | undefined => {
  return devices.find(device => device.id === id);
};

export const getAllDevices = (): DeviceDefinition[] => {
  return devices;
};
