import { useEffect, useState } from 'react'
import { Badge, Card, CardBody, Col, Row, Spinner } from 'react-bootstrap'
import { Link, useParams } from 'react-router-dom'
import PageBreadcrumb from '@/components/layout/PageBreadcrumb'
import PageMetaData from '@/components/PageTitle'
import { apiFetch } from '@/helpers/httpClient'

const money = (paise = 0) => `₹${(Number(paise || 0) / 100).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
const label = (value) => String(value || '—').replaceAll('_', ' ')
const dateTime = (value) => value ? new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : '—'

export default function UserDetails() {
  const { userId } = useParams()
  const [details, setDetails] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    apiFetch(`/api/auth/users/${encodeURIComponent(userId)}`)
      .then((response) => active && setDetails(response.data || null))
      .catch((requestError) => active && setError(requestError.message || 'Unable to load user details.'))
    return () => { active = false }
  }, [userId])

  if (error) {
    return <><PageMetaData title="User Details" /><PageBreadcrumb title="User Details" subName="Settings" /><Card><CardBody><p className="text-danger mb-3">{error}</p><Link to="/users" className="btn btn-soft-secondary">Back to users</Link></CardBody></Card></>
  }

  if (!details) return <div className="text-center py-5"><Spinner /></div>

  const { user, orders = [] } = details

  return (
    <>
      <PageMetaData title={`${user.fullName} | User Details`} />
      <PageBreadcrumb title="User Details" subName="Settings" />

      <Card className="mb-3">
        <CardBody className="d-flex flex-wrap align-items-center justify-content-between gap-3">
          <div>
            <h4 className="mb-1">{user.fullName}</h4>
            <span className="text-muted">Customer since {dateTime(user.createdAt)}</span>
          </div>
          <div className="d-flex align-items-center gap-2">
            <Badge bg={user.isBlocked ? 'danger' : 'success'}>{user.isBlocked ? 'Blocked' : 'Active'}</Badge>
            <Badge bg="secondary">{user.role}</Badge>
            <Link to="/users" className="btn btn-sm btn-soft-secondary">Back to users</Link>
          </div>
        </CardBody>
      </Card>

      <Row className="g-3 mb-3">
        <Col lg={5}>
          <Card className="h-100">
            <CardBody>
              <h5 className="card-title mb-3">Customer Profile</h5>
              <div className="d-flex justify-content-between gap-3 py-2 border-bottom"><span className="text-muted">Full name</span><span className="text-end">{user.fullName}</span></div>
              <div className="d-flex justify-content-between gap-3 py-2 border-bottom"><span className="text-muted">Email</span><span className="text-end">{user.email}</span></div>
              <div className="d-flex justify-content-between gap-3 py-2 border-bottom"><span className="text-muted">Mobile</span><span className="text-end">{user.mobileNumber || '—'}</span></div>
              <div className="d-flex justify-content-between gap-3 py-2 border-bottom"><span className="text-muted">Email verification</span><span className="text-end">{user.isEmailVerified ? 'Verified' : 'Pending'}</span></div>
              <div className="d-flex justify-content-between gap-3 pt-2"><span className="text-muted">Last updated</span><span className="text-end">{dateTime(user.updatedAt)}</span></div>
            </CardBody>
          </Card>
        </Col>
        <Col lg={7}>
          <Card className="h-100">
            <CardBody>
              <h5 className="card-title mb-3">Delivery Addresses Used in Orders</h5>
              {orders.filter((order) => order.addressSnapshot).map((order) => {
                const address = order.addressSnapshot
                const lines = [address.line1, address.line2, address.landmark, [address.city, address.state, address.postalCode].filter(Boolean).join(', '), address.country].filter(Boolean)
                return <div className="border-bottom pb-3 mb-3" key={order._id}>
                  <div className="d-flex justify-content-between gap-2 mb-1"><strong>{address.fullName || '—'}</strong><Link to={`/ecommerce/orders/${encodeURIComponent(order.orderNumber)}`}>Order #{order.orderNumber}</Link></div>
                  {lines.map((line) => <div className="text-muted" key={line}>{line}</div>)}
                  <div className="mt-1">Phone: {address.phone || '—'}{address.alternatePhone ? ` · Alternate: ${address.alternatePhone}` : ''}</div>
                </div>
              })}
              {!orders.some((order) => order.addressSnapshot) && <p className="text-muted mb-0">No delivery address is available yet.</p>}
            </CardBody>
          </Card>
        </Col>
      </Row>

      <Card>
        <CardBody>
          <h5 className="card-title mb-3">All Orders ({orders.length})</h5>
          <div className="table-responsive">
            <table className="table table-hover table-centered mb-0">
              <thead className="table-light"><tr><th>Order</th><th>Items</th><th>Total</th><th>Payment</th><th>Status</th><th>Date</th><th /></tr></thead>
              <tbody>
                {orders.map((order) => <tr key={order._id}>
                  <td className="fw-medium">{order.orderNumber}</td>
                  <td>{order.items?.map((item) => `${item.title} × ${item.quantity}`).join(', ') || '—'}</td>
                  <td>{money(order.pricing?.totalPaise)}</td>
                  <td><Badge bg="secondary">{label(order.paymentStatus)}</Badge></td>
                  <td><Badge bg="primary">{label(order.status)}</Badge></td>
                  <td>{dateTime(order.createdAt)}</td>
                  <td className="text-end"><Link to={`/ecommerce/orders/${encodeURIComponent(order.orderNumber)}`} className="btn btn-sm btn-soft-secondary">View order</Link></td>
                </tr>)}
                {!orders.length && <tr><td colSpan="7" className="text-center text-muted py-4">No orders found.</td></tr>}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>
    </>
  )
}
