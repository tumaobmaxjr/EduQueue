import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  ToggleButtonGroup,
  ToggleButton,
  MenuItem,
  Stack,
  alpha,
  Fade,
} from '@mui/material'
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings'
import PersonIcon from '@mui/icons-material/Person'
import LoginIcon from '@mui/icons-material/Login'
import { useAuthStore } from '../stores'
import { useActiveWindows } from '../api/hooks'

type Role = 'admin' | 'officer'

export function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const { data: windows = [] } = useActiveWindows()

  const [role, setRole] = useState<Role>('officer')
  const [name, setName] = useState('')
  const [windowId, setWindowId] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!name.trim()) {
      setError('Please enter your name.')
      return
    }
    if (role === 'officer' && !windowId) {
      setError('Please select a window to serve.')
      return
    }

    login(role, name.trim(), role === 'officer' ? windowId : undefined)
    navigate(role === 'admin' ? '/admin' : '/officer')
  }

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
      <Container maxWidth="xs">
        <Fade in timeout={600}>
          <Box>
            {/* Branding */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: 2,
                  bgcolor: 'primary.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 2,
                }}
              >
                <Typography variant="h4" color="white" fontWeight={800}>
                  E
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight={800} color="primary.main">
                EduQueue
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Queue Management System
              </Typography>
            </Box>

            {/* Login Card */}
            <Paper sx={{ p: 4 }}>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 3 }}>
                Sign In
              </Typography>

              <form onSubmit={handleSubmit}>
                <Stack spacing={3}>
                  {/* Role Selector */}
                  <Box>
                    <Typography variant="body2" fontWeight={600} color="text.secondary" sx={{ mb: 1 }}>
                      Select your role
                    </Typography>
                    <ToggleButtonGroup
                      value={role}
                      exclusive
                      onChange={(_, val) => val && setRole(val)}
                      fullWidth
                      sx={{
                        '& .MuiToggleButton-root': {
                          py: 1.5,
                          borderRadius: 1.5,
                          textTransform: 'none',
                          fontWeight: 600,
                          '&.Mui-selected': {
                            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                            color: 'primary.main',
                            borderColor: 'primary.main',
                            '&:hover': {
                              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.15),
                            },
                          },
                        },
                      }}
                    >
                      <ToggleButton value="officer">
                        <PersonIcon sx={{ mr: 1 }} /> Officer
                      </ToggleButton>
                      <ToggleButton value="admin">
                        <AdminPanelSettingsIcon sx={{ mr: 1 }} /> Admin
                      </ToggleButton>
                    </ToggleButtonGroup>
                  </Box>

                  {/* Name */}
                  <TextField
                    label="Your Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    required
                    fullWidth
                    autoFocus
                  />

                  {/* Window selector for officers */}
                  {role === 'officer' && (
                    <TextField
                      select
                      label="Assigned Window"
                      value={windowId}
                      onChange={(e) => setWindowId(e.target.value)}
                      required
                      fullWidth
                      helperText="Select the window you will be serving at"
                    >
                      <MenuItem value="">Select a window...</MenuItem>
                      {windows.map((w) => (
                        <MenuItem key={w.id} value={w.id}>
                          {w.name} {w.code ? `(${w.code})` : ''}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}

                  {error && (
                    <Typography variant="body2" color="error.main" fontWeight={500}>
                      {error}
                    </Typography>
                  )}

                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    fullWidth
                    startIcon={<LoginIcon />}
                    sx={{ py: 1.5 }}
                  >
                    Continue as {role === 'admin' ? 'Admin' : 'Officer'}
                  </Button>
                </Stack>
              </form>
            </Paper>

            <Typography
              variant="caption"
              color="text.disabled"
              display="block"
              textAlign="center"
              sx={{ mt: 3 }}
            >
              Visayas State University - Queue Management System
            </Typography>
          </Box>
        </Fade>
      </Container>
    </Box>
  )
}
