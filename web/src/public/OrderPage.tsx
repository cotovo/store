import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined'
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CircularProgress from '@mui/material/CircularProgress'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useQuery } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { useParams } from 'react-router-dom'
import { api } from '../api/client'
import type { Order } from '../api/types'
import PublicLayout from './PublicLayout'
import PublicOrderCard from './PublicOrderCard'

export default function OrderPage() {
  const { tradeNo = '' } = useParams()
  const orderQuery = useQuery({
    queryKey: ['order-status', tradeNo],
    queryFn: () => api<Order>(`/api/public/orders/${tradeNo}/status`),
    enabled: Boolean(tradeNo),
    refetchInterval: (query) =>
      query.state.data?.paymentStatus === 'paid' ? false : 3000,
  })
  const order = orderQuery.data

  return (
    <PublicLayout>
      <Stack spacing={2}>
        <Panel
          title="订单状态"
          icon={<ReceiptLongOutlinedIcon fontSize="small" />}
          action={
            <Button
              startIcon={<RefreshOutlinedIcon />}
              onClick={() => orderQuery.refetch()}
            >
              刷新
            </Button>
          }
        >
          {orderQuery.isLoading && (
            <Stack sx={{ py: 3, alignItems: 'center' }} spacing={1.5}>
              <CircularProgress size={28} />
              <Typography color="text.secondary">正在查询订单信息...</Typography>
            </Stack>
          )}
          {orderQuery.error && (
            <Alert severity="error">订单加载失败，请使用查单页确认。</Alert>
          )}
          {order && <PublicOrderCard order={order} />}
        </Panel>
      </Stack>
    </PublicLayout>
  )
}

function Panel({
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
    <Card className="acg-panel">
      <Box className="acg-panel-header">
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flex: 1 }}>
          <Box className="acg-panel-icon">{icon}</Box>
          <Typography variant="h6" className="acg-panel-title">
            {title}
          </Typography>
        </Box>
        {action}
      </Box>
      <CardContent className="acg-panel-body">{children}</CardContent>
    </Card>
  )
}
