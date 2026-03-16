import { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  TextField,
  MenuItem,
  Divider,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import SwapHorizIcon from '@mui/icons-material/SwapHoriz'
import type { Window } from '../../api/types'

interface TransferDialogProps {
  open: boolean
  onClose: () => void
  onTransfer: (targetWindowId: string) => void
  windows: Window[]
  currentWindowId: string
  loading: boolean
}

export function TransferDialog({
  open,
  onClose,
  onTransfer,
  windows,
  currentWindowId,
  loading,
}: TransferDialogProps) {
  const theme = useTheme()
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'))
  const [targetId, setTargetId] = useState('')

  const otherWindows = windows.filter((w) => w.id !== currentWindowId && w.isActive)

  const handleTransfer = () => {
    if (targetId) {
      onTransfer(targetId)
      setTargetId('')
    }
  }

  const handleClose = () => {
    setTargetId('')
    onClose()
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullScreen={fullScreen}
      maxWidth="xs"
      fullWidth
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Typography variant="h6" fontWeight={700}>
          Transfer Ticket
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Move the current ticket to another window
        </Typography>
      </DialogTitle>
      <Divider />
      <DialogContent sx={{ pt: 3 }}>
        <TextField
          select
          label="Target Window"
          value={targetId}
          onChange={(e) => setTargetId(e.target.value)}
          fullWidth
          helperText="Select the window to transfer this ticket to"
        >
          <MenuItem value="">Select a window...</MenuItem>
          {otherWindows.map((w) => (
            <MenuItem key={w.id} value={w.id}>
              {w.name} {w.code ? `(${w.code})` : ''}
            </MenuItem>
          ))}
        </TextField>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          variant="contained"
          color="info"
          onClick={handleTransfer}
          disabled={!targetId || loading}
          startIcon={<SwapHorizIcon />}
        >
          {loading ? 'Transferring...' : 'Transfer'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
