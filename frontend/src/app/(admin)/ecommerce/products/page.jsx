import { useEffect, useMemo, useState } from 'react';
import { Card, CardBody, Col, Form, Row, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import PageBreadcrumb from '@/components/layout/PageBreadcrumb';
import PageMetaData from '@/components/PageTitle';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import useCategoryStore from '@/store/categoryStore';
import useProductStore from '@/store/productStore';
import { productDisplay } from '@/helpers/productDisplay';
import ProductsListTable from './components/ProductsListTable';

const defaultFilters = {
  q: '',
  category: '',
  subcategory: '',
  status: 'all',
  stock: 'all',
  sort: 'newest',
};

const parentId = (category) => category.parent?._id || category.parent || '';

const Products = () => {
  const { products, meta, loading, fetchProducts, deleteProduct } = useProductStore();
  const { categories, fetchCategories } = useCategoryStore();
  const [filters, setFilters] = useState(defaultFilters);
  const [deletingId, setDeletingId] = useState('');

  const apiFilters = useMemo(() => ({ ...filters, limit: 2000 }), [filters]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchProducts(apiFilters, true);
  }, [fetchProducts, apiFilters]);

  const rootCategories = useMemo(
    () => categories.filter((category) => category.isActive !== false && !category.parent),
    [categories]
  );

  const subcategories = useMemo(
    () => categories.filter((category) => {
      if (category.isActive === false || !category.parent) return false;
      return !filters.category || parentId(category) === filters.category;
    }),
    [categories, filters.category]
  );

  const updateFilter = (key, value) => {
    setFilters((current) => ({
      ...current,
      [key]: value,
      ...(key === 'category' ? { subcategory: '' } : {}),
    }));
  };

  const handleDelete = async (product) => {
    const item = productDisplay(product);
    if (!window.confirm(`Delete "${item.title}"?`)) return;

    setDeletingId(item.id);
    const deleted = await deleteProduct(item.id);
    setDeletingId('');
    if (deleted) fetchProducts(apiFilters, true);
  };

  const clearFilters = () => setFilters(defaultFilters);
  const total = meta?.totalProducts ?? products.length;

  return (
    <>
      <PageMetaData title="Products" />
      <PageBreadcrumb title="Products" subName="Ecommerce" />

      <Card className="mb-3">
        <CardBody>
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
            <div>
              <h4 className="mb-1">Products</h4>
              <p className="text-muted mb-0">{total} products found</p>
            </div>
            <Link to="/ecommerce/products/create" className="btn btn-primary d-flex align-items-center">
              <IconifyIcon icon="bx:plus" className="me-1" />
              Add Product
            </Link>
          </div>

          <Row className="g-2 align-items-end">
            <Col lg={3} md={6}>
              <Form.Label>Search</Form.Label>
              <div className="search-bar w-100">
                <span><IconifyIcon icon="bx:search-alt" className="mb-1" /></span>
                <input
                  type="search"
                  className="form-control"
                  placeholder="Name, slug, tag..."
                  value={filters.q}
                  onChange={(event) => updateFilter('q', event.target.value)}
                />
              </div>
            </Col>
            <Col lg={2} md={6}>
              <Form.Label>Category</Form.Label>
              <Form.Select value={filters.category} onChange={(event) => updateFilter('category', event.target.value)}>
                <option value="">All categories</option>
                {rootCategories.map((category) => (
                  <option key={category._id} value={category._id}>{category.name}</option>
                ))}
              </Form.Select>
            </Col>
            <Col lg={2} md={6}>
              <Form.Label>Subcategory</Form.Label>
              <Form.Select value={filters.subcategory} onChange={(event) => updateFilter('subcategory', event.target.value)}>
                <option value="">All subcategories</option>
                {subcategories.map((category) => (
                  <option key={category._id} value={category._id}>{category.name}</option>
                ))}
              </Form.Select>
            </Col>
            <Col lg={2} md={6}>
              <Form.Label>Status</Form.Label>
              <Form.Select value={filters.status} onChange={(event) => updateFilter('status', event.target.value)}>
                <option value="all">All status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </Form.Select>
            </Col>
            <Col lg={1} md={6}>
              <Form.Label>Stock</Form.Label>
              <Form.Select value={filters.stock} onChange={(event) => updateFilter('stock', event.target.value)}>
                <option value="all">All</option>
                <option value="in-stock">In</option>
                <option value="out-of-stock">Out</option>
              </Form.Select>
            </Col>
            <Col lg={1} md={6}>
              <Form.Label>Sort</Form.Label>
              <Form.Select value={filters.sort} onChange={(event) => updateFilter('sort', event.target.value)}>
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="price-low">Price low</option>
                <option value="price-high">Price high</option>
                <option value="title">Title</option>
              </Form.Select>
            </Col>
            <Col lg={1} md={6}>
              <button type="button" className="btn btn-outline-secondary w-100" onClick={clearFilters}>
                Clear
              </button>
            </Col>
          </Row>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="p-0">
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" size="sm" />
            </div>
          ) : products.length === 0 ? (
            <div className="text-center text-muted py-5">No products found</div>
          ) : (
            <ProductsListTable products={products} onDelete={handleDelete} deletingId={deletingId} />
          )}
        </CardBody>
      </Card>
    </>
  );
};

export default Products;
