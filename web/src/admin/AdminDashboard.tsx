import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined'
import PaidOutlinedIcon from '@mui/icons-material/PaidOutlined'
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined'
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined'
import Alert from '@mui/material/Alert'
import CampaignOutlinedIcon from '@mui/icons-material/CampaignOutlined'
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined'
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useQuery } from '@tanstack/react-query'
import { api, money } from '../api/client'
import type { DashboardStats } from '../api/types'
import { AdminCard, AdminPage, AdminStat } from './AdminUi'

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
                      bgcolor: 'primary.50',
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
                  icon={<ReceiptLongOutlinedIcon />}
                  label="订单"
                  value={stats?.orderCount ?? 0}
                  tone="primary"
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

            <AdminCard>
              <Stack spacing={1}>
                <Typography variant="h6" color="primary">
                  本周数据
                </Typography>
                <Box className="admin-chart-placeholder">
                  <Typography color="text.secondary">
                    图表区域预留：后续接入订单趋势、发货趋势和库存预警。
                  </Typography>
                </Box>
              </Stack>
            </AdminCard>
          </Stack>
        </Grid>
      </Grid>
    </AdminPage>
  )
}
