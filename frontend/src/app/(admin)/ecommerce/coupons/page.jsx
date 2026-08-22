import { useEffect, useState } from 'react';
import { Badge, Button, Card, CardBody, Col, Form, Row, Spinner } from 'react-bootstrap';
import PageBreadcrumb from '@/components/layout/PageBreadcrumb';
import PageMetaData from '@/components/PageTitle';
import { apiFetch } from '@/helpers/httpClient';
import { useNotificationContext } from '@/context/useNotificationContext';

const emptyCoupon = { code: '', title: '', description: '', discountPercent: '', minOrder: '', maxDiscount: '', startsAt: '', expiresAt: '', isActive: true };
const localDateTime = (value) => value ? new Date(value).toISOString().slice(0, 16) : '';

export default function CouponManagement() {
  const { showNotification } = useNotificationContext();
  const [coupons, setCoupons] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyCoupon);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadCoupons = async () => {
    setLoading(true);
    try {
      const response = await apiFetch('/api/coupons');
      setCoupons(response.data?.coupons || []);
    } catch (error) {
      showNotification({ message: error.message, variant: 'danger' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadCoupons(); }, []);

  const editCoupon = (coupon) => {
    setEditing(coupon);
    setForm({ code: coupon.code, title: coupon.title, description: coupon.description, discountPercent: coupon.discountPercent, minOrder: coupon.minOrderPaise ? coupon.minOrderPaise / 100 : '', maxDiscount: coupon.maxDiscountPaise ? coupon.maxDiscountPaise / 100 : '', startsAt: localDateTime(coupon.startsAt), expiresAt: localDateTime(coupon.expiresAt), isActive: coupon.isActive });
  };

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    const payload = {
      code: form.code.trim().toUpperCase(), title: form.title.trim(), description: form.description.trim(), discountPercent: Number(form.discountPercent), isActive: form.isActive,
      minOrderPaise: Math.round(Number(form.minOrder || 0) * 100), maxDiscountPaise: form.maxDiscount ? Math.round(Number(form.maxDiscount) * 100) : null,
      startsAt: form.startsAt || null, expiresAt: form.expiresAt || null,
    };
    try {
      const response = await apiFetch(editing ? `/api/coupons/${editing._id}` : '/api/coupons', { method: editing ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      showNotification({ message: response.message || 'Coupon saved.', variant: 'success' });
      setEditing(null);
      setForm(emptyCoupon);
      await loadCoupons();
    } catch (error) {
      showNotification({ message: error.message, variant: 'danger' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <PageMetaData title="Coupon Management" />
      <PageBreadcrumb title="Coupon Management" subName="Ecommerce" />
      <Row className="g-3">
        <Col lg={4}>
          <Card><CardBody>
            <div className="d-flex justify-content-between align-items-center mb-3"><h5 className="mb-0">{editing ? 'Edit Coupon' : 'Create Coupon'}</h5>{editing && <Button size="sm" variant="soft-secondary" onClick={() => { setEditing(null); setForm(emptyCoupon); }}>Cancel</Button>}</div>
            <Form onSubmit={submit}>
              <Form.Group className="mb-3"><Form.Label>Code</Form.Label><Form.Control required maxLength="30" value={form.code} onChange={(event) => setForm((current) => ({ ...current, code: event.target.value.toUpperCase() }))} placeholder="WELCOME10" /></Form.Group>
              <Form.Group className="mb-3"><Form.Label>Title</Form.Label><Form.Control required value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} /></Form.Group>
              <Form.Group className="mb-3"><Form.Label>Description</Form.Label><Form.Control as="textarea" rows={2} required value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} /></Form.Group>
              <Row className="g-2"><Col><Form.Group className="mb-3"><Form.Label>Discount %</Form.Label><Form.Control required type="number" min="1" max="99" value={form.discountPercent} onChange={(event) => setForm((current) => ({ ...current, discountPercent: event.target.value }))} /></Form.Group></Col><Col><Form.Group className="mb-3"><Form.Label>Minimum ₹</Form.Label><Form.Control type="number" min="0" value={form.minOrder} onChange={(event) => setForm((current) => ({ ...current, minOrder: event.target.value }))} /></Form.Group></Col></Row>
              <Form.Group className="mb-3"><Form.Label>Maximum Discount ₹</Form.Label><Form.Control type="number" min="1" value={form.maxDiscount} onChange={(event) => setForm((current) => ({ ...current, maxDiscount: event.target.value }))} /></Form.Group>
              <Form.Group className="mb-3"><Form.Label>Starts At</Form.Label><Form.Control type="datetime-local" value={form.startsAt} onChange={(event) => setForm((current) => ({ ...current, startsAt: event.target.value }))} /></Form.Group>
              <Form.Group className="mb-3"><Form.Label>Expires At</Form.Label><Form.Control type="datetime-local" value={form.expiresAt} onChange={(event) => setForm((current) => ({ ...current, expiresAt: event.target.value }))} /></Form.Group>
              <Form.Check className="mb-3" type="switch" id="coupon-active" label="Active" checked={form.isActive} onChange={(event) => setForm((current) => ({ ...current, isActive: event.target.checked }))} />
              <Button className="w-100" type="submit" disabled={saving}>{saving ? <Spinner size="sm" /> : editing ? 'Update Coupon' : 'Create Coupon'}</Button>
            </Form>
          </CardBody></Card>
        </Col>
        <Col lg={8}>
          <Card><CardBody className="p-0">
            {loading ? <div className="text-center py-5"><Spinner size="sm" /></div> : <div className="table-responsive"><table className="table table-hover table-centered mb-0"><thead className="table-light"><tr><th className="ps-3">Code</th><th>Discount</th><th>Minimum</th><th>Valid Until</th><th>Status</th><th /></tr></thead><tbody>
              {coupons.map((coupon) => <tr key={coupon._id}><td className="ps-3 fw-medium">{coupon.code}<div className="text-muted fs-13">{coupon.title}</div></td><td>{coupon.discountPercent}%</td><td>{coupon.minOrderPaise ? `₹${(coupon.minOrderPaise / 100).toLocaleString('en-IN')}` : '—'}</td><td>{coupon.expiresAt ? new Date(coupon.expiresAt).toLocaleDateString() : 'No expiry'}</td><td><Badge bg={coupon.isActive ? 'success' : 'secondary'}>{coupon.isActive ? 'Active' : 'Inactive'}</Badge></td><td className="text-end pe-3"><Button size="sm" variant="soft-primary" onClick={() => editCoupon(coupon)}>Edit</Button></td></tr>)}
              {!coupons.length && <tr><td colSpan="6" className="text-center text-muted py-4">No coupons yet.</td></tr>}
            </tbody></table></div>}
          </CardBody></Card>
        </Col>
      </Row>
    </>
  );
}
