import { createTheme } from '@mui/material/styles'

export const theme = createTheme({
  shape: {
    borderRadius: 14,
  },
  palette: {
    mode: 'light',
    primary: {
      main: '#7DD3FC',
      dark: '#0284C7',
    },
    secondary: {
      main: '#BAE6FD',
      dark: '#0369A1',
    },
    success: {
      main: '#34C759',
    },
    info: {
      main: '#0EA5E9',
    },
    warning: {
      main: '#FF9500',
    },
    error: {
      main: '#FF3B30',
    },
    background: {
      default: '#F5F5F7',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1D1D1F',
      secondary: '#6E6E73',
    },
  },
  typography: {
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, system-ui, sans-serif',
    h1: { fontWeight: 700, letterSpacing: 0 },
    h2: { fontWeight: 700, letterSpacing: 0 },
    h3: { fontWeight: 700, letterSpacing: 0 },
    h4: { fontWeight: 700, letterSpacing: 0 },
    h5: { fontWeight: 700, letterSpacing: 0 },
    h6: { fontWeight: 700, letterSpacing: 0 },
    button: { letterSpacing: 0, fontWeight: 600 },
  },
  components: {
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          minHeight: 44,
          textTransform: 'none',
          borderRadius: 14,
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
        size: 'small',
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 18,
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 24,
        },
      },
    },
  },
})
