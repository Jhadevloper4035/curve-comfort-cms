import { useMemo, useState } from 'react'
import { Card, Form, InputGroup, Pagination } from 'react-bootstrap'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import useNewsletterSubscribersStore from '@/store/newsletterSubscribersStore'
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'

const formatDate = (value) => (value ? new Date(value).toLocaleDateString() : '-')

const NewsletterSubscribersTable = () => {
  const { subscribers, loading, error } = useNewsletterSubscribersStore()
  const [globalFilter, setGlobalFilter] = useState('')
  const [sorting, setSorting] = useState([])
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 50 })

  const columns = useMemo(
    () => [
      {
        accessorKey: 'index',
        header: '#',
        cell: ({ row }) => row.index + 1,
        enableSorting: false,
      },
      { accessorKey: 'email', header: 'Email' },
      {
        accessorKey: 'source',
        header: 'Source',
        cell: ({ getValue }) => <span className="text-capitalize">{getValue() || '-'}</span>,
      },
      {
        accessorKey: 'createdAt',
        header: 'Subscribed On',
        cell: ({ getValue }) => formatDate(getValue()),
      },
    ],
    []
  )

  const table = useReactTable({
    data: subscribers,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    state: { globalFilter, sorting, pagination },
  })

  if (loading) return <div className="text-center py-5">Loading newsletter subscribers...</div>
  if (error) return <div className="text-center text-danger py-5">Error: {error}</div>

  const firstItem = table.getFilteredRowModel().rows.length
    ? table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1
    : 0
  const lastItem = Math.min(
    (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
    table.getFilteredRowModel().rows.length
  )

  return (
    <Card className="overflow-hidden">
      <Card.Header>
        <div className="d-flex flex-wrap gap-2 justify-content-between align-items-center">
          <h5 className="mb-0">Newsletter Subscribers</h5>
          <InputGroup style={{ width: '300px' }}>
            <Form.Control
              type="text"
              placeholder="Search subscribers..."
              value={globalFilter ?? ''}
              onChange={(e) => setGlobalFilter(e.target.value)}
            />
            <InputGroup.Text>
              <IconifyIcon icon="bx:search" />
            </InputGroup.Text>
          </InputGroup>
        </div>
      </Card.Header>
      <div className="table-responsive table-centered">
        <table className="table text-nowrap mb-0">
          <thead className="table-light">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    style={{ cursor: header.column.getCanSort() ? 'pointer' : 'default' }}
                  >
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    {{ asc: ' ASC', desc: ' DESC' }[header.column.getIsSorted()] ?? null}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                ))}
              </tr>
            ))}
            {table.getRowModel().rows.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="text-center text-muted py-4">
                  No newsletter subscribers found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <Card.Footer>
        <div className="d-flex flex-wrap gap-2 justify-content-between align-items-center">
          <div>
            Showing {firstItem} to {lastItem} of {table.getFilteredRowModel().rows.length} entries
          </div>
          <Pagination className="mb-0">
            <Pagination.First onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()} />
            <Pagination.Prev onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()} />
            {Array.from({ length: table.getPageCount() }, (_, i) => (
              <Pagination.Item
                key={i}
                active={i === table.getState().pagination.pageIndex}
                onClick={() => table.setPageIndex(i)}
              >
                {i + 1}
              </Pagination.Item>
            ))}
            <Pagination.Next onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} />
            <Pagination.Last onClick={() => table.setPageIndex(table.getPageCount() - 1)} disabled={!table.getCanNextPage()} />
          </Pagination>
        </div>
      </Card.Footer>
    </Card>
  )
}

export default NewsletterSubscribersTable
