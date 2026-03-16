import { Box, Typography, Paper, useTheme } from '@mui/material'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'

interface DailyActivityChartProps {
  dayCounts: number[]
  monthName: string
  year: number
}

export function DailyActivityChart({ dayCounts, monthName, year }: DailyActivityChartProps) {
  const theme = useTheme()
  const todayIndex = new Date().getDate() - 1

  const data = dayCounts.map((count, index) => ({
    day: index + 1,
    tickets: count,
    isToday: index === todayIndex,
  }))

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="subtitle1" fontWeight={700} gutterBottom>
        {monthName} {year} Activity
      </Typography>
      <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
        Tickets created per day
      </Typography>
      <Box sx={{ width: '100%', height: 250 }}>
        <ResponsiveContainer>
          <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} vertical={false} />
            <XAxis
              dataKey="day"
              tick={{ fontSize: 11, fill: theme.palette.text.secondary }}
              tickLine={false}
              axisLine={{ stroke: theme.palette.divider }}
              interval={1}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fontSize: 11, fill: theme.palette.text.secondary }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                borderRadius: 8,
                border: `1px solid ${theme.palette.divider}`,
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                fontSize: '0.8125rem',
              }}
              formatter={(value) => [`${value ?? 0} tickets`, 'Count']}
              labelFormatter={(label) => `Day ${label}`}
            />
            <Bar dataKey="tickets" radius={[3, 3, 0, 0]} maxBarSize={24}>
              {data.map((entry, index) => (
                <Cell
                  key={index}
                  fill={
                    entry.isToday
                      ? theme.palette.primary.main
                      : theme.palette.info.light
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  )
}
