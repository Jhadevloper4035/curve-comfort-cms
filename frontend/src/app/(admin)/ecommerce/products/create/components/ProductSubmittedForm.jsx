import IconifyIcon from '@/components/wrappers/IconifyIcon';
import { Col, Row } from 'react-bootstrap';

const ProductSubmittedForm = ({ submitted, onGoToList }) => {
  if (!submitted) {
    return (
      <Row className="d-flex justify-content-center">
        <Col lg={6}>
          <div className="text-center py-4">
            <IconifyIcon icon="bx:info-circle" className="text-muted h2" />
            <h5 className="mt-2 text-muted">Complete all steps and click Create Product to finish.</h5>
          </div>
        </Col>
      </Row>
    );
  }

  return (
    <Row className="d-flex justify-content-center">
      <Col lg={6}>
        <div className="text-center py-4">
          <IconifyIcon icon="bx:check-double" className="text-success h2" />
          <h3 className="mt-0">Congratulations!</h3>
          <h5 className="w-75 mb-4 mt-3 mx-auto text-muted">Your product has been successfully created.</h5>
          <button type="button" className="btn btn-primary" onClick={onGoToList}>
            <IconifyIcon icon="bx:list-ul" className="me-1" />
            Go to Products
          </button>
        </div>
      </Col>
    </Row>
  );
};

export default ProductSubmittedForm;
