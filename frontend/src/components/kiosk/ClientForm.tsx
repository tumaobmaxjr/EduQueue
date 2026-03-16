import React from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Box,
  Typography,
  TextField,
  Stack,
  Paper,
  FormControlLabel,
  Checkbox,
  alpha,
} from '@mui/material'

// Validation schema
const clientFormSchema = z.object({
  clientName: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must not exceed 100 characters')
    .regex(/^[a-zA-Z\s.'-]+$/, 'Name must only contain letters, spaces, and common punctuation'),
  studentId: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^[a-zA-Z0-9-]+$/.test(val),
      'Student ID must only contain letters, numbers, and hyphens'
    ),
  yearLevel: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^[1-9]$|^1[0-2]$|^(First|Second|Third|Fourth|Fifth)( Year)?$/i.test(val),
      'Year level must be 1-12 or First/Second/Third/Fourth/Fifth Year'
    ),
  isPriority: z.boolean(),
})

export type ClientFormData = z.infer<typeof clientFormSchema>

interface ClientFormProps {
  formData: ClientFormData
  onChange: (data: ClientFormData) => void
  onValidationChange?: (isValid: boolean) => void
}

export function ClientForm({ formData, onChange, onValidationChange }: ClientFormProps) {
  const {
    control,
    formState: { errors, isValid },
    watch,
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientFormSchema),
    mode: 'onChange',
    defaultValues: formData,
  })

  // Stable callback refs
  const onChangeRef = React.useRef(onChange)
  const onValidationChangeRef = React.useRef(onValidationChange)
  
  React.useEffect(() => {
    onChangeRef.current = onChange
    onValidationChangeRef.current = onValidationChange
  }, [onChange, onValidationChange])

  // Watch all fields and propagate changes
  React.useEffect(() => {
    const subscription = watch((data) => {
      onChangeRef.current(data as ClientFormData)
    })
    return () => subscription.unsubscribe()
  }, [watch])

  // Notify parent of validation state
  React.useEffect(() => {
    onValidationChangeRef.current?.(isValid)
  }, [isValid])

  return (
    <Box>
      <Typography variant="h6" fontWeight={700} sx={{ mb: 0.5 }}>
        Your Information
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Please fill in your details below
      </Typography>

      <Paper sx={{ p: 3 }}>
        <Stack spacing={2.5}>
          <Controller
            name="clientName"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Full Name"
                placeholder="Enter your full name"
                required
                fullWidth
                autoFocus
                error={!!errors.clientName}
                helperText={errors.clientName?.message}
              />
            )}
          />

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <Controller
              name="studentId"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Student ID"
                  placeholder="e.g., 2024-12345"
                  fullWidth
                  error={!!errors.studentId}
                  helperText={errors.studentId?.message || 'Optional'}
                />
              )}
            />
            <Controller
              name="yearLevel"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Year Level"
                  placeholder="e.g., 1, 2, First Year"
                  fullWidth
                  error={!!errors.yearLevel}
                  helperText={errors.yearLevel?.message || 'Optional'}
                />
              )}
            />
          </Stack>

          <Paper
            sx={{
              p: 2,
              bgcolor: (theme) => alpha(theme.palette.warning.main, 0.05),
              borderColor: (theme) => alpha(theme.palette.warning.main, 0.2),
            }}
          >
            <Controller
              name="isPriority"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={field.value}
                      onChange={field.onChange}
                      color="warning"
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body2" fontWeight={600}>
                        Priority Lane
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        For PWD, pregnant, or senior citizens. You will be served ahead of regular queue.
                      </Typography>
                    </Box>
                  }
                  sx={{ alignItems: 'flex-start', mx: 0 }}
                />
              )}
            />
          </Paper>
        </Stack>
      </Paper>
    </Box>
  )
}
