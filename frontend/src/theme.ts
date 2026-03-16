import { createTheme, alpha } from '@mui/material'

// VSU (Visayas State University) branded theme
// Forest green + warm gold, flat design, Inter font

const theme = createTheme({
  palette: {
    primary: {
      main: '#1B5E20',
      light: '#2E7D32',
      dark: '#0D3D12',
      contrastText: '#fff',
    },
    secondary: {
      main: '#FFC107',
      light: '#FFD54F',
      dark: '#F9A825',
      contrastText: '#1B5E20',
    },
    success: {
      main: '#4CAF50',
      light: '#66BB6A',
      dark: '#388E3C',
    },
    error: {
      main: '#E53935',
      light: '#EF5350',
      dark: '#C62828',
    },
    warning: {
      main: '#FB8C00',
      light: '#FFA726',
      dark: '#EF6C00',
    },
    info: {
      main: '#1E88E5',
      light: '#42A5F5',
      dark: '#1565C0',
    },
    background: {
      default: '#F5F5F0',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1A1A1A',
      secondary: '#5F6368',
    },
    divider: '#E0E0E0',
  },
  shape: {
    borderRadius: 8,
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 800, letterSpacing: '-0.02em' },
    h2: { fontWeight: 800, letterSpacing: '-0.01em' },
    h3: { fontWeight: 700, letterSpacing: '-0.01em' },
    h4: { fontWeight: 700 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 700 },
    subtitle1: { fontWeight: 600 },
    subtitle2: { fontWeight: 600 },
    button: { fontWeight: 600, textTransform: 'none' as const },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarWidth: 'thin',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: { backgroundColor: '#1B5E20' },
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none' as const,
          fontWeight: 600,
          padding: '8px 20px',
        },
        sizeLarge: {
          padding: '12px 28px',
          fontSize: '1rem',
        },
        sizeSmall: {
          padding: '4px 12px',
          fontSize: '0.8125rem',
        },
      },
    },
    MuiPaper: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          borderRadius: 12,
          border: '1px solid',
          borderColor: '#E0E0E0',
        },
        elevation0: {
          boxShadow: 'none',
        },
      },
    },
    MuiCard: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          borderRadius: 12,
          border: '1px solid',
          borderColor: '#E0E0E0',
          transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
          '&:hover': {
            borderColor: '#BDBDBD',
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          borderRadius: 6,
        },
        sizeSmall: {
          height: 24,
          fontSize: '0.75rem',
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
        size: 'medium',
      },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 16,
          border: 'none',
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none' as const,
          fontWeight: 600,
          fontSize: '0.9375rem',
          minHeight: 56,
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          border: 'none',
        },
      },
    },
    MuiFab: {
      defaultProps: {
        disableRipple: false,
      },
      styleOverrides: {
        root: {
          boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
          '&:hover': {
            boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
          },
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          borderRadius: 6,
          fontSize: '0.8125rem',
        },
      },
    },
    MuiSkeleton: {
      styleOverrides: {
        root: {
          borderRadius: 6,
        },
      },
    },
  },
})

// Design tokens for consistent usage across the app
export const tokens = {
  borderRadius: {
    sm: 6,
    md: 8,
    lg: 12,
    xl: 16,
  },
  shadow: {
    card: '0 2px 12px rgba(0,0,0,0.06)',
    cardHover: '0 4px 20px rgba(0,0,0,0.1)',
    fab: '0 4px 14px rgba(0,0,0,0.15)',
  },
  transition: {
    default: 'all 0.2s ease',
    slow: 'all 0.3s ease',
  },
  status: {
    colors: {
      0: alpha('#1E88E5', 0.1),   // Queued — blue
      1: alpha('#FB8C00', 0.1),   // Called — orange
      2: alpha('#1B5E20', 0.1),   // Serving — green
      3: alpha('#4CAF50', 0.1),   // Completed — success
      4: alpha('#E53935', 0.1),   // No-show — red
      5: alpha('#9E9E9E', 0.1),   // Transferred — grey
    } as Record<number, string>,
    labels: {
      0: 'Queued',
      1: 'Called',
      2: 'Serving',
      3: 'Completed',
      4: 'No-show',
      5: 'Transferred',
    } as Record<number, string>,
    chipColors: {
      0: 'info',
      1: 'warning',
      2: 'primary',
      3: 'success',
      4: 'error',
      5: 'default',
    } as Record<number, 'default' | 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info'>,
  },
} as const

export default theme
