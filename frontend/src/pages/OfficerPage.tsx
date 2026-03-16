import { useState } from 'react'
import {
  Container,
  Alert,
  Grid,
  Fab,
  Chip,
  useTheme,
  useMediaQuery,
  Snackbar,
  Stack,
} from '@mui/material'
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive'
import type { Ticket } from '../api/types'
import { useAuthStore } from '../stores'
import {
  useWindows,
  useTicketsByWindow,
  useTicketPreview,
  useCallNextTicket,
  useCompleteTicket,
  useNoShowTicket,
  useTransferTicket,
} from '../api/hooks'
import { PageHeader, StatCard, EmptyState } from '../components/shared'
import { CurrentTicketCard, QueuePreviewList, TicketHistoryList, TransferDialog } from '../components/officer'
import PersonIcon from '@mui/icons-material/Person'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import PersonOffIcon from '@mui/icons-material/PersonOff'
import QueueIcon from '@mui/icons-material/Queue'

export function OfficerPage() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  const { name, selectedWindowId } = useAuthStore()
  const windowId = selectedWindowId ?? ''

  const { data: windows = [] } = useWindows()
  const { data: tickets = [] } = useTicketsByWindow(windowId)
  const { data: preview } = useTicketPreview(windowId)

  const callNextMutation = useCallNextTicket()
  const completeMutation = useCompleteTicket()
  const noShowMutation = useNoShowTicket()
  const transferMutation = useTransferTicket()

  const [currentTicket, setCurrentTicket] = useState<Ticket | null>(null)
  const [transferOpen, setTransferOpen] = useState(false)
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false, message: '', severity: 'success',
  })

  const currentWindow = windows.find((w) => w.id === windowId)

  // Stats
  const todayTickets = tickets.filter(
    (t) => new Date(t.createdAt).toDateString() === new Date().toDateString()
  )
  const servedToday = todayTickets.filter((t) => t.status === 3).length
  const noShowToday = todayTickets.filter((t) => t.status === 4).length
  const queueLength = preview?.totalQueueLength ?? 0

  const showNotification = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity })
  }

  const handleCallNext = async () => {
    if (!windowId) return
    const officerId = crypto.randomUUID?.() ?? '00000000-0000-0000-0000-000000000000'
    try {
      const ticket = await callNextMutation.mutateAsync({ windowId, officerId })
      setCurrentTicket(ticket)
      showNotification(`Now serving ${ticket.ticketNumber}`, 'success')
    } catch (e) {
      showNotification(e instanceof Error ? e.message : 'No more tickets in queue', 'error')
    }
  }

  const handleComplete = async () => {
    if (!currentTicket) return
    try {
      await completeMutation.mutateAsync(currentTicket.id)
      showNotification(`${currentTicket.ticketNumber} completed`, 'success')
      setCurrentTicket(null)
    } catch (e) {
      showNotification(e instanceof Error ? e.message : 'Failed to complete', 'error')
    }
  }

  const handleNoShow = async () => {
    if (!currentTicket) return
    try {
      await noShowMutation.mutateAsync(currentTicket.id)
      showNotification(`${currentTicket.ticketNumber} marked as no-show`, 'success')
      setCurrentTicket(null)
    } catch (e) {
      showNotification(e instanceof Error ? e.message : 'Failed to mark no-show', 'error')
    }
  }

  const handleTransfer = async (targetWindowId: string) => {
    if (!currentTicket) return
    try {
      await transferMutation.mutateAsync({ ticketId: currentTicket.id, targetWindowId })
      showNotification(`${currentTicket.ticketNumber} transferred`, 'success')
      setCurrentTicket(null)
      setTransferOpen(false)
    } catch (e) {
      showNotification(e instanceof Error ? e.message : 'Failed to transfer', 'error')
    }
  }

  if (!windowId) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <EmptyState
          icon={<PersonIcon />}
          title="No window assigned"
          description="Please log in again and select a window to start serving."
        />
      </Container>
    )
  }

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, md: 4 } }}>
      <PageHeader
        title="Officer Dashboard"
        subtitle={`Serving at ${currentWindow?.name ?? 'Window'} ${currentWindow?.code ? `(${currentWindow.code})` : ''}`}
        icon={<PersonIcon />}
        action={
          <Chip
            label={name || 'Officer'}
            variant="outlined"
            sx={{ fontWeight: 600 }}
          />
        }
      />

      {/* Stats Row */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 6, sm: 3 }}>
          <StatCard
            title="In Queue"
            value={queueLength}
            icon={<QueueIcon />}
            color={theme.palette.info.main}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <StatCard
            title="Served Today"
            value={servedToday}
            icon={<CheckCircleIcon />}
            color={theme.palette.success.main}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <StatCard
            title="No-Shows"
            value={noShowToday}
            icon={<PersonOffIcon />}
            color={theme.palette.warning.main}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <StatCard
            title="Total Today"
            value={todayTickets.length}
            icon={<NotificationsActiveIcon />}
            color={theme.palette.primary.main}
          />
        </Grid>
      </Grid>

      {/* Main Content */}
      <Grid container spacing={3}>
        {/* Left: Current Ticket */}
        <Grid size={{ xs: 12, md: 7 }}>
          <CurrentTicketCard
            currentTicket={currentTicket}
            loading={callNextMutation.isPending}
            queueLength={queueLength}
            onCallNext={handleCallNext}
            onComplete={handleComplete}
            onNoShow={handleNoShow}
            onTransferOpen={() => setTransferOpen(true)}
            completePending={completeMutation.isPending}
            noShowPending={noShowMutation.isPending}
          />
        </Grid>

        {/* Right: Queue & History */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Stack spacing={3}>
            {preview && <QueuePreviewList nextTickets={preview.nextTickets} />}
            <TicketHistoryList tickets={tickets} />
          </Stack>
        </Grid>
      </Grid>

      {/* FAB for Call Next — visible on mobile when no current ticket */}
      {isMobile && !currentTicket && (
        <Fab
          color="primary"
          variant="extended"
          onClick={handleCallNext}
          disabled={callNextMutation.isPending}
          sx={{
            position: 'fixed',
            bottom: 80,
            right: 16,
            zIndex: theme.zIndex.fab,
          }}
        >
          <NotificationsActiveIcon sx={{ mr: 1 }} />
          {callNextMutation.isPending ? 'Calling...' : 'Call Next'}
        </Fab>
      )}

      {/* Transfer Dialog */}
      <TransferDialog
        open={transferOpen}
        onClose={() => setTransferOpen(false)}
        onTransfer={handleTransfer}
        windows={windows}
        currentWindowId={windowId}
        loading={transferMutation.isPending}
      />

      {/* Notification */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  )
}
