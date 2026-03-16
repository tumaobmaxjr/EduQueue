import { Box, Typography, Stack, Paper, Chip, alpha, Button, CircularProgress, Grid } from '@mui/material'
import QueueIcon from '@mui/icons-material/Queue'
import PriorityHighIcon from '@mui/icons-material/PriorityHigh'
import PersonOffIcon from '@mui/icons-material/PersonOff'
import RefreshIcon from '@mui/icons-material/Refresh'
import type { TicketPreviewItem } from '../../api/types'

interface QueuePreviewListProps {
  nextTickets: TicketPreviewItem[]
  onRecall?: (ticketId: string) => void
  recallPending?: boolean
}

export function QueuePreviewList({ nextTickets, onRecall, recallPending }: QueuePreviewListProps) {
  // Separate into Priority, Regular, and No-Show queues
  const priorityQueue = nextTickets.filter((t) => t.isPriority && !t.isNoShow)
  const regularQueue = nextTickets.filter((t) => !t.isPriority && !t.isNoShow)
  const noShowQueue = nextTickets.filter((t) => t.isNoShow)

  const totalQueued = priorityQueue.length + regularQueue.length

  return (
    <Paper sx={{ p: 0, overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box
        sx={{
          px: 2,
          py: 1.5,
          bgcolor: (theme) => alpha(theme.palette.info.main, 0.05),
          borderBottom: '1px solid',
          borderColor: 'divider',
          flexShrink: 0,
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={1}>
            <QueueIcon fontSize="small" color="info" />
            <Typography variant="subtitle2" fontWeight={700}>
              Queue Preview
            </Typography>
          </Stack>
          <Stack direction="row" spacing={0.5}>
            <Chip
              label={`${totalQueued} queued`}
              size="small"
              color="info"
              variant="filled"
            />
            {noShowQueue.length > 0 && (
              <Chip
                label={`${noShowQueue.length} no-show`}
                size="small"
                color="warning"
                variant="filled"
              />
            )}
          </Stack>
        </Stack>
      </Box>

      {/* Three Column Layout */}
      <Box sx={{ flex: 1, overflow: 'hidden', p: 1.5 }}>
        {nextTickets.length === 0 ? (
          <Box sx={{ py: 4, textAlign: 'center', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="body2" color="text.disabled">
              Queue is empty
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={1.5} sx={{ height: '100%' }}>
            {/* Priority Column */}
            <Grid size={{ xs: 12, sm: 4 }} sx={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
              <QueueColumn
                title="Priority"
                tickets={priorityQueue}
                color="error"
                icon={<PriorityHighIcon sx={{ fontSize: 14 }} />}
              />
            </Grid>

            {/* Regular Column */}
            <Grid size={{ xs: 12, sm: 4 }} sx={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
              <QueueColumn
                title="Regular"
                tickets={regularQueue}
                color="primary"
                icon={<QueueIcon sx={{ fontSize: 14 }} />}
              />
            </Grid>

            {/* No-Show Column */}
            <Grid size={{ xs: 12, sm: 4 }} sx={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
              <NoShowColumn
                tickets={noShowQueue}
                onRecall={onRecall}
                recallPending={recallPending}
              />
            </Grid>
          </Grid>
        )}
      </Box>
    </Paper>
  )
}

/* ─────────────────────────────────────────────────────────
   Queue Column Component (Priority or Regular)
   ───────────────────────────────────────────────────────── */

interface QueueColumnProps {
  title: string
  tickets: TicketPreviewItem[]
  color: 'error' | 'primary'
  icon: React.ReactNode
}

function QueueColumn({ title, tickets, color, icon }: QueueColumnProps) {
  return (
    <Paper
      variant="outlined"
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        borderColor: (theme) => alpha(theme.palette[color].main, 0.3),
      }}
    >
      {/* Column Header */}
      <Box
        sx={{
          px: 1.5,
          py: 1,
          bgcolor: (theme) => alpha(theme.palette[color].main, 0.08),
          borderBottom: '1px solid',
          borderColor: 'divider',
          flexShrink: 0,
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={0.5}>
            {icon}
            <Typography variant="caption" fontWeight={700} color={`${color}.main`}>
              {title}
            </Typography>
          </Stack>
          <Chip
            label={tickets.length}
            size="small"
            color={color}
            sx={{ height: 18, minWidth: 24, fontSize: '0.7rem', '& .MuiChip-label': { px: 0.75 } }}
          />
        </Stack>
      </Box>

      {/* Ticket List */}
      <Box sx={{ flex: 1, overflowY: 'auto' }}>
        {tickets.length === 0 ? (
          <Box sx={{ py: 2, textAlign: 'center' }}>
            <Typography variant="caption" color="text.disabled">
              Empty
            </Typography>
          </Box>
        ) : (
          <Stack>
            {tickets.map((t, index) => (
              <Box
                key={t.id}
                sx={{
                  px: 1.5,
                  py: 0.75,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  bgcolor: index === 0 ? (theme) => alpha(theme.palette[color].main, 0.06) : 'transparent',
                  '&:last-child': { borderBottom: 'none' },
                }}
              >
                <Box
                  sx={{
                    width: 20,
                    height: 20,
                    borderRadius: 0.5,
                    bgcolor: index === 0 ? `${color}.main` : 'grey.200',
                    color: index === 0 ? 'white' : 'text.secondary',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  {index + 1}
                </Box>
                <Typography
                  variant="caption"
                  fontWeight={700}
                  fontFamily="monospace"
                  color={`${color}.main`}
                  noWrap
                >
                  {t.ticketNumber}
                </Typography>
              </Box>
            ))}
          </Stack>
        )}
      </Box>
    </Paper>
  )
}

/* ─────────────────────────────────────────────────────────
   No-Show Column Component (with Recall button)
   ───────────────────────────────────────────────────────── */

interface NoShowColumnProps {
  tickets: TicketPreviewItem[]
  onRecall?: (ticketId: string) => void
  recallPending?: boolean
}

function NoShowColumn({ tickets, onRecall, recallPending }: NoShowColumnProps) {
  return (
    <Paper
      variant="outlined"
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        borderColor: (theme) => alpha(theme.palette.warning.main, 0.3),
      }}
    >
      {/* Column Header */}
      <Box
        sx={{
          px: 1.5,
          py: 1,
          bgcolor: (theme) => alpha(theme.palette.warning.main, 0.12),
          borderBottom: '1px solid',
          borderColor: 'divider',
          flexShrink: 0,
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <PersonOffIcon sx={{ fontSize: 14, color: 'warning.dark' }} />
            <Typography variant="caption" fontWeight={700} color="warning.dark">
              No-Show
            </Typography>
          </Stack>
          <Chip
            label={tickets.length}
            size="small"
            color="warning"
            sx={{ height: 18, minWidth: 24, fontSize: '0.7rem', '& .MuiChip-label': { px: 0.75 } }}
          />
        </Stack>
      </Box>

      {/* No-Show Ticket List */}
      <Box sx={{ flex: 1, overflowY: 'auto' }}>
        {tickets.length === 0 ? (
          <Box sx={{ py: 2, textAlign: 'center' }}>
            <Typography variant="caption" color="text.disabled">
              None
            </Typography>
          </Box>
        ) : (
          <Stack>
            {tickets.map((t) => (
              <Box
                key={t.id}
                sx={{
                  px: 1.5,
                  py: 0.75,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 0.5,
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  bgcolor: (theme) => alpha(theme.palette.warning.main, 0.06),
                  '&:last-child': { borderBottom: 'none' },
                }}
              >
                <Stack direction="row" alignItems="center" spacing={0.5} sx={{ minWidth: 0 }}>
                  <Typography
                    variant="caption"
                    fontWeight={700}
                    fontFamily="monospace"
                    color="warning.dark"
                    noWrap
                  >
                    {t.ticketNumber}
                  </Typography>
                  {t.isPriority && (
                    <Chip
                      label="P"
                      size="small"
                      color="error"
                      sx={{ height: 16, minWidth: 16, fontSize: '0.6rem', '& .MuiChip-label': { px: 0.5 } }}
                    />
                  )}
                </Stack>
                {onRecall && (
                  <Button
                    size="small"
                    variant="contained"
                    color="warning"
                    onClick={() => onRecall(t.id)}
                    disabled={recallPending}
                    sx={{
                      minWidth: 'auto',
                      px: 1,
                      py: 0.25,
                      fontSize: '0.65rem',
                      fontWeight: 600,
                      lineHeight: 1.5,
                    }}
                  >
                    {recallPending ? <CircularProgress size={12} color="inherit" /> : 'Recall'}
                  </Button>
                )}
              </Box>
            ))}
          </Stack>
        )}
      </Box>
    </Paper>
  )
}
