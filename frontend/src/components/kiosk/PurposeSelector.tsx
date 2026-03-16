import { Box, Typography, Paper, alpha } from '@mui/material'
import type { Purpose } from '../../api/types'
import { LoadingSkeleton, EmptyState } from '../shared'
import CategoryIcon from '@mui/icons-material/Category'

interface PurposeSelectorProps {
  purposes: Purpose[]
  loading: boolean
  selectedId: string | null
  onSelect: (purpose: Purpose) => void
  windowName: string
}

export function PurposeSelector({ purposes, loading, selectedId, onSelect, windowName }: PurposeSelectorProps) {
  if (loading) {
    return <LoadingSkeleton variant="cards" count={3} />
  }

  if (purposes.length === 0) {
    return (
      <EmptyState
        icon={<CategoryIcon />}
        title="No purposes available"
        description={`There are no services configured for ${windowName} at the moment.`}
      />
    )
  }

  return (
    <Box>
      <Typography variant="h6" fontWeight={700} sx={{ mb: 0.5 }}>
        What do you need?
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Select your purpose of visit at <strong>{windowName}</strong>
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
          gap: 2,
        }}
      >
        {purposes.map((p) => {
          const isSelected = selectedId === p.id
          return (
            <Paper
              key={p.id}
              onClick={() => onSelect(p)}
              sx={{
                p: 2.5,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                borderColor: isSelected ? 'primary.main' : 'divider',
                borderWidth: isSelected ? 2 : 1,
                bgcolor: isSelected ? (theme) => alpha(theme.palette.primary.main, 0.04) : 'background.paper',
                '&:hover': {
                  borderColor: 'primary.light',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                  transform: 'translateY(-2px)',
                },
                '&:active': {
                  transform: 'translateY(0)',
                },
              }}
            >
              <Typography variant="subtitle1" fontWeight={700}>
                {p.name}
              </Typography>
              {p.description && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    mt: 0.5,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {p.description}
                </Typography>
              )}
            </Paper>
          )
        })}
      </Box>
    </Box>
  )
}
