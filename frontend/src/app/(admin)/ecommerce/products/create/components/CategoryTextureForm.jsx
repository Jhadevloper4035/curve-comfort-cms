import { Col, Row } from 'react-bootstrap';
import TextFormInput from '@/components/form/TextFormInput';

const CategoryTextureForm = ({ control }) => {
  return (
    <Row className="mt-3">
      <Col md={6}>
        <TextFormInput
          control={control}
          name="category"
          label="Category"
          placeholder="e.g. Plain"
          containerClassName="mb-3"
        />
      </Col>
      <Col md={6}>
        <TextFormInput
          control={control}
          name="subCategory"
          label="Sub Category"
          placeholder="e.g. Plain"
          containerClassName="mb-3"
        />
      </Col>
      <Col md={6}>
        <TextFormInput
          control={control}
          name="texture"
          label="Texture"
          placeholder="e.g. Flute Glass"
          containerClassName="mb-3"
        />
      </Col>
      <Col md={6}>
        <TextFormInput
          control={control}
          name="textureCode"
          label="Texture Code"
          placeholder="e.g. FGL"
          containerClassName="mb-3"
        />
      </Col>
    </Row>
  );
};

export default CategoryTextureForm;
