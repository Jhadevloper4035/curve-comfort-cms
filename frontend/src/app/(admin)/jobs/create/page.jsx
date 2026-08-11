import { useState } from 'react';
import { Card, CardBody, Col, Row } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import PageBreadcrumb from '@/components/layout/PageBreadcrumb';
import PageMetaData from '@/components/PageTitle';
import useJobStore from '@/store/jobStore';
import JobForm from '../components/JobForm';

const CreateJob = () => {
  const navigate = useNavigate();
  const { createJob } = useJobStore();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (payload) => {
    setSubmitting(true);
    const result = await createJob(payload);
    setSubmitting(false);
    if (result) navigate('/jobs');
  };

  return (
    <>
      <PageMetaData title="Create Job" />
      <PageBreadcrumb title="Create Job" subName="Jobs" />

      <Row>
        <Col>
          <Card>
            <CardBody>
              <JobForm onSubmit={handleSubmit} submitting={submitting} submitLabel="Create Job" />
            </CardBody>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default CreateJob;
