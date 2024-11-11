// frontend/src/contexts/EventsContext.tsx

import React, { createContext, useState, useEffect, ReactNode } from 'react'
import { RecentEvent } from '../types'

interface EventsContextType {
  events: RecentEvent[]
  addEvent: (event: RecentEvent) => void
  clearEvents: () => void
}

export const EventsContext = createContext<EventsContextType | undefined>(undefined)

export const EventsProvider = ({ children }: { children: ReactNode }) => {
  const [events, setEvents] = useState<RecentEvent[]>([])

  useEffect(() => {
    const storedEvents = localStorage.getItem('recentEvents')
    if (storedEvents) {
      setEvents(JSON.parse(storedEvents))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('recentEvents', JSON.stringify(events))
  }, [events])

  const addEvent = (event: RecentEvent) => {
    setEvents((prevEvents) => [event, ...prevEvents.slice(0, 9)]) // Keep only the latest 10 events
  }

  const clearEvents = () => {
    setEvents([])
  }

  return (
    <EventsContext.Provider value={{ events, addEvent, clearEvents }}>
      {children}
    </EventsContext.Provider>
  )
}
