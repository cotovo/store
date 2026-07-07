import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined'
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined'
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined'
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined'
import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import BottomNavigation from '@mui/material/BottomNavigation'
import BottomNavigationAction from '@mui/material/BottomNavigationAction'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import InputAdornment from '@mui/material/InputAdornment'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import type { ReactNode } from 'react'
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom'

type Props = {
  children: ReactNode
  searchValue?: string
  onSearchChange?: (value: string) => void
}

export default function PublicLayout({
  children,
  searchValue,
  onSearchChange,
}: Props) {
  const location = useLocation()
  const navigate = useNavigate()
  const bottomValue = location.pathname.startsWith('/query') ? '/query' : '/'

  return (
    <Box className="public-shell" sx={{ minHeight: '100dvh' }}>
      <AppBar
        color="inherit"
        position="sticky"
        elevation={0}
        sx={{
          borderBottom: '1px solid',
          borderColor: 'divider',
          backdropFilter: 'blur(14px)',
          bgcolor: 'rgba(255,255,255,0.88)',
        }}
      >
        <Container maxWidth="lg">
          <Toolbar
            disableGutters
            sx={{
              gap: 1.5,
              minHeight: 72,
              flexWrap: { xs: 'wrap', md: 'nowrap' },
              py: { xs: 1, md: 0 },
            }}
          >
            <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center', mr: 1 }}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  display: 'grid',
                  placeItems: 'center',
                  color: 'primary.main',
                  bgcolor: 'primary.light',
                  border: '1px solid',
                  borderColor: 'rgba(14, 165, 233, 0.22)',
                }}
              >
                <Inventory2OutlinedIcon fontSize="small" />
              </Box>
              <Box>
                <Typography variant="h6" sx={{ lineHeight: 1.1 }}>
                  Store
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  数字发卡店
                </Typography>
              </Box>
            </Stack>

            <Stack
              direction="row"
              spacing={0.5}
              sx={{
                flex: 1,
                alignItems: 'center',
                minWidth: 180,
                display: { xs: 'none', md: 'flex' },
              }}
            >
              <Button
                component={RouterLink}
                to="/"
                startIcon={<StorefrontOutlinedIcon />}
                color="inherit"
              >
                购物
              </Button>
              <Button
                component={RouterLink}
                to="/query"
                startIcon={<ReceiptLongOutlinedIcon />}
                color="inherit"
              >
                订单查询
              </Button>
            </Stack>

            {onSearchChange && (
              <TextField
                value={searchValue ?? ''}
                onChange={(event) => onSearchChange(event.target.value)}
                placeholder="搜索商品关键词..."
                size="small"
                sx={{
                  width: { xs: '100%', md: 280 },
                  '& .MuiOutlinedInput-root': {
                    bgcolor: 'background.paper',
                    borderRadius: 3,
                  },
                }}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchOutlinedIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  },
                }}
              />
            )}
          </Toolbar>
        </Container>
      </AppBar>
      <Container
        component="main"
        maxWidth="lg"
        sx={{
          py: { xs: 2.5, md: 4 },
          pb: { xs: 'calc(88px + env(safe-area-inset-bottom))', md: 4 },
        }}
      >
        {children}
      </Container>
      <BottomNavigation
        value={bottomValue}
        onChange={(_, value: string) => navigate(value)}
        className="ios-bottom-nav"
        sx={{ display: { xs: 'flex', md: 'none' } }}
      >
        <BottomNavigationAction
          label="购物"
          value="/"
          icon={<StorefrontOutlinedIcon />}
        />
        <BottomNavigationAction
          label="查单"
          value="/query"
          icon={<ReceiptLongOutlinedIcon />}
        />
      </BottomNavigation>
    </Box>
  )
}
