import ManageSearchOutlinedIcon from '@mui/icons-material/ManageSearchOutlined'
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined'
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CircularProgress from '@mui/material/CircularProgress'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useMutation } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { useState } from 'react'
import { api } from '../api/client'
import type { Order } from '../api/types'
import PublicLayout from './PublicLayout'
import PublicOrderCard from './PublicOrderCard'

export default function QueryPage() {
  const [keyword, setKeyword] = useState('')
  const [password, setPassword] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const query = useMutation({
    mutationFn: () =>
      api<Order>('/api/public/orders/query', {
        method: 'POST',
        body: JSON.stringify({
          keyword,
          queryPassword: password,
        }),
      }),
  })
  const keywordError = submitted && !keyword.trim()

  function runQuery() {
    setSubmitted(true)
    if (!keyword.trim()) {
      return
    }
    query.reset()
    query.mutate()
  }

  return (
    <PublicLayout>
      <Stack spacing={2}>
        <Panel title="订单查询" icon={<SearchOutlinedIcon fontSize="small" />}>
          <Stack
            component="form"
            className="order-query-form"
            spacing={2}
            onSubmit={(event) => {
              event.preventDefault()
              runQuery()
            }}
          >
            <Grid container spacing={1.5} sx={{ justifyContent: 'center', alignItems: 'flex-start' }}>
              <Grid size={{ xs: 12, sm: 5, md: 4 }}>
                <TextField
                  fullWidth
                  name="keywords"
                  value={keyword}
                  onChange={(event) => setKeyword(event.target.value)}
                  placeholder="订单号/联系方式"
                  error={keywordError}
                  helperText={keywordError ? '请输入订单号或联系方式。' : ' '}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4, md: 3 }}>
                <TextField
                  fullWidth
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="查询密码"
                  type="password"
                  helperText=" "
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 'auto' }}>
                <Button
                  fullWidth
                  type="submit"
                  variant="contained"
                  className="btn-search-query"
                  startIcon={<ManageSearchOutlinedIcon />}
                  disabled={query.isPending}
                >
                  查询订单
                </Button>
              </Grid>
            </Grid>
          </Stack>
          {query.error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {query.error.message}
            </Alert>
          )}
        </Panel>

        {query.isPending && (
          <Panel title="加载状态" icon={<ManageSearchOutlinedIcon fontSize="small" />}>
            <Stack sx={{ py: 2, alignItems: 'center' }} spacing={1.5}>
              <CircularProgress size={28} />
              <Typography color="text.secondary">正在查询订单信息...</Typography>
            </Stack>
          </Panel>
        )}

        {query.data && (
          <Panel title="查询结果" icon={<ReceiptLongOutlinedIcon fontSize="small" />}>
            <PublicOrderCard order={query.data} />
          </Panel>
        )}

        {!query.data && !query.isPending && !query.error && (
          <Panel title="查询结果" icon={<ReceiptLongOutlinedIcon fontSize="small" />}>
            <Stack className="no-results" sx={{ py: 3, alignItems: 'center' }} spacing={1}>
              <SearchOutlinedIcon sx={{ fontSize: 44, color: 'text.secondary' }} />
              <Typography variant="h6" color="text.secondary">
                未找到相关订单
              </Typography>
              <Typography color="text.secondary">
                请输入订单号或下单联系方式进行查询。
              </Typography>
            </Stack>
          </Panel>
        )}
      </Stack>
    </PublicLayout>
  )
}

function Panel({
  title,
  icon,
  children,
}: {
  title: string
  icon: ReactNode
  children: ReactNode
}) {
  return (
    <Card className="acg-panel">
      <Box className="acg-panel-header">
        <Box className="acg-panel-icon">{icon}</Box>
        <Typography variant="h6" className="acg-panel-title">
          {title}
        </Typography>
      </Box>
      <CardContent className="acg-panel-body">{children}</CardContent>
    </Card>
  )
}
