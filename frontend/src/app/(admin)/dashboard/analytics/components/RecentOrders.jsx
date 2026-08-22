import { useEffect, useState } from 'react';
import { Badge, Card, CardBody, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuthContext } from '@/context/useAuthContext';
import { apiFetch } from '@/helpers/httpClient';

const money = (paise = 0) => `₹${(paise / 100).toLocaleString('en-IN')}`;
const label = (value) => String(value || '—').replaceAll('_', ' ');

const RecentOrders = () => {
  const { user } = useAuthContext();
  const isAdmin = ['admin', 'superadmin'].includes(user?.accessType);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAdmin) return;

    let active = true;
    apiFetch('/api/orders?limit=10&status=confirmed&paymentStatus=paid')
      .then((response) => active && setOrders(response.data?.orders || []))
      .catch((requestError) => active && setError(requestError.message || 'Unable to load orders.'))
      .finally(() => active && setLoading(false));

    return () => { active = false; };
  }, [isAdmin]);

  if (!isAdmin) return null;

  return (
    <Card className="mb-3">
      <CardBody>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h5 className="card-title mb-0">Recent Orders</h5>
            <p className="text-muted fs-13 mb-0">Latest 10 confirmed and paid orders</p>
          </div>
          <Link to="/ecommerce/orders/confirmed" className="btn btn-sm btn-soft-primary">View all</Link>
        </div>

        {loading ? <div className="text-center py-5"><Spinner /></div> : error ? <p className="text-danger mb-0">{error}</p> : (
          <div className="table-responsive">
            <table className="table table-hover table-centered mb-0">
              <thead className="table-light"><tr><th>Order</th><th>Customer</th><th>Items</th><th>Total</th><th>Payment</th><th>Status</th><th>Date</th><th /></tr></thead>
              <tbody>
                {orders.map((order) => <tr key={order._id}>
                  <td className="fw-medium">{order.orderNumber}</td>
                  <td>{order.user?.fullName || order.addressSnapshot?.fullName || '—'}</td>
                  <td>{order.items?.length || 0}</td>
                  <td>{money(order.pricing?.totalPaise)}</td>
                  <td><Badge bg="secondary">{label(order.paymentStatus)}</Badge></td>
                  <td><Badge bg="primary">{label(order.status)}</Badge></td>
                  <td>{new Date(order.createdAt).toLocaleDateString('en-IN')}</td>
                  <td className="text-end"><Link to={`/ecommerce/orders/${encodeURIComponent(order.orderNumber)}`} className="btn btn-sm btn-soft-primary">View details</Link></td>
                </tr>)}
                {!orders.length && <tr><td colSpan="8" className="text-center text-muted py-4">No orders found.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </CardBody>
    </Card>
  );
};

export default RecentOrders;
