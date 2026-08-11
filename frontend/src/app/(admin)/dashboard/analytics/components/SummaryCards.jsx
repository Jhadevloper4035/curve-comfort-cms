import { useEffect, useState } from 'react';
import { Card, CardBody, Col, Row, Spinner } from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import { apiFetch } from '@/helpers/httpClient';

const CARDS = [
  { key: 'eventLeads',       label: 'Events Enquiry',      icon: 'bx:calendar-event',  color: 'primary'   },
  { key: 'showroomLeads',    label: 'Showroom Enquiry',    icon: 'bx:store',           color: 'info'      },
  { key: 'websiteLeads',     label: 'Website Enquiries',   icon: 'bx:globe',           color: 'success'   },
  { key: 'productEnquiries', label: 'Product Enquiries',   icon: 'bx:package',         color: 'warning'   },
];

const SummaryCards = () => {
  const [totals, setTotals] = useState({
    eventLeads: 0, showroomLeads: 0, websiteLeads: 0,
    productEnquiries: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [allLeads, showroom, website, product] = await Promise.allSettled([
          apiFetch('/api/lead/all-leads'),
          apiFetch('/api/lead/showroom?limit=1'),
          apiFetch('/api/lead/contactleads?limit=1'),
          apiFetch('/api/lead/productEnquiry?limit=1'),
        ]);

        const val = (r) => r.status === 'fulfilled' ? r.value : null;

        // all-leads returns { allLead: [...] } — all records, no pagination
        const allArr     = val(allLeads)?.allLead ?? [];
        const eventTotal = allArr.filter(l => l.leadType === 'event').length;

        setTotals({
          eventLeads:       eventTotal,
          showroomLeads:    val(showroom)?.total  ?? 0,
          websiteLeads:     val(website)?.total   ?? 0,
          productEnquiries: val(product)?.total   ?? 0,
        });
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  return (
    <Row className="g-3 mb-3">
      {CARDS.map((card) => (
        <Col key={card.key} xs={6} md={4} xl>
          <Card className="h-100">
            <CardBody>
              <div className={`avatar-sm bg-${card.color} bg-opacity-10 rounded d-flex align-items-center justify-content-center mb-3`} style={{ width: 40, height: 40 }}>
                <IconifyIcon icon={card.icon} className={`text-${card.color} fs-20`} />
              </div>
              {loading ? (
                <Spinner size="sm" />
              ) : (
                <h3 className="mb-0 fw-bold">{totals[card.key].toLocaleString()}</h3>
              )}
              <p className="text-muted mb-0 fs-13 mt-1">{card.label}</p>
            </CardBody>
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default SummaryCards;
