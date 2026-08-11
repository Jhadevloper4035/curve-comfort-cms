import { useEffect, useState } from 'react';
import { Badge, Card, CardBody, Col, Row, Spinner } from 'react-bootstrap';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import PageBreadcrumb from '@/components/layout/PageBreadcrumb';
import PageMetaData from '@/components/PageTitle';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import useJobStore from '@/store/jobStore';

const Field = ({ label, value }) => (
  <div className="mb-3">
    <p className="mb-1 text-muted fs-12 fw-medium text-uppercase">{label}</p>
    <p className="mb-0 fs-14">{value || <span className="text-muted fst-italic">-</span>}</p>
  </div>
);

const HtmlField = ({ label, value }) => (
  <div className="mb-3">
    <p className="mb-1 text-muted fs-12 fw-medium text-uppercase">{label}</p>
    {value ? (
      <div className="p-3 bg-light rounded fs-14 ql-editor" dangerouslySetInnerHTML={{ __html: value }} />
    ) : (
      <p className="mb-0 text-muted fst-italic">-</p>
    )}
  </div>
);

const BulletList = ({ title, items }) => (
  <div className="mb-3">
    <p className="mb-2 text-muted fs-12 fw-medium text-uppercase">{title}</p>
    {items?.length ? (
      <ul className="mb-0 ps-3">
        {items.map((item, index) => (
          <li key={`${title}-${index}`}>{item}</li>
        ))}
      </ul>
    ) : (
      <p className="mb-0 text-muted fst-italic">-</p>
    )}
  </div>
);

const JobDetail = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { jobs, loading, fetchJobs, deleteJob } = useJobStore();
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const job = jobs.find((item) => item._id === jobId);

  useEffect(() => {
    if (!loading && jobs.length > 0 && !job) {
      navigate('/error-404');
    }
  }, [loading, jobs, job, navigate]);

  if (loading && !job) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" size="sm" />
      </div>
    );
  }

  if (!job) return null;

  const postedLabel = job.postedAt
    ? new Date(job.postedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })
    : '-';
  const expiresLabel = job.expiresAt
    ? new Date(job.expiresAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })
    : '-';

  const handleDelete = async () => {
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

    setDeleting(true);
    const ok = await deleteJob(jobId);
    if (ok) {
      await Swal.fire({
        title: 'Deleted',
        text: 'The job was deleted successfully.',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
      });
      navigate('/jobs');
    } else {
      setDeleting(false);
    }
  };

  return (
    <>
      <PageMetaData title={job.title} />
      <PageBreadcrumb title="Job Detail" subName="Jobs" />

      <Row className="g-3">
        <Col lg={4}>
          <Card className="shadow-none border">
            <CardBody>
              <Badge bg={job.status === 'active' ? 'success' : 'secondary'} className="mb-3 text-capitalize">
                {job.status}
              </Badge>
              <h4 className="mb-1">{job.title}</h4>
              <p className="text-muted mb-3">/{job.slug}</p>
              <Field label="Department" value={job.department} />
              <Field label="Location" value={job.location} />
              <Field label="Employment Type" value={job.employmentType} />
              <Field label="Experience" value={job.experience} />
              <Field label="Qualification" value={job.qualification} />
              <Field label="Openings" value={job.openings} />
              <Field label="Salary Range" value={job.salaryRange} />
              <Field label="Posted On" value={postedLabel} />
              <Field label="Expires On" value={expiresLabel} />
            </CardBody>
            <div className="border-top p-3 d-flex gap-2 flex-wrap">
              <Link to={`/jobs/${jobId}/edit`} className="btn btn-primary flex-fill">
                <IconifyIcon icon="bx:edit" className="me-1" />
                Edit
              </Link>
              <Link to="/jobs" className="btn btn-outline-secondary flex-fill">
                <IconifyIcon icon="bx:arrow-back" className="me-1" />
                Back
              </Link>
              <button type="button" className="btn btn-danger w-100" onClick={handleDelete} disabled={deleting}>
                {deleting ? <Spinner animation="border" size="sm" className="me-1" /> : <IconifyIcon icon="bx:trash" className="me-1" />}
                Delete
              </button>
            </div>
          </Card>
        </Col>

        <Col lg={8}>
          <Card className="shadow-none border">
            <CardBody>
              <HtmlField label="Description" value={job.description} />
              <BulletList title="Responsibilities" items={job.responsibilities} />
              <BulletList title="Requirements" items={job.requirements} />
            </CardBody>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default JobDetail;
