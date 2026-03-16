import { Chip } from '@mui/material'
import { tokens } from '../../theme'

interface StatusChipProps {
  status: number
  size?: 'small' | 'medium'
  variant?: 'filled' | 'outlined'
}

export function StatusChip({ status, size = 'small', variant = 'filled' }: StatusChipProps) {
  const label = tokens.status.labels[status] ?? 'Unknown'
  const color = tokens.status.chipColors[status] ?? 'default'

  return (
    <Chip
      label={label}
      color={color}
      size={size}
      variant={variant}
      sx={{ fontWeight: 600 }}
    />
  )
}
