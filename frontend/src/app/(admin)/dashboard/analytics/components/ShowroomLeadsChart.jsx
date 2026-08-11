import { useEffect, useMemo } from 'react';
import { Card, CardBody, Col, Row, Spinner } from 'react-bootstrap';
import ReactApexChart from 'react-apexcharts';
import useShowroomLeadsStore from '@/store/showroomLeadsStore';

const ShowroomLeadsChart = () => {
  const { leads, loading, fetchLeads } = useShowroomLeadsStore();

  useEffect(() => { fetchLeads(); }, []);

  // Group by city (top 10)
  const cityData = useMemo(() => {
    const counts = leads.reduce((acc, l) => {
      const city = l.city || l.place || 'Unknown';
      acc[city] = (acc[city] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
  }, [leads]);

  // Group by user type
  const userTypeData = useMemo(() => {
    const counts = leads.reduce((acc, l) => {
      const t = l.userType || l.UserType || 'Unknown';
      acc[t] = (acc[t] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [leads]);

  // Group by product type (flatten arrays)
  const productTypeData = useMemo(() => {
    const counts = leads.reduce((acc, l) => {
      const types = Array.isArray(l.productType) ? l.productType : [l.productType || 'Unknown'];
      types.forEach(t => { if (t) acc[t] = (acc[t] || 0) + 1; });
      return acc;
    }, {});
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);
  }, [leads]);

  const cityChart = {
    chart:  { type: 'bar', toolbar: { show: false }, parentHeightOffset: 0 },
    colors: ['#727cf5'],
    plotOptions: { bar: { horizontal: true, barHeight: '60%', borderRadius: 4 } },
    dataLabels: { enabled: true, style: { fontSize: '11px' } },
    xaxis:  { categories: cityData.map(([c]) => c), labels: { style: { fontSize: '11px' } } },
    yaxis:  { labels: { style: { fontSize: '11px' } } },
    grid:   { borderColor: 'rgba(0,0,0,0.05)' },
    tooltip: { y: { formatter: (v) => `${v} leads` } },
  };

  const userTypeChart = {
    chart:  { type: 'bar', toolbar: { show: false }, parentHeightOffset: 0 },
    colors: ['#0acf97'],
    plotOptions: { bar: { horizontal: false, borderRadius: 4, columnWidth: '50%' } },
    dataLabels: { enabled: true, style: { fontSize: '11px' } },
    xaxis:  { categories: userTypeData.map(([t]) => t), labels: { style: { fontSize: '10px' }, rotate: -30 } },
    grid:   { borderColor: 'rgba(0,0,0,0.05)' },
    tooltip: { y: { formatter: (v) => `${v} leads` } },
  };

  const productChart = {
    chart:  { type: 'bar', toolbar: { show: false }, parentHeightOffset: 0 },
    colors: ['#fd7e14'],
    plotOptions: { bar: { horizontal: true, barHeight: '60%', borderRadius: 4 } },
    dataLabels: { enabled: true, style: { fontSize: '11px' } },
    xaxis:  { categories: productTypeData.map(([p]) => p), labels: { style: { fontSize: '10px' } } },
    yaxis:  { labels: { style: { fontSize: '10px' } } },
    grid:   { borderColor: 'rgba(0,0,0,0.05)' },
    tooltip: { y: { formatter: (v) => `${v} leads` } },
  };

  const placeholder = (
    <div className="d-flex justify-content-center align-items-center" style={{ height: 160 }}>
      {loading ? <Spinner /> : <p className="text-muted fs-13 mb-0">No data</p>}
    </div>
  );

  return (
    <Card>
      <CardBody>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h5 className="card-title mb-0">Showroom &amp; Events Enquiry Analysis</h5>
            <p className="text-muted fs-13 mb-0">
              {leads.length.toLocaleString()} leads — by city, user type, and product interest
            </p>
          </div>
        </div>

        <Row className="g-4">
          {/* Leads by City */}
          <Col lg={5}>
            <h6 className="fs-13 text-muted mb-2">Top Cities</h6>
            {cityData.length === 0 ? placeholder : (
              <ReactApexChart
                type="bar"
                height={Math.max(160, cityData.length * 32)}
                series={[{ name: 'Leads', data: cityData.map(([, c]) => c) }]}
                options={cityChart}
              />
            )}
          </Col>

          {/* Leads by User Type */}
          <Col lg={3}>
            <h6 className="fs-13 text-muted mb-2">By User Type</h6>
            {userTypeData.length === 0 ? placeholder : (
              <ReactApexChart
                type="bar"
                height={180}
                series={[{ name: 'Leads', data: userTypeData.map(([, c]) => c) }]}
                options={userTypeChart}
              />
            )}
          </Col>

          {/* Leads by Product Type */}
          <Col lg={4}>
            <h6 className="fs-13 text-muted mb-2">By Product Interest</h6>
            {productTypeData.length === 0 ? placeholder : (
              <ReactApexChart
                type="bar"
                height={Math.max(160, productTypeData.length * 28)}
                series={[{ name: 'Leads', data: productTypeData.map(([, c]) => c) }]}
                options={productChart}
              />
            )}
          </Col>
        </Row>
      </CardBody>
    </Card>
  );
};

export default ShowroomLeadsChart;
