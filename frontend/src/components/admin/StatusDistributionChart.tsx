import { Box, Typography, Paper, useTheme } from '@mui/material'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts'
import { tokens } from '../../theme'

interface StatusDistributionChartProps {
  statusCounts: Record<number, number>
  totalTickets: number
}

const STATUS_CHART_COLORS: Record<number, string> = {
  0: '#1E88E5', // Queued
  1: '#FB8C00', // Called
  2: '#1B5E20', // Serving
  3: '#4CAF50', // Completed
  4: '#E53935', // No-show
  5: '#9E9E9E', // Transferred
}

export function StatusDistributionChart({ statusCounts, totalTickets }: StatusDistributionChartProps) {
  const theme = useTheme()

  const data = Object.entries(statusCounts)
    .map(([status, count]) => ({
      name: tokens.status.labels[parseInt(status)] ?? 'Unknown',
      value: count,
      color: STATUS_CHART_COLORS[parseInt(status)] ?? theme.palette.grey[400],
    }))
    .filter((d) => d.value > 0)

  if (data.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="body2" color="text.disabled">No status data</Typography>
      </Paper>
    )
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="subtitle1" fontWeight={700} gutterBottom>
        Status Distribution
      </Typography>
      <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
        {totalTickets} total tickets
      </Typography>
      <Box sx={{ width: '100%', height: 280 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={3}
              dataKey="value"
              strokeWidth={0}
            >
              {data.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                borderRadius: 8,
                border: `1px solid ${theme.palette.divider}`,
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                fontSize: '0.8125rem',
              }}
              formatter={(value) => [`${value ?? 0} (${((Number(value ?? 0) / totalTickets) * 100).toFixed(1)}%)`, '']}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              iconType="circle"
              iconSize={10}
              formatter={(value) => (
                <span style={{ color: theme.palette.text.secondary, fontSize: '0.8125rem' }}>
                  {value}
                </span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  )
}
