import { useMemo, useState } from 'react'
import { Box, Button, Grid, Stack, TextField, Typography, Chip } from '@mui/material'
import { CalendarMonth as CalendarIcon, Clear as ClearIcon } from '@mui/icons-material'
import AnalyticsIcon from '@mui/icons-material/Analytics'
import { StatusDistributionChart } from './StatusDistributionChart'
import { DailyActivityChart } from './DailyActivityChart'
import { PerformanceChart } from './PerformanceChart'
import { EmptyState } from '../shared'
import type { Ticket } from '../../api/types'

interface AnalyticsData {
  statusCounts: Record<number, number>
  totalTickets: number
  windowStats: { name: string; count: number }[]
  purposeStats: { name: string; count: number }[]
}

interface AnalyticsTabProps {
  tickets: Ticket[]
  analyticsData: AnalyticsData
  hasTickets: boolean
}

export function AnalyticsTab({ tickets, analyticsData: allTimeData, hasTickets }: AnalyticsTabProps) {
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')

  const hasDateRange = startDate || endDate

  // Filter tickets by date range
  const filteredTickets = useMemo(() => {
    if (!hasDateRange) return tickets

    return tickets.filter((t) => {
      const date = new Date(t.createdAt).toISOString().split('T')[0]
      if (startDate && date < startDate) return false
      if (endDate && date > endDate) return false
      return true
    })
  }, [tickets, startDate, endDate, hasDateRange])

  // Compute analytics from filtered tickets
  const analyticsData = useMemo(() => {
    if (!hasDateRange) return allTimeData

    const statusCounts: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    filteredTickets.forEach((t) => (statusCounts[t.status] = (statusCounts[t.status] || 0) + 1))
    const totalTickets = filteredTickets.length || 1

    const windowCounts: Record<string, { name: string; count: number }> = {}
    filteredTickets.forEach((t) => {
      if (!windowCounts[t.windowId]) windowCounts[t.windowId] = { name: t.windowName, count: 0 }
      windowCounts[t.windowId].count++
    })
    const windowStats = Object.values(windowCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    const purposeCounts: Record<string, { name: string; count: number }> = {}
    filteredTickets.forEach((t) => {
      if (!purposeCounts[t.purposeId])
        purposeCounts[t.purposeId] = { name: t.purposeName, count: 0 }
      purposeCounts[t.purposeId].count++
    })
    const purposeStats = Object.values(purposeCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    return { statusCounts, totalTickets, windowStats, purposeStats }
  }, [filteredTickets, hasDateRange, allTimeData])

  // Compute daily activity data for the chart
  const { dayCounts, monthName, year } = useMemo(() => {
    // Determine which month to show based on date range or current month
    let targetYear: number
    let targetMonth: number

    if (startDate) {
      const d = new Date(startDate + 'T00:00:00')
      targetYear = d.getFullYear()
      targetMonth = d.getMonth()
    } else {
      const now = new Date()
      targetYear = now.getFullYear()
      targetMonth = now.getMonth()
    }

    const daysInMonth = new Date(targetYear, targetMonth + 1, 0).getDate()
    const counts = Array(daysInMonth).fill(0)

    filteredTickets
      .filter((t) => {
        const d = new Date(t.createdAt)
        return d.getFullYear() === targetYear && d.getMonth() === targetMonth
      })
      .forEach((t) => {
        counts[new Date(t.createdAt).getDate() - 1]++
      })

    const name = new Date(targetYear, targetMonth).toLocaleString('default', { month: 'long' })
    return { dayCounts: counts, monthName: name, year: targetYear }
  }, [filteredTickets, startDate])

  const clearDateRange = () => {
    setStartDate('')
    setEndDate('')
  }

  // Quick presets
  const setPreset = (days: number) => {
    const end = new Date()
    const start = new Date()
    start.setDate(end.getDate() - days)
    setStartDate(start.toISOString().split('T')[0])
    setEndDate(end.toISOString().split('T')[0])
  }

  const setThisMonth = () => {
    const now = new Date()
    const start = new Date(now.getFullYear(), now.getMonth(), 1)
    setStartDate(start.toISOString().split('T')[0])
    setEndDate(now.toISOString().split('T')[0])
  }

  const setLastMonth = () => {
    const now = new Date()
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const end = new Date(now.getFullYear(), now.getMonth(), 0)
    setStartDate(start.toISOString().split('T')[0])
    setEndDate(end.toISOString().split('T')[0])
  }

  if (!hasTickets) {
    return (
      <Box sx={{ p: 3 }}>
        <EmptyState
          icon={<AnalyticsIcon />}
          title="No data to analyze"
          description="Analytics will appear once tickets are created"
        />
      </Box>
    )
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Date Range Picker */}
      <Box
        sx={{
          mb: 3,
          p: 2.5,
          bgcolor: 'grey.50',
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }} flexWrap="wrap">
          <Stack direction="row" spacing={0.5} alignItems="center" sx={{ minWidth: 'fit-content' }}>
            <CalendarIcon fontSize="small" color="action" />
            <Typography variant="subtitle2" fontWeight={700}>
              Date Range
            </Typography>
          </Stack>

          <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
            <TextField
              size="small"
              type="date"
              label="From"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ width: 160, bgcolor: 'background.paper' }}
            />
            <Typography variant="body2" color="text.secondary">to</Typography>
            <TextField
              size="small"
              type="date"
              label="To"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ width: 160, bgcolor: 'background.paper' }}
            />
          </Stack>

          <Stack direction="row" spacing={0.5} flexWrap="wrap">
            <Chip label="7 days" size="small" variant="outlined" onClick={() => setPreset(7)} sx={{ cursor: 'pointer' }} />
            <Chip label="30 days" size="small" variant="outlined" onClick={() => setPreset(30)} sx={{ cursor: 'pointer' }} />
            <Chip label="This month" size="small" variant="outlined" onClick={setThisMonth} sx={{ cursor: 'pointer' }} />
            <Chip label="Last month" size="small" variant="outlined" onClick={setLastMonth} sx={{ cursor: 'pointer' }} />
          </Stack>

          {hasDateRange && (
            <Button
              size="small"
              variant="text"
              color="error"
              startIcon={<ClearIcon />}
              onClick={clearDateRange}
              sx={{ minWidth: 'auto' }}
            >
              Clear
            </Button>
          )}
        </Stack>

        {hasDateRange && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            Showing {filteredTickets.length} ticket{filteredTickets.length !== 1 ? 's' : ''} in selected range
            {filteredTickets.length !== tickets.length && ` (out of ${tickets.length} total)`}
          </Typography>
        )}
      </Box>

      <Grid container spacing={3}>
        {/* Status Distribution + Daily Activity */}
        <Grid size={{ xs: 12, md: 5 }}>
          <StatusDistributionChart
            statusCounts={analyticsData.statusCounts}
            totalTickets={analyticsData.totalTickets}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 7 }}>
          <DailyActivityChart
            dayCounts={dayCounts}
            monthName={monthName}
            year={year}
          />
        </Grid>

        {/* Window Performance + Purpose Popularity */}
        <Grid size={{ xs: 12, md: 6 }}>
          <PerformanceChart
            title="Window Performance"
            subtitle={`Top ${analyticsData.windowStats.length} most active windows`}
            stats={analyticsData.windowStats}
            color="primary.main"
            emptyMessage="No window data available"
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <PerformanceChart
            title="Purpose Popularity"
            subtitle={`Top ${analyticsData.purposeStats.length} most requested services`}
            stats={analyticsData.purposeStats}
            color="secondary.dark"
            emptyMessage="No purpose data available"
          />
        </Grid>
      </Grid>
    </Box>
  )
}
