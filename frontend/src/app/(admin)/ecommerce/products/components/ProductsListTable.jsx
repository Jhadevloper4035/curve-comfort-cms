import { Link } from 'react-router-dom';
import ReactTable from '@/components/Table';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import { productDisplay } from '@/helpers/productDisplay';

const productColumns = (onDelete, deletingId) => [
  {
    header: 'Product',
    cell: ({ row: { original } }) => {
      const item = productDisplay(original);
      return (
        <div className="d-flex align-items-center gap-3">
          {item.image && (
            <Link to={`/ecommerce/products/${item.id}`}>
              <img src={item.image} alt={item.title} className="img-fluid avatar-sm rounded" style={{ objectFit: 'cover' }} />
            </Link>
          )}
          <div>
            <h5 className="mt-0 mb-1">
              <Link to={`/ecommerce/products/${item.id}`} className="text-reset">{item.title}</Link>
            </h5>
            <span className="fs-13 text-muted">{item.subtitle || item.price}</span>
          </div>
        </div>
      );
    },
  },
  {
    header: 'Price',
    cell: ({ row: { original } }) => productDisplay(original).price || '—',
  },
  {
    header: 'Category',
    cell: ({ row: { original } }) => {
      const item = productDisplay(original);
      return (
        <span>
          {item.category}
          {item.subcategoryText && item.subcategoryText !== item.category && (
            <span className="text-muted"> / {item.subcategoryText}</span>
          )}
        </span>
      );
    },
  },
  {
    header: 'Stock',
    cell: ({ row: { original } }) => productDisplay(original).stockText,
  },
  {
    header: 'Status',
    cell: ({ row: { original } }) => (
      <span className={`badge badge-soft-${productDisplay(original).isActive ? 'success' : 'danger'}`}>
        {productDisplay(original).isActive ? 'Active' : 'Inactive'}
      </span>
    ),
  },
  {
    header: 'Action',
    cell: ({ row: { original } }) => {
      const item = productDisplay(original);
      return (
        <>
          <Link to={`/ecommerce/products/${item.id}`} className="btn btn-sm btn-soft-info me-1" title="View">
            <IconifyIcon icon="bx:show" className="fs-18" />
          </Link>
          <Link to={`/ecommerce/products/${item.id}/edit`} className="btn btn-sm btn-soft-secondary me-1" title="Edit">
            <IconifyIcon icon="bx:edit" className="fs-18" />
          </Link>
          <button
            type="button"
            className="btn btn-sm btn-soft-danger"
            title="Delete"
            disabled={deletingId === item.id}
            onClick={() => onDelete?.(original)}
          >
            <IconifyIcon icon={deletingId === item.id ? 'bx:loader-alt' : 'bx:trash'} className="fs-18" />
          </button>
        </>
      );
    },
  },
];

const ProductsListTable = ({ products, onDelete, deletingId }) => {
  return (
    <ReactTable
      columns={productColumns(onDelete, deletingId)}
      data={products}
      rowsPerPageList={[10, 25, 50, 100]}
      pageSize={10}
      tableClass="text-nowrap mb-0"
      theadClass="bg-light bg-opacity-50"
      showPagination
    />
  );
};

export default ProductsListTable;
