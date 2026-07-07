import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined'
import CreditCardOutlinedIcon from '@mui/icons-material/CreditCardOutlined'
import GiftOutlinedIcon from '@mui/icons-material/RedeemOutlined'
import ScheduleOutlinedIcon from '@mui/icons-material/ScheduleOutlined'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { money } from '../api/client'
import type { Order } from '../api/types'

export default function PublicOrderCard({ order }: { order: Order }) {
  const paid = order.paymentStatus === 'paid'
  const delivered = order.deliveryStatus === 'delivered'

  return (
    <Box className="order-item">
      <Box className="order-header">
        <Box className="order-left">
          <Box className="order-status">
            <span className={`status-badge status-${paid ? 'paid' : 'pending'}`}>
              {paid ? (
                <>
                  <CheckCircleOutlineOutlinedIcon className="inline-status-icon" />
                  已付款
                </>
              ) : (
                <>
                  <ScheduleOutlinedIcon className="inline-status-icon" />
                  待付款
                </>
              )}
            </span>
          </Box>
          <Box className="order-basic">
            <Box className="order-no">#{order.tradeNo}</Box>
            <Box className="order-time">下单时间：{formatTime(order.createdAt)}</Box>
            <Box className="payment-time">
              付款时间：{order.paidAt ? formatTime(order.paidAt) : '-'}
            </Box>
            <Box className="payment-dst">
              支付方式：
              <span className="payment-method">
                <CreditCardOutlinedIcon className="payment-icon" />
                <span className="payment-name">在线支付</span>
              </span>
            </Box>
          </Box>
        </Box>
        <Box className="order-right">
          <Box className="order-amount">
            <span className="amount-label">订单金额</span>
            <span className="amount-value">{money(order.amountCents)}</span>
          </Box>
        </Box>
      </Box>

      <Box className="goods-section">
        <Box className="goods-thumb">
          <Box className="goods-image-placeholder">
            <GiftOutlinedIcon />
          </Box>
        </Box>
        <Box className="goods-details">
          <Typography component="h6" className="goods-name">
            {order.productName}
          </Typography>
          <Box className="goods-meta">
            <span className="a-badge a-badge-warning">数量: {order.quantity}</span>
            <span className="a-badge a-badge-primary">
              发货: {delivered ? '已发货' : '等待发货'}
            </span>
            <span className="a-badge a-badge-success">
              支付: {paid ? '已付款' : '待付款'}
            </span>
          </Box>
        </Box>
      </Box>

      {paid && (
        <Box className="card-section">
          <Box className="card-header-like">
            <Box className="card-title-like shipment-content">
              <Box className="shipment-title">
                <GiftOutlinedIcon className="inline-status-icon" />
                宝贝内容
              </Box>
              <Box className="shipment-status">
                <span
                  className={`shipment-badge ${
                    delivered ? 'shipment-paid' : 'shipment-waiting'
                  }`}
                >
                  {delivered ? '已发货' : '等待发货'}
                </span>
              </Box>
            </Box>
          </Box>
          {order.deliveryContent ? (
            <Box className="card-content-no-password">
              <Box className="card-display">{order.deliveryContent}</Box>
            </Box>
          ) : (
            <Box className="card-content-no-password muted">
              订单已付款，发货内容处理完成后会在这里显示。
            </Box>
          )}
        </Box>
      )}
    </Box>
  )
}

function formatTime(value?: string) {
  if (!value) {
    return '-'
  }
  return new Date(value).toLocaleString('zh-CN', { hour12: false })
}
