import { useCallback, useMemo, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Chip,
  Collapse,
  Container,
  Divider,
  Fab,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Stack,
  Tab,
  TablePagination,
  Tabs,
  TextField,
  Typography,
  useTheme,
  useMediaQuery,
} from '@mui/material'
import {
  Person as PersonIcon,
  CheckCircle as CheckCircleIcon,
  PersonOff as PersonOffIcon,
  Queue as QueueIcon,
  NotificationsActive as NotificationsActiveIcon,
  Logout as LogoutIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Clear as ClearIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  History as HistoryIcon,
  AccessTime as TimeIcon,
  ConfirmationNumber as TicketIcon,
} from '@mui/icons-material'
import type { Ticket } from '../api/types'
import { useAuthStore } from '../stores'
import {
  useWindows,
  useTicketsByWindow,
  useTicketPreview,
  useCallNextTicket,
  useCompleteTicket,
  useNoShowTicket,
  useRecallTicket,
  useTransferTicket,
} from '../api/hooks'
import { PageHeader, StatCard, StatusChip, EmptyState } from '../components/shared'
import { CurrentTicketCard, QueuePreviewList, TransferDialog } from '../components/officer'
import { useNavigate } from 'react-router-dom'
import { tokens } from '../theme'

// Status options for filter dropdown
const STATUS_OPTIONS = [
  { value: -1, label: 'All Statuses' },
  { value: 0, label: 'Queued' },
  { value: 1, label: 'Called' },
  { value: 2, label: 'Serving' },
  { value: 3, label: 'Completed' },
  { value: 4, label: 'No-show' },
  { value: 5, label: 'Transferred' },
]

export function OfficerPage() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const navigate = useNavigate()
  const { name, selectedWindowId, logout } = useAuthStore()
  const windowId = selectedWindowId ?? ''

  const { data: windows = [], refetch: refetchWindows } = useWindows()
  const { data: tickets = [], refetch: refetchTickets } = useTicketsByWindow(windowId)
  const { data: preview, refetch: refetchPreview } = useTicketPreview(windowId)

  const callNextMutation = useCallNextTicket()
  const completeMutation = useCompleteTicket()
  const noShowMutation = useNoShowTicket()
  const recallMutation = useRecallTicket()
  const transferMutation = useTransferTicket()

  const [currentTicket, setCurrentTicket] = useState<Ticket | null>(null)
  const [transferOpen, setTransferOpen] = useState(false)
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false, message: '', severity: 'success',
  })

  // Tab state
  const [tabValue, setTabValue] = useState(0)

  // History filters
  const [historySearch, setHistorySearch] = useState('')
  const [historyStatusFilter, setHistoryStatusFilter] = useState<number>(-1)
  const [historyDateFilter, setHistoryDateFilter] = useState<string>('')
  const [showFilters, setShowFilters] = useState(false)

  // History pagination
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(25)

  // Expanded ticket row
  const [expandedTicketId, setExpandedTicketId] = useState<string | null>(null)

  const currentWindow = windows.find((w) => w.id === windowId)

  // Stats
  const todayTickets = tickets.filter(
    (t) => new Date(t.createdAt).toDateString() === new Date().toDateString()
  )
  const servedToday = todayTickets.filter((t) => t.status === 3).length
  const noShowToday = todayTickets.filter((t) => t.status === 4).length
  const queueLength = preview?.totalQueueLength ?? 0

  // Filtered history tickets
  const filteredHistory = useMemo(() => {
    let filtered = [...tickets].sort(
      (a, b) => +new Date(b.completedAt ?? b.calledAt ?? b.createdAt) - +new Date(a.completedAt ?? a.calledAt ?? a.createdAt)
    )

    // Text search
    if (historySearch.trim()) {
      const q = historySearch.toLowerCase()
      filtered = filtered.filter(
        (t) =>
          t.ticketNumber.toLowerCase().includes(q) ||
          (t.clientName && t.clientName.toLowerCase().includes(q)) ||
          t.purposeName.toLowerCase().includes(q) ||
          (t.studentId && t.studentId.toLowerCase().includes(q))
      )
    }

    // Status filter
    if (historyStatusFilter !== -1) {
      filtered = filtered.filter((t) => t.status === historyStatusFilter)
    }

    // Date filter
    if (historyDateFilter) {
      filtered = filtered.filter(
        (t) => new Date(t.createdAt).toISOString().split('T')[0] === historyDateFilter
      )
    }

    return filtered
  }, [tickets, historySearch, historyStatusFilter, historyDateFilter])

  const paginatedHistory = useMemo(
    () => filteredHistory.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [filteredHistory, page, rowsPerPage]
  )

  const hasActiveFilters = historySearch || historyStatusFilter !== -1 || historyDateFilter

  const clearAllFilters = useCallback(() => {
    setHistorySearch('')
    setHistoryStatusFilter(-1)
    setHistoryDateFilter('')
    setPage(0)
  }, [])

  const showNotification = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity })
  }

  const handleRefresh = () => {
    refetchWindows()
    refetchTickets()
    refetchPreview()
  }

  const handleLogout = () => {
    logout()
    navigate('/')
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

  const handleRecall = async (ticketId: string) => {
    const officerId = crypto.randomUUID?.() ?? '00000000-0000-0000-0000-000000000000'
    try {
      const ticket = await recallMutation.mutateAsync({ ticketId, officerId })
      setCurrentTicket(ticket)
      showNotification(`Recalled ${ticket.ticketNumber}`, 'success')
    } catch (e) {
      showNotification(e instanceof Error ? e.message : 'Failed to recall ticket', 'error')
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

  const toggleExpandTicket = (ticketId: string) => {
    setExpandedTicketId((prev) => (prev === ticketId ? null : ticketId))
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
    <Container maxWidth="xl" sx={{ height: '100%', display: 'flex', flexDirection: 'column', py: { xs: 2, md: 3 }, overflow: 'hidden' }}>
      {/* Header with Logout */}
      <Box sx={{ flexShrink: 0 }}>
        <PageHeader
          title="Officer Dashboard"
          subtitle={`Serving at ${currentWindow?.name ?? 'Window'} ${currentWindow?.code ? `(${currentWindow.code})` : ''}`}
          icon={<PersonIcon />}
          action={
            <Stack direction="row" spacing={1} alignItems="center">
              <Button variant="outlined" startIcon={<RefreshIcon />} onClick={handleRefresh} size={isMobile ? 'small' : 'medium'}>
                Refresh
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<LogoutIcon />}
                onClick={handleLogout}
                size={isMobile ? 'small' : 'medium'}
              >
                {isMobile ? 'Logout' : `Logout${name ? ` (${name})` : ''}`}
              </Button>
            </Stack>
          }
        />

        {/* Stats Row */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
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
      </Box>

      {/* Tabbed Content */}
      <Paper sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}>
        <Box sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
          <Tabs
            value={tabValue}
            onChange={(_, v) => setTabValue(v)}
            variant={isMobile ? 'scrollable' : 'standard'}
            scrollButtons="auto"
            sx={{ px: 2 }}
          >
            <Tab label="Serving" icon={<NotificationsActiveIcon fontSize="small" />} iconPosition="start" />
            <Tab label="Ticket History" icon={<HistoryIcon fontSize="small" />} iconPosition="start" />
          </Tabs>
        </Box>

        {/* TAB 0: Serving (Current Ticket + Queue Preview) */}
        <Box role="tabpanel" hidden={tabValue !== 0} sx={{ flex: 1, overflowY: 'auto', display: tabValue === 0 ? 'block' : 'none' }}>
          {tabValue === 0 && (
            <Box sx={{ p: { xs: 2, md: 3 }, height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Grid container spacing={3} sx={{ flex: 1 }}>
                {/* Left: Current Ticket */}
                <Grid size={{ xs: 12, md: 7 }} sx={{ display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
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
                  </Box>
                </Grid>

                {/* Right: Queue Preview */}
                <Grid size={{ xs: 12, md: 5 }} sx={{ display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    {preview && (
                      <QueuePreviewList
                        nextTickets={preview.nextTickets}
                        onRecall={handleRecall}
                        recallPending={recallMutation.isPending}
                      />
                    )}
                  </Box>
                </Grid>
              </Grid>
            </Box>
          )}
        </Box>

        {/* TAB 1: Ticket History (matches Admin Ticket Log) */}
        <Box role="tabpanel" hidden={tabValue !== 1} sx={{ flex: 1, flexDirection: 'column', minHeight: 0, display: tabValue === 1 ? 'flex' : 'none' }}>
          {tabValue === 1 && (
            <>
              {tickets.length === 0 ? (
                <Box sx={{ flex: 1, overflowY: 'auto' }}>
                  <EmptyState
                    icon={<TicketIcon />}
                    title="No tickets yet"
                    description="Tickets will appear here once they are processed at this window"
                  />
                </Box>
              ) : (
                <>
                  {/* Filter Bar Header */}
                  <Box sx={{ p: 3, pb: 2, bgcolor: 'grey.50', borderBottom: '1px solid', borderColor: 'divider' }}>
                    <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between" flexWrap="wrap" sx={{ mb: 2 }}>
                      <Box>
                        <Typography variant="subtitle1" fontWeight={700}>Ticket History</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {filteredHistory.length} ticket{filteredHistory.length !== 1 ? 's' : ''}
                          {hasActiveFilters ? ' (filtered)' : ''} at {currentWindow?.name ?? 'this window'}
                        </Typography>
                      </Box>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Chip size="small" label={`Served: ${servedToday}`} color="success" variant="outlined" />
                        <Chip size="small" label={`Today: ${todayTickets.length}`} color="info" variant="outlined" />
                        <Button
                          size="small"
                          variant={showFilters ? 'contained' : 'outlined'}
                          startIcon={<FilterListIcon />}
                          onClick={() => setShowFilters((v) => !v)}
                          sx={{ minWidth: 'auto' }}
                        >
                          {isMobile ? '' : 'Filters'}
                        </Button>
                      </Stack>
                    </Stack>

                    {/* Search bar */}
                    <TextField
                      size="small"
                      placeholder="Search by ticket #, name, student ID, or purpose..."
                      value={historySearch}
                      onChange={(e) => { setHistorySearch(e.target.value); setPage(0) }}
                      fullWidth
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon fontSize="small" />
                          </InputAdornment>
                        ),
                        endAdornment: historySearch ? (
                          <InputAdornment position="end">
                            <IconButton size="small" onClick={() => { setHistorySearch(''); setPage(0) }}>
                              <ClearIcon fontSize="small" />
                            </IconButton>
                          </InputAdornment>
                        ) : null,
                      }}
                      sx={{
                        bgcolor: 'background.paper',
                        '& .MuiOutlinedInput-root': { borderRadius: 2 },
                      }}
                    />

                    {/* Collapsible Filter Row */}
                    <Collapse in={showFilters}>
                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mt: 2 }}>
                        <FormControl size="small" sx={{ minWidth: 150 }}>
                          <InputLabel>Status</InputLabel>
                          <Select
                            value={historyStatusFilter}
                            label="Status"
                            onChange={(e) => { setHistoryStatusFilter(e.target.value as number); setPage(0) }}
                          >
                            {STATUS_OPTIONS.map((opt) => (
                              <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>

                        <TextField
                          size="small"
                          type="date"
                          label="Date"
                          value={historyDateFilter}
                          onChange={(e) => { setHistoryDateFilter(e.target.value); setPage(0) }}
                          InputLabelProps={{ shrink: true }}
                          sx={{ minWidth: 150 }}
                        />

                        {hasActiveFilters && (
                          <Button
                            size="small"
                            variant="text"
                            color="error"
                            startIcon={<ClearIcon />}
                            onClick={clearAllFilters}
                          >
                            Clear All
                          </Button>
                        )}
                      </Stack>
                    </Collapse>
                  </Box>

                  {/* Ticket List */}
                  <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
                    {paginatedHistory.length === 0 ? (
                      <Box sx={{ py: 6, textAlign: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                          No tickets match your filters
                        </Typography>
                        <Button size="small" sx={{ mt: 1 }} onClick={clearAllFilters}>
                          Clear filters
                        </Button>
                      </Box>
                    ) : (
                      <Stack spacing={1}>
                        {paginatedHistory.map((t) => {
                          const isExpanded = expandedTicketId === t.id
                          return (
                            <Box key={t.id}>
                              <Box
                                onClick={() => toggleExpandTicket(t.id)}
                                sx={{
                                  p: 2,
                                  border: '1px solid',
                                  borderColor: isExpanded ? 'primary.light' : 'divider',
                                  borderRadius: isExpanded ? '12px 12px 0 0' : 1.5,
                                  borderLeft: '4px solid',
                                  borderLeftColor: t.isPriority ? 'error.main' : 'grey.300',
                                  transition: 'all 0.2s',
                                  cursor: 'pointer',
                                  '&:hover': { borderColor: isExpanded ? 'primary.light' : 'primary.main', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
                                  bgcolor: isExpanded ? 'grey.50' : 'transparent',
                                }}
                              >
                                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2} flexWrap="wrap">
                                  <Box sx={{ minWidth: 80 }}>
                                    <Chip
                                      label={t.ticketNumber}
                                      size="small"
                                      sx={{
                                        fontFamily: 'monospace',
                                        fontWeight: 700,
                                        fontSize: '0.8125rem',
                                        bgcolor: t.isPriority ? 'error.main' : 'grey.800',
                                        color: 'white',
                                        minWidth: 75,
                                      }}
                                    />
                                    {t.isPriority && (
                                      <Typography variant="caption" color="error" display="block" mt={0.5} fontWeight={600}>
                                        PRIORITY
                                      </Typography>
                                    )}
                                  </Box>
                                  <Box sx={{ flex: 1, minWidth: 120 }}>
                                    <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                                      {t.clientName || 'Anonymous Client'}
                                    </Typography>
                                    <Stack direction="row" spacing={1} flexWrap="wrap" alignItems="center" sx={{ mb: 0.5 }}>
                                      <Typography variant="caption" color="text.secondary">{t.purposeName}</Typography>
                                      <Typography variant="caption" color="text.disabled">|</Typography>
                                      <Typography variant="caption" color="text.secondary">{t.windowName}</Typography>
                                    </Stack>
                                    <Typography variant="caption" color="text.disabled">
                                      {new Date(t.createdAt).toLocaleString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                      })}
                                    </Typography>
                                  </Box>
                                  <Stack direction="row" spacing={1} alignItems="center">
                                    <StatusChip status={t.status} />
                                    <IconButton size="small" sx={{ color: 'text.disabled' }}>
                                      {isExpanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
                                    </IconButton>
                                  </Stack>
                                </Stack>
                              </Box>

                              {/* Expanded Details */}
                              <Collapse in={isExpanded}>
                                <Box
                                  sx={{
                                    p: 2.5,
                                    border: '1px solid',
                                    borderColor: 'primary.light',
                                    borderTop: 'none',
                                    borderRadius: '0 0 12px 12px',
                                    bgcolor: 'grey.50',
                                  }}
                                >
                                  <Grid container spacing={2}>
                                    {/* Client Info */}
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                      <Stack spacing={1.5}>
                                        <Box>
                                          <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mb: 0.5 }}>
                                            <PersonIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                                            <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                              Client Information
                                            </Typography>
                                          </Stack>
                                          <Divider sx={{ mb: 1 }} />
                                        </Box>
                                        <DetailRow label="Full Name" value={t.clientName || 'N/A'} />
                                        <DetailRow label="Student ID" value={t.studentId || 'N/A'} />
                                        <DetailRow label="Course" value={t.course || 'N/A'} />
                                        <DetailRow label="Year Level" value={t.yearLevel || 'N/A'} />
                                        <DetailRow label="Department" value={t.department || 'N/A'} />
                                        <DetailRow label="Email" value={t.clientEmail || 'N/A'} />
                                      </Stack>
                                    </Grid>

                                    {/* Ticket Info */}
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                      <Stack spacing={1.5}>
                                        <Box>
                                          <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mb: 0.5 }}>
                                            <TimeIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                                            <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                              Ticket Details
                                            </Typography>
                                          </Stack>
                                          <Divider sx={{ mb: 1 }} />
                                        </Box>
                                        <DetailRow label="Ticket #" value={t.ticketNumber} />
                                        <DetailRow label="Status" value={tokens.status.labels[t.status] ?? 'Unknown'} />
                                        <DetailRow label="Window" value={t.windowName} />
                                        <DetailRow label="Purpose" value={t.purposeName} />
                                        <DetailRow label="Priority" value={t.isPriority ? 'Yes' : 'No'} />
                                        <DetailRow
                                          label="Created"
                                          value={new Date(t.createdAt).toLocaleString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                            second: '2-digit',
                                          })}
                                        />
                                        {t.calledAt && (
                                          <DetailRow
                                            label="Called"
                                            value={new Date(t.calledAt).toLocaleString('en-US', {
                                              month: 'short',
                                              day: 'numeric',
                                              year: 'numeric',
                                              hour: '2-digit',
                                              minute: '2-digit',
                                              second: '2-digit',
                                            })}
                                          />
                                        )}
                                        {t.completedAt && (
                                          <DetailRow
                                            label="Completed"
                                            value={new Date(t.completedAt).toLocaleString('en-US', {
                                              month: 'short',
                                              day: 'numeric',
                                              year: 'numeric',
                                              hour: '2-digit',
                                              minute: '2-digit',
                                              second: '2-digit',
                                            })}
                                          />
                                        )}
                                      </Stack>
                                    </Grid>
                                  </Grid>
                                </Box>
                              </Collapse>
                            </Box>
                          )
                        })}
                      </Stack>
                    )}
                  </Box>

                  {/* Pagination */}
                  <Divider />
                  <TablePagination
                    component="div"
                    count={filteredHistory.length}
                    page={page}
                    onPageChange={(_, newPage) => setPage(newPage)}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={(e) => {
                      setRowsPerPage(parseInt(e.target.value, 10))
                      setPage(0)
                    }}
                    rowsPerPageOptions={[10, 25, 50, 100]}
                    sx={{ borderTop: 'none' }}
                  />
                </>
              )}
            </>
          )}
        </Box>
      </Paper>

      {/* FAB for Call Next — visible on mobile when on Serving tab and no current ticket */}
      {isMobile && !currentTicket && tabValue === 0 && (
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

// Helper component for expanded ticket detail rows (same pattern as AdminPage)
function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <Stack direction="row" spacing={1} alignItems="baseline">
      <Typography variant="caption" color="text.secondary" sx={{ minWidth: 80, flexShrink: 0 }}>
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={500}>
        {value}
      </Typography>
    </Stack>
  )
}
