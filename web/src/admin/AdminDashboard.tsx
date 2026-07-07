import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined'
import PaidOutlinedIcon from '@mui/icons-material/PaidOutlined'
import PendingActionsOutlinedIcon from '@mui/icons-material/PendingActionsOutlined'
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined'
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined'
import Alert from '@mui/material/Alert'
import CampaignOutlinedIcon from '@mui/icons-material/CampaignOutlined'
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined'
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Grid from '@mui/material/Grid'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useQuery } from '@tanstack/react-query'
import { Link as RouterLink } from 'react-router-dom'
import { api, money } from '../api/client'
import type { DashboardOrderSummary, DashboardProductStock, DashboardStats } from '../api/types'
import { AdminCard, AdminPage, AdminStat, SoftStatus } from './AdminUi'

export default function AdminDashboard() {
  const statsQuery = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: () => api<DashboardStats>('/api/admin/dashboard'),
  })
  const stats = statsQuery.data

  if (statsQuery.error) {
    return <Alert severity="error">概览加载失败。</Alert>
  }

  return (
    <AdminPage title="控制台" crumbs={['Main', '控制台']}>
      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, lg: 3 }}>
          <AdminCard>
            <Stack spacing={2}>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                <CampaignOutlinedIcon color="primary" />
                <Typography variant="h6">官方公告</Typography>
              </Stack>
              <Typography color="text.secondary">
                当前版本保留发卡系统核心链路：商品、卡密、订单、自动/手动发货和查单。复杂会员、分站、供货、插件市场模块不进入新版。
              </Typography>
            </Stack>
          </AdminCard>
        </Grid>

        <Grid size={{ xs: 12, lg: 9 }}>
          <Stack spacing={2.5}>
            <AdminCard>
              <Box className="admin-user-card">
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={2}
                  sx={{ alignItems: { xs: 'flex-start', sm: 'center' } }}
                >
                  <Paper
                    elevation={0}
                    sx={{
                      width: 46,
                      height: 46,
                      borderRadius: '50%',
                      display: 'grid',
                      placeItems: 'center',
                      bgcolor: 'primary.light',
                      color: 'primary.main',
                    }}
                  >
                    <PersonOutlineOutlinedIcon />
                  </Paper>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h5" color="error.main">
                      Admin
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                      <EmailOutlinedIcon fontSize="small" color="primary" />
                      <Typography color="primary">admin@example.com</Typography>
                    </Stack>
                  </Box>
                </Stack>
              </Box>
            </AdminCard>

            <Grid container spacing={2}>
              <Grid size={{ xs: 6, md: 3 }}>
                <AdminStat
                  icon={<PaidOutlinedIcon />}
                  label="交易金额"
                  value={money(stats?.revenueCents ?? 0)}
                  tone="success"
                />
              </Grid>
              <Grid size={{ xs: 6, md: 3 }}>
                <AdminStat
                  icon={<PaidOutlinedIcon />}
                  label="今日收入"
                  value={money(stats?.todayRevenueCents ?? 0)}
                  tone="info"
                />
              </Grid>
              <Grid size={{ xs: 6, md: 3 }}>
                <AdminStat
                  icon={<ReceiptLongOutlinedIcon />}
                  label="订单"
                  value={stats?.orderCount ?? 0}
                  tone="primary"
                />
              </Grid>
              <Grid size={{ xs: 6, md: 3 }}>
                <AdminStat
                  icon={<PendingActionsOutlinedIcon />}
                  label="待发货"
                  value={stats?.pendingDelivery ?? 0}
                  tone={(stats?.pendingDelivery ?? 0) > 0 ? 'danger' : 'dark'}
                />
              </Grid>
              <Grid size={{ xs: 6, md: 3 }}>
                <AdminStat
                  icon={<ShoppingBagOutlinedIcon />}
                  label="商品"
                  value={stats?.productCount ?? 0}
                  tone="info"
                />
              </Grid>
              <Grid size={{ xs: 6, md: 3 }}>
                <AdminStat
                  icon={<Inventory2OutlinedIcon />}
                  label="可售卡密"
                  value={stats?.stockCount ?? 0}
                  tone="success"
                />
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, lg: 7 }}>
                <RecentOrders orders={stats?.recentOrders ?? []} />
              </Grid>
              <Grid size={{ xs: 12, lg: 5 }}>
                <StockWatch products={stats?.lowStockProducts ?? []} />
              </Grid>
            </Grid>
          </Stack>
        </Grid>
      </Grid>
    </AdminPage>
  )
}

function RecentOrders({ orders }: { orders: DashboardOrderSummary[] }) {
  return (
    <AdminCard
      toolbar={
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6">最近订单</Typography>
          <Button component={RouterLink} to="/admin/orders" size="small" variant="outlined">
            查看全部
          </Button>
        </Stack>
      }
    >
      <Stack divider={<Divider flexItem />} spacing={0}>
        {orders.length === 0 && (
          <Typography color="text.secondary">暂无订单。</Typography>
        )}
        {orders.map((order) => (
          <Stack
            key={order.id}
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1.5}
            sx={{ alignItems: { xs: 'flex-start', sm: 'center' }, py: 1.25 }}
          >
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ fontWeight: 800 }} noWrap>
                {order.productName}
              </Typography>
              <Typography className="mono" variant="body2" color="text.secondary">
                {order.tradeNo}
              </Typography>
            </Box>
            <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
              <SoftStatus
                color={order.paymentStatus === 'paid' ? 'success' : 'warning'}
                label={order.paymentStatus === 'paid' ? '已支付' : '待支付'}
              />
              <SoftStatus
                color={order.deliveryStatus === 'delivered' ? 'primary' : 'warning'}
                label={order.deliveryStatus === 'delivered' ? '已发货' : '待发货'}
              />
              <Typography sx={{ fontWeight: 800 }}>{money(order.amountCents)}</Typography>
            </Stack>
          </Stack>
        ))}
      </Stack>
    </AdminCard>
  )
}

function StockWatch({ products }: { products: DashboardProductStock[] }) {
  return (
    <AdminCard
      toolbar={
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6">库存预警</Typography>
          <Button component={RouterLink} to="/admin/cards" size="small" variant="outlined">
            管理卡密
          </Button>
        </Stack>
      }
    >
      <Stack divider={<Divider flexItem />} spacing={0}>
        {products.length === 0 && (
          <Typography color="text.secondary">自动发货商品库存正常。</Typography>
        )}
        {products.map((product) => (
          <Stack
            key={product.id}
            direction="row"
            spacing={1.5}
            sx={{ alignItems: 'center', py: 1.25 }}
          >
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ fontWeight: 800 }} noWrap>
                {product.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                已售 {product.soldCount}
              </Typography>
            </Box>
            <SoftStatus
              color={product.availableStock === 0 ? 'error' : 'warning'}
              label={`库存 ${product.availableStock}`}
            />
          </Stack>
        ))}
      </Stack>
    </AdminCard>
  )
}
