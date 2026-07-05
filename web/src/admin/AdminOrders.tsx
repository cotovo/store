import DeleteSweepOutlinedIcon from '@mui/icons-material/DeleteSweepOutlined'
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined'
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Grid from '@mui/material/Grid'
import MenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import { DataGrid, type GridColDef } from '@mui/x-data-grid'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { api, money } from '../api/client'
import type { Order } from '../api/types'
import {
  AdminCard,
  AdminPage,
  AdminStat,
  SoftStatus,
  TableSearch,
  ToolbarRow,
} from './AdminUi'

export default function AdminOrders() {
  const queryClient = useQueryClient()
  const [deliverOrder, setDeliverOrder] = useState<Order | null>(null)
  const [content, setContent] = useState('')
  const [keyword, setKeyword] = useState('')
  const [paymentStatus, setPaymentStatus] = useState('all')
  const [deliveryStatus, setDeliveryStatus] = useState('all')
  const ordersQuery = useQuery({
    queryKey: ['admin-orders'],
    queryFn: () => api<Order[]>('/api/admin/orders'),
  })
  const deliver = useMutation({
    mutationFn: () =>
      api<null>(`/api/admin/orders/${deliverOrder?.id}/deliver`, {
        method: 'POST',
        body: JSON.stringify({ content }),
      }),
    onSuccess: () => {
      setDeliverOrder(null)
      setContent('')
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] })
    },
  })
  const orders = useMemo(() => ordersQuery.data ?? [], [ordersQuery.data])
  const filteredOrders = useMemo(() => {
    const normalized = keyword.trim().toLowerCase()
    return orders.filter((order) => {
      const matchesKeyword =
        !normalized ||
        `${order.tradeNo} ${order.productName} ${order.buyerEmail}`.toLowerCase().includes(normalized)
      const matchesPayment =
        paymentStatus === 'all' || order.paymentStatus === paymentStatus
      const matchesDelivery =
        deliveryStatus === 'all' || order.deliveryStatus === deliveryStatus
      return matchesKeyword && matchesPayment && matchesDelivery
    })
  }, [deliveryStatus, keyword, orders, paymentStatus])
  const paidOrders = filteredOrders.filter((order) => order.paymentStatus === 'paid')
  const amountCents = paidOrders.reduce((sum, order) => sum + order.amountCents, 0)
  const pendingDeliveryCount = filteredOrders.filter(
    (order) => order.paymentStatus === 'paid' && order.deliveryStatus !== 'delivered',
  ).length

  const columns = useMemo<GridColDef<Order>[]>(
    () => [
      { field: 'tradeNo', headerName: '订单号', minWidth: 190 },
      { field: 'productName', headerName: '商品', flex: 1, minWidth: 160 },
      {
        field: 'amountCents',
        headerName: '金额',
        width: 120,
        valueFormatter: (value) => money(Number(value)),
      },
      { field: 'buyerEmail', headerName: '邮箱', minWidth: 190 },
      {
        field: 'paymentStatus',
        headerName: '支付',
        width: 110,
        renderCell: ({ value }) => (
          <SoftStatus
            color={value === 'paid' ? 'success' : 'warning'}
            label={value === 'paid' ? '已支付' : '待支付'}
          />
        ),
      },
      {
        field: 'deliveryStatus',
        headerName: '发货',
        width: 110,
        renderCell: ({ value }) => (
          <SoftStatus
            color={value === 'delivered' ? 'primary' : 'warning'}
            label={value === 'delivered' ? '已发货' : '待发货'}
          />
        ),
      },
      {
        field: 'actions',
        headerName: '操作',
        width: 140,
        sortable: false,
        renderCell: ({ row }) => (
          <Button
            size="small"
            startIcon={<LocalShippingOutlinedIcon />}
            disabled={row.paymentStatus !== 'paid'}
            onClick={() => {
              setDeliverOrder(row)
              setContent(row.deliveryContent || '')
            }}
          >
            发货
          </Button>
        ),
      },
    ],
    [],
  )

  return (
    <AdminPage title="商品订单" crumbs={['Trade', '商品订单']}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 4 }}>
          <AdminStat label="订单数量" value={filteredOrders.length} tone="primary" />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <AdminStat label="订单金额" value={money(amountCents)} tone="success" />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <AdminStat label="待发货" value={pendingDeliveryCount} tone="danger" />
        </Grid>
      </Grid>
      {ordersQuery.error && <Alert severity="error">订单加载失败。</Alert>}
      <AdminCard
        toolbar={
          <ToolbarRow>
            <Button color="primary" variant="outlined" startIcon={<DeleteSweepOutlinedIcon />}>
              一键清理无用订单
            </Button>
            <Button color="success" variant="outlined" startIcon={<DownloadOutlinedIcon />}>
              导出筛选订单
            </Button>
            <Alert severity="info" sx={{ py: 0, alignItems: 'center' }}>
              上方订单数据会根据下方查询条件筛选显示。
            </Alert>
          </ToolbarRow>
        }
      >
        <Stack spacing={1.5}>
          <TableSearch>
            <TextField
              label="订单号/商品/邮箱"
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              sx={{ minWidth: { md: 260 } }}
            />
            <TextField
              select
              label="支付状态"
              value={paymentStatus}
              onChange={(event) => setPaymentStatus(event.target.value)}
              sx={{ minWidth: { md: 150 } }}
            >
              <MenuItem value="all">全部支付</MenuItem>
              <MenuItem value="pending">待支付</MenuItem>
              <MenuItem value="paid">已支付</MenuItem>
            </TextField>
            <TextField
              select
              label="发货状态"
              value={deliveryStatus}
              onChange={(event) => setDeliveryStatus(event.target.value)}
              sx={{ minWidth: { md: 150 } }}
            >
              <MenuItem value="all">全部发货</MenuItem>
              <MenuItem value="pending">待发货</MenuItem>
              <MenuItem value="delivered">已发货</MenuItem>
            </TextField>
          </TableSearch>
          <Box className="admin-grid-wrap admin-grid-wrap-tall">
            <DataGrid
              rows={filteredOrders}
              columns={columns}
              loading={ordersQuery.isLoading}
              getRowId={(row) => row.id}
              checkboxSelection
              pageSizeOptions={[10, 25, 50]}
              initialState={{
                pagination: { paginationModel: { pageSize: 10, page: 0 } },
              }}
              disableRowSelectionOnClick
            />
          </Box>
        </Stack>
      </AdminCard>

      <Dialog
        open={Boolean(deliverOrder)}
        onClose={() => setDeliverOrder(null)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>手动发货</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <Alert severity="info">
              订单 {deliverOrder?.tradeNo}，保存后买家即可在查单页查看发货内容。
            </Alert>
            <TextField
              label="发货内容"
              multiline
              minRows={6}
              value={content}
              onChange={(event) => setContent(event.target.value)}
            />
            {deliver.error && <Alert severity="error">{deliver.error.message}</Alert>}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeliverOrder(null)}>取消</Button>
          <Button
            variant="contained"
            disabled={!content.trim() || deliver.isPending}
            onClick={() => deliver.mutate()}
          >
            确认发货
          </Button>
        </DialogActions>
      </Dialog>
    </AdminPage>
  )
}
