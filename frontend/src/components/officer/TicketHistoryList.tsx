import { Box, Typography, Paper, Stack, alpha } from '@mui/material'
import HistoryIcon from '@mui/icons-material/History'
import type { Ticket } from '../../api/types'
import { StatusChip } from '../shared'

interface TicketHistoryListProps {
  tickets: Ticket[]
}

export function TicketHistoryList({ tickets }: TicketHistoryListProps) {
  const processed = tickets
    .filter((t) => t.status === 3 || t.status === 4 || t.status === 5)
    .sort((a, b) => +new Date(b.completedAt ?? b.calledAt ?? b.createdAt) - +new Date(a.completedAt ?? a.calledAt ?? a.createdAt))
    .slice(0, 10)

  return (
    <Paper sx={{ p: 0, overflow: 'hidden' }}>
      <Box
        sx={{
          px: 2.5,
          py: 2,
          bgcolor: (theme) => alpha(theme.palette.grey[500], 0.04),
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          <HistoryIcon fontSize="small" sx={{ color: 'text.secondary' }} />
          <Typography variant="subtitle2" fontWeight={700}>
            Recent History
          </Typography>
        </Stack>
      </Box>

      {processed.length === 0 ? (
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <Typography variant="body2" color="text.disabled">
            No tickets processed yet
          </Typography>
        </Box>
      ) : (
        <Stack>
          {processed.map((t, index) => (
            <Box
              key={t.id}
              sx={{
                px: 2.5,
                py: 1.5,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: index < processed.length - 1 ? '1px solid' : 'none',
                borderColor: 'divider',
              }}
            >
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="body2" fontWeight={700} fontFamily="monospace">
                  {t.ticketNumber}
                </Typography>
                <Typography variant="caption" color="text.secondary" noWrap>
                  {t.clientName}
                </Typography>
              </Box>
              <StatusChip status={t.status} />
            </Box>
          ))}
        </Stack>
      )}
    </Paper>
  )
}
