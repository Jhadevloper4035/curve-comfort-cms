import { useState } from 'react';
import { Alert, Col, Row } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import ImageUploader from '@/components/ImageUploader';
import SelectFormInput from '@/components/form/SelectFormInput';
import TextAreaFormInput from '@/components/form/TextAreaFormInput';
import TextFormInput from '@/components/form/TextFormInput';
import useProductStore from '@/store/productStore';
import { buildProductPayload, getProductFormDefaults } from '@/helpers/productForm';
import ProductOptionsEditor from '../../components/ProductOptionsEditor';
import ProductCategoryFields from '../../components/ProductCategoryFields';

const STATUS_OPTIONS = [
  { value: true, label: 'Active' },
  { value: false, label: 'Inactive' },
];

const CURRENCY_OPTIONS = ['INR', 'USD', 'EUR', 'GBP'].map((value) => ({ value, label: value }));
const DIMENSION_UNITS = ['cm', 'inch', 'm'].map((value) => ({ value, label: value }));
const WEIGHT_UNITS = ['kg', 'g', 'lb'].map((value) => ({ value, label: value }));

const CreateProductForms = () => {
  const navigate = useNavigate();
  const { createProduct } = useProductStore();
  const defaults = getProductFormDefaults();
  const [images, setImages] = useState([]);
  const [optionPricing, setOptionPricing] = useState(defaults.optionPricing);
  const [customizationGroups, setCustomizationGroups] = useState(defaults.customizationGroups);
  const [formError, setFormError] = useState('');

  const { control, handleSubmit } = useForm({
    defaultValues: defaults,
  });

  const onSubmit = async (values) => {
    setFormError('');
    try {
      const result = await createProduct(buildProductPayload(values, images, optionPricing, customizationGroups));
      if (result) navigate('/ecommerce/products');
    } catch (error) {
      setFormError(error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {formError && <Alert variant="danger">{formError}</Alert>}
      <Row>
        <Col md={8}>
          <TextFormInput control={control} name="title" label="Title" placeholder="Curve Comfort sofa" containerClassName="mb-3" />
        </Col>
        <Col md={4}>
          <TextFormInput control={control} name="slug" label="Slug" placeholder="curve-comfort-sofa" containerClassName="mb-3" />
        </Col>
        <Col md={12}>
          <TextAreaFormInput control={control} name="description" label="Description" rows={4} containerClassName="mb-3" />
        </Col>
        <Col md={4}>
          <TextFormInput control={control} name="basePrice" label="Base Price" type="number" min="0" containerClassName="mb-3" />
        </Col>
        <Col md={4}>
          <SelectFormInput control={control} name="currency" label="Currency" options={CURRENCY_OPTIONS} containerClassName="mb-3" />
        </Col>
        <Col md={4}>
          <TextFormInput control={control} name="stock" label="Stock" type="number" min="0" containerClassName="mb-3" />
        </Col>
        <ProductCategoryFields control={control} />
        <Col md={12}>
          <div className="mb-3">
            <label className="form-label">Images</label>
            <ImageUploader
              folder="products"
              multiple
              maxFiles={10}
              value={images}
              onComplete={(keys) => setImages((prev) => [...prev, ...keys])}
              onRemove={(key) => setImages((prev) => prev.filter((item) => item !== key))}
            />
          </div>
        </Col>
        <Col md={3}>
          <TextFormInput control={control} name="dimensions.length" label="Length" type="number" min="0" containerClassName="mb-3" />
        </Col>
        <Col md={3}>
          <TextFormInput control={control} name="dimensions.width" label="Width" type="number" min="0" containerClassName="mb-3" />
        </Col>
        <Col md={3}>
          <TextFormInput control={control} name="dimensions.height" label="Height" type="number" min="0" containerClassName="mb-3" />
        </Col>
        <Col md={3}>
          <SelectFormInput control={control} name="dimensions.unit" label="Dimension Unit" options={DIMENSION_UNITS} containerClassName="mb-3" />
        </Col>
        <Col md={4}>
          <TextFormInput control={control} name="weight.value" label="Weight" type="number" min="0" containerClassName="mb-3" />
        </Col>
        <Col md={4}>
          <SelectFormInput control={control} name="weight.unit" label="Weight Unit" options={WEIGHT_UNITS} containerClassName="mb-3" />
        </Col>
        <Col md={4}>
          <SelectFormInput control={control} name="assemblyRequired" label="Assembly Required" options={STATUS_OPTIONS} containerClassName="mb-3" />
        </Col>
        <Col md={6}>
          <TextFormInput control={control} name="warranty" label="Warranty" containerClassName="mb-3" />
        </Col>
        <Col md={6}>
          <SelectFormInput control={control} name="isActive" label="Status" options={STATUS_OPTIONS} containerClassName="mb-3" />
        </Col>
        <Col md={6}>
          <TextAreaFormInput control={control} name="careInstructions" label="Care Instructions" rows={3} placeholder="one per line" containerClassName="mb-3" />
        </Col>
        <Col md={6}>
          <TextAreaFormInput control={control} name="tags" label="Tags" rows={3} placeholder="comma separated" containerClassName="mb-3" />
        </Col>
        <ProductOptionsEditor
          optionPricing={optionPricing}
          setOptionPricing={setOptionPricing}
          customizationGroups={customizationGroups}
          setCustomizationGroups={setCustomizationGroups}
        />
      </Row>

      <div className="d-flex gap-2 mt-1">
        <button type="submit" className="btn btn-primary">
          <IconifyIcon icon="bx:check" className="me-1" />
          Create Product
        </button>
        <button type="button" className="btn btn-outline-secondary" onClick={() => navigate('/ecommerce/products')}>
          Cancel
        </button>
      </div>
    </form>
  );
};

export default CreateProductForms;
