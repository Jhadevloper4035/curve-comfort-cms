import { useState, useMemo } from 'react'
import { Button, Card, Form, InputGroup, Modal, Pagination } from 'react-bootstrap'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import useWebsiteLeadsStore from '@/store/websiteLeadsStore'
import { useReactTable, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, flexRender } from '@tanstack/react-table'

const statusVariant = {
  new: 'soft-primary',
  contacted: 'soft-warning',
  converted: 'soft-success',
  closed: 'soft-danger',
}

const WebsiteLeadsTable = () => {
  const { leads, loading, error } = useWebsiteLeadsStore()
  const [globalFilter, setGlobalFilter] = useState('')
  const [sorting, setSorting] = useState([])
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 50 })
  const [queryModal, setQueryModal] = useState({ show: false, text: '' })

  const columns = useMemo(
    () => [
      {
        accessorKey: 'index',
        header: '#',
        cell: ({ row }) => row.index + 1,
        enableSorting: false,
      },
      { accessorKey: 'name', header: 'Name', cell: ({ getValue }) => getValue() },
      { accessorKey: 'email', header: 'Email', cell: ({ getValue }) => getValue() },
      { accessorKey: 'phone', header: 'Phone', cell: ({ getValue }) => getValue() },
      { accessorKey: 'enquiryType', header: 'Enquiry Type', cell: ({ getValue }) => getValue() },
      {
        accessorKey: 'products',
        header: 'Products',
        cell: ({ getValue }) => {
          const val = getValue()
          return Array.isArray(val) ? val.join(', ') : val
        },
      },
      {
        accessorKey: 'comments',
        header: 'Query',
        cell: ({ getValue }) => {
          const text = getValue() || ''
          return (
            <div className="d-flex align-items-center gap-2">
              <span className="text-truncate" style={{ maxWidth: 160 }}>{text}</span>
              {text && (
                <Button variant="soft-info" size="sm" onClick={() => setQueryModal({ show: true, text })}>
                  View
                </Button>
              )}
            </div>
          )
        },
      },
      { accessorKey: 'source', header: 'Source', cell: ({ getValue }) => getValue() },
      {
        accessorKey: 'createdAt',
        header: 'Date',
        cell: ({ getValue }) => getValue() ? new Date(getValue()).toLocaleDateString() : '-',
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ getValue }) => (
          <span className={`badge bg-${statusVariant[getValue()] ?? 'soft-secondary'}`}>{getValue() ?? 'new'}</span>
        ),
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: () => (
          <Button variant="soft-secondary" size="sm">
            <IconifyIcon icon="bx:edit" className="fs-16" />
          </Button>
        ),
        enableSorting: false,
      },
    ],
    []
  )

  const table = useReactTable({
    data: leads,
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

  if (loading) return <div className="text-center py-5">Loading leads...</div>
  if (error) return <div className="text-center text-danger py-5">Error: {error}</div>

  return (
    <>
      <Card className="overflow-hidden">
        <Card.Header>
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Website Leads</h5>
            <InputGroup style={{ width: '300px' }}>
              <Form.Control type="text" placeholder="Search leads..." value={globalFilter ?? ''} onChange={(e) => setGlobalFilter(e.target.value)} />
              <InputGroup.Text><IconifyIcon icon="bx:search" /></InputGroup.Text>
            </InputGroup>
          </div>
        </Card.Header>
        <div className="table-responsive table-centered">
          <table className="table text-nowrap mb-0">
            <thead className="table-light">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} onClick={header.column.getToggleSortingHandler()} style={{ cursor: header.column.getCanSort() ? 'pointer' : 'default' }}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      {{ asc: ' 🔼', desc: ' 🔽' }[header.column.getIsSorted()] ?? null}
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
                <tr><td colSpan={columns.length} className="text-center text-muted py-4">No website leads found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <Card.Footer>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{' '}
              {Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, table.getFilteredRowModel().rows.length)} of{' '}
              {table.getFilteredRowModel().rows.length} entries
            </div>
            <Pagination>
              <Pagination.First onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()} />
              <Pagination.Prev onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()} />
              {Array.from({ length: table.getPageCount() }, (_, i) => (
                <Pagination.Item key={i} active={i === table.getState().pagination.pageIndex} onClick={() => table.setPageIndex(i)}>{i + 1}</Pagination.Item>
              ))}
              <Pagination.Next onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} />
              <Pagination.Last onClick={() => table.setPageIndex(table.getPageCount() - 1)} disabled={!table.getCanNextPage()} />
            </Pagination>
          </div>
        </Card.Footer>
      </Card>

      <Modal show={queryModal.show} onHide={() => setQueryModal({ show: false, text: '' })} centered>
        <Modal.Header closeButton>
          <Modal.Title>Query Message</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{queryModal.text}</p>
        </Modal.Body>
      </Modal>
    </>
  )
}

export default WebsiteLeadsTable
