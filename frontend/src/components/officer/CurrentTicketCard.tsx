import {
  Box,
  Paper,
  Typography,
  Stack,
  Chip,
  Divider,
  Grid,
  Button,
} from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import PersonOffIcon from '@mui/icons-material/PersonOff'
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive'
import SwapHorizIcon from '@mui/icons-material/SwapHoriz'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import type { Ticket } from '../../api/types'
import { useState, useEffect } from 'react'

interface CurrentTicketCardProps {
  currentTicket: Ticket | null
  loading: boolean
  queueLength: number
  onCallNext: () => void
  onComplete: () => void
  onNoShow: () => void
  onTransferOpen: () => void
  completePending?: boolean
  noShowPending?: boolean
}

function ElapsedTimer({ since }: { since: string }) {
  const [elapsed, setElapsed] = useState('')

  useEffect(() => {
    const update = () => {
      const diff = Date.now() - new Date(since).getTime()
      const mins = Math.floor(diff / 60000)
      const secs = Math.floor((diff % 60000) / 1000)
      setElapsed(`${mins}:${secs.toString().padStart(2, '0')}`)
    }
    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [since])

  return (
    <Stack direction="row" alignItems="center" spacing={0.5}>
      <AccessTimeIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
      <Typography variant="body2" color="text.secondary" fontFamily="monospace" fontWeight={600}>
        {elapsed}
      </Typography>
    </Stack>
  )
}

export function CurrentTicketCard({
  currentTicket,
  loading,
  queueLength,
  onCallNext,
  onComplete,
  onNoShow,
  onTransferOpen,
  completePending = false,
  noShowPending = false,
}: CurrentTicketCardProps) {
  return (
    <Paper sx={{ p: 0, overflow: 'hidden' }}>
      {/* Header */}
      <Box sx={{ p: 3, bgcolor: 'primary.main', color: 'white' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="overline" sx={{ opacity: 0.8, letterSpacing: 1.5 }}>
              Current Status
            </Typography>
            <Typography variant="h4" fontWeight={800}>
              {currentTicket ? 'SERVING' : 'READY'}
            </Typography>
          </Box>
          <Box textAlign="right">
            <Typography variant="overline" sx={{ opacity: 0.8, letterSpacing: 1.5 }}>
              Queue
            </Typography>
            <Typography variant="h4" fontWeight={800}>
              {queueLength}
            </Typography>
          </Box>
        </Stack>
      </Box>

      {/* Body */}
      <Box sx={{ p: 3 }}>
        {currentTicket ? (
          <Box>
            {/* Ticket info */}
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
              <Box>
                <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: 1 }}>
                  Ticket Number
                </Typography>
                <Typography
                  variant="h2"
                  color="primary.main"
                  fontWeight={800}
                  letterSpacing={2}
                  sx={{ lineHeight: 1, fontFamily: 'monospace', fontSize: { xs: '2rem', sm: '3rem' } }}
                >
                  {currentTicket.ticketNumber}
                </Typography>
              </Box>
              <Stack spacing={1} alignItems="flex-end">
                {currentTicket.isPriority && (
                  <Chip label="Priority" color="error" size="small" />
                )}
                {currentTicket.calledAt && <ElapsedTimer since={currentTicket.calledAt} />}
              </Stack>
            </Stack>

            <Divider sx={{ my: 2 }} />

            {/* Client details */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid size={{ xs: 6 }}>
                <Typography variant="caption" color="text.secondary">
                  Client Name
                </Typography>
                <Typography variant="subtitle2" fontWeight={700}>
                  {currentTicket.clientName}
                </Typography>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography variant="caption" color="text.secondary">
                  Purpose
                </Typography>
                <Typography variant="subtitle2" fontWeight={700}>
                  {currentTicket.purposeName}
                </Typography>
              </Grid>
              {currentTicket.studentId && (
                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" color="text.secondary">
                    Student ID
                  </Typography>
                  <Typography variant="subtitle2" fontWeight={700}>
                    {currentTicket.studentId}
                  </Typography>
                </Grid>
              )}
              {currentTicket.yearLevel && (
                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" color="text.secondary">
                    Year Level
                  </Typography>
                  <Typography variant="subtitle2" fontWeight={700}>
                    {currentTicket.yearLevel}
                  </Typography>
                </Grid>
              )}
            </Grid>

            {/* Action buttons */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
              <Button
                variant="contained"
                color="success"
                size="large"
                fullWidth
                onClick={onComplete}
                disabled={completePending}
                startIcon={<CheckCircleIcon />}
                sx={{ py: 1.5 }}
              >
                {completePending ? 'Completing...' : 'Complete'}
              </Button>
              <Button
                variant="outlined"
                color="error"
                size="large"
                onClick={onNoShow}
                disabled={noShowPending}
                startIcon={<PersonOffIcon />}
                sx={{ py: 1.5, minWidth: { sm: 140 } }}
              >
                No-Show
              </Button>
              <Button
                variant="outlined"
                color="info"
                size="large"
                onClick={onTransferOpen}
                startIcon={<SwapHorizIcon />}
                sx={{ py: 1.5, minWidth: { sm: 140 } }}
              >
                Transfer
              </Button>
            </Stack>
          </Box>
        ) : (
          <Box textAlign="center" py={4}>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              {queueLength > 0
                ? `${queueLength} client${queueLength > 1 ? 's' : ''} waiting. Ready to serve?`
                : 'No clients in queue. Waiting for new tickets...'}
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={onCallNext}
              disabled={loading || queueLength === 0}
              startIcon={<NotificationsActiveIcon />}
              sx={{
                px: 5,
                py: 2,
                borderRadius: 3,
                fontWeight: 700,
                fontSize: '1rem',
              }}
            >
              {loading ? 'Calling...' : 'Call Next Ticket'}
            </Button>
          </Box>
        )}
      </Box>
    </Paper>
  )
}
