import IconifyIcon from '@/components/wrappers/IconifyIcon';
import { productDisplay } from '@/helpers/productDisplay';

const Field = ({ label, value }) => (
  <div className="d-flex mb-2">
    <span className="text-muted" style={{ minWidth: 130 }}>{label}</span>
    <span className="fw-medium">{value ?? '—'}</span>
  </div>
);

const ProductDetailView = ({ product }) => {
  const item = productDisplay(product);
  const dimension = product.dimensions
    ? [product.dimensions.length, product.dimensions.width, product.dimensions.height].filter(Boolean).join(' x ')
    : '';
  const weight = product.weight?.value ? `${product.weight.value} ${product.weight.unit || ''}`.trim() : '';
  const groups = product.customizationGroups?.filter((group) => group.isActive !== false) || [];

  return (
    <div className="ps-xl-3 mt-3 mt-xl-0">
      <div className="d-flex align-items-center gap-2 mb-1">
        {item.subtitle && <span className="badge badge-soft-secondary fs-13">{item.subtitle}</span>}
        <span className={`badge badge-soft-${item.isActive ? 'success' : 'danger'}`}>
          {item.isActive ? 'Active' : 'Inactive'}
        </span>
      </div>

      <h4 className="mb-3">{item.title}</h4>

      <div className="mb-3 pb-3 border-bottom">
        <Field label="Price"         value={item.price || '—'} />
        <Field label="Stock"         value={item.stockText} />
        <Field label="Category"      value={item.category} />
        <Field label="Subcategories" value={item.subcategoryText || '—'} />
        <Field label="Dimensions"    value={dimension ? `${dimension} ${product.dimensions.unit || ''}`.trim() : '—'} />
        <Field label="Weight"        value={weight || '—'} />
        <Field label="Warranty"      value={product.warranty || '—'} />
        <Field label="Options"       value={groups.length ? `${groups.length} group${groups.length === 1 ? '' : 's'}` : '—'} />
      </div>


      {product.pdfUrlPath && (
        <a
          href={product.pdfUrlPath}
          target="_blank"
          rel="noreferrer"
          className="btn btn-danger d-inline-flex align-items-center gap-2"
        >
          <IconifyIcon icon="bx:file-pdf" className="fs-18" />
          Download PDF
        </a>
      )}
    </div>
  );
};

export default ProductDetailView;
