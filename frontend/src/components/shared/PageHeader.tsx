import { Box, Typography, Stack } from '@mui/material'
import type { ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  subtitle?: string
  icon?: ReactNode
  action?: ReactNode
}

export function PageHeader({ title, subtitle, icon, action }: PageHeaderProps) {
  return (
    <Box sx={{ mb: 4 }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        spacing={2}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {icon && (
            <Box
              sx={{
                color: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                '& > svg': { fontSize: 32 },
              }}
            >
              {icon}
            </Box>
          )}
          <Box>
            <Typography variant="h4" component="h1" fontWeight={800}>
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="body1" color="text.secondary" sx={{ mt: 0.25 }}>
                {subtitle}
              </Typography>
            )}
          </Box>
        </Box>
        {action && <Box>{action}</Box>}
      </Stack>
    </Box>
  )
}
