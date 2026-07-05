import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined'
import KeyboardArrowDownOutlinedIcon from '@mui/icons-material/KeyboardArrowDownOutlined'
import KeyboardArrowUpOutlinedIcon from '@mui/icons-material/KeyboardArrowUpOutlined'
import RotateRightOutlinedIcon from '@mui/icons-material/RotateRightOutlined'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Grid from '@mui/material/Grid'
import MenuItem from '@mui/material/MenuItem'
import Snackbar from '@mui/material/Snackbar'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import { DataGrid, type GridColDef } from '@mui/x-data-grid'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { api, money } from '../api/client'
import type { Product } from '../api/types'
import {
  AdminCard,
  AdminPage,
  AdminStat,
  SoftStatus,
  TableSearch,
  ToolbarRow,
} from './AdminUi'

type Category = {
  id: number
  name: string
}

export default function AdminProducts() {
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [notice, setNotice] = useState('')
  const [keyword, setKeyword] = useState('')
  const [status, setStatus] = useState('all')
  const [form, setForm] = useState({
    categoryId: 1,
    name: '',
    description: '',
    price: '1.00',
    deliveryMode: 'auto',
    status: 'enabled',
  })

  const productsQuery = useQuery({
    queryKey: ['admin-products'],
    queryFn: () => api<Product[]>('/api/admin/products'),
  })
  const categoriesQuery = useQuery({
    queryKey: ['admin-categories'],
    queryFn: () => api<Category[]>('/api/admin/categories'),
  })
  const saveProduct = useMutation({
    mutationFn: () =>
      api<Product>('/api/admin/products', {
        method: 'POST',
        body: JSON.stringify({
          categoryId: form.categoryId,
          name: form.name,
          description: form.description,
          priceCents: Math.round(Number(form.price) * 100),
          deliveryMode: form.deliveryMode,
          status: form.status,
          stockVisible: true,
          buyMin: 1,
          buyMax: 0,
        }),
      }),
    onSuccess: () => {
      setOpen(false)
      setForm({
        categoryId: 1,
        name: '',
        description: '',
        price: '1.00',
        deliveryMode: 'auto',
        status: 'enabled',
      })
      queryClient.invalidateQueries({ queryKey: ['admin-products'] })
    },
  })
  const products = useMemo(() => productsQuery.data ?? [], [productsQuery.data])
  const filteredProducts = useMemo(() => {
    const normalized = keyword.trim().toLowerCase()
    return products.filter((product) => {
      const matchesKeyword =
        !normalized ||
        `${product.name} ${product.description}`.toLowerCase().includes(normalized)
      const matchesStatus = status === 'all' || product.status === status
      return matchesKeyword && matchesStatus
    })
  }, [keyword, products, status])
  const enabledCount = products.filter((product) => product.status === 'enabled').length
  const disabledCount = products.filter((product) => product.status !== 'enabled').length
  const autoCount = products.filter((product) => product.deliveryMode === 'auto').length
  const manualCount = products.filter((product) => product.deliveryMode === 'manual').length

  const columns = useMemo<GridColDef<Product>[]>(
    () => [
      { field: 'id', headerName: 'ID', width: 80 },
      { field: 'name', headerName: '商品', flex: 1, minWidth: 190 },
      {
        field: 'priceCents',
        headerName: '价格',
        width: 120,
        valueFormatter: (value) => money(Number(value)),
      },
      {
        field: 'deliveryMode',
        headerName: '发货',
        width: 120,
        renderCell: ({ value }) => (
          <SoftStatus
            color={value === 'auto' ? 'success' : 'primary'}
            label={value === 'auto' ? '自动发货' : '手动发货'}
          />
        ),
      },
      {
        field: 'availableStock',
        headerName: '库存',
        width: 110,
      },
      {
        field: 'status',
        headerName: '状态',
        width: 110,
        renderCell: ({ value }) => (
          <SoftStatus
            color={value === 'enabled' ? 'success' : 'default'}
            label={value === 'enabled' ? '已上架' : '未上架'}
          />
        ),
      },
    ],
    [],
  )

  return (
    <AdminPage title="商品管理" crumbs={['Trade', '商品管理']}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 6, md: 2 }}>
          <AdminStat label="总商品" value={products.length} tone="primary" />
        </Grid>
        <Grid size={{ xs: 6, md: 2 }}>
          <AdminStat label="已上架" value={enabledCount} tone="success" />
        </Grid>
        <Grid size={{ xs: 6, md: 2 }}>
          <AdminStat label="未上架" value={disabledCount} tone="danger" />
        </Grid>
        <Grid size={{ xs: 6, md: 2 }}>
          <AdminStat label="自动发货" value={autoCount} tone="info" />
        </Grid>
        <Grid size={{ xs: 6, md: 2 }}>
          <AdminStat label="手动发货" value={manualCount} tone="dark" />
        </Grid>
        <Grid size={{ xs: 6, md: 2 }}>
          <AdminStat label="可售库存" value={products.reduce((sum, item) => sum + Math.max(0, item.availableStock), 0)} tone="success" />
        </Grid>
      </Grid>

      {productsQuery.error && <Alert severity="error">商品加载失败。</Alert>}
      <AdminCard
        toolbar={
          <ToolbarRow>
            <Button
              variant="contained"
              startIcon={<AddOutlinedIcon />}
              onClick={() => setOpen(true)}
            >
              添加商品
            </Button>
            <Button
              color="success"
              variant="outlined"
              startIcon={<KeyboardArrowUpOutlinedIcon />}
              onClick={() => setNotice('批量上架接口待接入，当前可在商品编辑中修改状态。')}
            >
              上架选中商品
            </Button>
            <Button
              color="inherit"
              variant="outlined"
              startIcon={<KeyboardArrowDownOutlinedIcon />}
              onClick={() => setNotice('批量下架接口待接入，当前可在商品编辑中修改状态。')}
            >
              下架选中商品
            </Button>
            <Button
              color="primary"
              variant="outlined"
              startIcon={<RotateRightOutlinedIcon />}
              onClick={() => setNotice('一键操作会按你的规则接入，当前先保留入口。')}
            >
              一键操作选中商品
            </Button>
            <Button
              color="error"
              variant="outlined"
              startIcon={<DeleteOutlineOutlinedIcon />}
              onClick={() => setNotice('为避免误删，删除接口需要确认策略后接入。')}
            >
              移除选中商品
            </Button>
          </ToolbarRow>
        }
      >
        <Stack spacing={1.5}>
          <TableSearch>
            <TextField
              label="商品关键词"
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              sx={{ minWidth: { md: 260 } }}
            />
            <TextField
              select
              label="上架状态"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              sx={{ minWidth: { md: 160 } }}
            >
              <MenuItem value="all">全部状态</MenuItem>
              <MenuItem value="enabled">已上架</MenuItem>
              <MenuItem value="disabled">未上架</MenuItem>
            </TextField>
          </TableSearch>
          <Box className="admin-grid-wrap">
            <DataGrid
              rows={filteredProducts}
              columns={columns}
              loading={productsQuery.isLoading}
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

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>新建商品</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField
              select
              label="分类"
              value={form.categoryId}
              onChange={(event) =>
                setForm((old) => ({
                  ...old,
                  categoryId: Number(event.target.value),
                }))
              }
            >
              {(categoriesQuery.data ?? [{ id: 1, name: '默认分类' }]).map(
                (category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ),
              )}
            </TextField>
            <TextField
              label="商品名称"
              value={form.name}
              onChange={(event) =>
                setForm((old) => ({ ...old, name: event.target.value }))
              }
            />
            <TextField
              label="说明"
              multiline
              minRows={3}
              value={form.description}
              onChange={(event) =>
                setForm((old) => ({ ...old, description: event.target.value }))
              }
            />
            <TextField
              label="价格"
              type="number"
              value={form.price}
              onChange={(event) =>
                setForm((old) => ({ ...old, price: event.target.value }))
              }
            />
            <TextField
              select
              label="发货模式"
              value={form.deliveryMode}
              onChange={(event) =>
                setForm((old) => ({ ...old, deliveryMode: event.target.value }))
              }
            >
              <MenuItem value="auto">自动发货</MenuItem>
              <MenuItem value="manual">手动发货</MenuItem>
            </TextField>
            {saveProduct.error && (
              <Alert severity="error">{saveProduct.error.message}</Alert>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>取消</Button>
          <Button
            variant="contained"
            disabled={!form.name || saveProduct.isPending}
            onClick={() => saveProduct.mutate()}
          >
            保存
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={Boolean(notice)}
        autoHideDuration={2800}
        message={notice}
        onClose={() => setNotice('')}
      />
    </AdminPage>
  )
}
