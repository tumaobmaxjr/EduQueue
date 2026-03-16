import { Box, Typography, Paper, useTheme } from '@mui/material'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

interface PerformanceChartProps {
  title: string
  subtitle: string
  stats: { name: string; count: number }[]
  color: string
  emptyMessage?: string
}

export function PerformanceChart({
  title,
  subtitle,
  stats,
  color,
  emptyMessage = 'No data available',
}: PerformanceChartProps) {
  const theme = useTheme()

  // Resolve MUI color token to hex
  const resolveColor = (c: string): string => {
    const parts = c.split('.')
    if (parts.length === 2) {
      const palette = (theme.palette as Record<string, any>)[parts[0]]
      if (palette && palette[parts[1]]) return palette[parts[1]]
    }
    return c
  }

  const chartColor = resolveColor(color)

  if (stats.length === 0) {
    return (
      <Paper sx={{ p: 3, height: '100%' }}>
        <Typography variant="subtitle1" fontWeight={700} gutterBottom>
          {title}
        </Typography>
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <Typography variant="body2" color="text.disabled">
            {emptyMessage}
          </Typography>
        </Box>
      </Paper>
    )
  }

  const data = stats.map((item) => ({
    name: item.name.length > 15 ? item.name.slice(0, 15) + '...' : item.name,
    fullName: item.name,
    value: item.count,
  }))

  return (
    <Paper sx={{ p: 3, height: '100%' }}>
      <Typography variant="subtitle1" fontWeight={700} gutterBottom>
        {title}
      </Typography>
      <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
        {subtitle}
      </Typography>
      <Box sx={{ width: '100%', height: Math.max(200, stats.length * 40 + 40) }}>
        <ResponsiveContainer>
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} horizontal={false} />
            <XAxis
              type="number"
              allowDecimals={false}
              tick={{ fontSize: 11, fill: theme.palette.text.secondary }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              type="category"
              dataKey="name"
              width={100}
              tick={{ fontSize: 12, fill: theme.palette.text.primary }}
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
              formatter={(value, _name, props: any) => [
                `${value ?? 0} tickets`,
                props.payload.fullName,
              ]}
            />
            <Bar dataKey="value" fill={chartColor} radius={[0, 4, 4, 0]} maxBarSize={28} />
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  )
}
