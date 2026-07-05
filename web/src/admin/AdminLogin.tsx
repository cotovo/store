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
      sx={{
        minHeight: '100dvh',
        display: 'grid',
        placeItems: 'center',
        bgcolor: 'background.default',
        p: 2,
      }}
    >
      <Card variant="outlined" sx={{ width: '100%', maxWidth: 420 }}>
        <CardContent>
          <Stack spacing={2.5}>
            <Box>
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
            />
            <TextField
              label="密码"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
            />
            <Button
              variant="contained"
              startIcon={<LoginOutlinedIcon />}
              disabled={login.isPending}
              onClick={() => login.mutate()}
            >
              登录
            </Button>
            {login.error && <Alert severity="error">{login.error.message}</Alert>}
          </Stack>
        </CardContent>
      </Card>
    </Box>
  )
}
