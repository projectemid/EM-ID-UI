"use client"

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Power, PowerOff, Clock, Settings } from 'lucide-react';
import { getIconByClassification } from '@/utils/classificationIconMapping';
import { cn } from "@/lib/utils";
import { useData, Device } from '@/context/DataContext';
import { DeviceSettingsModal } from '../modals/device-settings-modal';

const DevicesTab = ({ isDarkMode }: { isDarkMode: boolean }) => {
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  const { devices, devicesOn, setDevicesOn } = useData();
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [timeRange, setTimeRange] = useState('day');
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  const handleDeviceClick = (device: Device) => {
    setSelectedDevice(device);
  };

  const getDeviceIcon = (category: string) => {
    return getIconByClassification(category.toLowerCase().replace(/\s+/g, '_'));
  };

  const handleSaveDeviceSettings = async (deviceData: Partial<Device>) => {
    // TODO: Implement the save functionality
    console.log('Saving device settings:', deviceData)
  };

  const sortedDevices = useMemo(() => {
    if (!devices || !devicesOn) return [];  // Add safety check
    return [...devices].sort((a, b) => {
      const aOn = devicesOn.includes(a.deviceId);
      const bOn = devicesOn.includes(b.deviceId);
      if (aOn && !bOn) return -1;
      if (!aOn && bOn) return 1;
      return b.wattageOn - a.wattageOn;
    });
  }, [devices, devicesOn]);

  // Add safety check before rendering
  if (!devices || !devicesOn) return null;

  return (
    <div className={cn(
      "flex h-full",
      isDarkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"
    )}>
      {/* Left Sidebar - Device List */}
      <ScrollArea className={cn(
        "w-80 border-r",
        isDarkMode ? "border-gray-800" : "border-gray-200"
      )}>
        <div className="p-4">
          <h2 className="text-lg font-semibold mb-4">Your Devices</h2>
          <div className="space-y-4">
            {sortedDevices.map((device) => (
              <Card 
                key={device.deviceId} 
                className={cn(
                  "cursor-pointer transition-all duration-200 hover:shadow-md",
                  selectedDevice?.deviceId === device.deviceId
                    ? isDarkMode ? "bg-gray-800 border-blue-500" : "bg-white border-blue-500"
                    : isDarkMode ? "bg-gray-800" : "bg-white",
                  devicesOn.includes(device.deviceId)
                    ? "border-l-4 border-l-green-500"
                    : isDarkMode ? "border-gray-700" : "border-gray-200"
                )}
                onClick={() => handleDeviceClick(device)}
              >
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={cn(
                      "w-10 h-10 flex items-center justify-center rounded-full",
                      isDarkMode ? "bg-gray-700" : "bg-gray-200"
                    )}>
                      {getDeviceIcon(device.category)}
                    </div>
                    <div>
                      <p className="font-medium">{device.label}</p>
                      <p className={cn(
                        "text-xs",
                        isDarkMode ? "text-gray-400" : "text-gray-500"
                      )}>
                        {device.wattageOn}W
                      </p>
                    </div>
                  </div>
                  {devicesOn.includes(device.deviceId) && (
                    <Power className="w-4 h-4 text-green-500" />
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </ScrollArea>

      {/* Main Content Area */}
      {selectedDevice ? (
        <div className="flex-1 p-8 overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className={cn(
                "w-16 h-16 flex items-center justify-center rounded-2xl",
                isDarkMode ? "bg-blue-500/10" : "bg-blue-100"
              )}>
                {getDeviceIcon(selectedDevice.category)}
              </div>
              <div>
                <h1 className="text-3xl font-bold">{selectedDevice.label}</h1>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge 
                    variant={devicesOn.includes(selectedDevice.deviceId) ? "default" : "secondary"}
                  >
                    {devicesOn.includes(selectedDevice.deviceId) ? "On" : "Off"}
                  </Badge>
                  <p className={cn(
                    "text-sm",
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  )}>
                    {selectedDevice.room || 'No location'}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="lg"
                className={cn(
                  "flex items-center gap-2",
                  isDarkMode
                    ? "border-gray-700 text-white hover:bg-gray-800"
                    : "border-gray-300 text-gray-900 hover:bg-gray-200"
                )}
                onClick={() => setIsSettingsModalOpen(true)}
              >
                <Settings className="w-5 h-5" />
                Device Settings
              </Button>
            </div>
          </div>

          {/* Device Details */}
          <Card className={cn(
            "mb-8",
            isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
          )}>
            <CardHeader>
              <CardTitle>Device Details</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium mb-1">Brand</p>
                <p className={isDarkMode ? "text-gray-300" : "text-gray-700"}>{selectedDevice.brand}</p>
              </div>
              <div>
                <p className="text-sm font-medium mb-1">Model</p>
                <p className={isDarkMode ? "text-gray-300" : "text-gray-700"}>{selectedDevice.model}</p>
              </div>
              <div>
                <p className="text-sm font-medium mb-1">Wattage (On)</p>
                <p className={isDarkMode ? "text-gray-300" : "text-gray-700"}>{selectedDevice.wattageOn}W</p>
              </div>
              <div>
                <p className="text-sm font-medium mb-1">Wattage (Standby)</p>
                <p className={isDarkMode ? "text-gray-300" : "text-gray-700"}>{selectedDevice.wattageStandby}W</p>
              </div>
            </CardContent>
          </Card>

          {/* Power Consumption Visualization */}
          <Card className={cn(
            "mb-8",
            isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
          )}>
            <CardHeader>
              <CardTitle>Power Consumption</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <Badge variant={devicesOn.includes(selectedDevice.deviceId) ? "default" : "secondary"}>
                  {devicesOn.includes(selectedDevice.deviceId) ? (
                    <Power className="w-4 h-4 mr-1" />
                  ) : (
                    <PowerOff className="w-4 h-4 mr-1" />
                  )}
                  {devicesOn.includes(selectedDevice.deviceId) ? "On" : "Off"}
                </Badge>
                <p className="text-2xl font-bold">
                  {devicesOn.includes(selectedDevice.deviceId) ? selectedDevice.wattageOn : selectedDevice.wattageStandby}W
                </p>
              </div>
              <Progress 
                value={devicesOn.includes(selectedDevice.deviceId) ? 100 : (selectedDevice.wattageStandby / selectedDevice.wattageOn) * 100} 
                className="h-2 mb-2"
              />
              <div className="flex justify-between text-sm">
                <span>0W</span>
                <span>{selectedDevice.wattageOn}W</span>
              </div>
            </CardContent>
          </Card>

          {/* Usage Statistics - Now with time period controls */}
          <Card className={cn(
            "mb-8",
            isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
          )}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Usage Statistics</CardTitle>
                <div className="flex items-center gap-2">
                  <Tabs defaultValue={timeRange} onValueChange={setTimeRange}>
                    <TabsList className={isDarkMode ? "bg-gray-700" : "bg-gray-100"}>
                      <TabsTrigger value="day">Day</TabsTrigger>
                      <TabsTrigger value="week">Week</TabsTrigger>
                      <TabsTrigger value="month">Month</TabsTrigger>
                      <TabsTrigger value="year">Year</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center">
                <p className={isDarkMode ? "text-gray-400" : "text-gray-600"}>
                  Usage statistics and graphs will be implemented here.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card className={cn(
            isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
          )}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Timeline</CardTitle>
                <Button variant="outline" size="sm" className={cn(
                  isDarkMode
                    ? "border-gray-700 text-white hover:bg-gray-800"
                    : "border-gray-300 text-gray-900 hover:bg-gray-100"
                )}>
                  <Clock className="w-4 h-4 mr-2" />
                  Today
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {devicesOn.includes(selectedDevice.deviceId) ? (
                  <div className="flex items-start gap-3">
                    <div className="relative">
                      <div className="w-2 h-2 mt-2 rounded-full bg-blue-500" />
                      <div className="absolute top-4 left-1/2 w-px h-full -translate-x-1/2 bg-gray-600" />
                    </div>
                    <div>
                      <div className="font-medium">Now</div>
                      <div className={cn(
                        "text-sm",
                        isDarkMode ? "text-gray-400" : "text-gray-500"
                      )}>Device is running</div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 mt-2 rounded-full bg-gray-500" />
                    <div>
                      <div className="font-medium">Now</div>
                      <div className={cn(
                        "text-sm",
                        isDarkMode ? "text-gray-400" : "text-gray-500"
                      )}>Device is off</div>
                    </div>
                  </div>
                )}
                {/* Placeholder for future timeline events */}
                <div className="text-sm text-gray-500 pl-5">
                  Additional timeline events will appear here when device data is implemented.
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-400">
          Select a device to view details
        </div>
      )}
      {selectedDevice && (
        <DeviceSettingsModal
          open={isSettingsModalOpen}
          onOpenChange={setIsSettingsModalOpen}
          device={selectedDevice}
          onSave={handleSaveDeviceSettings}
          isDarkMode={isDarkMode}
        />
      )}
    </div>
  );
};

export default DevicesTab;

