import { useEffect, useMemo, useState } from 'react';
import { Card, CardBody, Col, Row, Spinner } from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import { hasPermission } from '@/constants/access';
import { useAuthContext } from '@/context/useAuthContext';
import { apiFetch } from '@/helpers/httpClient';

const LEAD_CARDS = [
  { key: 'websiteLeads', label: 'Website Enquiries', icon: 'bx:globe', color: 'success', permission: 'websiteLeads.manage', url: '/api/lead/contactleads?limit=1' },
];

const STORE_CARDS = [
  { key: 'totalOrders', label: 'Orders', icon: 'bx:receipt', color: 'primary', store: true },
  { key: 'customers', label: 'Customers', icon: 'bx:group', color: 'info', store: true },
  { key: 'collectedPaise', label: 'Order Amount', icon: 'bx:rupee', color: 'success', store: true, format: (value) => `₹${(value / 100).toLocaleString('en-IN')}` },
  { key: 'pendingPayments', label: 'Pending Payments', icon: 'bx:time-five', color: 'warning', store: true },
  { key: 'toFulfil', label: 'To Fulfil', icon: 'bx:package', color: 'secondary', store: true },
  { key: 'refundedPaise', label: 'Refunded', icon: 'bx:undo', color: 'danger', store: true, format: (value) => `₹${(value / 100).toLocaleString('en-IN')}` },
];

const SummaryCards = () => {
  const { user } = useAuthContext();
  const isAdmin = ['admin', 'superadmin'].includes(user?.accessType);
  const visibleLeadCards = useMemo(() => LEAD_CARDS.filter((card) => hasPermission(user, card.permission)), [user]);
  const [totals, setTotals] = useState({});
  const [storeMetrics, setStoreMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [leadResults, storeResult] = await Promise.all([
          Promise.allSettled(visibleLeadCards.map((card) => apiFetch(card.url))),
          isAdmin ? apiFetch('/api/admin/dashboard') : Promise.resolve(null),
        ]);

        setTotals(Object.fromEntries(visibleLeadCards.map((card, index) => [
          card.key,
          leadResults[index]?.status === 'fulfilled' ? leadResults[index].value?.total ?? 0 : 0,
        ])));
        setStoreMetrics(storeResult?.data?.dashboard?.metrics || null);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [isAdmin, visibleLeadCards]);

  const cards = isAdmin ? [...visibleLeadCards, ...STORE_CARDS] : visibleLeadCards;

  return (
    <Row className="g-3 mb-3">
      {cards.map((card) => {
        const value = card.store ? storeMetrics?.[card.key] : totals[card.key];
        return (
        <Col key={card.key} xs={6} md={4} xl={3}>
          <Card className="h-100">
            <CardBody>
              <div className={`avatar-sm bg-${card.color} bg-opacity-10 rounded d-flex align-items-center justify-content-center mb-3`} style={{ width: 40, height: 40 }}>
                <IconifyIcon icon={card.icon} className={`text-${card.color} fs-20`} />
              </div>
              {loading ? (
                <Spinner size="sm" />
              ) : (
                <h3 className="mb-0 fw-bold">{value === undefined ? '—' : (card.format ? card.format(value) : value.toLocaleString())}</h3>
              )}
              <p className="text-muted mb-0 fs-13 mt-1">{card.label}</p>
            </CardBody>
          </Card>
        </Col>
        );
      })}
    </Row>
  );
};

export default SummaryCards;
