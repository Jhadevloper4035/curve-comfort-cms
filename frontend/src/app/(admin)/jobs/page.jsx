import { useEffect, useMemo, useState } from 'react';
import { Badge, Card, CardBody, Col, Row, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import PageBreadcrumb from '@/components/layout/PageBreadcrumb';
import PageMetaData from '@/components/PageTitle';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import useJobStore from '@/store/jobStore';

const getTextPreview = (value, length = 130) => {
  const text = String(value || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return text.length > length ? `${text.slice(0, length)}...` : text;
};

const JobCard = ({ job, onDelete, deleting }) => {
  const postedLabel = job.postedAt
    ? new Date(job.postedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : '-';
  const descriptionPreview = getTextPreview(job.description);

  return (
    <Col xs={12} md={6} xl={4}>
      <Card className="h-100 shadow-none border">
        <CardBody>
          <div className="d-flex justify-content-between gap-2 mb-2">
            <div>
              <h5 className="mb-1 fs-16">{job.title}</h5>
              <p className="mb-0 text-muted fs-13">/{job.slug}</p>
            </div>
            <Badge bg={job.status === 'active' ? 'success' : 'secondary'} className="align-self-start text-capitalize">
              {job.status}
            </Badge>
          </div>

          <p className="mb-3 text-muted fs-13" style={{ minHeight: 40 }}>
            {descriptionPreview || 'No description added'}
          </p>

          <div className="d-flex flex-wrap gap-2">
            <Badge bg="light" text="dark" className="border fw-normal">
              <IconifyIcon icon="bx:briefcase" className="me-1" />
              {job.department}
            </Badge>
            <Badge bg="light" text="dark" className="border fw-normal">
              <IconifyIcon icon="bx:map" className="me-1" />
              {job.location}
            </Badge>
            <Badge bg="light" text="dark" className="border fw-normal">
              <IconifyIcon icon="bx:time" className="me-1" />
              {job.experience}
            </Badge>
            <Badge bg="light" text="dark" className="border fw-normal">
              <IconifyIcon icon="bx:user-plus" className="me-1" />
              {job.openings || 1} opening{job.openings === 1 ? '' : 's'}
            </Badge>
          </div>

          <p className="mb-0 mt-3 text-muted fs-12">
            Posted {postedLabel}
          </p>
        </CardBody>

        <div className="border-top p-2 d-flex gap-1">
          <Link to={`/jobs/${job._id}`} className="btn btn-sm btn-soft-info flex-fill py-1" title="View">
            <IconifyIcon icon="bx:show" />
          </Link>
          <Link to={`/jobs/${job._id}/edit`} className="btn btn-sm btn-soft-secondary flex-fill py-1" title="Edit">
            <IconifyIcon icon="bx:edit" />
          </Link>
          <button
            type="button"
            className="btn btn-sm btn-soft-danger flex-fill py-1"
            title="Delete"
            onClick={() => onDelete(job)}
            disabled={deleting}
          >
            {deleting ? <Spinner animation="border" size="sm" /> : <IconifyIcon icon="bx:trash" />}
          </button>

        </div>
      </Card>
    </Col>
  );
};

const Jobs = () => {
  const { jobs, loading, fetchJobs, deleteJob } = useJobStore();
  const [search, setSearch] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const filtered = useMemo(() => {
    if (!search.trim()) return jobs;
    const q = search.toLowerCase();
    return jobs.filter(
      (job) =>
        job.title?.toLowerCase().includes(q) ||
        job.slug?.toLowerCase().includes(q) ||
        job.department?.toLowerCase().includes(q) ||
        job.location?.toLowerCase().includes(q)
    );
  }, [jobs, search]);

  const handleDelete = async (job) => {
    const result = await Swal.fire({
      title: 'Delete job?',
      text: `This will permanently delete "${job.title}".`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Confirm',
      cancelButtonText: 'Cancel',
      reverseButtons: true,
      focusCancel: true,
    });

    if (!result.isConfirmed) return;

    setDeletingId(job._id);
    const ok = await deleteJob(job._id);
    setDeletingId(null);

    if (ok) {
      await Swal.fire({
        title: 'Deleted',
        text: 'The job was deleted successfully.',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
      });
    }
  };

  return (
    <>
      <PageMetaData title="Jobs" />
      <PageBreadcrumb title="Jobs" subName="Website Utilities" />

      <Card className="mb-3">
        <CardBody>
          <div className="d-flex flex-wrap justify-content-between gap-3">
            <div className="search-bar">
              <span><IconifyIcon icon="bx:search-alt" className="mb-1" /></span>
              <input
                type="search"
                className="form-control"
                placeholder="Search jobs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Link to="/jobs/create" className="btn btn-primary d-flex align-items-center">
              <IconifyIcon icon="bx:plus" className="me-1" />
              Add Job
            </Link>
          </div>
        </CardBody>
      </Card>

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" size="sm" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center text-muted py-5">No jobs found</div>
      ) : (
        <Row className="g-3">
          {filtered.map((job) => (
            <JobCard key={job._id} job={job} onDelete={handleDelete} deleting={deletingId === job._id} />
          ))}
        </Row>
      )}
    </>
  );
};

export default Jobs;
