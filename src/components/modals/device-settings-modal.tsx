"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Plus, ArrowLeft, X } from 'lucide-react'
import { cn } from "@/lib/utils"
import { Device } from '@/context/DataContext'
import { TimePicker } from "../ui/time-picker"
import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/components/ui/hover-card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useData } from '@/context/DataContext';

interface CustomNotification {
  id: string;
  type: 'time-range' | 'duration';
  startTime?: string;
  endTime?: string;
  duration?: number;
  durationUnit?: 'hours' | 'minutes';
}

interface DeviceSettingsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  device: Device
  isDarkMode: boolean
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onSave: (deviceData: Partial<Device>) => Promise<void>
}

export function DeviceSettingsModal({
  open,
  onOpenChange,
  device,
  isDarkMode = false,
  onSave,
}: DeviceSettingsModalProps) {
  const { updateDevice } = useData();

  const [formData, setFormData] = useState({
    label: device.label,
    brand: device.brand,
    model: device.model,
    category: device.category,
    wattageOn: device.wattageOn,
    wattageStandby: device.wattageStandby,
    location: device.room || "",
    showTimeLine: device.showTimeline || false,
    notes: "",
    alertOnTurnOn: false,
    alertOnTurnOff: false,
    customNotifications: [] as CustomNotification[],
  })

  const [showAddNotification, setShowAddNotification] = useState(false)
  const [newNotification, setNewNotification] = useState<Partial<CustomNotification>>({
    type: 'time-range',
    durationUnit: 'minutes',
  })
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)

  const handleSave = async () => {
    if (!device?.deviceId) {
      console.error('No device ID available');
      return;
    }

    try {
      // Build updates object with non-empty values only
      const updates: Partial<Device> = {};

      if (formData.label.trim()) updates.label = formData.label.trim();
      if (formData.brand.trim()) updates.brand = formData.brand.trim();
      if (formData.model.trim()) updates.model = formData.model.trim();
      if (formData.category.trim()) updates.category = formData.category.trim();
      if (formData.location.trim()) updates.room = formData.location.trim();
      
      // Only include numeric values if they're valid numbers
      if (!isNaN(Number(formData.wattageOn))) {
        updates.wattageOn = Number(formData.wattageOn);
      }
      if (!isNaN(Number(formData.wattageStandby))) {
        updates.wattageStandby = Number(formData.wattageStandby);
      }

      // Only include boolean values if they're defined
      if (typeof formData.showTimeLine === 'boolean') {
        updates.showTimeline = formData.showTimeLine;
      }

      console.log('Device ID:', device.deviceId);
      console.log('Updates to send:', updates);
      
      await updateDevice(device.deviceId, updates);
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to save device settings:', error);
    }
  }

  const addCustomNotification = () => {
    if (
      (newNotification.type === 'time-range' && newNotification.startTime && newNotification.endTime) ||
      (newNotification.type === 'duration' && newNotification.duration)
    ) {
      const notification: CustomNotification = {
        ...newNotification as CustomNotification,
        id: Date.now().toString()
      }
      setFormData({
        ...formData,
        customNotifications: [...formData.customNotifications, notification]
      })
      setNewNotification({ type: 'time-range', durationUnit: 'minutes' })
      setShowAddNotification(false)
    }
  }

  const removeCustomNotification = (id: string) => {
    setFormData({
      ...formData,
      customNotifications: formData.customNotifications.filter(n => n.id !== id)
    })
  }

  const formatDuration = (duration: number, unit: 'hours' | 'minutes') => {
    if (unit === 'hours') {
      return duration === 1 ? '1 hour' : `${duration} hours`;
    } else {
      return duration === 1 ? '1 minute' : `${duration} minutes`;
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "sm:max-w-[600px] max-h-screen overflow-y-auto",
          isDarkMode ? "bg-gray-900 text-white border-gray-800" : "bg-white"
        )}
      >
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 space-x-4">
          <button
            onClick={() => onOpenChange(false)}
            className={cn(
              "hover:text-primary",
              isDarkMode ? "text-gray-400" : "text-gray-600"
            )}
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <DialogTitle className="flex-1 text-center">Device Settings</DialogTitle>
          <Button
            onClick={handleSave}
            className={isDarkMode ? "bg-orange-600 hover:bg-orange-700" : ""}
          >
            Save changes?
          </Button>
        </DialogHeader>

        <div className="grid gap-6 pt-4">
          {/* Device Details */}
          <div
            className={cn(
              "rounded-lg p-4",
              isDarkMode ? "bg-gray-800" : "bg-gray-100"
            )}
          >
            <h3 className="text-lg font-semibold mb-4">Device Details</h3>
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.label}
                  onChange={(e) =>
                    setFormData({ ...formData, label: e.target.value })
                  }
                  className={cn(
                    isDarkMode ? "bg-gray-900 border-gray-700" : "bg-white"
                  )}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="brand">Make</Label>
                <Input
                  id="brand"
                  value={formData.brand}
                  onChange={(e) =>
                    setFormData({ ...formData, brand: e.target.value })
                  }
                  className={cn(
                    isDarkMode ? "bg-gray-900 border-gray-700" : "bg-white"
                  )}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="model">Model</Label>
                <Input
                  id="model"
                  value={formData.model}
                  onChange={(e) =>
                    setFormData({ ...formData, model: e.target.value })
                  }
                  className={cn(
                    isDarkMode ? "bg-gray-900 border-gray-700" : "bg-white"
                  )}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className={cn(
                    isDarkMode ? "bg-gray-900 border-gray-700" : "bg-white"
                  )}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="wattageOn">Wattage (On)</Label>
                <Input
                  id="wattageOn"
                  type="number"
                  value={formData.wattageOn}
                  onChange={(e) =>
                    setFormData({ ...formData, wattageOn: parseInt(e.target.value) })
                  }
                  className={cn(
                    isDarkMode ? "bg-gray-900 border-gray-700" : "bg-white"
                  )}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="wattageStandby">Wattage (Standby)</Label>
                <Input
                  id="wattageStandby"
                  type="number"
                  value={formData.wattageStandby}
                  onChange={(e) =>
                    setFormData({ ...formData, wattageStandby: parseInt(e.target.value) })
                  }
                  className={cn(
                    isDarkMode ? "bg-gray-900 border-gray-700" : "bg-white"
                  )}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  className={cn(
                    isDarkMode ? "bg-gray-900 border-gray-700" : "bg-white"
                  )}
                />
              </div>
            </div>
          </div>

          {/* Basic Notifications */}
          <div
            className={cn(
              "rounded-lg p-4",
              isDarkMode ? "bg-gray-800" : "bg-gray-100"
            )}
          >
            <h3 className="text-lg font-semibold mb-4">Basic Notifications</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="alert-on">Alert me when it turns ON</Label>
                <Switch
                  id="alert-on"
                  checked={formData.alertOnTurnOn}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, alertOnTurnOn: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="alert-off">Alert me when it turns OFF</Label>
                <Switch
                  id="alert-off"
                  checked={formData.alertOnTurnOff}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, alertOnTurnOff: checked })
                  }
                />
              </div>
            </div>
          </div>

          {/* Custom Notifications */}
          <div
            className={cn(
              "rounded-lg p-4",
              isDarkMode ? "bg-gray-800" : "bg-gray-100"
            )}
          >
            <h3 className="text-lg font-semibold mb-4">Custom Notifications</h3>
            {formData.customNotifications.map((notification) => (
              <div key={notification.id} className={cn(
                "mb-2 p-3 rounded-md flex justify-between items-center",
                isDarkMode ? "bg-gray-800/50" : "bg-gray-100"
              )}>
                <span>
                  {notification.type === 'time-range'
                    ? `On between ${notification.startTime} - ${notification.endTime}`
                    : `On for more than ${formatDuration(notification.duration!, notification.durationUnit!)}`}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeCustomNotification(notification.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            {showAddNotification ? (
              <div className="mt-4 space-y-4">
                <div className="flex items-center space-x-2">
                  <Label htmlFor="notification-type">Type:</Label>
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <div className="inline-flex items-center">
                        <select
                          id="notification-type"
                          value={newNotification.type}
                          onChange={(e) => setNewNotification({ ...newNotification, type: e.target.value as 'time-range' | 'duration' })}
                          className={cn(
                            "w-full p-2 rounded-md",
                            isDarkMode ? "bg-gray-900 text-white" : "bg-white text-gray-900"
                          )}
                        >
                          <option value="time-range">Time Range</option>
                          <option value="duration">Duration</option>
                        </select>
                      </div>
                    </HoverCardTrigger>
                    <HoverCardContent>
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Choose a notification type:</p>
                        <p className="text-sm text-muted-foreground">
                          <strong>Time Range:</strong> Get notified if the device is on during specific hours (e.g., between 11 PM - 6 AM)
                        </p>
                        <p className="text-sm text-muted-foreground">
                          <strong>Duration:</strong> Get notified if the device stays on longer than a specified time (e.g., more than 2 hours)
                        </p>
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                </div>
                {newNotification.type === 'time-range' ? (
                  <div className="flex items-center space-x-2">
                    <TimePicker
                      label="Start Time"
                      value={newNotification.startTime}
                      onChange={(time) => setNewNotification({ ...newNotification, startTime: time })}
                    />
                    <TimePicker
                      label="End Time"
                      value={newNotification.endTime}
                      onChange={(time) => setNewNotification({ ...newNotification, endTime: time })}
                    />
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Label htmlFor="duration">Duration:</Label>
                    <Input
                      id="duration"
                      type="number"
                      min="1"
                      value={newNotification.duration || ''}
                      onChange={(e) => {
                        const value = e.target.value === '' ? '' : Math.max(1, parseInt(e.target.value));
                        setNewNotification({ ...newNotification, duration: value === '' ? undefined : value });
                      }}
                      className={cn(
                        "w-20",
                        isDarkMode ? "bg-gray-900 text-white" : "bg-white text-gray-900"
                      )}
                    />
                    <Select
                      value={newNotification.durationUnit}
                      onValueChange={(value: 'hours' | 'minutes') => setNewNotification({ ...newNotification, durationUnit: value })}
                    >
                      <SelectTrigger className="w-[100px]">
                        <SelectValue placeholder="Unit" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="minutes">Minutes</SelectItem>
                        <SelectItem value="hours">Hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowAddNotification(false)}>Cancel</Button>
                  <Button onClick={addCustomNotification}>Add</Button>
                </div>
              </div>
            ) : (
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-between",
                  isDarkMode
                    ? "bg-gray-900 border-gray-700 hover:bg-gray-800"
                    : "bg-white"
                )}
                onClick={() => setShowAddNotification(true)}
              >
                <span>Add custom alert</span>
                <Plus
                  className={cn(
                    "h-4 w-4",
                    isDarkMode ? "text-orange-500" : "text-orange-600"
                  )}
                />
              </Button>
            )}
          </div>

          {/* Manage */}
          <div
            className={cn(
              "rounded-lg p-4",
              isDarkMode ? "bg-gray-800" : "bg-gray-100"
            )}
          >
            <h3 className="text-lg font-semibold mb-4">Manage</h3>
            <div className="space-y-2">
              <Button
                variant="ghost"
                className="w-full justify-start text-orange-600 hover:text-orange-700 hover:bg-transparent"
              >
                Report a problem
              </Button>
              <AlertDialog open={showDeleteConfirmation} onOpenChange={setShowDeleteConfirmation}>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-transparent"
                  >
                    Delete Device
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete the device and all data associated with it.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction className="bg-red-600 hover:bg-red-700">Delete Device</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

