import { useEffect, useState } from 'react';
import { Badge, Card, CardBody, Col, Row, Spinner } from 'react-bootstrap';
import { Link, useParams } from 'react-router-dom';
import PageBreadcrumb from '@/components/layout/PageBreadcrumb';
import PageMetaData from '@/components/PageTitle';
import { apiFetch } from '@/helpers/httpClient';

const money = (paise = 0) => `₹${(Number(paise || 0) / 100).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const label = (value) => String(value || '—').replaceAll('_', ' ');
const dateTime = (value) => value ? new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : '—';
const paymentMethods = { upi: 'UPI', card: 'Card', cod: 'Cash on delivery' };

const DetailCard = ({ title, children }) => (
  <Card className="h-100">
    <CardBody>
      <h5 className="card-title mb-3">{title}</h5>
      {children}
    </CardBody>
  </Card>
);

const DetailRow = ({ label: rowLabel, value }) => (
  <div className="d-flex justify-content-between gap-3 py-2 border-bottom">
    <span className="text-muted">{rowLabel}</span>
    <span className="text-end">{value}</span>
  </div>
);

export default function OrderDetails() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    apiFetch(`/api/orders/${encodeURIComponent(orderId)}`)
      .then((response) => active && setOrder(response.data?.order || null))
      .catch((requestError) => active && setError(requestError.message || 'Unable to load this order.'));
    return () => { active = false; };
  }, [orderId]);

  if (error) return <><PageMetaData title="Order Details" /><PageBreadcrumb title="Order Details" subName="Ecommerce" /><Card><CardBody><p className="text-danger mb-3">{error}</p><Link to="/ecommerce/orders" className="btn btn-soft-secondary">Back to orders</Link></CardBody></Card></>;
  if (!order) return <div className="text-center py-5"><Spinner /></div>;

  const address = order.addressSnapshot || {};
  const pricing = order.pricing || {};
  const transaction = order.activePaymentTransaction || order.paymentTransaction || order.advancePaymentTransaction;
  const addressLines = [address.line1, address.line2, address.landmark, [address.city, address.state, address.postalCode].filter(Boolean).join(', '), address.country].filter(Boolean);

  return (
    <>
      <PageMetaData title={`Order ${order.orderNumber}`} />
      <PageBreadcrumb title="Order Details" subName="Ecommerce" />

      <Card className="mb-3">
        <CardBody className="d-flex flex-wrap justify-content-between align-items-center gap-3">
          <div>
            <h4 className="mb-1">Order #{order.orderNumber}</h4>
            <span className="text-muted">Placed {dateTime(order.createdAt)}</span>
          </div>
          <div className="d-flex align-items-center gap-2"><Badge bg="secondary">{label(order.paymentStatus)}</Badge><Badge bg="primary">{label(order.status)}</Badge><Link to="/ecommerce/orders" className="btn btn-sm btn-soft-secondary">Back to orders</Link></div>
        </CardBody>
      </Card>

      <Row className="g-3 mb-3">
        <Col lg={6}>
          <DetailCard title="Customer">
            <DetailRow label="Name" value={order.user?.fullName || address.fullName || '—'} />
            <DetailRow label="Email" value={order.user?.email || '—'} />
            <DetailRow label="Phone" value={order.user?.mobileNumber || address.phone || '—'} />
            {address.alternatePhone && <DetailRow label="Alternate phone" value={address.alternatePhone} />}
          </DetailCard>
        </Col>
        <Col lg={6}>
          <DetailCard title="Delivery Address">
            <p className="fw-semibold mb-1">{address.fullName || '—'}</p>
            {addressLines.map((line) => <p className="mb-1 text-muted" key={line}>{line}</p>)}
            {address.phone && <p className="mb-0 mt-2">Phone: {address.phone}</p>}
          </DetailCard>
        </Col>
      </Row>

      <DetailCard title="Order Items">
        <div className="table-responsive">
          <table className="table table-hover table-centered mb-0">
            <thead className="table-light"><tr><th>Product</th><th>Options</th><th>Unit price</th><th>GST</th><th>Quantity</th><th className="text-end">Amount</th></tr></thead>
            <tbody>{order.items.map((item, index) => <tr key={`${item.product}-${index}`}>
              <td><div className="d-flex align-items-center gap-2">{item.image && <img src={item.image} alt="" className="avatar-sm rounded" />}<span className="fw-medium">{item.title}</span></div></td>
              <td className="text-muted">{item.selectedOptions?.map((option) => `${option.label || option.key}: ${option.value}`).join(', ') || '—'}</td>
              <td>{money(item.unitPricePaise)}</td><td>{item.gstPercent}%</td><td>{item.quantity}</td><td className="text-end">{money(item.unitPricePaise * item.quantity)}</td>
            </tr>)}</tbody>
          </table>
        </div>
      </DetailCard>

      <Row className="g-3 mt-0">
        <Col lg={5}>
          <DetailCard title="Pricing Summary">
            <DetailRow label="Subtotal" value={money(pricing.subtotalPaise)} />
            <DetailRow label={order.couponCode ? `Discount (${order.couponCode})` : 'Discount'} value={`−${money(pricing.discountPaise)}`} />
            <DetailRow label="Shipping" value={pricing.shippingPaise ? money(pricing.shippingPaise) : 'Included'} />
            <DetailRow label="GST / Tax" value={money(pricing.taxPaise)} />
            <DetailRow label="Total" value={<strong>{money(pricing.totalPaise)}</strong>} />
            <DetailRow label="Advance paid" value={money(order.advancePaidPaise || pricing.advancePaise)} />
            <DetailRow label="Balance due" value={money(order.codBalanceDuePaise ?? pricing.balanceDuePaise)} />
            {order.refundReservedPaise > 0 && <DetailRow label="Refund pending" value={money(order.refundReservedPaise)} />}
            {order.refundedPaise > 0 && <DetailRow label="Refunded" value={money(order.refundedPaise)} />}
          </DetailCard>
        </Col>
        <Col lg={7}>
          <DetailCard title="Payment & Order Status">
            <DetailRow label="Payment method" value={paymentMethods[order.paymentMethod] || label(order.paymentMethod)} />
            <DetailRow label="Payment status" value={label(order.paymentStatus)} />
            <DetailRow label="Order status" value={label(order.status)} />
            <DetailRow label="COD balance status" value={label(order.codBalanceStatus)} />
            <DetailRow label="Coupon reservation" value={label(order.couponReservationStatus)} />
            {order.advancePaidAt && <DetailRow label="Advance paid on" value={dateTime(order.advancePaidAt)} />}
            {order.codBalanceCollectedAt && <DetailRow label="COD balance collected" value={dateTime(order.codBalanceCollectedAt)} />}
            {transaction && <>
              <DetailRow label="Gateway" value={label(transaction.gateway)} />
              <DetailRow label="Transaction status" value={label(transaction.status)} />
              <DetailRow label="Cashfree order ID" value={transaction.cfOrderId || '—'} />
              <DetailRow label="Cashfree payment ID" value={transaction.cfPaymentId || '—'} />
              <DetailRow label="Cashfree status" value={transaction.cashfreeStatus || '—'} />
              <DetailRow label="Payment amount" value={money(transaction.amountPaise)} />
              <DetailRow label="Processed" value={dateTime(transaction.processedAt)} />
            </>}
            {order.lastPaymentReconciledAt && <DetailRow label="Last reconciled" value={dateTime(order.lastPaymentReconciledAt)} />}
            {order.expiresAt && <DetailRow label="Payment expiry" value={dateTime(order.expiresAt)} />}
          </DetailCard>
        </Col>
      </Row>
    </>
  );
}
