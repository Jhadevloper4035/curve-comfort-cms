import { Col, Row } from 'react-bootstrap';
import PageBreadcrumb from '@/components/layout/PageBreadcrumb';
import PageMetaData from '@/components/PageTitle';
import SummaryCards from './components/SummaryCards';
import LeadSourceChart from './components/LeadSourceChart';
import LeadStatusCharts from './components/LeadStatusCharts';
import RecentLeads from './components/RecentLeads';
import ShowroomLeadsChart from './components/ShowroomLeadsChart';
import ContentHighlights from './components/ContentHighlights';
import LeadTrendAnalytics from './components/LeadTrendAnalytics';

export default function Dashboard() {
  return (
    <>
      <PageBreadcrumb title="Dashboard" subName="General" />
      <PageMetaData title="Dashboard" />

      {/* Row 1 — 6 summary stat cards */}
      <SummaryCards />

      {/* Row 2 — Month-wise and year-wise lead trends */}
      <LeadTrendAnalytics />

      {/* Row 3 — Recent content and active jobs */}
      <ContentHighlights />

      {/* Row 4 — Lead source donut + status breakdown */}
      <Row className="g-3 mb-3">
        <Col xl={8}>
          <LeadSourceChart />
        </Col>
        <Col xl={4}>
          <LeadStatusCharts />
        </Col>
      </Row>

      {/* Row 5 — Recent leads table */}
      <Row className="g-3 mb-3">
        <Col xl={12}>
          <RecentLeads />
        </Col>
      </Row>

      {/* Row 6 — Showroom and event leads by location */}
      <Row className="g-3">
        <Col xl={12}>
          <ShowroomLeadsChart />
        </Col>
      </Row>
    </>
  );
}
