import React from 'react'
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

interface TimePickerProps {
  label: string
  value?: string
  onChange: (time: string) => void
}

export function TimePicker({ label, value, onChange }: TimePickerProps) {
  return (
    <div className="flex flex-col space-y-1">
      <Label htmlFor={label.toLowerCase().replace(' ', '-')}>{label}</Label>
      <Input
        type="time"
        id={label.toLowerCase().replace(' ', '-')}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}

