import { useEffect, useState } from 'react';
import { Badge, Card, CardBody, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import { hasPermission } from '@/constants/access';
import { useAuthContext } from '@/context/useAuthContext';
import { apiFetch } from '@/helpers/httpClient';

const money = (paise = 0) => `₹${(Number(paise || 0) / 100).toLocaleString('en-IN')}`;

const ContentHighlights = () => {
  const { user } = useAuthContext();
  const canViewCoupons = hasPermission(user, 'products.manage');
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!canViewCoupons) return;

    let active = true;
    apiFetch('/api/coupons?active=true')
      .then((response) => active && setCoupons(response.data?.coupons || []))
      .catch((requestError) => active && setError(requestError.message || 'Unable to load active coupons.'))
      .finally(() => active && setLoading(false));

    return () => { active = false; };
  }, [canViewCoupons]);

  if (!canViewCoupons) return null;

  return (
    <Card className="mb-3">
      <CardBody>
        <div className="d-flex justify-content-between align-items-start gap-3 mb-3">
          <div className="d-flex align-items-center gap-2">
            <div className="avatar-sm bg-success bg-opacity-10 text-success rounded d-flex align-items-center justify-content-center">
              <IconifyIcon icon="iconamoon:discount-duotone" className="fs-20" />
            </div>
            <div>
              <h5 className="card-title mb-0">Active Website Coupons</h5>
              <p className="text-muted fs-13 mb-0">Coupons currently available at checkout</p>
            </div>
          </div>
          <Link to="/ecommerce/coupons" className="btn btn-sm btn-soft-secondary">View</Link>
        </div>

        {loading ? <div className="text-center py-4"><Spinner size="sm" /></div> : error ? <div className="text-center text-danger py-4 fs-13">{error}</div> : coupons.length === 0 ? <div className="text-center text-muted py-4 fs-13">No active website coupons found</div> : (
          <div className="table-responsive">
            <table className="table table-hover table-centered mb-0">
              <thead className="table-light"><tr><th>Code</th><th>Coupon</th><th>Discount</th><th>Minimum Order</th><th>Valid Until</th></tr></thead>
              <tbody>{coupons.slice(0, 6).map((coupon) => <tr key={coupon._id}>
                <td><Badge bg="success">{coupon.code}</Badge></td>
                <td><div className="fw-medium">{coupon.title}</div><small className="text-muted">{coupon.description}</small></td>
                <td>{coupon.discountPercent}%</td>
                <td>{coupon.minOrderPaise ? money(coupon.minOrderPaise) : 'No minimum'}</td>
                <td>{coupon.expiresAt ? new Date(coupon.expiresAt).toLocaleDateString('en-IN') : 'No expiry'}</td>
              </tr>)}</tbody>
            </table>
          </div>
        )}
      </CardBody>
    </Card>
  );
};

export default ContentHighlights;
