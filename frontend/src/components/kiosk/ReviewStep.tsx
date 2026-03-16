import { Box, Typography, Paper, Stack, Divider, alpha } from '@mui/material'
import StorefrontIcon from '@mui/icons-material/Storefront'
import CategoryIcon from '@mui/icons-material/Category'
import PersonIcon from '@mui/icons-material/Person'
import PriorityHighIcon from '@mui/icons-material/PriorityHigh'
import type { Window, Purpose } from '../../api/types'
import type { ClientFormData } from './ClientForm'

interface ReviewStepProps {
  window: Window | null
  purpose: Purpose | null
  formData: ClientFormData
}

export function ReviewStep({ window, purpose, formData }: ReviewStepProps) {
  if (!window || !purpose) return null

  const items = [
    { icon: <StorefrontIcon />, label: 'Service Window', value: `${window.name}${window.code ? ` (${window.code})` : ''}` },
    { icon: <CategoryIcon />, label: 'Purpose', value: purpose.name },
    { icon: <PersonIcon />, label: 'Name', value: formData.clientName },
  ]

  if (formData.studentId) {
    items.push({ icon: <PersonIcon />, label: 'Student ID', value: formData.studentId })
  }
  if (formData.yearLevel) {
    items.push({ icon: <PersonIcon />, label: 'Year Level', value: formData.yearLevel })
  }

  return (
    <Box>
      <Typography variant="h6" fontWeight={700} sx={{ mb: 0.5 }}>
        Review Your Details
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Please confirm your information before getting your ticket
      </Typography>

      <Paper sx={{ p: 0, overflow: 'hidden' }}>
        {formData.isPriority && (
          <Box
            sx={{
              px: 3,
              py: 1.5,
              bgcolor: (theme) => alpha(theme.palette.warning.main, 0.1),
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <PriorityHighIcon sx={{ fontSize: 18, color: 'warning.main' }} />
            <Typography variant="body2" fontWeight={600} color="warning.dark">
              Priority Lane - You will be served ahead of the regular queue
            </Typography>
          </Box>
        )}
        <Stack divider={<Divider />}>
          {items.map((item, idx) => (
            <Stack
              key={idx}
              direction="row"
              alignItems="center"
              spacing={2}
              sx={{ px: 3, py: 2 }}
            >
              <Box sx={{ color: 'text.disabled', display: 'flex', '& > svg': { fontSize: 20 } }}>
                {item.icon}
              </Box>
              <Box sx={{ minWidth: 100 }}>
                <Typography variant="caption" color="text.secondary">
                  {item.label}
                </Typography>
              </Box>
              <Typography variant="body2" fontWeight={600} sx={{ flex: 1 }}>
                {item.value}
              </Typography>
            </Stack>
          ))}
        </Stack>
      </Paper>
    </Box>
  )
}
