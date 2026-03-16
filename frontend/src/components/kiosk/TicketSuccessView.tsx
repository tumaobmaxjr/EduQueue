import { useEffect, useState, useRef } from 'react'
import { Container, Paper, Box, Typography, Stack, Chip, Button, alpha, LinearProgress } from '@mui/material'
import HomeIcon from '@mui/icons-material/Home'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import PriorityHighIcon from '@mui/icons-material/PriorityHigh'
import DownloadIcon from '@mui/icons-material/Download'
import VisibilityIcon from '@mui/icons-material/Visibility'
import html2canvas from 'html2canvas'
import { useNavigate } from 'react-router-dom'
import type { Ticket } from '../../api/types'

interface TicketSuccessViewProps {
  ticket: Ticket
  onGetAnother: () => void
}

const AUTO_RESET_SECONDS = 30

export function TicketSuccessView({ ticket, onGetAnother }: TicketSuccessViewProps) {
  const [countdown, setCountdown] = useState(AUTO_RESET_SECONDS)
  const ticketContentRef = useRef<HTMLDivElement>(null)
  const [isDownloading, setIsDownloading] = useState(false)
  const navigate = useNavigate()

  const handleDownload = async () => {
    if (!ticketContentRef.current) return
    setIsDownloading(true)
    try {
      const canvas = await html2canvas(ticketContentRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false,
      })
      const safeTicketNum = ticket.ticketNumber.replace(/[^a-zA-Z0-9]/g, '-')
      const link = document.createElement('a')
      link.download = `ticket-${safeTicketNum}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    } catch (error) {
      console.error('Failed to download ticket:', error)
    } finally {
      setIsDownloading(false)
    }
  }

  const handleViewQueueStatus = () => {
    navigate(`/display?window=${ticket.windowId}`)
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          onGetAnother()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [onGetAnother])

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        p: 2,
      }}
    >
      <Container maxWidth="sm">
        {/* Ticket Content - This gets captured */}
        <Paper ref={ticketContentRef} sx={{ p: { xs: 3, sm: 5 }, textAlign: 'center', overflow: 'hidden', mb: 3 }}>
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              bgcolor: (theme) => alpha(theme.palette.success.main, 0.1),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 2,
            }}
          >
            <CheckCircleIcon sx={{ fontSize: 36, color: 'success.main' }} />
          </Box>

          <Typography variant="h5" fontWeight={800} gutterBottom>
            You're in the Queue!
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            Please wait for your number to be called.
          </Typography>

          <Box
            sx={{
              py: 4,
              px: 3,
              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.04),
              borderRadius: 2,
              mb: 3,
              border: '2px dashed',
              borderColor: (theme) => alpha(theme.palette.primary.main, 0.2),
            }}
          >
            <Typography variant="overline" color="text.secondary" display="block" gutterBottom fontWeight={600}>
              Your Ticket Number
            </Typography>
            <Typography
              variant="h2"
              component="div"
              fontWeight={800}
              letterSpacing={3}
              color="primary.main"
              sx={{ fontFamily: 'monospace', fontSize: { xs: '2.5rem', sm: '3.5rem' } }}
            >
              {ticket.ticketNumber}
            </Typography>
            <Stack direction="row" justifyContent="center" spacing={1} sx={{ mt: 2 }}>
              <Chip
                label={`Position: #${ticket.queuePosition}`}
                color="primary"
                size="small"
              />
              <Chip label={ticket.windowName} variant="outlined" size="small" />
              {ticket.isPriority && (
                <Chip
                  icon={<PriorityHighIcon />}
                  label="Priority"
                  color="warning"
                  size="small"
                />
              )}
            </Stack>
          </Box>

          <Stack spacing={0.5}>
            <Typography variant="body2" color="text.secondary">
              Purpose: <strong>{ticket.purposeName}</strong>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Name: <strong>{ticket.clientName}</strong>
            </Typography>
            {ticket.studentId && (
              <Typography variant="body2" color="text.secondary">
                Student ID: <strong>{ticket.studentId}</strong>
              </Typography>
            )}
            {ticket.yearLevel && (
              <Typography variant="body2" color="text.secondary">
                Year: <strong>{ticket.yearLevel}</strong>
              </Typography>
            )}
            {ticket.course && (
              <Typography variant="body2" color="text.secondary">
                Course: <strong>{ticket.course}</strong>
              </Typography>
            )}
            <Typography variant="caption" color="text.disabled">
              {new Date(ticket.createdAt).toLocaleString()}
            </Typography>
          </Stack>
        </Paper>

        {/* Buttons - Outside the captured area */}
        <Stack spacing={2} sx={{ mb: 3 }}>
          <Button
            variant="contained"
            size="large"
            onClick={handleViewQueueStatus}
            startIcon={<VisibilityIcon />}
            fullWidth
            sx={{ py: 1.5 }}
          >
            View Queue Status
          </Button>
          <Button
            variant="outlined"
            size="large"
            onClick={handleDownload}
            startIcon={<DownloadIcon />}
            fullWidth
            disabled={isDownloading}
            sx={{ py: 1.5 }}
          >
            {isDownloading ? 'Downloading...' : 'Download Ticket'}
          </Button>
          <Button
            variant="text"
            size="large"
            onClick={onGetAnother}
            startIcon={<HomeIcon />}
            fullWidth
            sx={{ py: 1.5, color: 'text.secondary' }}
          >
            Back to Main Page
          </Button>
        </Stack>

        <Typography variant="caption" color="text.disabled" display="block" textAlign="center">
          This screen will reset in {countdown} seconds
        </Typography>
        <LinearProgress
          variant="determinate"
          value={((AUTO_RESET_SECONDS - countdown) / AUTO_RESET_SECONDS) * 100}
          sx={{ mt: 1, borderRadius: 4, height: 3, opacity: 0.5 }}
        />
      </Container>
    </Box>
  )
}
