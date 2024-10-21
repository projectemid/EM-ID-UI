"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import EnergyMonitor from "@/components/energy-monitor"

export default function Dashboard() {
  const router = useRouter()

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("isAuthenticated")
    if (!isAuthenticated) {
      router.push("/")
    }
  }, [router])

  return (
    <main className="min-h-screen bg-gray-100">
      <EnergyMonitor />
    </main>
  )
}