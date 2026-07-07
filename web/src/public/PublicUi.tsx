import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CircularProgress from '@mui/material/CircularProgress'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { ReactNode } from 'react'

export function PublicPanel({
  title,
  icon,
  action,
  children,
}: {
  title: string
  icon: ReactNode
  action?: ReactNode
  children: ReactNode
}) {
  return (
    <Card className="store-panel">
      <Box className="store-panel-header">
        <Box className="store-panel-heading">
          <Box className="store-panel-icon">{icon}</Box>
          <Typography variant="h6" className="store-panel-title">
            {title}
          </Typography>
        </Box>
        {action}
      </Box>
      <CardContent className="store-panel-body">{children}</CardContent>
    </Card>
  )
}

export function PublicLoadingState({ label }: { label: string }) {
  return (
    <Stack className="store-state" spacing={1.5}>
      <CircularProgress size={28} />
      <Typography color="text.secondary">{label}</Typography>
    </Stack>
  )
}

export function PublicEmptyState({
  icon,
  title,
  description,
}: {
  icon: ReactNode
  title: string
  description: string
}) {
  return (
    <Stack className="store-state" spacing={1}>
      <Box className="store-state-icon">{icon}</Box>
      <Typography variant="h6" color="text.secondary">
        {title}
      </Typography>
      <Typography color="text.secondary" sx={{ textAlign: 'center' }}>
        {description}
      </Typography>
    </Stack>
  )
}
