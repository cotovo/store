import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { ReactNode } from 'react'

export function AdminPage({
  title,
  crumbs = [],
  children,
}: {
  title: string
  crumbs?: string[]
  children: ReactNode
}) {
  return (
    <Stack spacing={2.5}>
      <Box
        sx={{
          minHeight: 55,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          flexWrap: 'wrap',
        }}
      >
        <Typography variant="h5" component="h1" sx={{ color: 'grey.900' }}>
          {title}
        </Typography>
        <Box sx={{ height: 20, borderLeft: '1px solid', borderColor: 'divider' }} />
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
          {(crumbs.length ? crumbs : ['后台']).map((crumb, index) => (
            <Stack
              key={`${crumb}-${index}`}
              direction="row"
              spacing={1}
              sx={{ alignItems: 'center' }}
            >
              <Typography
                variant="body2"
                color={index === crumbs.length - 1 ? 'text.primary' : 'text.secondary'}
                sx={{ fontWeight: index === crumbs.length - 1 ? 700 : 600 }}
              >
                {crumb}
              </Typography>
              {index < crumbs.length - 1 && (
                <Box
                  sx={{
                    width: 5,
                    height: 2,
                    borderRadius: 1,
                    bgcolor: 'grey.300',
                  }}
                />
              )}
            </Stack>
          ))}
        </Stack>
      </Box>
      {children}
    </Stack>
  )
}

export function AdminCard({
  children,
  toolbar,
}: {
  children: ReactNode
  toolbar?: ReactNode
}) {
  return (
    <Card variant="outlined" className="admin-card">
      {toolbar && (
        <Box
          sx={{
            px: 2,
            py: 1.5,
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          {toolbar}
        </Box>
      )}
      <CardContent sx={{ p: 2 }}>{children}</CardContent>
    </Card>
  )
}

export function AdminStat({
  label,
  value,
  tone = 'primary',
  icon,
}: {
  label: string
  value: ReactNode
  tone?: 'primary' | 'success' | 'danger' | 'info' | 'dark'
  icon?: ReactNode
}) {
  const colorMap = {
    primary: 'primary.main',
    success: 'success.main',
    danger: 'error.main',
    info: 'info.main',
    dark: 'grey.900',
  }

  return (
    <Card variant="outlined" className="admin-stat-card">
      <CardContent>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          {icon && (
            <Box
              sx={{
                width: 42,
                height: 42,
                borderRadius: '50%',
                display: 'grid',
                placeItems: 'center',
                bgcolor: 'rgba(0, 158, 247, 0.08)',
                color: colorMap[tone],
              }}
            >
              {icon}
            </Box>
          )}
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 700 }}>
              {label}
            </Typography>
            <Typography variant="h4" sx={{ color: colorMap[tone], mt: 0.75 }}>
              {value}
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  )
}

export function ToolbarRow({ children }: { children: ReactNode }) {
  return (
    <Stack
      direction="row"
      spacing={1}
      sx={{ alignItems: 'center', flexWrap: 'wrap', gap: 1 }}
    >
      {children}
    </Stack>
  )
}

export function TableSearch({ children }: { children: ReactNode }) {
  return (
    <Box className="admin-table-search">
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={1.25}
        sx={{ alignItems: { xs: 'stretch', md: 'center' }, flexWrap: 'wrap' }}
      >
        {children}
      </Stack>
    </Box>
  )
}

export function SoftStatus({
  label,
  color = 'default',
}: {
  label: string
  color?: 'success' | 'warning' | 'error' | 'info' | 'primary' | 'default'
}) {
  return <Chip size="small" className={`soft-status soft-status-${color}`} label={label} />
}
