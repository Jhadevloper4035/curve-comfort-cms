import { useEffect } from 'react';
import { Card, CardBody, Spinner } from 'react-bootstrap';
import ReactApexChart from 'react-apexcharts';
import useWebsiteLeadsStore    from '@/store/websiteLeadsStore';

const STATUS_COLORS = {
  // website
  new:       '#727cf5',
  pending:   '#727cf5',
  contacted: '#39afd1',
  qualified: '#0acf97',
  converted: '#0acf97',
  closed:    '#6c757d',
  rejected:  '#fa5c7c',
};

const miniDonut = (labels, series, colors) => ({
  chart:      { type: 'donut', toolbar: { show: false }, sparkline: { enabled: true } },
  colors,
  labels,
  legend:     { show: false },
  dataLabels: { enabled: false },
  plotOptions: { pie: { donut: { size: '70%' } } },
  tooltip:    { y: { formatter: (v) => `${v}` } },
});

const StatusRow = ({ label, count, color }) => (
  <div className="d-flex justify-content-between align-items-center mb-1">
    <div className="d-flex align-items-center gap-2">
      <span className="rounded-circle d-inline-block" style={{ width: 8, height: 8, backgroundColor: color, flexShrink: 0 }} />
      <span className="fs-12 text-capitalize">{label}</span>
    </div>
    <span className="fw-semibold fs-12">{count}</span>
  </div>
);

const MiniChart = ({ title, leads, statusField = 'status', loading }) => {
  const counts = leads.reduce((acc, l) => {
    const s = l[statusField] || 'unknown';
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {});
  const labels  = Object.keys(counts);
  const series  = Object.values(counts);
  const colors  = labels.map(l => STATUS_COLORS[l] || '#adb5bd');
  const total   = series.reduce((a, b) => a + b, 0);

  return (
    <div className="mb-4">
      <div className="d-flex align-items-center justify-content-between mb-1">
        <span className="fw-semibold fs-13">{title}</span>
        <span className="badge bg-light text-dark fs-11">{total}</span>
      </div>
      {loading ? (
        <div className="py-2"><Spinner size="sm" /></div>
      ) : total === 0 ? (
        <p className="text-muted fs-12 mb-0">No data</p>
      ) : (
        <div className="d-flex gap-3 align-items-center">
          <div style={{ width: 70, flexShrink: 0 }}>
            <ReactApexChart
              type="donut"
              height={70}
              series={series}
              options={miniDonut(labels, series, colors)}
            />
          </div>
          <div className="flex-grow-1">
            {labels.map((l, i) => (
              <StatusRow key={l} label={l} count={series[i]} color={colors[i]} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const LeadStatusCharts = () => {
  const { leads: webLeads,     loading: webLoading,  fetchLeads: fetchWeb  } = useWebsiteLeadsStore();

  useEffect(() => {
    fetchWeb();
  }, []);

  return (
    <Card className="h-100">
      <CardBody>
        <h5 className="card-title mb-0">Status Breakdown</h5>
        <p className="text-muted fs-13 mb-3">Current stage of website enquiries</p>

        <MiniChart title="Website Enquiries" leads={webLeads} loading={webLoading} />
      </CardBody>
    </Card>
  );
};

export default LeadStatusCharts;
