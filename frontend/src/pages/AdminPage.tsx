import { useCallback, useMemo, useState } from 'react'
import {
  Alert,
  Badge,
  Box,
  Button,
  Chip,
  Collapse,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
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
  Switch,
  Tab,
  TablePagination,
  Tabs,
  TextField,
  Tooltip,
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
  AdminPanelSettings as AdminPanelSettingsIcon,
  FilterList as FilterListIcon,
  Clear as ClearIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Person as PersonIcon,
  AccessTime as TimeIcon,
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
import { tokens } from '../theme'
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

export function AdminPage() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  
  // Data hooks
  const { data: windows = [], isLoading: loadingWindows, refetch: refetchWindows } = useWindows()
  const { data: purposes = [], isLoading: loadingPurposes, refetch: refetchPurposes } = usePurposes()
  const { data: tickets = [], refetch: refetchTickets } = useTickets()

  // Mutations
  const createWindowMut = useCreateWindow()
  const updateWindowMut = useUpdateWindow()
  const deleteWindowMut = useDeleteWindow()
  const createPurposeMut = useCreatePurpose()
  const updatePurposeMut = useUpdatePurpose()
  const deletePurposeMut = useDeletePurpose()

  // UI state
  const [tabValue, setTabValue] = useState(0)
  const [configSearchText, setConfigSearchText] = useState('')
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

  // Ticket Log filter state
  const [ticketSearch, setTicketSearch] = useState('')
  const [ticketStatusFilter, setTicketStatusFilter] = useState<number>(-1)
  const [ticketWindowFilter, setTicketWindowFilter] = useState<string>('all')
  const [ticketDateFilter, setTicketDateFilter] = useState<string>('')
  const [showFilters, setShowFilters] = useState(false)

  // Ticket Log pagination state
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(25)

  // Expanded ticket row
  const [expandedTicketId, setExpandedTicketId] = useState<string | null>(null)

  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  })

  const showNotification = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity })
  }

  // ── Computed: Configuration tab ──

  const sortedWindows = useMemo(
    () =>
      windows
        .filter((w) => w.name.toLowerCase().includes(configSearchText.toLowerCase()))
        .sort((a, b) => a.name.localeCompare(b.name)),
    [windows, configSearchText]
  )

  const sortedPurposes = useMemo(
    () =>
      purposes
        .filter((p) => p.name.toLowerCase().includes(configSearchText.toLowerCase()))
        .sort((a, b) => a.name.localeCompare(b.name)),
    [purposes, configSearchText]
  )

  // ── Computed: Ticket Log (filtered + paginated) ──

  const filteredTickets = useMemo(() => {
    let filtered = [...tickets].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))

    // Text search (ticket number, client name, purpose, window)
    if (ticketSearch.trim()) {
      const q = ticketSearch.toLowerCase()
      filtered = filtered.filter(
        (t) =>
          t.ticketNumber.toLowerCase().includes(q) ||
          (t.clientName && t.clientName.toLowerCase().includes(q)) ||
          t.purposeName.toLowerCase().includes(q) ||
          t.windowName.toLowerCase().includes(q) ||
          (t.studentId && t.studentId.toLowerCase().includes(q))
      )
    }

    // Status filter
    if (ticketStatusFilter !== -1) {
      filtered = filtered.filter((t) => t.status === ticketStatusFilter)
    }

    // Window filter
    if (ticketWindowFilter !== 'all') {
      filtered = filtered.filter((t) => t.windowId === ticketWindowFilter)
    }

    // Date filter
    if (ticketDateFilter) {
      filtered = filtered.filter(
        (t) => new Date(t.createdAt).toISOString().split('T')[0] === ticketDateFilter
      )
    }

    return filtered
  }, [tickets, ticketSearch, ticketStatusFilter, ticketWindowFilter, ticketDateFilter])

  const paginatedTickets = useMemo(
    () => filteredTickets.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [filteredTickets, page, rowsPerPage]
  )

  const hasActiveFilters = ticketSearch || ticketStatusFilter !== -1 || ticketWindowFilter !== 'all' || ticketDateFilter

  const clearAllFilters = useCallback(() => {
    setTicketSearch('')
    setTicketStatusFilter(-1)
    setTicketWindowFilter('all')
    setTicketDateFilter('')
    setPage(0)
  }, [])

  // ── Stats ──

  const stats = {
    totalWindows: windows.length,
    totalPurposes: purposes.length,
    ticketsToday: tickets.filter(
      (t) => new Date(t.createdAt).toDateString() === new Date().toDateString()
    ).length,
    activeTickets: tickets.filter((t) => t.status === 0 || t.status === 1 || t.status === 2)
      .length,
  }

  // Ticket counts per window and per purpose (for badges in Configuration)
  const ticketCountByWindow = useMemo(() => {
    const counts: Record<string, number> = {}
    tickets.forEach((t) => {
      if (t.status === 0 || t.status === 1 || t.status === 2) {
        counts[t.windowId] = (counts[t.windowId] || 0) + 1
      }
    })
    return counts
  }, [tickets])

  const ticketCountByPurpose = useMemo(() => {
    const counts: Record<string, number> = {}
    tickets.forEach((t) => {
      if (t.status === 0 || t.status === 1 || t.status === 2) {
        counts[t.purposeId] = (counts[t.purposeId] || 0) + 1
      }
    })
    return counts
  }, [tickets])

  // ── Analytics data ──

  const analyticsData = useMemo(() => {
    const statusCounts: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    tickets.forEach((t) => (statusCounts[t.status] = (statusCounts[t.status] || 0) + 1))
    const totalTickets = tickets.length || 1

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

    return { statusCounts, totalTickets, windowStats, purposeStats }
  }, [tickets])

  // ── Handlers ──

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

  const toggleExpandTicket = (ticketId: string) => {
    setExpandedTicketId((prev) => (prev === ticketId ? null : ticketId))
  }

  const saving = createWindowMut.isPending || updateWindowMut.isPending || createPurposeMut.isPending || updatePurposeMut.isPending
  const deleting = deleteWindowMut.isPending || deletePurposeMut.isPending

  return (
    <Container maxWidth="xl" sx={{ height: '100%', display: 'flex', flexDirection: 'column', py: { xs: 2, md: 3 }, overflow: 'hidden' }}>
      <Box sx={{ flexShrink: 0 }}>
        <PageHeader
          title="Admin Dashboard"
          subtitle="System overview and configuration"
          icon={<AdminPanelSettingsIcon />}
          action={
            <Stack direction="row" spacing={1}>
              <Button variant="outlined" startIcon={<RefreshIcon />} onClick={handleRefresh}>
                Refresh
              </Button>
            </Stack>
          }
        />

        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid size={{ xs: 6, md: 3 }}>
            <StatCard title="Total Tickets" value={analyticsData.totalTickets} icon={<TicketIcon />} color={theme.palette.primary.main} />
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <StatCard title="Active Windows" value={windows.filter((w) => w.isActive).length} icon={<WindowIcon />} color={theme.palette.success.main} />
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <StatCard title="Pending Queue" value={analyticsData.statusCounts[0] || 0} icon={<AnalyticsIcon />} color={theme.palette.warning.main} />
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <StatCard title="Served Today" value={analyticsData.statusCounts[3] || 0} icon={<AnalyticsIcon />} color={theme.palette.info.main} />
          </Grid>
        </Grid>
      </Box>

      <Paper sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}>
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
        <Box role="tabpanel" hidden={tabValue !== 0} sx={{ flex: 1, overflowY: 'auto', display: tabValue === 0 ? 'block' : 'none' }}>
          {tabValue === 0 && (
            <AnalyticsTab
              tickets={tickets}
              analyticsData={analyticsData}
              hasTickets={tickets.length > 0}
            />
          )}
        </Box>

        {/* TAB 1: Configuration */}
        <Box role="tabpanel" hidden={tabValue !== 1} sx={{ flex: 1, flexDirection: 'column', overflow: 'hidden', display: tabValue === 1 ? 'flex' : 'none' }}>
          {tabValue === 1 && (
            <>
              {/* Search */}
              <Box sx={{ p: 3, pb: 2, bgcolor: 'grey.50', borderBottom: '1px solid', borderColor: 'divider', flexShrink: 0 }}>
                <TextField
                  size="small"
                  placeholder="Search windows or purposes..."
                  value={configSearchText}
                  onChange={(e) => setConfigSearchText(e.target.value)}
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon fontSize="small" />
                      </InputAdornment>
                    ),
                    endAdornment: configSearchText ? (
                      <InputAdornment position="end">
                        <IconButton size="small" onClick={() => setConfigSearchText('')}>
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
              </Box>

              <Grid container spacing={0} sx={{ flex: 1, overflow: 'hidden' }}>
                {/* Windows */}
                <Grid size={{ xs: 12, md: 6 }} sx={{ borderRight: { md: '1px solid' }, borderColor: { md: 'divider' }, display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <Box sx={{ p: 3, flex: 1, overflowY: 'auto' }}>
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
                        {sortedWindows.map((w) => {
                          const activeCount = ticketCountByWindow[w.id] || 0
                          return (
                            <Box
                              key={w.id}
                              sx={{
                                p: 2,
                                border: '1px solid',
                                borderColor: w.isActive ? 'divider' : 'grey.200',
                                borderRadius: 1.5,
                                transition: 'all 0.2s',
                                opacity: w.isActive ? 1 : 0.6,
                                bgcolor: w.isActive ? 'transparent' : 'grey.50',
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
                                    {activeCount > 0 && (
                                      <Chip
                                        label={`${activeCount} active`}
                                        size="small"
                                        color="info"
                                        variant="outlined"
                                        sx={{ height: 22, fontSize: '0.7rem' }}
                                      />
                                    )}
                                    {!w.isActive && (
                                      <Chip label="Inactive" size="small" color="default" sx={{ height: 22, fontSize: '0.7rem' }} />
                                    )}
                                  </Stack>
                                  {w.description && (
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }} noWrap>{w.description}</Typography>
                                  )}
                                  {w.location && (
                                    <Typography variant="caption" color="text.disabled">{w.location}</Typography>
                                  )}
                                </Box>
                                <Stack direction="row" spacing={0.5} sx={{ flexShrink: 0 }} alignItems="center">
                                  <Tooltip title={w.isActive ? 'Active' : 'Inactive'}>
                                    <Switch
                                      size="small"
                                      checked={w.isActive}
                                      color="success"
                                      onChange={() => {
                                        // Note: isActive toggle is a frontend-only visual indicator
                                        // since the backend doesn't expose a toggle endpoint yet.
                                        // For now we show the current state from the API.
                                        showNotification('Active/Inactive state is managed by the backend', 'error')
                                      }}
                                    />
                                  </Tooltip>
                                  <IconButton onClick={() => openEditWindow(w)} size="small" sx={{ color: 'text.secondary' }}>
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                  <IconButton onClick={() => confirmDelete('window', w.id, w.name)} size="small" sx={{ color: 'text.secondary' }}>
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </Stack>
                              </Stack>
                            </Box>
                          )
                        })}
                      </Stack>
                    )}
                  </Box>
                </Grid>

                {/* Purposes */}
                <Grid size={{ xs: 12, md: 6 }} sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <Box sx={{ p: 3, flex: 1, overflowY: 'auto' }}>
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
                        {sortedPurposes.map((p) => {
                          const activeCount = ticketCountByPurpose[p.id] || 0
                          return (
                            <Box
                              key={p.id}
                              sx={{
                                p: 2,
                                border: '1px solid',
                                borderColor: p.isActive ? 'divider' : 'grey.200',
                                borderRadius: 1.5,
                                transition: 'all 0.2s',
                                opacity: p.isActive ? 1 : 0.6,
                                bgcolor: p.isActive ? 'transparent' : 'grey.50',
                                '&:hover': { borderColor: 'secondary.main', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
                              }}
                            >
                              <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                                <Box sx={{ minWidth: 0, flex: 1 }}>
                                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                                    <Typography fontWeight={700} noWrap>{p.name}</Typography>
                                    {activeCount > 0 && (
                                      <Chip
                                        label={`${activeCount} active`}
                                        size="small"
                                        color="info"
                                        variant="outlined"
                                        sx={{ height: 22, fontSize: '0.7rem' }}
                                      />
                                    )}
                                    {!p.isActive && (
                                      <Chip label="Inactive" size="small" color="default" sx={{ height: 22, fontSize: '0.7rem' }} />
                                    )}
                                  </Stack>
                                  {p.description && (
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }} noWrap>{p.description}</Typography>
                                  )}
                                  <Stack direction="row" alignItems="center" spacing={0.5}>
                                    <WindowIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
                                    <Typography variant="caption" color="text.disabled">{p.windowName}</Typography>
                                  </Stack>
                                </Box>
                                <Stack direction="row" spacing={0.5} sx={{ flexShrink: 0 }} alignItems="center">
                                  <Tooltip title={p.isActive ? 'Active' : 'Inactive'}>
                                    <Switch
                                      size="small"
                                      checked={p.isActive}
                                      color="success"
                                      onChange={() => {
                                        showNotification('Active/Inactive state is managed by the backend', 'error')
                                      }}
                                    />
                                  </Tooltip>
                                  <IconButton onClick={() => openEditPurpose(p)} size="small" sx={{ color: 'text.secondary' }}>
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                  <IconButton onClick={() => confirmDelete('purpose', p.id, p.name)} size="small" sx={{ color: 'text.secondary' }}>
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </Stack>
                              </Stack>
                            </Box>
                          )
                        })}
                      </Stack>
                    )}
                  </Box>
                </Grid>
              </Grid>
            </>
          )}
        </Box>

        {/* TAB 2: Ticket Log */}
        <Box role="tabpanel" hidden={tabValue !== 2} sx={{ flex: 1, flexDirection: 'column', overflow: 'hidden', display: tabValue === 2 ? 'flex' : 'none' }}>
          {tabValue === 2 && (
            <>
              {tickets.length === 0 ? (
                <EmptyState
                  icon={<TicketIcon />}
                  title="No tickets yet"
                  description="Tickets will appear here once they are created"
                />
              ) : (
                <>
                  {/* Filter Header */}
                  <Box sx={{ p: 3, pb: 2, bgcolor: 'grey.50', borderBottom: '1px solid', borderColor: 'divider', flexShrink: 0 }}>
                    <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between" flexWrap="wrap" sx={{ mb: 2 }}>
                      <Box>
                        <Typography variant="subtitle1" fontWeight={700}>Ticket Log</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {filteredTickets.length} ticket{filteredTickets.length !== 1 ? 's' : ''}
                          {hasActiveFilters ? ' (filtered)' : ''}
                        </Typography>
                      </Box>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Chip size="small" label={`Active: ${stats.activeTickets}`} color="primary" variant="outlined" />
                        <Chip size="small" label={`Today: ${stats.ticketsToday}`} color="info" variant="outlined" />
                        <Button
                          size="small"
                          variant={showFilters ? 'contained' : 'outlined'}
                          startIcon={<FilterListIcon />}
                          onClick={() => setShowFilters((v) => !v)}
                          sx={{ minWidth: 'auto' }}
                        >
                          {isMobile ? '' : 'Filters'}
                          {hasActiveFilters && (
                            <Badge
                              color="error"
                              variant="dot"
                              sx={{ ml: 1 }}
                            />
                          )}
                        </Button>
                      </Stack>
                    </Stack>

                    {/* Search bar always visible */}
                    <TextField
                      size="small"
                      placeholder="Search by ticket #, name, student ID, purpose, or window..."
                      value={ticketSearch}
                      onChange={(e) => { setTicketSearch(e.target.value); setPage(0) }}
                      fullWidth
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon fontSize="small" />
                          </InputAdornment>
                        ),
                        endAdornment: ticketSearch ? (
                          <InputAdornment position="end">
                            <IconButton size="small" onClick={() => { setTicketSearch(''); setPage(0) }}>
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
                            value={ticketStatusFilter}
                            label="Status"
                            onChange={(e) => { setTicketStatusFilter(e.target.value as number); setPage(0) }}
                          >
                            {STATUS_OPTIONS.map((opt) => (
                              <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>

                        <FormControl size="small" sx={{ minWidth: 150 }}>
                          <InputLabel>Window</InputLabel>
                          <Select
                            value={ticketWindowFilter}
                            label="Window"
                            onChange={(e) => { setTicketWindowFilter(e.target.value); setPage(0) }}
                          >
                            <MenuItem value="all">All Windows</MenuItem>
                            {windows.map((w) => (
                              <MenuItem key={w.id} value={w.id}>{w.name}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>

                        <TextField
                          size="small"
                          type="date"
                          label="Date"
                          value={ticketDateFilter}
                          onChange={(e) => { setTicketDateFilter(e.target.value); setPage(0) }}
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
                  <Box sx={{ p: 2, flex: 1, overflowY: 'auto' }}>
                    {paginatedTickets.length === 0 ? (
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
                        {paginatedTickets.map((t) => {
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
                    count={filteredTickets.length}
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

// ── Helper component for expanded ticket detail rows ──

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
