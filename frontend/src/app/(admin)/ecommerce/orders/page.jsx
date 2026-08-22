import { useEffect, useState } from 'react';
import { Badge, Button, Card, CardBody, Col, Form, Modal, Row, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import PageBreadcrumb from '@/components/layout/PageBreadcrumb';
import PageMetaData from '@/components/PageTitle';
import { apiFetch } from '@/helpers/httpClient';
import { useNotificationContext } from '@/context/useNotificationContext';

const nextStatuses = {
  pending_payment: ['cancelled'],
  confirmed: ['processing', 'cancel_requested'],
  processing: ['shipped', 'cancel_requested'],
  shipped: ['delivered', 'cancelled'],
  cancel_requested: ['cancelled'],
  payment_review_required: ['cancelled'],
};
const orderStatuses = ['pending_payment', 'confirmed', 'processing', 'shipped', 'delivered', 'payment_failed', 'cancel_requested', 'cancelled', 'payment_review_required', 'payment_received_after_cancellation', 'refund_pending', 'partially_refunded', 'refunded'];
const paymentStatuses = ['pending', 'advance_paid', 'paid', 'failed', 'refund_pending', 'partially_refunded', 'refunded'];
const money = (paise = 0) => `₹${(Number(paise || 0) / 100).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const label = (value) => String(value || '—').replaceAll('_', ' ');
const dateTime = (value) => value ? new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : '—';

export default function OrderManagement({ pageTitle = 'Order Management', fixedFilters = {}, lookupMode = false }) {
  const { showNotification } = useNotificationContext();
  const defaultFilters = { query: '', status: '', paymentStatus: '', view: '', ...fixedFilters };
  const [orders, setOrders] = useState([]);
  const [selected, setSelected] = useState(null);
  const [filters, setFilters] = useState(defaultFilters);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusTarget, setStatusTarget] = useState('');
  const [codStatus, setCodStatus] = useState('collected');
  const [refund, setRefund] = useState({ amount: '', reason: '' });

  const loadOrders = async (nextFilters = filters) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: '50' });
      if (nextFilters.query.trim()) params.set('q', nextFilters.query.trim());
      if (nextFilters.status) params.set('status', nextFilters.status);
      if (nextFilters.paymentStatus) params.set('paymentStatus', nextFilters.paymentStatus);
      if (nextFilters.view) params.set('view', nextFilters.view);
      const response = await apiFetch(`/api/orders?${params}`);
      setOrders(response.data?.orders || []);
    } catch (error) {
      showNotification({ message: error.message || 'Unable to load orders.', variant: 'danger' });
    } finally {
      setLoading(false);
    }
  };

  const openOrder = async (orderNumber) => {
    const response = await apiFetch(`/api/orders/${encodeURIComponent(orderNumber)}`);
    setSelected(response.data?.order || null);
    setStatusTarget('');
    setCodStatus('collected');
    setRefund({ amount: '', reason: '' });
  };

  const filterKey = JSON.stringify(fixedFilters);

  useEffect(() => {
    const nextFilters = { query: '', status: '', paymentStatus: '', view: '', ...fixedFilters };
    setFilters(nextFilters);
    setSelected(null);
    loadOrders(nextFilters);
  }, [filterKey]);

  const manageOrder = async (orderNumber) => {
    setSaving(true);
    try {
      await openOrder(orderNumber);
    } catch (error) {
      showNotification({ message: error.message || 'Unable to load order.', variant: 'danger' });
    } finally {
      setSaving(false);
    }
  };

  const refreshSelectedOrder = async (orderNumber) => {
    await openOrder(orderNumber);
    await loadOrders();
  };

  const updateStatus = async () => {
    if (!selected || !statusTarget) return;
    setSaving(true);
    try {
      await apiFetch(`/api/orders/${encodeURIComponent(selected.orderNumber)}/status`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: statusTarget }),
      });
      await refreshSelectedOrder(selected.orderNumber);
      showNotification({ message: 'Order status updated.', variant: 'success' });
    } catch (error) {
      showNotification({ message: error.message || 'Unable to update order status.', variant: 'danger' });
    } finally {
      setSaving(false);
    }
  };

  const reconcile = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      const response = await apiFetch(`/api/admin/payments/${encodeURIComponent(selected.orderNumber)}/reconcile`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}),
      });
      await refreshSelectedOrder(selected.orderNumber);
      showNotification({ message: response.data?.paymentPending ? 'No successful gateway payment was found.' : 'Payment review completed.', variant: response.data?.paymentPending ? 'warning' : 'success' });
    } catch (error) {
      showNotification({ message: error.message || 'Unable to review payment.', variant: 'danger' });
    } finally {
      setSaving(false);
    }
  };

  const resolveCodBalance = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await apiFetch(`/api/orders/${encodeURIComponent(selected.orderNumber)}/cod-balance`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: codStatus }),
      });
      await refreshSelectedOrder(selected.orderNumber);
      showNotification({ message: 'COD balance updated.', variant: 'success' });
    } catch (error) {
      showNotification({ message: error.message || 'Unable to update COD balance.', variant: 'danger' });
    } finally {
      setSaving(false);
    }
  };

  const createRefund = async (event) => {
    event.preventDefault();
    if (!selected || !refund.amount || !refund.reason.trim()) return;
    setSaving(true);
    try {
      const response = await apiFetch(`/api/orders/${encodeURIComponent(selected.orderNumber)}/refunds`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: Number(refund.amount), reason: refund.reason.trim(), idempotencyKey: crypto.randomUUID() }),
      });
      await refreshSelectedOrder(selected.orderNumber);
      showNotification({ message: response.data?.refund?.status === 'review_required' ? 'Refund needs payment review.' : 'Refund requested.', variant: 'success' });
    } catch (error) {
      showNotification({ message: error.message || 'Unable to request refund.', variant: 'danger' });
    } finally {
      setSaving(false);
    }
  };

  const transaction = selected?.activePaymentTransaction || selected?.paymentTransaction || selected?.advancePaymentTransaction;
  const refundable = ['paid', 'partially_refunded'].includes(transaction?.status);
  const availableStatuses = nextStatuses[selected?.status] || [];

  return (
    <>
      <PageMetaData title={pageTitle} />
      <PageBreadcrumb title={pageTitle} subName="Ecommerce" />
      <Row className="g-3">
        <Col xl={12}>
          <Card>
            <CardBody>
              <Form onSubmit={(event) => { event.preventDefault(); loadOrders(); }} className="row g-2 mb-3">
                <Col md={fixedFilters.status || fixedFilters.view ? 6 : 4}><Form.Control value={filters.query} onChange={(event) => setFilters((current) => ({ ...current, query: event.target.value }))} placeholder={lookupMode ? 'Order, customer, email, or phone' : 'Search order number'} /></Col>
                {!fixedFilters.status && !fixedFilters.view && <Col md={3}><Form.Select value={filters.status} onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}><option value="">All order statuses</option>{orderStatuses.map((status) => <option key={status} value={status}>{label(status)}</option>)}</Form.Select></Col>}
                {!fixedFilters.paymentStatus && !fixedFilters.view && <Col md={3}><Form.Select value={filters.paymentStatus} onChange={(event) => setFilters((current) => ({ ...current, paymentStatus: event.target.value }))}><option value="">All payment statuses</option>{paymentStatuses.map((status) => <option key={status} value={status}>{label(status)}</option>)}</Form.Select></Col>}
                <Col md={fixedFilters.status || fixedFilters.view ? 6 : 2} className="d-flex gap-2"><Button type="submit" disabled={loading}>Apply</Button><Button type="button" variant="soft-secondary" onClick={() => { setFilters(defaultFilters); loadOrders(defaultFilters); }}>Reset</Button></Col>
              </Form>
              {loading ? <div className="text-center py-5"><Spinner size="sm" /></div> : (
                <div className="table-responsive">
                  <table className="table table-hover table-centered mb-0">
                    <thead className="table-light"><tr><th>Order</th><th>Customer</th><th>Total</th><th>Method</th><th>Payment</th><th>Status</th><th>Placed</th><th /></tr></thead>
                    <tbody>
                      {orders.map((order) => <tr key={order._id}>
                        <td className="fw-medium">{order.orderNumber}</td>
                        <td><div>{order.user?.fullName || '—'}</div><small className="text-muted">{order.user?.mobileNumber || ''}</small></td>
                        <td>{money(order.pricing?.totalPaise)}</td>
                        <td>{label(order.paymentMethod)}</td>
                        <td><Badge bg={order.paymentStatus === 'paid' ? 'success' : order.paymentStatus === 'failed' ? 'danger' : 'secondary'}>{label(order.paymentStatus)}</Badge></td>
                        <td><Badge bg={order.status === 'payment_review_required' ? 'warning' : 'primary'} text={order.status === 'payment_review_required' ? 'dark' : undefined}>{label(order.status)}</Badge></td>
                        <td>{dateTime(order.createdAt)}</td>
                        <td className="text-end"><div className="d-flex justify-content-end gap-2"><Link to={`/ecommerce/orders/${encodeURIComponent(order.orderNumber)}`} className="btn btn-sm btn-soft-secondary">Details</Link><Button size="sm" variant="soft-primary" onClick={() => manageOrder(order.orderNumber)} disabled={saving}>Manage</Button></div></td>
                      </tr>)}
                      {!orders.length && <tr><td colSpan="8" className="text-center text-muted py-4">No orders found.</td></tr>}
                    </tbody>
                  </table>
                </div>
              )}
            </CardBody>
          </Card>
        </Col>
        {selected && <Modal show onHide={() => setSelected(null)} size="lg" scrollable>
          <Modal.Header closeButton>
            <Modal.Title as="div"><h5 className="mb-1">{selected.orderNumber}</h5><div className="text-muted fs-14">{selected.user?._id ? <Link to={`/users/${selected.user._id}`}>{selected.user.fullName}</Link> : selected.addressSnapshot?.fullName || '—'}</div></Modal.Title>
          </Modal.Header>
          <Modal.Body>

              <div className="border rounded p-3 mb-3"><div><strong>Total:</strong> {money(selected.pricing?.totalPaise)} · <strong>Method:</strong> {label(selected.paymentMethod)}</div><div className="mt-1"><strong>Payment:</strong> {label(selected.paymentStatus)} · <strong>Order:</strong> {label(selected.status)}</div>{transaction && <div className="mt-1"><strong>Gateway status:</strong> {label(transaction.status)}</div>}</div>

              {selected.status === 'payment_review_required' && <div className="alert alert-warning py-2">This payment needs gateway review before the order can proceed.</div>}
              <div className="mb-3">
                <Form.Label>Update Order Status</Form.Label>
                <div className="d-flex gap-2"><Form.Select value={statusTarget} onChange={(event) => setStatusTarget(event.target.value)} disabled={saving || !availableStatuses.length}><option value="">{availableStatuses.length ? 'Choose next status' : `No next status from ${label(selected.status)}`}</option>{availableStatuses.map((status) => <option key={status} value={status}>{label(status)}</option>)}</Form.Select><Button variant="soft-primary" onClick={updateStatus} disabled={saving || !statusTarget}>Update</Button></div>
              </div>

              <div className="mb-3">
                <Form.Label>Payment Review</Form.Label>
                <div className="d-flex align-items-center gap-2"><Button variant="soft-warning" onClick={reconcile} disabled={saving || !transaction}>{selected.status === 'payment_review_required' ? 'Review payment' : 'Reconcile payment'}</Button>{!transaction && <small className="text-muted">No online payment attempt for this order.</small>}</div>
              </div>

              {selected.paymentMethod === 'cod' && <div className="mb-3"><Form.Label>COD Balance: {money(selected.codBalanceDuePaise)}</Form.Label><div className="d-flex gap-2"><Form.Select value={codStatus} onChange={(event) => setCodStatus(event.target.value)} disabled={saving || selected.codBalanceStatus !== 'due'}><option value="collected">Collected</option><option value="refused">Refused</option><option value="failed_delivery">Failed delivery</option></Form.Select><Button variant="soft-primary" onClick={resolveCodBalance} disabled={saving || selected.codBalanceStatus !== 'due'}>Record COD</Button></div><small className="text-muted">Current COD status: {label(selected.codBalanceStatus)}</small></div>}

              <h6 className="mt-4">Items</h6>
              <ul className="ps-3 mb-3">{selected.items?.map((item, index) => <li key={`${item.product}-${index}`}>{item.title} × {item.quantity}</li>)}</ul>

              {refundable && <Form onSubmit={createRefund}>
                <h6>Request Refund</h6>
                <Row className="g-2"><Col md={4}><Form.Control required min="0.01" step="0.01" type="number" placeholder="Amount" value={refund.amount} onChange={(event) => setRefund((current) => ({ ...current, amount: event.target.value }))} /></Col><Col md={8}><Form.Control required placeholder="Reason" value={refund.reason} onChange={(event) => setRefund((current) => ({ ...current, reason: event.target.value }))} /></Col></Row>
                <Button className="mt-2" type="submit" variant="soft-danger" disabled={saving}>Request Refund</Button>
              </Form>}
              {!refundable && <small className="text-muted">Refunds are available after a successful online payment.</small>}
              <Link to={`/ecommerce/orders/${encodeURIComponent(selected.orderNumber)}`} className="btn btn-sm btn-soft-secondary mt-3">Open complete order details</Link>
          </Modal.Body>
        </Modal>}
      </Row>
    </>
  );
}
