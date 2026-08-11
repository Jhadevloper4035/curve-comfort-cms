import { useEffect, useMemo } from 'react';
import { Badge, Card, CardBody, Col, Row, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import { hasPermission } from '@/constants/access';
import { useAuthContext } from '@/context/useAuthContext';
import useBlogStore from '@/store/blogStore';
import useJobStore from '@/store/jobStore';

const fmtDate = (date) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const EmptyState = ({ label }) => (
  <div className="text-center text-muted py-4 fs-13">No {label} found</div>
);

const HighlightCard = ({ title, subtitle, icon, color, viewAllTo, loading, children }) => (
  <Card className="h-100">
    <CardBody>
      <div className="d-flex justify-content-between align-items-start gap-3 mb-3">
        <div className="d-flex align-items-center gap-2">
          <div className={`avatar-sm bg-${color} bg-opacity-10 text-${color} rounded d-flex align-items-center justify-content-center`}>
            <IconifyIcon icon={icon} className="fs-20" />
          </div>
          <div>
            <h5 className="card-title mb-0">{title}</h5>
            <p className="text-muted fs-13 mb-0">{subtitle}</p>
          </div>
        </div>
        <Link to={viewAllTo} className="btn btn-sm btn-soft-secondary">
          View
        </Link>
      </div>
      {loading ? (
        <div className="d-flex justify-content-center py-4">
          <Spinner size="sm" />
        </div>
      ) : children}
    </CardBody>
  </Card>
);

const ContentHighlights = () => {
  const { user } = useAuthContext();
  const canViewBlogs = hasPermission(user, 'blogs.manage');
  const canViewJobs = hasPermission(user, 'jobs.manage');

  const { blogs, loading: blogsLoading, fetchBlogs } = useBlogStore();
  const { jobs, loading: jobsLoading, fetchJobs } = useJobStore();

  useEffect(() => {
    if (canViewBlogs) fetchBlogs();
    if (canViewJobs) fetchJobs();
  }, [canViewBlogs, canViewJobs, fetchBlogs, fetchJobs]);

  const recentPublishedBlogs = useMemo(
    () =>
      blogs
        .filter((blog) => blog.status === 'active')
        .sort((a, b) => new Date(b.created_at || b.createdAt) - new Date(a.created_at || a.createdAt))
        .slice(0, 4),
    [blogs]
  );

  const activeJobs = useMemo(
    () =>
      jobs
        .filter((job) => job.status === 'active')
        .sort((a, b) => new Date(b.postedAt || b.createdAt) - new Date(a.postedAt || a.createdAt))
        .slice(0, 4),
    [jobs]
  );

  if (!canViewBlogs && !canViewJobs) return null;

  return (
    <Row className="g-3 mb-3">
      {canViewBlogs && (
        <Col xl={4} md={6}>
          <HighlightCard title="Recent Published Blogs" subtitle="Latest active posts" icon="bx:news" color="primary" viewAllTo="/blogs" loading={blogsLoading}>
            {recentPublishedBlogs.length === 0 ? (
              <EmptyState label="published blogs" />
            ) : (
              <div className="d-flex flex-column gap-3">
                {recentPublishedBlogs.map((blog) => (
                  <Link key={blog._id} to={`/blogs/${blog._id}`} className="d-flex justify-content-between gap-3 text-reset">
                    <div className="text-truncate">
                      <p className="mb-1 fw-semibold text-truncate">{blog.title}</p>
                      <p className="mb-0 text-muted fs-13 text-truncate">/{blog.url}</p>
                    </div>
                    <span className="text-muted fs-12 flex-shrink-0">{fmtDate(blog.created_at || blog.createdAt)}</span>
                  </Link>
                ))}
              </div>
            )}
          </HighlightCard>
        </Col>
      )}

      {canViewJobs && (
        <Col xl={4} md={6}>
          <HighlightCard title="Active Jobs" subtitle="Open job posts" icon="bx:briefcase" color="success" viewAllTo="/jobs" loading={jobsLoading}>
            {activeJobs.length === 0 ? (
              <EmptyState label="active jobs" />
            ) : (
              <div className="d-flex flex-column gap-3">
                {activeJobs.map((job) => (
                  <Link key={job._id} to={`/jobs/${job._id}`} className="d-flex justify-content-between gap-3 text-reset">
                    <div className="text-truncate">
                      <p className="mb-1 fw-semibold text-truncate">{job.title}</p>
                      <p className="mb-0 text-muted fs-13 text-truncate">{job.department} · {job.location}</p>
                    </div>
                    <Badge bg="success" className="align-self-start fw-normal flex-shrink-0">
                      {job.openings || 1} open
                    </Badge>
                  </Link>
                ))}
              </div>
            )}
          </HighlightCard>
        </Col>
      )}
    </Row>
  );
};

export default ContentHighlights;
