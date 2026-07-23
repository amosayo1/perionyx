'use client'

import {
  useCallback,
  useMemo,
  useRef,
  useState,
  useEffect,
  type ReactNode,
} from 'react'

export interface VirtualizedTableProps<T> {
  data: T[]
  columns: {
    key: string
    label: string
    width?: number
    render?: (item: T) => ReactNode
  }[]
  rowHeight?: number
  overscan?: number
  maxHeight?: number
  onRowClick?: (item: T) => void
  loading?: boolean
  loadingRows?: number
  emptyMessage?: string
  sortColumn?: string
  sortDirection?: 'asc' | 'desc'
  onSort?: (column: string) => void
}

const ROW_H = 44
const HEADER_H = 44
const DEF_OVERSCAN = 5
const DEF_MAX_H = 600

function SkeletonBar({ width }: { width: string }) {
  return (
    <div
      style={{
        height: 12,
        width,
        borderRadius: 4,
        background: 'linear-gradient(90deg, #2a2a4a 25%, #3a3a5a 50%, #2a2a4a 75%)',
        backgroundSize: '200% 100%',
        animation: 'vt-shimmer 1.2s ease-in-out infinite',
      }}
    />
  )
}

export function VirtualizedTable<T extends Record<string, unknown>>({
  data,
  columns,
  rowHeight = ROW_H,
  overscan = DEF_OVERSCAN,
  maxHeight = DEF_MAX_H,
  onRowClick,
  loading = false,
  loadingRows = 10,
  emptyMessage = 'No data',
  sortColumn,
  sortDirection,
  onSort,
}: VirtualizedTableProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scrollTop, setScrollTop] = useState(0)
  const [containerHeight, setContainerHeight] = useState(maxHeight)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerHeight(entry.contentRect.height)
      }
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const handleScroll = useCallback(() => {
    const el = containerRef.current
    if (el) setScrollTop(el.scrollTop)
  }, [])

  const itemCount = loading ? loadingRows : data.length

  const totalHeight = itemCount * rowHeight

  const { startIdx, endIdx, offsetY } = useMemo(() => {
    const s = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan)
    const e = Math.min(
      itemCount,
      Math.ceil((scrollTop + containerHeight) / rowHeight) + overscan
    )
    return { startIdx: s, endIdx: e, offsetY: s * rowHeight }
  }, [scrollTop, containerHeight, rowHeight, overscan, itemCount])

  const visibleItems = useMemo(() => {
    if (loading) {
      return Array.from({ length: endIdx - startIdx }, (_, i) => ({
        _idx: startIdx + i,
      }))
    }
    return data.slice(startIdx, endIdx).map((item, i) => ({
      _idx: startIdx + i,
      _data: item,
    }))
  }, [data, startIdx, endIdx, loading])

  const cellValue = useCallback(
    (item: T, column: { key: string; render?: (item: T) => ReactNode }) => {
      if (column.render) return column.render(item)
      const v = item[column.key]
      if (v === null || v === undefined) return '\u2014'
      return String(v)
    },
    []
  )

  const sortIndicator = useCallback(
    (key: string) => {
      if (sortColumn !== key) return null
      return (
        <span style={{ color: '#d4a843', marginLeft: 4 }}>
          {sortDirection === 'asc' ? '\u25B2' : '\u25BC'}
        </span>
      )
    },
    [sortColumn, sortDirection]
  )

  return (
    <div
      style={{
        maxHeight,
        borderRadius: 8,
        border: '1px solid #2a2a4a',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <style>{`
        .vt-container::-webkit-scrollbar { width: 6px; }
        .vt-container::-webkit-scrollbar-track { background: #1a1a2e; }
        .vt-container::-webkit-scrollbar-thumb { background: #3a3a5a; border-radius: 3px; }
        .vt-container::-webkit-scrollbar-thumb:hover { background: #4a4a6a; }
        @keyframes vt-shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>

      <div
        style={{
          display: 'flex',
          height: HEADER_H,
          backgroundColor: '#16213e',
          borderBottom: '2px solid #d4a843',
          flexShrink: 0,
        }}
      >
        {columns.map((col) => (
          <div
            key={col.key}
            onClick={() => onSort?.(col.key)}
            style={{
              flex: col.width ? `0 0 ${col.width}px` : 1,
              minWidth: col.width ?? 100,
              padding: '0 16px',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              color: sortColumn === col.key ? '#d4a843' : '#e0e0e0',
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              cursor: onSort ? 'pointer' : 'default',
              userSelect: 'none',
              whiteSpace: 'nowrap',
            }}
          >
            {col.label}
            {sortIndicator(col.key)}
          </div>
        ))}
      </div>

      <div
        ref={containerRef}
        className="vt-container"
        onScroll={handleScroll}
        style={{
          flex: 1,
          overflowY: 'auto',
          backgroundColor: '#1a1a2e',
          position: 'relative',
          minHeight: 0,
        }}
      >
        <div style={{ height: totalHeight, position: 'relative' }} />

        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            transform: `translateY(${offsetY}px)`,
            willChange: 'transform',
          }}
        >
          {loading
            ? (visibleItems as { _idx: number }[]).map((item) => (
                <div
                  key={item._idx}
                  style={{
                    display: 'flex',
                    height: rowHeight,
                    alignItems: 'center',
                    borderBottom: '1px solid #2a2a4a',
                    backgroundColor: '#1a1a2e',
                  }}
                >
                  {columns.map((col) => (
                    <div
                      key={col.key}
                      style={{
                        flex: col.width ? `0 0 ${col.width}px` : 1,
                        minWidth: col.width ?? 100,
                        padding: '0 16px',
                        color: '#e0e0e0',
                        fontSize: 13,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      <SkeletonBar
                        width={
                          col.width
                            ? `${Math.min(col.width * 0.6, 120)}px`
                            : '60%'
                        }
                      />
                    </div>
                  ))}
                </div>
              ))
            : (visibleItems as { _idx: number; _data: T }[]).map((item) => (
                <div
                  key={item._idx}
                  onClick={() => onRowClick?.(item._data)}
                  style={{
                    display: 'flex',
                    height: rowHeight,
                    alignItems: 'center',
                    borderBottom: '1px solid #2a2a4a',
                    backgroundColor: '#1a1a2e',
                    cursor: onRowClick ? 'pointer' : 'default',
                    transition: 'background-color 0.12s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#2a2a4a'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#1a1a2e'
                  }}
                >
                  {columns.map((col) => (
                    <div
                      key={col.key}
                      style={{
                        flex: col.width ? `0 0 ${col.width}px` : 1,
                        minWidth: col.width ?? 100,
                        padding: '0 16px',
                        color: '#e0e0e0',
                        fontSize: 13,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {cellValue(item._data, col)}
                    </div>
                  ))}
                </div>
              ))}
        </div>

        {!loading && data.length === 0 && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#888',
              fontSize: 14,
              pointerEvents: 'none',
            }}
          >
            {emptyMessage}
          </div>
        )}
      </div>
    </div>
  )
}
