import { useEffect, useMemo } from 'react';
import { Badge, Col, Dropdown, DropdownMenu, DropdownToggle, Form, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Controller, useWatch } from 'react-hook-form';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import useCategoryStore from '@/store/categoryStore';

const idsFromValue = (value) => String(value || '').split(',').map((item) => item.trim()).filter(Boolean);

const categoryLabel = (category) => `${'-- '.repeat(category.level || 0)}${category.name}`;

const joinIds = (ids) => ids.join(', ');

const ProductCategoryFields = ({ control }) => {
  const { categories, loading, fetchCategories } = useCategoryStore();
  const parentId = useWatch({ control, name: 'category' });

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const activeCategories = useMemo(
    () => categories.filter((category) => category.isActive !== false),
    [categories]
  );

  const rootCategories = activeCategories.filter((category) => !category.parent);
  const subcategories = parentId
    ? activeCategories.filter((category) => category.parent?._id === parentId || category.parent === parentId)
    : activeCategories.filter((category) => category.parent);
  const categoriesById = new Map(activeCategories.map((category) => [category._id, category]));

  return (
    <Col md={12}>
      <div className="border rounded p-3 mb-3">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
          <div>
            <h5 className="mb-1">Product Category</h5>
            <p className="text-muted mb-0">Choose an existing category and subcategory for this product.</p>
          </div>
          <Link to="/ecommerce/categories" className="btn btn-sm btn-soft-primary">
            <IconifyIcon icon="bx:category" className="me-1" />
            Manage categories
          </Link>
        </div>

        <div className="row g-3">
          <Col md={6}>
            <Controller
              control={control}
              name="category"
              render={({ field }) => (
                <Form.Group>
                  <Form.Label>Category</Form.Label>
                  <div className="position-relative">
                    <Form.Select {...field} disabled={loading}>
                      <option value="">Select category</option>
                      {rootCategories.map((category) => (
                        <option key={category._id} value={category._id}>{category.name}</option>
                      ))}
                    </Form.Select>
                    {loading && <Spinner animation="border" size="sm" className="position-absolute top-50 end-0 translate-middle-y me-4" />}
                  </div>
                </Form.Group>
              )}
            />
          </Col>

          <Col md={6}>
            <Controller
              control={control}
              name="subcategories"
              render={({ field }) => {
                const selected = idsFromValue(field.value);

                return (
                  <Form.Group>
                    <div className="d-flex justify-content-between align-items-center gap-2">
                      <Form.Label>Subcategories</Form.Label>
                      {selected.length > 0 && (
                        <button type="button" className="btn btn-link btn-sm p-0" onClick={() => field.onChange('')}>
                          Clear
                        </button>
                      )}
                    </div>
                    <Dropdown autoClose="outside" className="w-100">
                      <DropdownToggle
                        as="button"
                        type="button"
                        disabled={loading}
                        className="form-select text-start cc-multiselect-toggle"
                      >
                        <span className={selected.length ? '' : 'text-muted'}>
                          {selected.length ? `${selected.length} selected` : 'Select subcategories'}
                        </span>
                      </DropdownToggle>
                      <DropdownMenu className="w-100 p-2" style={{ maxHeight: 240, overflowY: 'auto' }}>
                        {subcategories.length === 0 && <div className="text-muted px-2 py-1">No subcategories available</div>}
                        {subcategories.map((category) => {
                          const checked = selected.includes(category._id);
                          const nextSelected = checked
                            ? selected.filter((id) => id !== category._id)
                            : [...selected, category._id];

                          return (
                            <Form.Check
                              key={category._id}
                              type="checkbox"
                              id={`subcategory-${category._id}`}
                              label={categoryLabel(category)}
                              checked={checked}
                              className="dropdown-item mb-0 ps-4"
                              onChange={() => field.onChange(joinIds(nextSelected))}
                            />
                          );
                        })}
                      </DropdownMenu>
                    </Dropdown>
                    {selected.length > 0 && (
                      <div className="d-flex flex-wrap gap-1 mt-2">
                        {selected.map((id) => (
                          <Badge key={id} bg="primary-subtle" text="primary">
                            {categoriesById.get(id)?.name || id}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </Form.Group>
                );
              }}
            />
          </Col>
        </div>
      </div>
    </Col>
  );
};

export default ProductCategoryFields;
