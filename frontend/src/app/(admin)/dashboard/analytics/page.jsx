import { Col, Row } from 'react-bootstrap';
import PageBreadcrumb from '@/components/layout/PageBreadcrumb';
import PageMetaData from '@/components/PageTitle';
import SummaryCards from './components/SummaryCards';
import LeadStatusCharts from './components/LeadStatusCharts';
import RecentLeads from './components/RecentLeads';
import ContentHighlights from './components/ContentHighlights';
import RecentOrders from './components/RecentOrders';

export default function Dashboard() {
  return (
    <>
      <PageBreadcrumb title="Dashboard" subName="General" />
      <PageMetaData title="Dashboard" />

      {/* Summary cards */}
      <SummaryCards />

      <RecentOrders />

      {/* Row 3 — Recent content and active jobs */}
      <ContentHighlights />

      {/* Website enquiry status breakdown */}
      <Row className="g-3 mb-3">
        <Col xl={12}>
          <LeadStatusCharts />
        </Col>
      </Row>

      {/* Row 5 — Recent leads table */}
      <Row className="g-3 mb-3">
        <Col xl={12}>
          <RecentLeads />
        </Col>
      </Row>
    </>
  );
}
