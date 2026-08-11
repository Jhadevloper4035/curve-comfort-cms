import { useEffect, useMemo } from 'react';
import { Badge, Card, CardBody, Spinner, Table } from 'react-bootstrap';
import useShowroomLeadsStore    from '@/store/showroomLeadsStore';
import useWebsiteLeadsStore     from '@/store/websiteLeadsStore';
import useProductEnquiriesStore from '@/store/productEnquiriesStore';

const TYPE_META = {
  showroom: { label: 'Showroom',  bg: 'info'    },
  website:  { label: 'Website',   bg: 'success'  },
  product:  { label: 'Product',   bg: 'warning'  },
};

const STATUS_BG = {
  new: 'primary', pending: 'primary', contacted: 'info',
  qualified: 'success', converted: 'success',
  closed: 'secondary', rejected: 'danger',
};

const fmtDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' });
};

const RecentLeads = () => {
  const { leads: showroomLeads, loading: sl, fetchLeads: fetchShowroom } = useShowroomLeadsStore();
  const { leads: webLeads,      loading: wl, fetchLeads: fetchWeb      } = useWebsiteLeadsStore();
  const { leads: prodLeads,     loading: pl, fetchLeads: fetchProd     } = useProductEnquiriesStore();

  const loading = sl || wl || pl;

  useEffect(() => {
    fetchShowroom();
    fetchWeb();
    fetchProd();
  }, []);

  const combined = useMemo(() => {
    const rows = [
      ...showroomLeads.map(l => ({
        type:    'showroom',
        name:    l.fullName || l.name || '—',
        contact: l.mobileNumber || l.phone || '—',
        detail:  l.city || l.place || '—',
        status:  l.leadType || 'showroom',
        date:    l.createdAt,
      })),
      ...webLeads.map(l => ({
        type:    'website',
        name:    l.name   || '—',
        contact: l.phone  || l.email || '—',
        detail:  l.enquiryType || '—',
        status:  l.status || 'new',
        date:    l.createdAt,
      })),
      ...prodLeads.map(l => ({
        type:    'product',
        name:    l.fullName || '—',
        contact: l.phone    || l.email || '—',
        detail:  l.productInterest || '—',
        status:  l.status || 'pending',
        date:    l.createdAt,
      })),
    ];

    return rows
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 15);
  }, [showroomLeads, webLeads, prodLeads]);

  return (
    <Card className="h-100">
      <CardBody>
        <h5 className="card-title mb-0">Recent Activity</h5>
        <p className="text-muted fs-13 mb-3">Latest 15 entries across all lead types</p>

        {loading && combined.length === 0 ? (
          <div className="d-flex justify-content-center py-4">
            <Spinner />
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <Table hover size="sm" className="mb-0 fs-13">
              <thead className="table-light">
                <tr>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Contact</th>
                  <th>Detail</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {combined.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center text-muted py-3">No leads found</td>
                  </tr>
                ) : (
                  combined.map((row, i) => {
                    const meta = TYPE_META[row.type] || { label: row.type, bg: 'secondary' };
                    return (
                      <tr key={i}>
                        <td className="fw-medium">{row.name}</td>
                        <td>
                          <Badge bg={meta.bg} className="fw-normal">{meta.label}</Badge>
                        </td>
                        <td className="text-muted">{row.contact}</td>
                        <td className="text-muted text-truncate" style={{ maxWidth: 140 }}>{row.detail}</td>
                        <td>
                          <Badge bg={STATUS_BG[row.status] || 'secondary'} className="fw-normal text-capitalize">
                            {row.status}
                          </Badge>
                        </td>
                        <td className="text-muted">{fmtDate(row.date)}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </Table>
          </div>
        )}
      </CardBody>
    </Card>
  );
};

export default RecentLeads;
