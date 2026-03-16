import { useMemo, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Snackbar,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
  useTheme,
  useMediaQuery,
} from '@mui/material'
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Storefront as WindowIcon,
  Category as PurposeIcon,
  ConfirmationNumber as TicketIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Analytics as AnalyticsIcon,
} from '@mui/icons-material'
import {
  useWindows,
  usePurposes,
  useTickets,
  useCreateWindow,
  useUpdateWindow,
  useDeleteWindow,
  useCreatePurpose,
  useUpdatePurpose,
  useDeletePurpose,
} from '../api/hooks'
import { PageHeader, StatCard, StatusChip, ConfirmDialog, EmptyState, LoadingSkeleton } from '../components/shared'
import { AnalyticsTab } from '../components/admin'
import type { Window, Purpose } from '../api/types'

type EditableWindow = {
  id?: string
  name: string
  description: string
  code: string
  location: string
}

type EditablePurpose = {
  id?: string
  name: string
  description: string
  windowId: string
}

const emptyWindowForm: EditableWindow = { name: '', description: '', code: '', location: '' }
const emptyPurposeForm: EditablePurpose = { name: '', description: '', windowId: '' }

export function AdminPage() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  // Data hooks
  const { data: windows = [], isLoading: loadingWindows, refetch: refetchWindows } = useWindows()
  const { data: purposes = [], isLoading: loadingPurposes, refetch: refetchPurposes } = usePurposes()
  const { data: tickets = [], isLoading: loadingTickets, refetch: refetchTickets } = useTickets()

  // Mutations
  const createWindowMut = useCreateWindow()
  const updateWindowMut = useUpdateWindow()
  const deleteWindowMut = useDeleteWindow()
  const createPurposeMut = useCreatePurpose()
  const updatePurposeMut = useUpdatePurpose()
  const deletePurposeMut = useDeletePurpose()

  // UI state
  const [tabValue, setTabValue] = useState(0)
  const [searchText, setSearchText] = useState('')
  const [windowDialogOpen, setWindowDialogOpen] = useState(false)
  const [purposeDialogOpen, setPurposeDialogOpen] = useState(false)
  const [windowForm, setWindowForm] = useState<EditableWindow>(emptyWindowForm)
  const [purposeForm, setPurposeForm] = useState<EditablePurpose>(emptyPurposeForm)
  const [deleteConfirm, setDeleteConfirm] = useState<{
    open: boolean
    type: 'window' | 'purpose'
    id: string
    name: string
  }>({ open: false, type: 'window', id: '', name: '' })

  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  })

  const showNotification = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity })
  }

  // Computed
  const sortedWindows = useMemo(
    () =>
      windows
        .filter((w) => w.name.toLowerCase().includes(searchText.toLowerCase()))
        .sort((a, b) => a.name.localeCompare(b.name)),
    [windows, searchText]
  )

  const sortedPurposes = useMemo(
    () =>
      purposes
        .filter((p) => p.name.toLowerCase().includes(searchText.toLowerCase()))
        .sort((a, b) => a.name.localeCompare(b.name)),
    [purposes, searchText]
  )

  const recentTickets = useMemo(
    () =>
      [...tickets]
        .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
        .slice(0, 50),
    [tickets]
  )

  const stats = {
    totalWindows: windows.length,
    totalPurposes: purposes.length,
    ticketsToday: tickets.filter(
      (t) => new Date(t.createdAt).toDateString() === new Date().toDateString()
    ).length,
    activeTickets: tickets.filter((t) => t.status === 0 || t.status === 1 || t.status === 2)
      .length,
  }

  const now = new Date()
  const monthName = now.toLocaleString('default', { month: 'long' })
  const year = now.getFullYear()

  const analyticsData = useMemo(() => {
    const statusCounts: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    tickets.forEach((t) => (statusCounts[t.status] = (statusCounts[t.status] || 0) + 1))
    const totalTickets = tickets.length || 1

    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth()
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
    const dayCounts = Array(daysInMonth).fill(0)
    tickets
      .filter((t) => {
        const d = new Date(t.createdAt)
        return d.getFullYear() === currentYear && d.getMonth() === currentMonth
      })
      .forEach((t) => {
        dayCounts[new Date(t.createdAt).getDate() - 1]++
      })

    const windowCounts: Record<string, { name: string; count: number }> = {}
    tickets.forEach((t) => {
      if (!windowCounts[t.windowId]) windowCounts[t.windowId] = { name: t.windowName, count: 0 }
      windowCounts[t.windowId].count++
    })
    const windowStats = Object.values(windowCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    const purposeCounts: Record<string, { name: string; count: number }> = {}
    tickets.forEach((t) => {
      if (!purposeCounts[t.purposeId])
        purposeCounts[t.purposeId] = { name: t.purposeName, count: 0 }
      purposeCounts[t.purposeId].count++
    })
    const purposeStats = Object.values(purposeCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    return { statusCounts, totalTickets, dayCounts, windowStats, purposeStats }
  }, [tickets])

  // Handlers
  const handleRefresh = () => {
    refetchWindows()
    refetchPurposes()
    refetchTickets()
  }

  const openCreateWindow = () => {
    setWindowForm(emptyWindowForm)
    setWindowDialogOpen(true)
  }

  const openEditWindow = (w: Window) => {
    setWindowForm({
      id: w.id,
      name: w.name,
      description: w.description,
      code: w.code ?? '',
      location: w.location ?? '',
    })
    setWindowDialogOpen(true)
  }

  const saveWindow = async () => {
    if (!windowForm.name || !windowForm.code) {
      showNotification('Name and Code are required', 'error')
      return
    }
    const body = {
      name: windowForm.name.trim(),
      description: windowForm.description.trim(),
      code: windowForm.code.trim(),
      location: windowForm.location.trim(),
    }
    try {
      if (windowForm.id) {
        await updateWindowMut.mutateAsync({ id: windowForm.id, body })
        showNotification('Window updated', 'success')
      } else {
        await createWindowMut.mutateAsync(body)
        showNotification('Window created', 'success')
      }
      setWindowDialogOpen(false)
    } catch {
      showNotification('Failed to save window', 'error')
    }
  }

  const openCreatePurpose = () => {
    setPurposeForm({ ...emptyPurposeForm, windowId: sortedWindows[0]?.id ?? '' })
    setPurposeDialogOpen(true)
  }

  const openEditPurpose = (p: Purpose) => {
    setPurposeForm({ id: p.id, name: p.name, description: p.description, windowId: p.windowId })
    setPurposeDialogOpen(true)
  }

  const savePurpose = async () => {
    if (!purposeForm.name || !purposeForm.windowId) {
      showNotification('Name and Window are required', 'error')
      return
    }
    const body = {
      name: purposeForm.name.trim(),
      description: purposeForm.description.trim(),
      windowId: purposeForm.windowId,
    }
    try {
      if (purposeForm.id) {
        await updatePurposeMut.mutateAsync({ id: purposeForm.id, body })
        showNotification('Purpose updated', 'success')
      } else {
        await createPurposeMut.mutateAsync(body)
        showNotification('Purpose created', 'success')
      }
      setPurposeDialogOpen(false)
    } catch {
      showNotification('Failed to save purpose', 'error')
    }
  }

  const confirmDelete = (type: 'window' | 'purpose', id: string, name: string) => {
    setDeleteConfirm({ open: true, type, id, name })
  }

  const executeDelete = async () => {
    try {
      if (deleteConfirm.type === 'window') {
        await deleteWindowMut.mutateAsync(deleteConfirm.id)
      } else {
        await deletePurposeMut.mutateAsync(deleteConfirm.id)
      }
      showNotification(`${deleteConfirm.type === 'window' ? 'Window' : 'Purpose'} deleted`, 'success')
      setDeleteConfirm((prev) => ({ ...prev, open: false }))
    } catch {
      showNotification('Delete failed. Ensure no tickets rely on this item.', 'error')
    }
  }

  const saving = createWindowMut.isPending || updateWindowMut.isPending || createPurposeMut.isPending || updatePurposeMut.isPending
  const deleting = deleteWindowMut.isPending || deletePurposeMut.isPending

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, md: 4 } }}>
      <PageHeader
        title="Administration"
        subtitle="Manage queues, windows, and view analytics"
        icon={<AnalyticsIcon />}
        action={
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={handleRefresh}>
            Refresh
          </Button>
        }
      />

      {/* Stats */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 6, sm: 3 }}>
          <StatCard title="Active Tickets" value={stats.activeTickets} icon={<TicketIcon />} color={theme.palette.success.main} />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <StatCard title="Tickets Today" value={stats.ticketsToday} icon={<AnalyticsIcon />} color={theme.palette.info.main} />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <StatCard title="Windows" value={stats.totalWindows} icon={<WindowIcon />} color={theme.palette.primary.main} />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <StatCard title="Purposes" value={stats.totalPurposes} icon={<PurposeIcon />} color={theme.palette.secondary.dark} />
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ mb: 4, overflow: 'hidden' }}>
        <Box sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
          <Tabs
            value={tabValue}
            onChange={(_, v) => setTabValue(v)}
            variant={isMobile ? 'scrollable' : 'standard'}
            scrollButtons="auto"
            sx={{ px: 2 }}
          >
            <Tab label="Analytics" icon={<AnalyticsIcon fontSize="small" />} iconPosition="start" />
            <Tab label="Configuration" icon={<WindowIcon fontSize="small" />} iconPosition="start" />
            <Tab label="Ticket Log" icon={<TicketIcon fontSize="small" />} iconPosition="start" />
          </Tabs>
        </Box>

        {/* TAB 0: Analytics */}
        <Box role="tabpanel" hidden={tabValue !== 0}>
          {tabValue === 0 && (
            <AnalyticsTab
              analyticsData={analyticsData}
              hasTickets={tickets.length > 0}
              monthName={monthName}
              year={year}
            />
          )}
        </Box>

        {/* TAB 1: Configuration */}
        <Box role="tabpanel" hidden={tabValue !== 1}>
          {tabValue === 1 && (
            <>
              {/* Search */}
              <Box sx={{ p: 3, pb: 2, bgcolor: 'grey.50', borderBottom: '1px solid', borderColor: 'divider' }}>
                <TextField
                  size="small"
                  placeholder="Search windows or purposes..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    maxWidth: 400,
                    bgcolor: 'background.paper',
                    '& .MuiOutlinedInput-root': { '& fieldset': { border: 'none' } },
                  }}
                />
              </Box>

              <Grid container spacing={0}>
                {/* Windows */}
                <Grid size={{ xs: 12, md: 6 }} sx={{ borderRight: { md: '1px solid' }, borderColor: { md: 'divider' } }}>
                  <Box sx={{ p: 3 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Box sx={{ bgcolor: 'primary.main', color: 'white', borderRadius: 1, p: 0.5, display: 'flex' }}>
                          <WindowIcon fontSize="small" />
                        </Box>
                        <Box>
                          <Typography variant="subtitle1" fontWeight={700}>Service Windows</Typography>
                          <Typography variant="caption" color="text.secondary">{sortedWindows.length} total</Typography>
                        </Box>
                      </Box>
                      <Button startIcon={<AddIcon />} variant="contained" size="small" onClick={openCreateWindow}>
                        Add
                      </Button>
                    </Stack>

                    {loadingWindows ? (
                      <LoadingSkeleton variant="list" count={3} />
                    ) : sortedWindows.length === 0 ? (
                      <EmptyState icon={<WindowIcon />} title="No windows yet" description="Create your first service window" />
                    ) : (
                      <Stack spacing={1.5}>
                        {sortedWindows.map((w) => (
                          <Box
                            key={w.id}
                            sx={{
                              p: 2,
                              border: '1px solid',
                              borderColor: 'divider',
                              borderRadius: 1.5,
                              transition: 'all 0.2s',
                              '&:hover': { borderColor: 'primary.main', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
                            }}
                          >
                            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                              <Box sx={{ minWidth: 0, flex: 1 }}>
                                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                                  <Typography fontWeight={700} noWrap>{w.name}</Typography>
                                  {w.code && (
                                    <Chip label={w.code} size="small" sx={{ fontWeight: 700, bgcolor: 'primary.main', color: 'white', height: 22, fontSize: '0.75rem' }} />
                                  )}
                                </Stack>
                                {w.description && (
                                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }} noWrap>{w.description}</Typography>
                                )}
                                {w.location && (
                                  <Typography variant="caption" color="text.disabled">{w.location}</Typography>
                                )}
                              </Box>
                              <Stack direction="row" spacing={0.5} sx={{ flexShrink: 0 }}>
                                <IconButton onClick={() => openEditWindow(w)} size="small" sx={{ color: 'text.secondary' }}>
                                  <EditIcon fontSize="small" />
                                </IconButton>
                                <IconButton onClick={() => confirmDelete('window', w.id, w.name)} size="small" sx={{ color: 'text.secondary' }}>
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Stack>
                            </Stack>
                          </Box>
                        ))}
                      </Stack>
                    )}
                  </Box>
                </Grid>

                {/* Purposes */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <Box sx={{ p: 3 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Box sx={{ bgcolor: 'secondary.dark', color: 'white', borderRadius: 1, p: 0.5, display: 'flex' }}>
                          <PurposeIcon fontSize="small" />
                        </Box>
                        <Box>
                          <Typography variant="subtitle1" fontWeight={700}>Service Purposes</Typography>
                          <Typography variant="caption" color="text.secondary">{sortedPurposes.length} total</Typography>
                        </Box>
                      </Box>
                      <Button
                        startIcon={<AddIcon />}
                        variant="contained"
                        color="secondary"
                        size="small"
                        onClick={openCreatePurpose}
                        disabled={windows.length === 0}
                      >
                        Add
                      </Button>
                    </Stack>

                    {loadingPurposes ? (
                      <LoadingSkeleton variant="list" count={3} />
                    ) : sortedPurposes.length === 0 ? (
                      <EmptyState
                        icon={<PurposeIcon />}
                        title="No purposes yet"
                        description={windows.length === 0 ? 'Create a window first' : 'Create purposes to categorize services'}
                      />
                    ) : (
                      <Stack spacing={1.5}>
                        {sortedPurposes.map((p) => (
                          <Box
                            key={p.id}
                            sx={{
                              p: 2,
                              border: '1px solid',
                              borderColor: 'divider',
                              borderRadius: 1.5,
                              transition: 'all 0.2s',
                              '&:hover': { borderColor: 'secondary.main', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
                            }}
                          >
                            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                              <Box sx={{ minWidth: 0, flex: 1 }}>
                                <Typography fontWeight={700} sx={{ mb: 0.5 }} noWrap>{p.name}</Typography>
                                {p.description && (
                                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }} noWrap>{p.description}</Typography>
                                )}
                                <Stack direction="row" alignItems="center" spacing={0.5}>
                                  <WindowIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
                                  <Typography variant="caption" color="text.disabled">{p.windowName}</Typography>
                                </Stack>
                              </Box>
                              <Stack direction="row" spacing={0.5} sx={{ flexShrink: 0 }}>
                                <IconButton onClick={() => openEditPurpose(p)} size="small" sx={{ color: 'text.secondary' }}>
                                  <EditIcon fontSize="small" />
                                </IconButton>
                                <IconButton onClick={() => confirmDelete('purpose', p.id, p.name)} size="small" sx={{ color: 'text.secondary' }}>
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Stack>
                            </Stack>
                          </Box>
                        ))}
                      </Stack>
                    )}
                  </Box>
                </Grid>
              </Grid>
            </>
          )}
        </Box>

        {/* TAB 2: Ticket Log */}
        <Box role="tabpanel" hidden={tabValue !== 2}>
          {tabValue === 2 && (
            <>
              {loadingTickets ? (
                <Box sx={{ p: 3 }}>
                  <LoadingSkeleton variant="list" count={8} />
                </Box>
              ) : recentTickets.length === 0 ? (
                <EmptyState
                  icon={<TicketIcon />}
                  title="No tickets yet"
                  description="Tickets will appear here once they are created"
                />
              ) : (
                <>
                  <Box sx={{ p: 3, bgcolor: 'grey.50', borderBottom: '1px solid', borderColor: 'divider' }}>
                    <Stack direction="row" spacing={3} alignItems="center" justifyContent="space-between" flexWrap="wrap">
                      <Box>
                        <Typography variant="subtitle1" fontWeight={700}>Recent Activity</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Showing {recentTickets.length} most recent tickets
                        </Typography>
                      </Box>
                      <Stack direction="row" spacing={1}>
                        <Chip size="small" label={`Active: ${stats.activeTickets}`} color="primary" variant="outlined" />
                        <Chip size="small" label={`Today: ${stats.ticketsToday}`} color="info" variant="outlined" />
                      </Stack>
                    </Stack>
                  </Box>
                  <Box sx={{ p: 2 }}>
                    <Stack spacing={1}>
                      {recentTickets.map((t) => (
                        <Box
                          key={t.id}
                          sx={{
                            p: 2,
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 1.5,
                            borderLeft: '4px solid',
                            borderLeftColor: t.isPriority ? 'error.main' : 'grey.300',
                            transition: 'box-shadow 0.2s',
                            '&:hover': { boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
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
                            <Box sx={{ textAlign: 'right', minWidth: 90 }}>
                              <StatusChip status={t.status} />
                            </Box>
                          </Stack>
                        </Box>
                      ))}
                    </Stack>
                  </Box>
                </>
              )}
            </>
          )}
        </Box>
      </Paper>

      {/* --- Dialogs --- */}

      {/* Window Dialog */}
      <Dialog
        open={windowDialogOpen}
        onClose={() => setWindowDialogOpen(false)}
        fullWidth
        maxWidth="sm"
        fullScreen={isMobile}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h6" fontWeight={700}>
            {windowForm.id ? 'Edit Window' : 'New Window'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {windowForm.id ? 'Update window information' : 'Create a new service window'}
          </Typography>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 3 }}>
          <Stack spacing={2.5}>
            <TextField
              label="Display Name"
              value={windowForm.name}
              onChange={(e) => setWindowForm({ ...windowForm, name: e.target.value })}
              fullWidth
              required
              placeholder="e.g., Cashier Counter"
            />
            <TextField
              label="Window Code"
              value={windowForm.code}
              onChange={(e) => setWindowForm({ ...windowForm, code: e.target.value })}
              fullWidth
              required
              helperText="Short code for ticket numbering (e.g., A, B, W1)"
              placeholder="A"
            />
            <TextField
              label="Description"
              value={windowForm.description}
              onChange={(e) => setWindowForm({ ...windowForm, description: e.target.value })}
              fullWidth
              multiline
              rows={2}
              placeholder="Brief description"
            />
            <TextField
              label="Location"
              value={windowForm.location}
              onChange={(e) => setWindowForm({ ...windowForm, location: e.target.value })}
              fullWidth
              placeholder="e.g., Ground Floor, Section A"
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setWindowDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => void saveWindow()} disabled={saving}>
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Purpose Dialog */}
      <Dialog
        open={purposeDialogOpen}
        onClose={() => setPurposeDialogOpen(false)}
        fullWidth
        maxWidth="sm"
        fullScreen={isMobile}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h6" fontWeight={700}>
            {purposeForm.id ? 'Edit Purpose' : 'New Purpose'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {purposeForm.id ? 'Update purpose information' : 'Create a new service purpose'}
          </Typography>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 3 }}>
          <Stack spacing={2.5}>
            <TextField
              label="Purpose Name"
              value={purposeForm.name}
              onChange={(e) => setPurposeForm({ ...purposeForm, name: e.target.value })}
              fullWidth
              required
              placeholder="e.g., Payment, Document Request"
            />
            <TextField
              label="Description"
              value={purposeForm.description}
              onChange={(e) => setPurposeForm({ ...purposeForm, description: e.target.value })}
              fullWidth
              multiline
              rows={2}
              placeholder="What is this purpose for?"
            />
            <TextField
              select
              label="Assign to Window"
              value={purposeForm.windowId}
              onChange={(e) => setPurposeForm({ ...purposeForm, windowId: e.target.value })}
              fullWidth
              required
              helperText="Which window handles this service?"
            >
              {sortedWindows.map((w) => (
                <MenuItem key={w.id} value={w.id}>
                  {w.name} ({w.code})
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setPurposeDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" color="secondary" onClick={() => void savePurpose()} disabled={saving}>
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteConfirm.open}
        title="Confirm Delete"
        message={`Are you sure you want to delete "${deleteConfirm.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        confirmColor="error"
        loading={deleting}
        onConfirm={() => void executeDelete()}
        onCancel={() => setDeleteConfirm((prev) => ({ ...prev, open: false }))}
      />

      {/* Snackbar */}
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
