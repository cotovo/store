import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined'
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import LockOpenOutlinedIcon from '@mui/icons-material/LockOpenOutlined'
import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import MenuItem from '@mui/material/MenuItem'
import Snackbar from '@mui/material/Snackbar'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import { DataGrid, type GridColDef, type GridRowSelectionModel } from '@mui/x-data-grid'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useMemo } from 'react'
import { useState } from 'react'
import { api } from '../api/client'
import type { Card as CardRow, Product } from '../api/types'
import {
  AdminCard,
  AdminPage,
  SoftStatus,
  TableSearch,
  ToolbarRow,
} from './AdminUi'
import { downloadCsv, selectedNumberIds } from './AdminTools'

const emptySelection: GridRowSelectionModel = { type: 'include', ids: new Set() }

export default function AdminCards() {
  const queryClient = useQueryClient()
  const [productId, setProductId] = useState(0)
  const [status, setStatus] = useState('all')
  const [keyword, setKeyword] = useState('')
  const [secrets, setSecrets] = useState('')
  const [note, setNote] = useState('')
  const [notice, setNotice] = useState('')
  const [rowSelectionModel, setRowSelectionModel] =
    useState<GridRowSelectionModel>(emptySelection)

  const productsQuery = useQuery({
    queryKey: ['admin-products'],
    queryFn: () => api<Product[]>('/api/admin/products'),
  })
  useEffect(() => {
    if (productId === 0 && productsQuery.data?.[0]?.id) {
      setProductId(productsQuery.data[0].id)
    }
  }, [productId, productsQuery.data])
  const cardsQuery = useQuery({
    queryKey: ['admin-cards', productId],
    queryFn: () => api<CardRow[]>(`/api/admin/cards?productId=${productId}`),
    enabled: productId > 0,
  })
  const importCards = useMutation({
    mutationFn: () =>
      api<{ success: number; skipped: number }>('/api/admin/cards/import', {
        method: 'POST',
        body: JSON.stringify({ productId, secrets, unique: true, note }),
      }),
    onSuccess: () => {
      setSecrets('')
      queryClient.invalidateQueries({ queryKey: ['admin-cards', productId] })
      queryClient.invalidateQueries({ queryKey: ['admin-products'] })
    },
  })
  const cards = useMemo(() => cardsQuery.data ?? [], [cardsQuery.data])
  const filteredCards = useMemo(() => {
    const normalized = keyword.trim().toLowerCase()
    return cards.filter((card) => {
      const matchesStatus = status === 'all' || card.status === status
      const matchesKeyword =
        !normalized ||
        `${card.secret} ${card.previewText} ${card.note}`.toLowerCase().includes(normalized)
      return matchesStatus && matchesKeyword
    })
  }, [cards, keyword, status])
  const selectedCardIds = selectedNumberIds(rowSelectionModel, filteredCards)
  const hasSelection = selectedCardIds.length > 0
  const refreshCards = () => {
    setRowSelectionModel(emptySelection)
    queryClient.invalidateQueries({ queryKey: ['admin-cards', productId] })
    queryClient.invalidateQueries({ queryKey: ['admin-products'] })
  }
  const batchStatus = useMutation({
    mutationFn: (nextStatus: CardRow['status']) =>
      api<{ updated: number }>('/api/admin/cards/batch-status', {
        method: 'POST',
        body: JSON.stringify({ ids: selectedCardIds, status: nextStatus }),
      }),
    onSuccess: (data) => {
      refreshCards()
      setNotice(`已更新 ${data.updated} 张卡密。`)
    },
  })
  const deleteCards = useMutation({
    mutationFn: () =>
      api<{ deleted: number }>('/api/admin/cards', {
        method: 'DELETE',
        body: JSON.stringify({ ids: selectedCardIds }),
      }),
    onSuccess: (data) => {
      refreshCards()
      setNotice(`已移除 ${data.deleted} 张未出售卡密。`)
    },
  })
  const productName = (productsQuery.data ?? []).find((product) => product.id === productId)?.name
  const columns = useMemo<GridColDef<CardRow>[]>(
    () => [
      { field: 'id', headerName: 'ID', width: 80 },
      { field: 'productId', headerName: '商品 ID', width: 110 },
      { field: 'secret', headerName: '卡密', flex: 1, minWidth: 260 },
      {
        field: 'status',
        headerName: '状态',
        width: 120,
        renderCell: ({ value }) => {
          const labelMap = {
            available: '可出售',
            sold: '已出售',
            locked: '已锁定',
          } as const
          const colorMap = {
            available: 'success',
            sold: 'warning',
            locked: 'default',
          } as const
          const key = value as keyof typeof labelMap
          return <SoftStatus label={labelMap[key] ?? String(value)} color={colorMap[key] ?? 'default'} />
        },
      },
      { field: 'note', headerName: '备注', width: 180 },
    ],
    [],
  )

  return (
    <AdminPage title="卡密管理" crumbs={['Trade', '卡密管理']}>
      <AdminCard
        toolbar={
          <ToolbarRow>
            <Button
              color="error"
              variant="outlined"
              startIcon={<DeleteOutlineOutlinedIcon />}
              disabled={!hasSelection || deleteCards.isPending}
              onClick={() => {
                if (window.confirm('确认移除选中的未出售卡密？已出售卡密不会被删除。')) {
                  deleteCards.mutate()
                }
              }}
            >
              移除选中卡密
            </Button>
            <Button
              color="inherit"
              variant="outlined"
              startIcon={<LockOutlinedIcon />}
              disabled={!hasSelection || batchStatus.isPending}
              onClick={() => batchStatus.mutate('locked')}
            >
              锁定选中卡密
            </Button>
            <Button
              variant="outlined"
              startIcon={<LockOpenOutlinedIcon />}
              disabled={!hasSelection || batchStatus.isPending}
              onClick={() => batchStatus.mutate('available')}
            >
              解锁选中卡密
            </Button>
            <Button
              color="primary"
              variant="outlined"
              startIcon={<DownloadOutlinedIcon />}
              disabled={filteredCards.length === 0}
              onClick={() =>
                downloadCsv(
                  `cards-${productId || 'all'}.csv`,
                  filteredCards.map((card) => ({
                    id: card.id,
                    productId: card.productId,
                    secret: card.secret,
                    status: card.status,
                    note: card.note,
                    createdAt: card.createdAt,
                  })),
                )
              }
            >
              导出筛选卡密
            </Button>
          </ToolbarRow>
        }
      >
        <Stack spacing={2}>
          <TableSearch>
            <TextField
              select
              label="商品"
              value={productId}
              onChange={(event) => setProductId(Number(event.target.value))}
              sx={{ minWidth: { md: 280 } }}
            >
              {(productsQuery.data ?? []).map((product) => (
                <MenuItem key={product.id} value={product.id}>
                  {product.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="卡密状态"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              sx={{ minWidth: { md: 160 } }}
            >
              <MenuItem value="all">全部状态</MenuItem>
              <MenuItem value="available">可出售</MenuItem>
              <MenuItem value="sold">已出售</MenuItem>
              <MenuItem value="locked">已锁定</MenuItem>
            </TextField>
            <TextField
              label="搜索卡密/备注"
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              sx={{ minWidth: { md: 240 } }}
            />
          </TableSearch>

          <Stack spacing={2}>
            <TextField
              label={`批量导入卡密${productName ? ` - ${productName}` : ''}`}
              multiline
              minRows={5}
              value={secrets}
              onChange={(event) => setSecrets(event.target.value)}
              helperText="一行一条卡密，自动跳过空行和重复项。"
            />
            <TextField
              label="备注"
              value={note}
              onChange={(event) => setNote(event.target.value)}
            />
            <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
              <Button
                variant="contained"
                startIcon={<UploadFileOutlinedIcon />}
                disabled={!secrets.trim() || importCards.isPending}
                onClick={() => importCards.mutate()}
              >
                导入
              </Button>
              {importCards.data && (
                <Alert severity="success" sx={{ py: 0 }}>
                  成功 {importCards.data.success}，跳过 {importCards.data.skipped}
                </Alert>
              )}
            </Stack>
            {importCards.error && (
              <Alert severity="error">{importCards.error.message}</Alert>
            )}
          </Stack>

          <Box className="admin-grid-wrap">
            <DataGrid
              rows={filteredCards}
              columns={columns}
              loading={cardsQuery.isLoading}
              checkboxSelection
              rowSelectionModel={rowSelectionModel}
              onRowSelectionModelChange={setRowSelectionModel}
              pageSizeOptions={[10, 25, 50]}
              initialState={{
                pagination: { paginationModel: { pageSize: 10, page: 0 } },
              }}
              disableRowSelectionOnClick
            />
          </Box>
        </Stack>
      </AdminCard>
      <Snackbar
        open={Boolean(notice)}
        autoHideDuration={2600}
        message={notice}
        onClose={() => setNotice('')}
      />
    </AdminPage>
  )
}
