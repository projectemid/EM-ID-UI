"use client"

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Power, PowerOff, Clock, Settings, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { getIconByClassification } from '@/utils/classificationIconMapping';
import { cn } from "@/lib/utils";
import { useData, Device } from '@/context/DataContext';
import { DeviceSettingsModal } from '../modals/device-settings-modal';
import { UsageChart } from '../graph-helpers/usage-chart';
import { calculateDeviceStats } from '@/utils/device-stats';

const DevicesTab = ({ isDarkMode }: { isDarkMode: boolean }) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { devices, devicesOn, setDevicesOn, userData } = useData();
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  // @typescript-eslint/no-explicit-any
  const [deviceData, setDeviceData] = useState<any[]>([]);
  const [dateRange, setDateRange] = useState<{ start: Date; end: Date }>({
    start: new Date(),
    end: new Date()
  });
  const [displayMode, setDisplayMode] = useState<'kwh' | 'cost'>('kwh');

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (selectedDevice) {
      fetchDeviceData();
    }
  }, [selectedDevice, timeRange, dateRange]);

  const fetchDeviceData = async () => {
    if (!selectedDevice) return;
    
    try {
      const response = await fetch('/data/AggregatedDeviceData.json');
      const data = await response.json();
      setDeviceData(data);
    } catch (error) {
      console.error('Error loading device data:', error);
    }
  };

  useEffect(() => {
    updateDateRange(timeRange === 'week' ? 'month' : timeRange, new Date());
  }, [timeRange, selectedDevice]);

  const updateDateRange = (period: 'month' | 'year', currentDate: Date) => {
    let start: Date;
    let end: Date;

    switch (period) {
      case 'month':
        start = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        end = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        break;
      case 'year':
        start = new Date(currentDate.getFullYear(), 0, 1);
        end = new Date(currentDate.getFullYear(), 11, 31);
        break;
      default:
        start = new Date();
        end = new Date();
    }

    // Remove time components to avoid timezone issues
    start = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    end = new Date(end.getFullYear(), end.getMonth(), end.getDate());

    setDateRange({ start, end });
  };

  const handleNavigation = (direction: 'prev' | 'next') => {
    if (!selectedDevice) return;

    let newDate: Date;

    switch (timeRange) {
      case 'week':
        newDate = new Date(dateRange.start);
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
        break;
      case 'month':
        newDate = new Date(
          dateRange.start.getFullYear(),
          dateRange.start.getMonth() + (direction === 'next' ? 1 : -1),
          1
        );
        break;
      case 'year':
        newDate = new Date(dateRange.start.getFullYear() + (direction === 'next' ? 1 : -1), 0, 1);
        break;
      default:
        newDate = new Date();
    }

    updateDateRange(timeRange === 'week' ? 'month' : timeRange, newDate);
  };

  const handleToggleDisplayMode = () => {
    setDisplayMode(prev => prev === 'kwh' ? 'cost' : 'kwh');
  };

  const handleDeviceClick = (device: Device) => {
    setSelectedDevice(device);
    setTimeRange('month'); // Reset to 'month' when a new device is selected
  };

  const getDeviceIcon = (category: string) => {
    return getIconByClassification(category.toLowerCase().replace(/\s+/g, '_'));
  };

  const handleSaveDeviceSettings = async (deviceData: Partial<Device>) => {
    // TODO: Implement the save functionality
    console.log('Saving device settings:', deviceData)
  };

  const sortedDevices = useMemo(() => {
    if (!devices || !devicesOn) return [];
    return [...devices].sort((a, b) => {
      const aOn = devicesOn.includes(a.deviceId);
      const bOn = devicesOn.includes(b.deviceId);
      if (aOn && !bOn) return -1;
      if (!aOn && bOn) return 1;
      return b.wattageOn - a.wattageOn;
    });
  }, [devices, devicesOn]);

  const formatDateRange = (start: Date, end: Date, period: 'week' | 'month' | 'year'): string => {
    if (period === 'week') {
      const options: Intl.DateTimeFormatOptions = {
        month: 'short',
        day: 'numeric'
      }
      return `${start.toLocaleDateString(undefined, options)} - ${end.toLocaleDateString(
        undefined,
        options
      )}`
    }

    if (period === 'month') {
      return start.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    }

    if (period === 'year') {
      return start.getFullYear().toString()
    }

    return ''
  }

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
                  "cursor-pointer transition-all duration-200 hover:shadow-md relative",
                  selectedDevice?.deviceId === device.deviceId && "ring-2 ring-blue-500",
                  isDarkMode ? "bg-gray-800" : "bg-white",
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

      {/* Main Content */}
      {selectedDevice ? (
        <div className="flex-1 p-8 overflow-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className={cn(
                  "w-16 h-16 flex items-center justify-center rounded-2xl",
                  isDarkMode ? "bg-gray-800" : "bg-gray-200"
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
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleToggleDisplayMode}
                >
                  <Download className="h-4 w-4" />
                  <span className="sr-only">Toggle Display Mode</span>
                </Button>
              </div>
            </div>

            {/* Usage Statistics */}
            <Card className={cn(
              "mb-8",
              isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
            )}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Usage Statistics</CardTitle>
                  <div className="flex items-center gap-4">
                    <Tabs
                      defaultValue={timeRange}
                      onValueChange={(v) => setTimeRange(v as 'week' | 'month' | 'year')}
                      className="w-full max-w-[400px] justify-center"
                    >
                      <TabsList className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} p-1`}>
                        <TabsTrigger value="week">Week</TabsTrigger>
                        <TabsTrigger value="month">Month</TabsTrigger>
                        <TabsTrigger value="year">Year</TabsTrigger>
                      </TabsList>
                    </Tabs>
                    <div className="flex items-center gap-4">
                      <Button variant="ghost" size="icon" onClick={() => handleNavigation('prev')}>
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <span className="text-sm font-medium min-w-[120px] text-center">
                        {formatDateRange(dateRange.start, dateRange.end, timeRange)}
                      </span>
                      <Button variant="ghost" size="icon" onClick={() => handleNavigation('next')}>
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                    <Button
                      variant="outline"
                      onClick={handleToggleDisplayMode}
                    >
                      Show {displayMode === 'kwh' ? 'Est. Cost' : 'kWh'}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {selectedDevice && (
                  <>
                    <UsageChart
                      aggregatedData={deviceData}
                      period={timeRange}
                      dateRange={dateRange}
                      devices={[selectedDevice]}
                      userData={userData}
                      displayMode={displayMode}
                    />
                    <div className="grid grid-cols-4 gap-4 mt-8">
                      {/* Stats Cards */}
                      <Card className={cn(
                        "p-4",
                        isDarkMode ? "bg-gray-700" : "bg-gray-50"
                      )}>
                        <div className="text-sm font-medium mb-2">Total Usage</div>
                        <div className="text-2xl font-bold">
                          {calculateDeviceStats(
                            deviceData,
                            selectedDevice.deviceId,
                            timeRange === 'week' ? 'month' : timeRange,
                            dateRange.start,
                            selectedDevice.wattageOn,
                            userData?.baseRatePerKWh ?? 0
                          ).totalUsage} kWh
                        </div>
                      </Card>
                      <Card className={cn(
                        "p-4",
                        isDarkMode ? "bg-gray-700" : "bg-gray-50"
                      )}>
                        <div className="text-sm font-medium mb-2">Total Est. Cost</div>
                        <div className="text-2xl font-bold">
                          ${calculateDeviceStats(
                            deviceData,
                            selectedDevice.deviceId,
                            timeRange === 'week' ? 'month' : timeRange,
                            dateRange.start,
                            selectedDevice.wattageOn,
                            userData?.baseRatePerKWh ?? 0
                          ).totalCost}
                        </div>
                      </Card>
                      <Card className={cn(
                        "p-4",
                        isDarkMode ? "bg-gray-700" : "bg-gray-50"
                      )}>
                        <div className="text-sm font-medium mb-2">Times On</div>
                        <div className="text-2xl font-bold">
                          {calculateDeviceStats(
                            deviceData,
                            selectedDevice.deviceId,
                            timeRange === 'week' ? 'month' : timeRange,
                            dateRange.start,
                            selectedDevice.wattageOn,
                            userData?.baseRatePerKWh ?? 0
                          ).timesOn}x
                        </div>
                      </Card>
                      <Card className={cn(
                        "p-4",
                        isDarkMode ? "bg-gray-700" : "bg-gray-50"
                      )}>
                        <div className="text-sm font-medium mb-2">Total Time On</div>
                        <div className="text-2xl font-bold">
                          {calculateDeviceStats(
                            deviceData,
                            selectedDevice.deviceId,
                            timeRange === 'week' ? 'month' : timeRange,
                            dateRange.start,
                            selectedDevice.wattageOn,
                            userData?.baseRatePerKWh ?? 0
                          ).totalTimeOn}
                        </div>
                      </Card>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Power Consumption */}
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

            {/* Device Details and Timeline */}
            <div className="flex gap-4 mb-8">
              {/* Device Details */}
              <Card className={cn(
                "flex-1",
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
              {/* Timeline */}
              <Card className={cn(
                "flex-1",
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
          </div>
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

