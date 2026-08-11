import IconifyIcon from '@/components/wrappers/IconifyIcon';
import { Link } from 'react-router-dom';
import { Button, Card, CardBody, Col, Form, Modal, Row, Spinner } from 'react-bootstrap';
import { useEffect, useMemo, useState } from 'react';
import useProductStore from '@/store/productStore';
import { downloadExcel } from '@/helpers/httpClient';
import { productDisplay } from '@/helpers/productDisplay';

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

const SortIcon = ({ field, sortField, sortDir }) => {
  if (sortField !== field) return <IconifyIcon icon="bx:sort" className="ms-1 text-muted opacity-50" />;
  return <IconifyIcon icon={sortDir === 'asc' ? 'bx:sort-up' : 'bx:sort-down'} className="ms-1 text-primary" />;
};

const InventoryProducts = ({ filters }) => {
  const { products, loading, fetchProducts, deleteProduct } = useProductStore();
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [downloading, setDownloading] = useState(false);

  const handleDelete = async (id) => {
    await deleteProduct(id);
    setConfirmDeleteId(null);
  };

  const [sortField, setSortField] = useState('title');
  const [sortDir, setSortDir] = useState('asc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setPage(1);
  }, [filters]);

  const rows = useMemo(() => products.map((product) => ({ product, ...productDisplay(product) })), [products]);

  const filtered = useMemo(() => {
    if (!filters) return rows;
    return rows.filter((p) => {
      const contains = (val, search) => String(val ?? '').toLowerCase().includes(String(search).toLowerCase());
      if (filters.productCode && !contains(`${p.title} ${p.subtitle}`, filters.productCode)) return false;
      if (filters.category && p.category !== filters.category) return false;
      if (filters.subCategory && p.subcategoryText !== filters.subCategory) return false;
      return true;
    });
  }, [rows, filters]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
    setPage(1);
  };

  const handleDownloadExcel = async () => {
    setDownloading(true);
    try {
      await downloadExcel('/api/product/download', 'Products.xlsx');
    } finally {
      setDownloading(false);
    }
  };

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const av = sortField === 'updatedAt' ? a.product.updatedAt : a[sortField];
      const bv = sortField === 'updatedAt' ? b.product.updatedAt : b[sortField];
      const cmp = String(av).localeCompare(String(bv), undefined, { numeric: true });
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [filtered, sortField, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const paginated = sorted.slice((page - 1) * pageSize, page * pageSize);

  const cols = [
    { label: 'Product',     field: 'title' },
    { label: 'Price',       field: 'price' },
    { label: 'Category',    field: 'category' },
    { label: 'Subcategories', field: 'subcategoryText' },
    { label: 'Stock',       field: 'stockText' },
    { label: 'Status',      field: 'isActive' },
    { label: 'Updated',     field: 'updatedAt' },
    { label: 'Action',      field: null },
  ];

  // Active filter badges
  const activeFilters = filters
    ? Object.entries(filters).filter(([, v]) => v !== '' && v != null)
    : [];

  return (
    <>
    <Card>
      <CardBody>
        <Row className="align-items-center mb-2">
          <Col xs={12} md="auto" className="d-flex flex-wrap gap-2">
            <Button variant="success" onClick={handleDownloadExcel} disabled={downloading}>
              {downloading ? (
                <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true" />
              ) : (
                <IconifyIcon icon="bx:export" className="me-1 icons-center" />
              )}
              {downloading ? 'Preparing...' : 'Export Excel'}
            </Button>
            <Button variant="secondary">
              <IconifyIcon icon="bx:import" className="me-1 icons-center" />
              Import
            </Button>
            <Link to="/ecommerce/products/create" className="btn btn-primary d-inline-flex align-items-center ms-md-auto">
              <IconifyIcon icon="bx:plus" className="me-1" />
              Add Product
            </Link>
          </Col>
          <Col xs={12} md="auto" className="ms-md-auto mt-2 mt-md-0 d-flex align-items-center gap-2">
            <span className="text-muted small">Rows:</span>
            <Form.Select size="sm" style={{ width: 80 }} value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}>
              {PAGE_SIZE_OPTIONS.map(n => <option key={n} value={n}>{n}</option>)}
            </Form.Select>
            <span className="text-muted small">{sorted.length} products</span>
          </Col>
        </Row>

        {/* Applied filter badges */}
        {activeFilters.length > 0 && (
          <div className="d-flex flex-wrap gap-2 mb-2">
            {activeFilters.map(([key, val]) => (
              <span key={key} className="badge bg-primary bg-opacity-10 text-primary fw-normal px-2 py-1">
                <span className="text-muted me-1">{key}:</span>{String(val)}
              </span>
            ))}
          </div>
        )}

        <div className="table-responsive table-centered mt-2">
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" size="sm" />
            </div>
          ) : (
            <table className="table text-nowrap mb-0">
              <thead>
                <tr>
                  {cols.map(({ label, field }) => (
                    <th
                      key={label}
                      onClick={() => field && handleSort(field)}
                      style={{ cursor: field ? 'pointer' : 'default', userSelect: 'none' }}
                    >
                      {label}
                      {field && <SortIcon field={field} sortField={sortField} sortDir={sortDir} />}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.length === 0 ? (
                  <tr><td colSpan={cols.length} className="text-center text-muted py-4">No products found</td></tr>
                ) : paginated.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.title}
                            className="img-fluid avatar-sm rounded"
                            style={{ objectFit: 'cover', cursor: 'pointer' }}
                            onClick={() => setPreviewImage(item)}
                            title="Click to preview"
                          />
                        )}
                        <div>
                          <p className="mb-0 fw-medium">{item.title}</p>
                          {item.subtitle && <span className="text-muted fs-13">{item.subtitle}</span>}
                        </div>
                      </div>
                    </td>
                    <td>{item.price || '—'}</td>
                    <td>{item.category}</td>
                    <td>{item.subcategoryText || '—'}</td>
                    <td>{item.stockText}</td>
                    <td>
                      <span className={`badge badge-soft-${item.isActive ? 'success' : 'danger'}`}>
                        {item.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>{item.product.updatedAt ? new Date(item.product.updatedAt).toLocaleDateString() : '—'}</td>
                    <td>
                      <div className="d-flex gap-1">
                        <Link to={`/ecommerce/products/${item.id}`} className="btn btn-sm btn-soft-info" title="View">
                          <IconifyIcon icon="bx:show" className="fs-18" />
                        </Link>
                        <Link to={`/ecommerce/products/${item.id}/edit`} className="btn btn-sm btn-soft-secondary" title="Edit">
                          <IconifyIcon icon="bx:edit" className="fs-18" />
                        </Link>
                        {confirmDeleteId === item.id ? (
                          <>
                            <button className="btn btn-sm btn-danger" title="Confirm delete" onClick={() => handleDelete(item.id)}>
                              <IconifyIcon icon="bx:check" className="fs-18" />
                            </button>
                            <button className="btn btn-sm btn-soft-secondary" title="Cancel" onClick={() => setConfirmDeleteId(null)}>
                              <IconifyIcon icon="bx:x" className="fs-18" />
                            </button>
                          </>
                        ) : (
                          <button className="btn btn-sm btn-soft-danger" title="Delete" onClick={() => setConfirmDeleteId(item.id)}>
                            <IconifyIcon icon="bx:trash" className="fs-18" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {!loading && totalPages > 1 && (
          <div className="d-flex justify-content-between align-items-center mt-3">
            <span className="text-muted small">
              Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, sorted.length)} of {sorted.length}
            </span>
            <nav>
              <ul className="pagination pagination-sm mb-0">
                <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={() => setPage(1)}>«</button>
                </li>
                <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={() => setPage(p => p - 1)}>‹</button>
                </li>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
                  .reduce((acc, p, i, arr) => {
                    if (i > 0 && p - arr[i - 1] > 1) acc.push('...');
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((p, i) =>
                    p === '...' ? (
                      <li key={`ellipsis-${i}`} className="page-item disabled"><span className="page-link">…</span></li>
                    ) : (
                      <li key={p} className={`page-item ${p === page ? 'active' : ''}`}>
                        <button className="page-link" onClick={() => setPage(p)}>{p}</button>
                      </li>
                    )
                  )}
                <li className={`page-item ${page === totalPages ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={() => setPage(p => p + 1)}>›</button>
                </li>
                <li className={`page-item ${page === totalPages ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={() => setPage(totalPages)}>»</button>
                </li>
              </ul>
            </nav>
          </div>
        )}
      </CardBody>
    </Card>
      <Modal show={!!previewImage} onHide={() => setPreviewImage(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="fs-6">
            <span className="text-primary fw-bold">{previewImage?.title}</span>
            {previewImage?.subtitle && <span className="text-muted fw-normal ms-2 fs-13">— {previewImage.subtitle}</span>}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center p-3">
          {previewImage?.image && (
            <img
              src={previewImage.image}
              alt={previewImage.title}
              className="img-fluid rounded"
              style={{ maxHeight: 400, objectFit: 'contain' }}
            />
          )}
          <div className="mt-3 d-flex flex-wrap justify-content-center gap-2 text-muted small">
            {previewImage?.category && <span className="text-capitalize">{previewImage.category}</span>}
            {previewImage?.subcategoryText && <><span>/</span><span className="text-capitalize">{previewImage.subcategoryText}</span></>}
          </div>
        </Modal.Body>
        <Modal.Footer className="justify-content-center gap-2 py-2">
          {previewImage?.image && (
            <a
              href={previewImage.image}
              target="_blank"
              rel="noreferrer"
              className="btn btn-sm btn-primary"
            >
              <IconifyIcon icon="bx:link-external" className="me-1" />
              Open Full Image
            </a>
          )}
          <Button variant="secondary" size="sm" onClick={() => setPreviewImage(null)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default InventoryProducts;
