import { useEffect, useMemo, useState } from 'react'
import { Button, Card, Form, InputGroup, Modal, Pagination } from 'react-bootstrap'
import { useReactTable, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, flexRender } from '@tanstack/react-table'
import PageBreadcrumb from '@/components/layout/PageBreadcrumb'
import PageMetaData from '@/components/PageTitle'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import useUserManagementStore from '@/store/userManagementStore'

const ROLE_BADGE = {
  admin: 'primary',
  user: 'secondary',
}

const UserModal = ({ user, onClose, onSave }) => {
  const isCreate = !user
  const [fullName, setFullName] = useState(user?.fullName || '')
  const [email, setEmail] = useState(user?.email || '')
  const [mobileNumber, setMobileNumber] = useState(user?.mobileNumber || '')
  const [role, setRole] = useState(user?.role || 'user')
  const [isBlocked, setIsBlocked] = useState(Boolean(user?.isBlocked))
  const [password, setPassword] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    const payload = { fullName, email, mobileNumber, role, isBlocked }
    if (password) payload.password = password
    const ok = isCreate ? await onSave(payload) : await onSave(user._id, payload)
    setSaving(false)
    if (ok) onClose()
  }

  return (
    <Modal show onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>{isCreate ? 'Create User' : 'Edit User'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form.Group className="mb-3">
          <Form.Label>Full Name</Form.Label>
          <Form.Control value={fullName} onChange={(e) => setFullName(e.target.value)} />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Email</Form.Label>
          <Form.Control type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Mobile Number</Form.Label>
          <Form.Control value={mobileNumber} onChange={(e) => setMobileNumber(e.target.value)} />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Role</Form.Label>
          <Form.Select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="user">user</option>
            <option value="admin">admin</option>
          </Form.Select>
        </Form.Group>
        <Form.Check
          className="mb-3"
          type="switch"
          id="user-blocked"
          label="Blocked"
          checked={isBlocked}
          onChange={(e) => setIsBlocked(e.target.checked)}
        />
        <Form.Group className="mb-3">
          <Form.Label>{isCreate ? 'Password' : 'New Password'}</Form.Label>
          <Form.Control
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={isCreate ? 'Minimum 8 characters' : 'Leave blank to keep current'}
          />
        </Form.Group>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button
          variant="primary"
          onClick={handleSave}
          disabled={saving || !fullName || !email || !mobileNumber || (isCreate && password.length < 8)}
        >
          {saving ? 'Saving...' : isCreate ? 'Create User' : 'Save Changes'}
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

const DeleteModal = ({ user, onClose, onConfirm }) => {
  const [deleting, setDeleting] = useState(false)

  const handleConfirm = async () => {
    setDeleting(true)
    const ok = await onConfirm(user._id)
    setDeleting(false)
    if (ok) onClose()
  }

  return (
    <Modal show onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Delete User</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        Are you sure you want to delete <strong>{user.fullName}</strong>? This cannot be undone.
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button variant="danger" onClick={handleConfirm} disabled={deleting}>
          {deleting ? 'Deleting...' : 'Delete'}
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

const UsersPage = () => {
  const { users, loading, error, fetchUsers, createUser, updateUser, deleteUser } = useUserManagementStore()
  const [globalFilter, setGlobalFilter] = useState('')
  const [sorting, setSorting] = useState([])
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 20 })
  const [createOpen, setCreateOpen] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  useEffect(() => { fetchUsers() }, [fetchUsers])

  const columns = useMemo(() => [
    {
      accessorKey: 'index',
      header: '#',
      cell: ({ row }) => row.index + 1,
      enableSorting: false,
    },
    {
      accessorKey: 'fullName',
      header: 'Full Name',
    },
    {
      accessorKey: 'email',
      header: 'Email',
    },
    {
      accessorKey: 'mobileNumber',
      header: 'Mobile',
    },
    {
      accessorKey: 'role',
      header: 'Role',
      cell: ({ getValue }) => {
        const val = getValue()
        return <span className={`badge bg-${ROLE_BADGE[val] ?? 'secondary'}`}>{val}</span>
      },
    },
    {
      accessorKey: 'isBlocked',
      header: 'Status',
      cell: ({ getValue }) => getValue() ? <span className="badge bg-danger">Blocked</span> : <span className="badge bg-success">Active</span>,
    },
    {
      accessorKey: 'isEmailVerified',
      header: 'Email',
      cell: ({ getValue }) => getValue() ? <span className="badge bg-success">Verified</span> : <span className="badge bg-warning text-dark">Pending</span>,
    },
    {
      accessorKey: 'createdAt',
      header: 'Created',
      cell: ({ getValue }) => new Date(getValue()).toLocaleDateString(),
    },
    {
      id: 'actions',
      header: 'Actions',
      enableSorting: false,
      cell: ({ row }) => (
        <div className="d-flex gap-2">
          <Button variant="soft-primary" size="sm" onClick={() => setEditTarget(row.original)}>
            <IconifyIcon icon="bx:edit" className="fs-16" />
          </Button>
          <Button variant="soft-danger" size="sm" onClick={() => setDeleteTarget(row.original)}>
            <IconifyIcon icon="bx:trash" className="fs-16" />
          </Button>
        </div>
      ),
    },
  ], [])

  const table = useReactTable({
    data: users,
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

  return (
    <>
      <PageBreadcrumb subName="Settings" title="User Management" />
      <PageMetaData title="User Management" />

      <Card className="overflow-hidden">
        <Card.Header>
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">All Users ({users.length})</h5>
            <div className="d-flex gap-2">
              <Button variant="primary" onClick={() => setCreateOpen(true)}>
                <IconifyIcon icon="bx:plus" className="me-1" />
                Create User
              </Button>
              <InputGroup style={{ width: '280px' }}>
                <Form.Control
                  type="text"
                  placeholder="Search users..."
                  value={globalFilter ?? ''}
                  onChange={(e) => setGlobalFilter(e.target.value)}
                />
                <InputGroup.Text><IconifyIcon icon="bx:search" /></InputGroup.Text>
              </InputGroup>
            </div>
          </div>
        </Card.Header>

        {loading && <div className="text-center py-5">Loading users...</div>}
        {error && <div className="text-center text-danger py-5">Error: {error}</div>}

        {!loading && !error && (
          <>
            <div className="table-responsive table-centered">
              <table className="table text-nowrap mb-0">
                <thead className="table-light">
                  {table.getHeaderGroups().map((hg) => (
                    <tr key={hg.id}>
                      {hg.headers.map((header) => (
                        <th
                          key={header.id}
                          onClick={header.column.getToggleSortingHandler()}
                          style={{ cursor: header.column.getCanSort() ? 'pointer' : 'default' }}
                        >
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
                    <tr>
                      <td colSpan={columns.length} className="text-center text-muted py-4">No users found.</td>
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
          </>
        )}
      </Card>

      {createOpen && (
        <UserModal
          onClose={() => setCreateOpen(false)}
          onSave={createUser}
        />
      )}
      {editTarget && (
        <UserModal
          user={editTarget}
          onClose={() => setEditTarget(null)}
          onSave={updateUser}
        />
      )}
      {deleteTarget && (
        <DeleteModal
          user={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={deleteUser}
        />
      )}
    </>
  )
}

export default UsersPage
