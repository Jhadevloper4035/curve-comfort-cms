import { useEffect, useState } from 'react';
import { Card, CardBody, Col, Row, Spinner } from 'react-bootstrap';
import ReactApexChart from 'react-apexcharts';
import { apiFetch } from '@/helpers/httpClient';

const COLORS  = ['#727cf5', '#0acf97', '#39afd1', '#fd7e14'];
const SOURCES = ['Events Enquiry', 'Showroom Enquiry', 'Website Enquiries', 'Product Enquiries'];

const LeadSourceChart = () => {
  const [counts, setCounts]   = useState([0, 0, 0, 0]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [allLeads, showroom, website, product] = await Promise.allSettled([
          apiFetch('/api/lead/all-leads'),
          apiFetch('/api/lead/showroom?limit=1'),
          apiFetch('/api/lead/contactleads?limit=1'),
          apiFetch('/api/lead/productEnquiry?limit=1'),
        ]);

        const val = (r) => (r.status === 'fulfilled' ? r.value : null);

        // all-leads returns { allLead: [...] } — all records, no pagination
        const allArr     = val(allLeads)?.allLead ?? [];
        const eventTotal = allArr.filter(l => l.leadType === 'event').length;

        setCounts([
          eventTotal,
          val(showroom)?.total  ?? 0,
          val(website)?.total   ?? 0,
          val(product)?.total   ?? 0,
        ]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const total = counts.reduce((a, b) => a + b, 0);

  const chartOptions = {
    chart:  { type: 'donut', toolbar: { show: false } },
    colors: COLORS,
    labels: SOURCES,
    legend: { show: false },
    dataLabels: { enabled: false },
    plotOptions: {
      pie: {
        donut: {
          size: '75%',
          labels: {
            show: true,
            total: {
              show:      true,
              label:     'Total Leads',
              fontSize:  '13px',
              color:     '#6c757d',
              formatter: () => total.toLocaleString(),
            },
          },
        },
      },
    },
    tooltip: {
      y: { formatter: (v) => `${v.toLocaleString()} leads` },
    },
    responsive: [{ breakpoint: 480, options: { chart: { height: 220 } } }],
  };

  return (
    <Card className="h-100">
      <CardBody>
        <h5 className="card-title mb-0">Lead Sources</h5>
        <p className="text-muted fs-13 mb-3">Distribution of all lead types</p>

        {loading ? (
          <div className="d-flex justify-content-center align-items-center" style={{ height: 260 }}>
            <Spinner />
          </div>
        ) : (
          <Row className="align-items-center">
            <Col md={6}>
              <ReactApexChart
                type="donut"
                height={260}
                series={counts}
                options={chartOptions}
              />
            </Col>
            <Col md={6}>
              {SOURCES.map((src, i) => (
                <div key={src} className="d-flex align-items-center justify-content-between mb-2">
                  <div className="d-flex align-items-center gap-2">
                    <span
                      className="rounded-circle d-inline-block"
                      style={{ width: 10, height: 10, backgroundColor: COLORS[i], flexShrink: 0 }}
                    />
                    <span className="fs-13">{src}</span>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <span className="fw-semibold fs-14">{counts[i].toLocaleString()}</span>
                    <span className="text-muted fs-12">
                      ({total > 0 ? Math.round((counts[i] / total) * 100) : 0}%)
                    </span>
                  </div>
                </div>
              ))}
              <hr className="my-2" />
              <div className="d-flex justify-content-between">
                <span className="fw-semibold fs-13">Total</span>
                <span className="fw-bold fs-14">{total.toLocaleString()}</span>
              </div>
            </Col>
          </Row>
        )}
      </CardBody>
    </Card>
  );
};

export default LeadSourceChart;
