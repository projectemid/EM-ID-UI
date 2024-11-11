import axios from 'axios';

export interface Device {
  name: string;
  probability: number;
}

export const fetchDevices = async (): Promise<Device[]> => {
  try {
    const response = await axios.get<Device[]>('http://localhost:8000/devices.json');
    console.log('Fetched Devices:', response.data); // Log fetched data
    return response.data;
  } catch (error) {
    console.error('Error fetching devices:', error);
    return [];
  }
};
