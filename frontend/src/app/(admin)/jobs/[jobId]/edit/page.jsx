import { useEffect, useState } from 'react';
import { Card, CardBody, Col, Row, Spinner } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import PageBreadcrumb from '@/components/layout/PageBreadcrumb';
import PageMetaData from '@/components/PageTitle';
import useJobStore from '@/store/jobStore';
import JobForm from '../../components/JobForm';

const EditJob = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { jobs, loading, fetchJobs, updateJob } = useJobStore();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const job = jobs.find((item) => item._id === jobId);

  useEffect(() => {
    if (!loading && jobs.length > 0 && !job) {
      navigate('/error-404');
    }
  }, [loading, jobs, job, navigate]);

  const handleSubmit = async (payload) => {
    setSubmitting(true);
    const result = await updateJob(jobId, payload);
    setSubmitting(false);
    if (result) navigate(`/jobs/${jobId}`);
  };

  if (loading && !job) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" size="sm" />
      </div>
    );
  }

  return (
    <>
      <PageMetaData title={`Edit ${job?.title ?? 'Job'}`} />
      <PageBreadcrumb title="Edit Job" subName="Jobs" />

      <Row>
        <Col>
          <Card>
            <CardBody>
              <JobForm
                initialValues={job}
                onSubmit={handleSubmit}
                submitting={submitting}
                submitLabel="Save Changes"
              />
            </CardBody>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default EditJob;
