'use client'

import {
  useCallback,
  useMemo,
  useRef,
  useState,
  useEffect,
  type ReactNode,
} from 'react'

const EDL = {
  surfaces: { raised: '#111118', elevated: '#1a1a24', floating: '#222230' },
  text: { primary: '#f7f6f2', secondary: '#a1a1aa', tertiary: '#71717a' },
  borders: { default: 'rgba(255,255,255,0.08)', strong: 'rgba(255,255,255,0.12)' },
  gold: '#d4af37',
  space: { 1: 4, 2: 8, 3: 12, 4: 16 },
  radius: { sm: 4, lg: 8 },
} as const

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
        height: EDL.space[3],
        width,
        borderRadius: EDL.radius.sm,
        background: `linear-gradient(90deg, ${EDL.surfaces.elevated} 25%, ${EDL.surfaces.floating} 50%, ${EDL.surfaces.elevated} 75%)`,
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
        <span style={{ color: EDL.gold, marginLeft: EDL.space[1] }}>
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
        borderRadius: EDL.radius.lg,
        border: `1px solid ${EDL.borders.default}`,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <style>{`
        .vt-container::-webkit-scrollbar { width: 6px; }
        .vt-container::-webkit-scrollbar-track { background: ${EDL.surfaces.elevated}; }
        .vt-container::-webkit-scrollbar-thumb { background: ${EDL.surfaces.floating}; border-radius: 3px; }
        .vt-container::-webkit-scrollbar-thumb:hover { background: ${EDL.borders.strong}; }
        @keyframes vt-shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>

      <div
        style={{
          display: 'flex',
          height: HEADER_H,
          backgroundColor: EDL.surfaces.raised,
          borderBottom: `2px solid ${EDL.gold}`,
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
              padding: `0 ${EDL.space[4]}px`,
              display: 'flex',
              alignItems: 'center',
              gap: EDL.space[1],
              color: sortColumn === col.key ? EDL.gold : EDL.text.primary,
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: '0.06em',
              textTransform: 'uppercase' as const,
              cursor: onSort ? 'pointer' : 'default',
              userSelect: 'none' as const,
              whiteSpace: 'nowrap' as const,
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
          backgroundColor: EDL.surfaces.elevated,
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
                    borderBottom: `1px solid ${EDL.borders.default}`,
                    backgroundColor: EDL.surfaces.elevated,
                  }}
                >
                  {columns.map((col) => (
                    <div
                      key={col.key}
                      style={{
                        flex: col.width ? `0 0 ${col.width}px` : 1,
                        minWidth: col.width ?? 100,
                        padding: `0 ${EDL.space[4]}px`,
                        color: EDL.text.primary,
                        fontSize: 13,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap' as const,
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
                    borderBottom: `1px solid ${EDL.borders.default}`,
                    backgroundColor: EDL.surfaces.elevated,
                    cursor: onRowClick ? 'pointer' : 'default',
                    transition: 'background-color 0.12s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = EDL.surfaces.floating
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = EDL.surfaces.elevated
                  }}
                >
                  {columns.map((col) => (
                    <div
                      key={col.key}
                      style={{
                        flex: col.width ? `0 0 ${col.width}px` : 1,
                        minWidth: col.width ?? 100,
                        padding: `0 ${EDL.space[4]}px`,
                        color: EDL.text.primary,
                        fontSize: 13,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap' as const,
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
              color: EDL.text.tertiary,
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
