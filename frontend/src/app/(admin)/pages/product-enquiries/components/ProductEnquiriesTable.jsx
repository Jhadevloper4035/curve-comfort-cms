import { useState, useMemo } from 'react'
import { Card, Form, InputGroup, Pagination, Badge, Modal } from 'react-bootstrap'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import useProductEnquiriesStore from '@/store/productEnquiriesStore'
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
} from '@tanstack/react-table'

const statusVariant = {
  pending: 'warning',
  contacted: 'primary',
  qualified: 'info',
  converted: 'success',
  rejected: 'danger',
}

const TRUNCATE_LEN = 60

const MessageCell = ({ text, onReadMore }) => {
  if (!text) return '-'
  const isLong = text.length > TRUNCATE_LEN

  return (
    <span style={{ whiteSpace: 'nowrap' }}>
      {isLong ? text.slice(0, TRUNCATE_LEN) + '…' : text}
      {isLong && (
        <button
          className="btn btn-link btn-sm p-0 ms-1"
          style={{ fontSize: '0.75rem', verticalAlign: 'baseline' }}
          onClick={(e) => { e.stopPropagation(); onReadMore(text) }}
        >
          Read more
        </button>
      )}
    </span>
  )
}

const MessageModal = ({ text, onHide }) => (
  <Modal show={!!text} onHide={onHide} centered>
    <Modal.Header closeButton>
      <Modal.Title style={{ fontSize: '1rem' }}>Message</Modal.Title>
    </Modal.Header>
    <Modal.Body style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
      {text}
    </Modal.Body>
    <Modal.Footer>
      <button className="btn btn-secondary btn-sm" onClick={onHide}>Close</button>
    </Modal.Footer>
  </Modal>
)

const ProductEnquiriesTable = () => {
  const { leads, loading, error } = useProductEnquiriesStore()
  const [globalFilter, setGlobalFilter] = useState('')
  const [sorting, setSorting] = useState([])
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 50 })
  const [modalText, setModalText] = useState(null)

  const columns = useMemo(
    () => [
      {
        accessorKey: 'index',
        header: '#',
        cell: ({ row }) => row.index + 1,
        enableSorting: false,
      },
      { accessorKey: 'fullName', header: 'Name' },
      { accessorKey: 'email', header: 'Email' },
      { accessorKey: 'phone', header: 'Phone' },
      { accessorKey: 'productInterest', header: 'Product' },
      { accessorKey: 'estimatedQuantity', header: 'Qty', cell: ({ getValue }) => getValue() || '-' },
      {
        accessorKey: 'message',
        header: 'Message',
        cell: ({ getValue }) => <MessageCell text={getValue()} onReadMore={setModalText} />,
        enableSorting: false,
      },
      { accessorKey: 'source', header: 'Source', cell: ({ getValue }) => getValue() || '-' },
      {
        accessorKey: 'createdAt',
        header: 'Date',
        cell: ({ getValue }) => getValue() ? new Date(getValue()).toLocaleDateString() : '-',
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ getValue }) => {
          const val = getValue() ?? 'pending'
          return (
            <Badge bg={statusVariant[val] ?? 'secondary'} className="text-capitalize">
              {val}
            </Badge>
          )
        },
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

  if (loading) return <div className="text-center py-5">Loading enquiries...</div>
  if (error) return <div className="text-center text-danger py-5">Error: {error}</div>

  return (
    <>
    <MessageModal text={modalText} onHide={() => setModalText(null)} />
    <Card className="overflow-hidden">
      <Card.Header>
        <div className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Product Enquiries</h5>
          <InputGroup style={{ width: '300px' }}>
            <Form.Control
              type="text"
              placeholder="Search enquiries..."
              value={globalFilter ?? ''}
              onChange={(e) => setGlobalFilter(e.target.value)}
            />
            <InputGroup.Text><IconifyIcon icon="bx:search" /></InputGroup.Text>
          </InputGroup>
        </div>
      </Card.Header>
      <div className="table-responsive table-centered">
        <table className="table mb-0">
          <thead className="table-light">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    style={{ cursor: header.column.getCanSort() ? 'pointer' : 'default', whiteSpace: 'nowrap' }}
                  >
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    {{ asc: ' ▲', desc: ' ▼' }[header.column.getIsSorted()] ?? null}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} style={{ whiteSpace: 'nowrap' }}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
            {table.getRowModel().rows.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="text-center text-muted py-4">
                  No product enquiries found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <Card.Footer>
        <div className="d-flex justify-content-between align-items-center">
          <div>
            Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{' '}
            {Math.min(
              (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
              table.getFilteredRowModel().rows.length
            )} of {table.getFilteredRowModel().rows.length} entries
          </div>
          <Pagination>
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
    </>
  )
}

export default ProductEnquiriesTable
