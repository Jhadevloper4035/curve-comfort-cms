import { useEffect, useMemo, useState } from 'react';
import { Card, CardBody, Col, Form, Row, Spinner } from 'react-bootstrap';
import ReactApexChart from 'react-apexcharts';
import { hasPermission } from '@/constants/access';
import { useAuthContext } from '@/context/useAuthContext';
import { apiFetch } from '@/helpers/httpClient';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const SOURCES = [
  { key: 'event', label: 'Events Enquiry', color: '#727cf5', permission: 'eventLeads.view' },
  { key: 'showroom', label: 'Showroom Enquiry', color: '#0acf97', permission: 'showroomLeads.manage' },
  { key: 'website', label: 'Website Enquiries', color: '#39afd1', permission: 'websiteLeads.manage' },
  { key: 'product', label: 'Product Enquiries', color: '#fd7e14', permission: 'productEnquiries.view' },
];

const getRows = (response) => response?.data || (Array.isArray(response) ? response : []);

const getDate = (lead) => {
  const value = lead?.createdAt || lead?.submittedAt || lead?.created_at;
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const LeadTrendAnalytics = () => {
  const { user } = useAuthContext();
  const currentDate = new Date();
  const [mode, setMode] = useState('yearly');
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth());
  const [rowsBySource, setRowsBySource] = useState({});
  const [loading, setLoading] = useState(true);

  const visibleSources = useMemo(
    () => SOURCES.filter((source) => hasPermission(user, source.permission)),
    [user]
  );

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      if (visibleSources.length === 0) {
        setRowsBySource({});
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const requests = visibleSources.map((source) => {
          if (source.key === 'event') return apiFetch('/api/lead/all-leads');
          if (source.key === 'showroom') return apiFetch('/api/lead/showroom?limit=10000');
          if (source.key === 'website') return apiFetch('/api/lead/contactleads?limit=10000');
          return apiFetch('/api/lead/productEnquiry?limit=10000');
        });

        const results = await Promise.allSettled(requests);
        const nextRows = {};

        visibleSources.forEach((source, index) => {
          const result = results[index];
          const value = result.status === 'fulfilled' ? result.value : null;

          if (source.key === 'event') {
            nextRows[source.key] = (value?.allLead || []).filter((lead) => lead.leadType === 'event');
          } else {
            nextRows[source.key] = getRows(value);
          }
        });

        if (mounted) setRowsBySource(nextRows);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [visibleSources]);

  const availableYears = useMemo(() => {
    const years = new Set([currentDate.getFullYear()]);
    Object.values(rowsBySource).forEach((rows) => {
      rows.forEach((lead) => {
        const date = getDate(lead);
        if (date) years.add(date.getFullYear());
      });
    });
    return Array.from(years).sort((a, b) => b - a);
  }, [rowsBySource]);

  const chartData = useMemo(() => {
    const categories = mode === 'yearly'
      ? MONTHS
      : Array.from(
          { length: new Date(selectedYear, selectedMonth + 1, 0).getDate() },
          (_, index) => `${index + 1}`
        );

    const series = visibleSources.map((source) => {
      const counts = Array(categories.length).fill(0);

      (rowsBySource[source.key] || []).forEach((lead) => {
        const date = getDate(lead);
        if (!date || date.getFullYear() !== Number(selectedYear)) return;

        if (mode === 'yearly') {
          counts[date.getMonth()] += 1;
          return;
        }

        if (date.getMonth() === Number(selectedMonth)) {
          counts[date.getDate() - 1] += 1;
        }
      });

      return { name: source.label, data: counts };
    });

    return { categories, series };
  }, [mode, rowsBySource, selectedMonth, selectedYear, visibleSources]);

  const total = chartData.series.reduce(
    (sum, source) => sum + source.data.reduce((sourceSum, value) => sourceSum + value, 0),
    0
  );

  const chartOptions = {
    chart: { type: 'bar', toolbar: { show: false }, stacked: false },
    colors: visibleSources.map((source) => source.color),
    plotOptions: {
      bar: { borderRadius: 3, columnWidth: mode === 'yearly' ? '42%' : '58%' },
    },
    dataLabels: { enabled: false },
    xaxis: { categories: chartData.categories },
    yaxis: { labels: { formatter: (value) => Math.round(value).toString() } },
    legend: { position: 'top', horizontalAlign: 'left', markers: { radius: 12 } },
    tooltip: { y: { formatter: (value) => `${value.toLocaleString()} leads` } },
    grid: { strokeDashArray: 4 },
  };

  if (visibleSources.length === 0) return null;

  return (
    <Card className="mb-3">
      <CardBody>
        <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-3">
          <div>
            <h5 className="card-title mb-0">Lead Data Trends</h5>
            <p className="text-muted fs-13 mb-0">Month-wise and year-wise enquiry data by source</p>
          </div>
          <Row className="g-2 align-items-center">
            <Col xs="auto">
              <Form.Select size="sm" value={mode} onChange={(event) => setMode(event.target.value)}>
                <option value="yearly">Yearly</option>
                <option value="monthly">Monthly</option>
              </Form.Select>
            </Col>
            <Col xs="auto">
              <Form.Select size="sm" value={selectedYear} onChange={(event) => setSelectedYear(Number(event.target.value))}>
                {availableYears.map((year) => (
                  <option value={year} key={year}>{year}</option>
                ))}
              </Form.Select>
            </Col>
            {mode === 'monthly' && (
              <Col xs="auto">
                <Form.Select size="sm" value={selectedMonth} onChange={(event) => setSelectedMonth(Number(event.target.value))}>
                  {MONTHS.map((month, index) => (
                    <option value={index} key={month}>{month}</option>
                  ))}
                </Form.Select>
              </Col>
            )}
          </Row>
        </div>

        {loading ? (
          <div className="d-flex justify-content-center align-items-center" style={{ height: 320 }}>
            <Spinner />
          </div>
        ) : (
          <>
            <ReactApexChart type="bar" height={320} series={chartData.series} options={chartOptions} />
            <div className="d-flex justify-content-end text-muted fs-13">
              Total: <span className="fw-semibold text-body ms-1">{total.toLocaleString()}</span>
            </div>
          </>
        )}
      </CardBody>
    </Card>
  );
};

export default LeadTrendAnalytics;
