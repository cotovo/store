import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined'
import LoginOutlinedIcon from '@mui/icons-material/LoginOutlined'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/client'

type LoginResult = {
  token: string
  admin: { id: number; email: string; name: string }
}

export default function AdminLogin() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('admin@example.com')
  const [password, setPassword] = useState('password')
  const login = useMutation({
    mutationFn: () =>
      api<LoginResult>('/api/admin/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),
    onSuccess: (data) => {
      localStorage.setItem('admin_token', data.token)
      navigate('/admin', { replace: true })
    },
  })

  return (
    <Box
      className="admin-login-shell"
      sx={{
        minHeight: '100dvh',
        display: 'grid',
        placeItems: 'center',
        p: { xs: 2, md: 3 },
      }}
    >
      <Card variant="outlined" className="admin-login-card" sx={{ width: '100%', maxWidth: 430 }}>
        <CardContent>
          <Stack
            component="form"
            spacing={2.25}
            onSubmit={(event) => {
              event.preventDefault()
              if (!login.isPending) {
                login.mutate()
              }
            }}
          >
            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
              <Box className="admin-login-mark">
                <Inventory2OutlinedIcon />
              </Box>
              <Box>
                <Typography variant="overline" color="primary" sx={{ fontWeight: 800 }}>
                  Store Admin
                </Typography>
                <Typography color="text.secondary">
                  数字发卡店管理后台
                </Typography>
              </Box>
            </Stack>
            <Box sx={{ pt: 0.5 }}>
              <Typography variant="h4" component="h1">
                后台登录
              </Typography>
              <Typography color="text.secondary">
                默认账号来自初始化 SQL，可部署后立即修改。
              </Typography>
            </Box>
            <TextField
              label="邮箱"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="username"
              required
            />
            <TextField
              label="密码"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
            />
            <Button
              type="submit"
              variant="contained"
              startIcon={<LoginOutlinedIcon />}
              disabled={login.isPending}
            >
              {login.isPending ? '正在登录...' : '登录'}
            </Button>
            {login.error && <Alert severity="error">{login.error.message}</Alert>}
          </Stack>
        </CardContent>
      </Card>
    </Box>
  )
}
