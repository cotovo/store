import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import { Suspense, lazy } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import OrderPage from './public/OrderPage'
import ProductPage from './public/ProductPage'
import QueryPage from './public/QueryPage'
import Storefront from './public/Storefront'

const AdminApp = lazy(() => import('./admin/AdminApp'))

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Storefront />} />
      <Route path="/item/:id" element={<ProductPage />} />
      <Route path="/query" element={<QueryPage />} />
      <Route path="/order/:tradeNo" element={<OrderPage />} />
      <Route
        path="/admin/*"
        element={
          <Suspense
            fallback={
              <Box sx={{ display: 'grid', minHeight: '100dvh', placeItems: 'center' }}>
                <CircularProgress />
              </Box>
            }
          >
            <AdminApp />
          </Suspense>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
