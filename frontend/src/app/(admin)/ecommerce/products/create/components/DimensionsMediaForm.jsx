import { Col, Row } from 'react-bootstrap';
import TextFormInput from '@/components/form/TextFormInput';
import ImageUploader from '@/components/ImageUploader';

const DimensionsMediaForm = ({ control, setValue, watch }) => {
  const imageValue = watch('image');

  return (
    <Row className="mt-3">
      <Col md={4}>
        <TextFormInput control={control} name="size"      label="Size"      placeholder="e.g. 4ft x 8ft" containerClassName="mb-3" />
      </Col>
      <Col md={4}>
        <TextFormInput control={control} name="thickness" label="Thickness" placeholder="e.g. 3mm"       containerClassName="mb-3" />
      </Col>
      <Col md={4}>
        <TextFormInput control={control} name="width"     label="Width"     placeholder="e.g. 1220mm"    containerClassName="mb-3" />
      </Col>

      <Col md={12}>
        <div className="mb-3">
          <label className="form-label">Product Image</label>
          <ImageUploader
            folder="products"
            multiple={false}
            value={imageValue ? [imageValue] : []}
            onComplete={([key]) => setValue('image', key, { shouldValidate: true })}
            onRemove={() => setValue('image', '', { shouldValidate: true })}
          />
        </div>
      </Col>

      <Col md={12}>
        <TextFormInput
          control={control}
          name="pdfUrlPath"
          label="PDF URL"
          placeholder="https://curve-comfort.s3.ap-south-1.amazonaws.com/..."
          containerClassName="mb-3"
        />
      </Col>
    </Row>
  );
};

export default DimensionsMediaForm;
