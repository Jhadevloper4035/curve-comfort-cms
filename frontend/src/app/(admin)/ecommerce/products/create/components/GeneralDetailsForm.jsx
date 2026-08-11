import { Col, Row } from 'react-bootstrap';
import TextFormInput from '@/components/form/TextFormInput';
import SelectFormInput from '@/components/form/SelectFormInput';

const STATUS_OPTIONS = [
  { value: true,  label: 'Active' },
  { value: false, label: 'Inactive' },
];

const GeneralDetailsForm = ({ control }) => {
  return (
    <Row className="mt-3">
      <Col md={6}>
        <TextFormInput
          control={control}
          name="productName"
          label="Product Name"
          placeholder="e.g. SDA 2002"
          containerClassName="mb-3"
        />
      </Col>
      <Col md={6}>
        <TextFormInput
          control={control}
          name="productCode"
          label="Product Code"
          placeholder="e.g. SDA-2002"
          containerClassName="mb-3"
        />
      </Col>
      <Col md={6}>
        <TextFormInput
          control={control}
          name="productType"
          label="Product Type"
          placeholder="e.g. Acrylish"
          containerClassName="mb-3"
        />
      </Col>
      <Col md={6}>
        <SelectFormInput
          control={control}
          name="isActive"
          label="Status"
          options={STATUS_OPTIONS}
          containerClassName="mb-3"
        />
      </Col>
    </Row>
  );
};

export default GeneralDetailsForm;
