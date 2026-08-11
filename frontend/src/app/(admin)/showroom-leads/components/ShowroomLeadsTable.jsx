import { useState, useMemo } from 'react'
import { Button, Card, Form, InputGroup, Pagination } from 'react-bootstrap'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import useShowroomLeadsStore from '@/store/showroomLeadsStore'

import { useReactTable, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, flexRender } from '@tanstack/react-table'

const statusVariant = {
  New: 'soft-primary',
  'In Progress': 'soft-warning',
  Converted: 'soft-success',
  Lost: 'soft-danger',
}

const ShowroomLeadsTable = () => {
  const { leads, loading, error } = useShowroomLeadsStore()
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
      {
        accessorKey: 'fullName',
        header: 'Name',
        cell: ({ getValue }) => getValue(),
      },
      {
        accessorKey: 'mobileNumber',
        header: 'Phone',
        cell: ({ getValue }) => getValue(),
      },
      {
        accessorKey: 'email',
        header: 'Email',
        cell: ({ getValue }) => getValue(),
      },
      {
        accessorKey: 'UserType',
        header: 'UserType',
        cell: ({ getValue }) => getValue(),
      },
      {
        accessorKey: 'ProductEnquire',
        header: 'ProductEnquire',
        cell: ({ getValue }) => getValue(),
      },
      {
        accessorKey: 'companyName',
        header: 'Company',
        cell: ({ getValue }) => getValue(),
      },
      {
        accessorKey: 'city',
        header: 'City',
        cell: ({ getValue }) => getValue(),
      },
      {
        accessorKey: 'state',
        header: 'State',
        cell: ({ getValue }) => getValue(),
      },
      {
        accessorKey: 'representative',
        header: 'Representative',
        cell: ({ getValue }) => getValue(),
      },
      {
        accessorKey: 'leadType',
        header: 'LeadType',
        cell: ({ getValue }) => getValue(),
      },
      {
        accessorKey: 'place',
        header: 'Place',
        cell: ({ getValue }) => getValue(),
      },
      {
        accessorKey: 'createdAt',
        header: 'Date',
        cell: ({ getValue }) => new Date(getValue()).toLocaleDateString(),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ getValue }) => <span className={`badge bg-${statusVariant[getValue()] ?? 'soft-secondary'}`}>{getValue()}</span>,
        enableSorting: true,
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <div>
            <Button variant="soft-secondary" size="sm" className="me-2">
              <IconifyIcon icon="bx:edit" className="fs-16" />
            </Button>
          </div>
        ),
        enableSorting: false,
      },
    ],
    [],
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
    state: {
      globalFilter,
      sorting,
      pagination,
    },
  })

  if (loading) return <div className="text-center py-5">Loading leads...</div>
  if (error) return <div className="text-center text-danger py-5">Error: {error}</div>

  return (
    <Card className="overflow-hidden">
      <Card.Header>
        <div className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Showroom Enquiry</h5>
          <InputGroup style={{ width: '300px' }}>
            <Form.Control type="text" placeholder="Search leads..." value={globalFilter ?? ''} onChange={(e) => setGlobalFilter(e.target.value)} />
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
                    style={{ cursor: header.column.getCanSort() ? 'pointer' : 'default' }}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    {{
                      asc: ' 🔼',
                      desc: ' 🔽',
                    }[header.column.getIsSorted()] ?? null}
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
                  No leads found.
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
            {Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, table.getFilteredRowModel().rows.length)} of{' '}
            {table.getFilteredRowModel().rows.length} entries
          </div>
          <Pagination>
            <Pagination.First onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()} />
            <Pagination.Prev onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()} />
            {Array.from({ length: table.getPageCount() }, (_, i) => (
              <Pagination.Item key={i} active={i === table.getState().pagination.pageIndex} onClick={() => table.setPageIndex(i)}>
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

export default ShowroomLeadsTable
