import type { GridRowSelectionModel } from '@mui/x-data-grid'

export function selectedNumberIds<T extends { id: number }>(
  model: GridRowSelectionModel,
  rows: T[],
) {
  const ids = new Set(Array.from(model.ids).map(Number))
  if (model.type === 'exclude') {
    return rows.map((row) => row.id).filter((id) => !ids.has(id))
  }
  return Array.from(ids)
}

export function downloadCsv(
  filename: string,
  rows: Array<Record<string, string | number | null | undefined>>,
) {
  if (rows.length === 0) return
  const headers = Object.keys(rows[0])
  const escapeCell = (value: string | number | null | undefined) =>
    `"${String(value ?? '').replaceAll('"', '""')}"`
  const csv = [
    headers.map(escapeCell).join(','),
    ...rows.map((row) => headers.map((header) => escapeCell(row[header])).join(',')),
  ].join('\n')
  const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}
