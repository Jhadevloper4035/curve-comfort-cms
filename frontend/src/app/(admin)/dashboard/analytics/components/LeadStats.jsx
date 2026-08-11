import { useEffect, useState } from 'react';
import { Card, CardBody, Col, Row, Spinner } from 'react-bootstrap';
import { apiFetch } from '@/helpers/httpClient';

const SmallStatCard = ({ title, value, children }) => {
  return (
    <Card className="mb-3 h-100">
      <CardBody>
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div>
            <p className="text-muted mb-1 text-uppercase fs-12">{title}</p>
            <h4 className="mb-0">{value}</h4>
          </div>
        </div>
        {children}
      </CardBody>
    </Card>
  );
};

const formatCounts = (counts) =>
  Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([name, count]) => (
      <div key={name} className="d-flex justify-content-between text-muted mb-1">
        <span>{name}</span>
        <span>{count}</span>
      </div>
    ));

const LeadStats = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    const loadLeads = async () => {
      try {
        const data = await apiFetch('/api/lead/showroom');
        if (mounted) {
          setLeads(data?.data || []);
        }
      } catch (err) {
        if (mounted) {
          setError(err.message || 'Failed to load lead stats');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadLeads();

    return () => {
      mounted = false;
    };
  }, []);

  const totalLeads = leads.length;
  const userTypeCounts = leads.reduce((acc, lead) => {
    const key = lead.UserType || lead.userType || 'Unknown';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const locationCounts = leads.reduce((acc, lead) => {
    const key = lead.place || 'Unknown';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  return (
    <Card className="mb-4">
      <CardBody>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h5 className="mb-0">Lead Summary</h5>
            <p className="text-muted mb-0">Totals by user type and location</p>
          </div>
          {loading && <Spinner animation="border" size="sm" />}
        </div>

        {error ? (
          <div className="text-danger">{error}</div>
        ) : (
          <Row>
            <Col md={4}>
              <SmallStatCard title="Total Leads" value={totalLeads} />
            </Col>
            <Col md={4}>
              <SmallStatCard title="Top User Types" value="">
                {formatCounts(userTypeCounts)}
              </SmallStatCard>
            </Col>
            <Col md={4}>
              <SmallStatCard title="Top Locations" value="">
                {formatCounts(locationCounts)}
              </SmallStatCard>
            </Col>
          </Row>
        )}
      </CardBody>
    </Card>
  );
};

export default LeadStats;
