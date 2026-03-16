import { Box, Typography, Grid, Paper, Stack, Chip, alpha, useTheme, Container } from '@mui/material'
import { useWindows, useTickets } from '../api/hooks'
import type { Ticket } from '../api/types'
import { useMemo, useEffect } from 'react'

export function DisplayPage() {
  const theme = useTheme()
  const { data: windows = [] } = useWindows()
  const { data: tickets = [] } = useTickets()

  // Hide cursor after inactivity (for kiosk mode)
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>
    const hide = () => {
      document.body.style.cursor = 'none'
    }
    const show = () => {
      document.body.style.cursor = 'default'
      clearTimeout(timeout)
      timeout = setTimeout(hide, 5000)
    }
    document.addEventListener('mousemove', show)
    timeout = setTimeout(hide, 5000)
    return () => {
      clearTimeout(timeout)
      document.removeEventListener('mousemove', show)
      document.body.style.cursor = 'default'
    }
  }, [])

  // Build a map: windowId -> currently serving ticket
  const servingByWindow = useMemo(() => {
    const map: Record<string, Ticket | null> = {}
    windows.forEach((w) => {
      map[w.id] = null
    })
    // Find tickets that are currently being served (status 2 = Serving or 1 = Called)
    tickets.forEach((t) => {
      if (t.status === 2 || t.status === 1) {
        // Keep the most recently called ticket per window
        const existing = map[t.windowId]
        if (
          !existing ||
          new Date(t.calledAt ?? t.createdAt).getTime() >
            new Date(existing.calledAt ?? existing.createdAt).getTime()
        ) {
          map[t.windowId] = t
        }
      }
    })
    return map
  }, [windows, tickets])

  // Next up tickets across all windows (queued, next 8)
  const nextUp = useMemo(() => {
    return tickets
      .filter((t) => t.status === 0)
      .sort((a, b) => {
        // Priority first, then by creation time
        if (a.isPriority !== b.isPriority) return a.isPriority ? -1 : 1
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      })
      .slice(0, 8)
  }, [tickets])

  // Statistics - simplified
  const stats = useMemo(() => {
    return {
      // Remove all stats calculations since we removed the cards
    }
  }, [tickets, windows, servingByWindow])

  const activeWindows = windows.filter((w) => w.isActive)

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Header - Consistent with main page */}
      <Box
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
          py: { xs: 3, sm: 4 },
          px: 2,
        }}
      >
        <Container maxWidth="xl">
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h4" fontWeight={800} gutterBottom>
                Queue Display
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Visayas State University - Real-time Queue Status
              </Typography>
            </Box>
            <Box textAlign="right">
              <Typography variant="h4" fontWeight={700} fontFamily="monospace">
                {new Date().toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                })}
              </Typography>
            </Box>
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ py: { xs: 3, sm: 4 } }}>

        {/* Now Serving Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" fontWeight={700} gutterBottom color="text.primary">
            Now Serving
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Current tickets being served at each service window
          </Typography>
          
          <Grid container spacing={3}>
            {activeWindows.map((w) => {
              const serving = servingByWindow[w.id]
              const isActive = !!serving

              return (
                <Grid key={w.id} item xs={12} sm={6} md={4} lg={3}>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 0,
                      overflow: 'hidden',
                      height: '100%',
                      bgcolor: isActive 
                        ? alpha(theme.palette.success.main, 0.02) 
                        : 'background.paper',
                      borderColor: isActive 
                        ? theme.palette.success.main 
                        : 'divider',
                      borderWidth: isActive ? 2 : 1,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        boxShadow: theme.shadows[4],
                      },
                    }}
                  >
                    {/* Window Header */}
                    <Box
                      sx={{
                        px: 3,
                        py: 2,
                        bgcolor: isActive
                          ? alpha(theme.palette.success.main, 0.08)
                          : alpha(theme.palette.grey[500], 0.04),
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                      }}
                    >
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="h6" fontWeight={700}>
                          {w.name}
                        </Typography>
                        <Chip
                          label={isActive ? 'Active' : 'Idle'}
                          size="small"
                          color={isActive ? 'success' : 'default'}
                          sx={{
                            fontWeight: 600,
                            fontSize: '0.75rem',
                          }}
                        />
                      </Stack>
                      {w.location && (
                        <Typography variant="caption" color="text.secondary">
                          {w.location}
                        </Typography>
                      )}
                    </Box>

                    {/* Ticket Content */}
                    <Box sx={{ p: 3, textAlign: 'center', minHeight: 120 }}>
                      {isActive ? (
                        <Box>
                          <Typography
                            variant="h3"
                            fontWeight={800}
                            fontFamily="monospace"
                            letterSpacing={2}
                            color={serving?.isPriority ? 'error.main' : 'success.main'}
                            gutterBottom
                          >
                            {serving?.ticketNumber}
                          </Typography>
                          <Typography
                            variant="subtitle1"
                            fontWeight={600}
                            color="text.primary"
                            gutterBottom
                          >
                            {serving?.clientName}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            {serving?.purposeName}
                          </Typography>
                          {serving?.isPriority && (
                            <Chip
                              label="PRIORITY"
                              size="small"
                              color="error"
                              sx={{
                                mt: 1,
                                fontWeight: 700,
                                fontSize: '0.7rem',
                              }}
                            />
                          )}
                        </Box>
                      ) : (
                        <Box sx={{ py: 3 }}>
                          <Typography
                            variant="h2"
                            sx={{ 
                              color: theme.palette.grey[300], 
                              fontWeight: 300,
                              fontSize: '3rem'
                            }}
                          >
                            --
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Waiting for next customer
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Paper>
                </Grid>
              )
            })}
          </Grid>
        </Box>

        {/* Next Up Section */}
        {nextUp.length > 0 && (
          <Box>
            <Typography variant="h5" fontWeight={700} gutterBottom color="text.primary">
              Next in Queue
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Upcoming tickets to be called
            </Typography>
            
            <Paper 
              variant="outlined"
              sx={{ 
                p: 3,
                bgcolor: alpha(theme.palette.primary.main, 0.02),
                borderColor: alpha(theme.palette.primary.main, 0.2),
              }}
            >
              <Grid container spacing={2}>
                {nextUp.map((t, index) => (
                  <Grid key={t.id} item xs={6} sm={4} md={3} lg={1.5}>
                    <Paper
                      sx={{
                        p: 2,
                        textAlign: 'center',
                        bgcolor: t.isPriority 
                          ? alpha(theme.palette.error.main, 0.08)
                          : alpha(theme.palette.primary.main, 0.04),
                        border: '1px solid',
                        borderColor: t.isPriority 
                          ? alpha(theme.palette.error.main, 0.2)
                          : alpha(theme.palette.primary.main, 0.2),
                      }}
                    >
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        display="block"
                        gutterBottom
                      >
                        #{index + 1}
                      </Typography>
                      <Typography
                        variant="h6"
                        fontFamily="monospace"
                        fontWeight={700}
                        color={t.isPriority ? 'error.main' : 'primary.main'}
                        gutterBottom
                      >
                        {t.ticketNumber}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {t.windowName}
                      </Typography>
                      {t.isPriority && (
                        <Chip
                          label="PRIORITY"
                          size="small"
                          color="error"
                          sx={{
                            mt: 0.5,
                            fontSize: '0.6rem',
                            height: 16,
                            '& .MuiChip-label': { px: 1 }
                          }}
                        />
                      )}
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Box>
        )}

        {/* Empty State */}
        {activeWindows.every(w => !servingByWindow[w.id]) && nextUp.length === 0 && (
          <Paper 
            sx={{ 
              p: 6, 
              textAlign: 'center',
              bgcolor: alpha(theme.palette.grey[500], 0.02),
            }}
          >
            <Typography variant="h5" color="text.secondary" gutterBottom>
              No Active Queue
            </Typography>
            <Typography variant="body2" color="text.disabled">
              All service windows are currently idle. New tickets will appear here when customers join the queue.
            </Typography>
          </Paper>
        )}
      </Container>
    </Box>
  )
}