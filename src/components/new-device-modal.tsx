// frontend/src/components/NewDeviceModal.tsx

"use client"

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { DialogFooter } from "@/components/ui/dialog"

type DeviceType = 
  | "air_conditioner" 
  | "tablet" 
  | "phone" 
  | "laptop" 
  | "lights" 
  | "console" 
  | "tv" 
  | "monitor" 
  | "computer" 
  | "cooking_appliance" 
  | "speaker" 
  | "other"

interface NewDeviceModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (deviceData: {
    deviceName: string
    averageWatts: number
    deviceType: DeviceType
  }) => void
}

export default function NewDeviceModal({ isOpen, onClose, onConfirm }: NewDeviceModalProps) {
  const [deviceName, setDeviceName] = useState('')
  const [averageWatts, setAverageWatts] = useState('')
  const [deviceType, setDeviceType] = useState<DeviceType | ''>('')

  const handleConfirm = () => {
    if (deviceName && averageWatts && deviceType) {
      onConfirm({
        deviceName,
        averageWatts: parseFloat(averageWatts),
        deviceType: deviceType as DeviceType,
      })
      resetForm()
    }
  }

  const resetForm = () => {
    setDeviceName('')
    setAverageWatts('')
    setDeviceType('')
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>New Device Detected</DialogTitle>
          <DialogDescription>
            A new device has been detected on your network. Please provide some information about it.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="device-name" className="text-right">
              Device Name
            </Label>
            <Input
              id="device-name"
              value={deviceName}
              onChange={(e) => setDeviceName(e.target.value)}
              className="col-span-3"
              placeholder="e.g., Living Room TV"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="average-watts" className="text-right">
              Average Watts
            </Label>
            <Input
              id="average-watts"
              type="number"
              value={averageWatts}
              onChange={(e) => setAverageWatts(e.target.value)}
              className="col-span-3"
              placeholder="e.g., 150"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="device-type" className="text-right">
              Device Type
            </Label>
            <Select 
              value={deviceType} 
              onValueChange={(value: DeviceType) => setDeviceType(value)}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select device type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="air_conditioner">Air Conditioner</SelectItem>
                <SelectItem value="tablet">Tablet</SelectItem>
                <SelectItem value="phone">Phone</SelectItem>
                <SelectItem value="laptop">Laptop</SelectItem>
                <SelectItem value="lights">Lights</SelectItem>
                <SelectItem value="console">Console</SelectItem>
                <SelectItem value="tv">TV</SelectItem>
                <SelectItem value="monitor">Monitor</SelectItem>
                <SelectItem value="computer">Computer</SelectItem>
                <SelectItem value="cooking_appliance">Cooking Appliance</SelectItem>
                <SelectItem value="speaker">Speaker</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleConfirm} 
            disabled={!deviceName || !averageWatts || !deviceType}
          >
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
