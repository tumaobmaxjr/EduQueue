import { Box, Typography } from '@mui/material'
import type { ReactNode } from 'react'

interface EmptyStateProps {
  icon: ReactNode
  title: string
  description?: string
  action?: ReactNode
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 8,
        px: 3,
        textAlign: 'center',
      }}
    >
      <Box sx={{ color: 'text.disabled', mb: 2, '& > svg': { fontSize: 56 } }}>
        {icon}
      </Box>
      <Typography variant="h6" color="text.secondary" gutterBottom fontWeight={600}>
        {title}
      </Typography>
      {description && (
        <Typography variant="body2" color="text.disabled" sx={{ maxWidth: 360, mb: action ? 3 : 0 }}>
          {description}
        </Typography>
      )}
      {action && <Box>{action}</Box>}
    </Box>
  )
}
