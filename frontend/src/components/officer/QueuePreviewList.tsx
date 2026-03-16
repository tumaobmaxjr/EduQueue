import { Box, Typography, Stack, Paper, Chip, alpha } from '@mui/material'
import QueueIcon from '@mui/icons-material/Queue'
import PriorityHighIcon from '@mui/icons-material/PriorityHigh'

interface NextTicket {
  ticketNumber: string
  isPriority: boolean
  position: number
}

interface QueuePreviewListProps {
  nextTickets: NextTicket[]
}

export function QueuePreviewList({ nextTickets }: QueuePreviewListProps) {
  return (
    <Paper sx={{ p: 0, overflow: 'hidden' }}>
      <Box
        sx={{
          px: 2.5,
          py: 2,
          bgcolor: (theme) => alpha(theme.palette.info.main, 0.05),
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={1}>
            <QueueIcon fontSize="small" color="info" />
            <Typography variant="subtitle2" fontWeight={700}>
              Up Next
            </Typography>
          </Stack>
          <Chip
            label={`${nextTickets.length} waiting`}
            size="small"
            variant="outlined"
            color="info"
          />
        </Stack>
      </Box>

      {nextTickets.length === 0 ? (
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <Typography variant="body2" color="text.disabled">
            Queue is empty
          </Typography>
        </Box>
      ) : (
        <Stack>
          {nextTickets.map((t, index) => (
            <Box
              key={t.ticketNumber}
              sx={{
                px: 2.5,
                py: 1.5,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: index < nextTickets.length - 1 ? '1px solid' : 'none',
                borderColor: 'divider',
                transition: 'background 0.15s',
                '&:hover': { bgcolor: 'action.hover' },
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <Box
                  sx={{
                    width: 28,
                    height: 28,
                    borderRadius: 1,
                    bgcolor: index === 0 ? 'primary.main' : 'grey.100',
                    color: index === 0 ? 'white' : 'text.secondary',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                  }}
                >
                  {t.position}
                </Box>
                <Typography
                  variant="body2"
                  fontWeight={700}
                  fontFamily="monospace"
                  letterSpacing={0.5}
                >
                  {t.ticketNumber}
                </Typography>
              </Stack>
              {t.isPriority && (
                <Chip
                  icon={<PriorityHighIcon sx={{ fontSize: 14 }} />}
                  label="Priority"
                  size="small"
                  color="error"
                  variant="outlined"
                  sx={{ height: 24 }}
                />
              )}
            </Box>
          ))}
        </Stack>
      )}
    </Paper>
  )
}
