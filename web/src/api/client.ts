import type { ApiResponse } from './types'

const API_BASE = import.meta.env.VITE_API_BASE ?? ''

export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

export async function api<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = localStorage.getItem('admin_token')
  const headers = new Headers(options.headers)
  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json')
  }
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers })
  const body = (await res.json().catch(() => null)) as ApiResponse<T> | null
  if (!res.ok || !body || body.code !== 200) {
    if (res.status === 401 && path.startsWith('/api/admin') && !path.includes('/auth/login')) {
      localStorage.removeItem('admin_token')
      if (window.location.pathname !== '/admin/login') {
        window.location.replace('/admin/login')
      }
      throw new ApiError(res.status, '登录已失效，请重新登录')
    }
    throw new ApiError(res.status, body?.msg || '请求失败')
  }
  return body.data
}

export function money(cents: number) {
  return `¥${(cents / 100).toFixed(2)}`
}
