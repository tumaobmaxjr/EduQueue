import { Box, Typography, Paper, Stack, alpha } from '@mui/material'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import type { Window } from '../../api/types'
import { LoadingSkeleton, EmptyState } from '../shared'
import StorefrontIcon from '@mui/icons-material/Storefront'

interface WindowSelectorProps {
  windows: Window[]
  loading: boolean
  selectedId: string | null
  onSelect: (window: Window) => void
}

export function WindowSelector({ windows, loading, selectedId, onSelect }: WindowSelectorProps) {
  if (loading) {
    return <LoadingSkeleton variant="cards" count={4} />
  }

  if (windows.length === 0) {
    return (
      <EmptyState
        icon={<StorefrontIcon />}
        title="No windows available"
        description="There are no active service windows at the moment. Please check back later."
      />
    )
  }

  return (
    <Box>
      <Typography variant="h6" fontWeight={700} sx={{ mb: 0.5 }}>
        Choose a Service Window
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Select the window for the service you need
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
          gap: 2,
        }}
      >
        {windows.map((w) => {
          const isSelected = selectedId === w.id
          return (
            <Paper
              key={w.id}
              onClick={() => onSelect(w)}
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
              <Stack direction="row" alignItems="flex-start" spacing={2}>
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 1.5,
                    bgcolor: isSelected ? 'primary.main' : (theme) => alpha(theme.palette.primary.main, 0.08),
                    color: isSelected ? 'white' : 'primary.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    fontWeight: 800,
                    fontSize: '1rem',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {w.code || w.name.charAt(0)}
                </Box>
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="subtitle1" fontWeight={700} noWrap>
                    {w.name}
                  </Typography>
                  {w.description && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        mt: 0.25,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {w.description}
                    </Typography>
                  )}
                  {w.location && (
                    <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 1 }}>
                      <LocationOnIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
                      <Typography variant="caption" color="text.disabled">
                        {w.location}
                      </Typography>
                    </Stack>
                  )}
                </Box>
              </Stack>
            </Paper>
          )
        })}
      </Box>
    </Box>
  )
}
