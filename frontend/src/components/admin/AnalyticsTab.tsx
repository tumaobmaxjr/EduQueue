import { Box, Grid } from '@mui/material'
import AnalyticsIcon from '@mui/icons-material/Analytics'
import { StatusDistributionChart } from './StatusDistributionChart'
import { DailyActivityChart } from './DailyActivityChart'
import { PerformanceChart } from './PerformanceChart'
import { EmptyState } from '../shared'

interface AnalyticsData {
  statusCounts: Record<number, number>
  totalTickets: number
  dayCounts: number[]
  windowStats: { name: string; count: number }[]
  purposeStats: { name: string; count: number }[]
}

interface AnalyticsTabProps {
  analyticsData: AnalyticsData
  hasTickets: boolean
  monthName: string
  year: number
}

export function AnalyticsTab({ analyticsData, hasTickets, monthName, year }: AnalyticsTabProps) {
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
            dayCounts={analyticsData.dayCounts}
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
