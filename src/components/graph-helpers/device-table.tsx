// device-table.tsx

"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { processTableData } from "../../utils/data-processing"
import { getIconByClassification } from "@/utils/classificationIconMapping"
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { AggregatedDataEntry, DeviceStatistics } from '@/types/data'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Device, UserData } from '@/context/DataContext'

interface DeviceTableProps {
  // @typescript-eslint/no-explicit-any

  aggregatedData: any[];
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  period: 'week' | 'month' | 'year';
  dateRange: { start: Date; end: Date };

  devices: any[];

  userData: any;
  displayMode: 'kwh' | 'cost';
}

export function DeviceTable({
  aggregatedData,
  period,
  dateRange,
  devices,
  userData,
  displayMode
}: DeviceTableProps) {
  if (!aggregatedData || !devices || !userData) {
    return <div className="text-gray-400">No data available</div>
  }

  const deviceStats = processTableData(
    aggregatedData,
    devices,
    userData.baseRatePerKWh,
    displayMode,
    dateRange // Pass the dateRange here
  )

  return (
    <div className="mt-8">
      <Table>
        <TableHeader>
          <TableRow className="border-gray-800">
            <TableHead className="text-gray-400">Name</TableHead>
            <TableHead className="text-right text-gray-400">
              {displayMode === 'kwh' ? 'kWh' : '$'}
            </TableHead>
            <TableHead className="text-right text-gray-400">% of total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {deviceStats.map((stat) => {
            const device = devices.find((d) => d.deviceId === stat.deviceId)
            return (
              <TableRow key={stat.deviceId} className="border-gray-800">
                <TableCell className="flex items-center gap-2">
                  {getIconByClassification(device?.category || 'other')}
                  {stat.name}
                </TableCell>
                <TableCell className="text-right">
                  {displayMode === 'kwh' ? stat.kwh : `$${stat.cost.toFixed(2)}`}
                </TableCell>
                <TableCell className="text-right">{stat.percentage}%</TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
