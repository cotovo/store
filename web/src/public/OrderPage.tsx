import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined'
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { api } from '../api/client'
import type { Order } from '../api/types'
import PublicLayout from './PublicLayout'
import PublicOrderCard from './PublicOrderCard'
import { PublicLoadingState, PublicPanel } from './PublicUi'

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
        <PublicPanel
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
            <PublicLoadingState label="正在查询订单信息..." />
          )}
          {orderQuery.error && (
            <Alert severity="error">订单加载失败，请使用查单页确认。</Alert>
          )}
          {order && <PublicOrderCard order={order} />}
        </PublicPanel>
      </Stack>
    </PublicLayout>
  )
}
