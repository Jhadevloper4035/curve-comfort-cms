import { useEffect, useMemo, useState } from 'react';
import { Badge, Button, Card, CardBody, Col, Form, Row, Spinner } from 'react-bootstrap';
import PageBreadcrumb from '@/components/layout/PageBreadcrumb';
import PageMetaData from '@/components/PageTitle';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import useCategoryStore from '@/store/categoryStore';

const label = (category) => `${'— '.repeat(category.level || 0)}${category.name}`;

const Categories = () => {
  const { categories, loading, fetchCategories, createCategory, updateCategory, deleteCategory } = useCategoryStore();
  const [form, setForm] = useState({ name: '', parent: '', description: '', displayOrder: 0, isActive: true });
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const sorted = useMemo(
    () => [...categories].sort((a, b) => (a.path || a.name).localeCompare(b.path || b.name)),
    [categories]
  );

  const parentOptions = sorted.filter(
    (category) =>
      category._id !== editing?._id &&
      !(editing?.path && category.path?.startsWith(`${editing.path}/`)) &&
      category.level < 3 &&
      category.isActive !== false
  );

  const resetForm = (parent = '') => {
    setEditing(null);
    setForm({ name: '', parent, description: '', displayOrder: 0, isActive: true });
  };

  const editCategory = (category) => {
    setEditing(category);
    setForm({
      name: category.name || '',
      parent: category.parent?._id || category.parent || '',
      description: category.description || '',
      displayOrder: category.displayOrder || 0,
      isActive: category.isActive !== false,
    });
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!form.name.trim()) return;

    setSaving(true);
    const payload = {
      name: form.name.trim(),
      parent: form.parent || null,
      description: form.description.trim(),
      displayOrder: Number(form.displayOrder) || 0,
      isActive: form.isActive,
    };
    const saved = editing ? await updateCategory(editing._id, payload) : await createCategory(payload);
    setSaving(false);

    if (saved) {
      resetForm(form.parent);
      fetchCategories(true);
    }
  };

  const removeCategory = async (category) => {
    if (!window.confirm(`Delete ${category.name}?`)) return;
    const deleted = await deleteCategory(category._id);
    if (deleted && editing?._id === category._id) resetForm();
  };

  return (
    <>
      <PageMetaData title="Categories" />
      <PageBreadcrumb title="Categories" subName="Products" />

      <Row>
        <Col lg={4}>
          <Card>
            <CardBody>
              <div className="d-flex justify-content-between align-items-center gap-2 mb-3">
                <h5 className="mb-0">{editing ? 'Edit Category' : 'Add Category'}</h5>
                {editing && (
                  <Button variant="soft-secondary" size="sm" onClick={() => resetForm()}>
                    Cancel
                  </Button>
                )}
              </div>
              <Form onSubmit={submit}>
                <Form.Group className="mb-3">
                  <Form.Label>Name</Form.Label>
                  <Form.Control value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} placeholder="Sofas" />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Parent</Form.Label>
                  <Form.Select value={form.parent} onChange={(e) => setForm((prev) => ({ ...prev, parent: e.target.value }))}>
                    <option value="">No parent</option>
                    {parentOptions.map((category) => (
                      <option key={category._id} value={category._id}>{label(category)}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Description</Form.Label>
                  <Form.Control as="textarea" rows={3} value={form.description} onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))} />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Display Order</Form.Label>
                  <Form.Control type="number" min="0" value={form.displayOrder} onChange={(e) => setForm((prev) => ({ ...prev, displayOrder: e.target.value }))} />
                </Form.Group>
                <Form.Check
                  className="mb-3"
                  type="switch"
                  id="category-active"
                  label="Active"
                  checked={form.isActive}
                  onChange={(e) => setForm((prev) => ({ ...prev, isActive: e.target.checked }))}
                />
                <Button type="submit" disabled={saving} className="w-100">
                  {saving ? <Spinner animation="border" size="sm" className="me-1" /> : <IconifyIcon icon={editing ? 'bx:save' : 'bx:plus'} className="me-1" />}
                  {editing ? 'Update' : 'Create'}
                </Button>
              </Form>
            </CardBody>
          </Card>
        </Col>
        <Col lg={8}>
          <Card>
            <CardBody className="p-0">
              {loading ? (
                <div className="text-center py-5">
                  <Spinner animation="border" size="sm" />
                </div>
              ) : sorted.length === 0 ? (
                <div className="text-center text-muted py-5">No categories yet</div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover table-centered mb-0">
                    <thead className="bg-light">
                      <tr>
                        <th className="ps-3">Name</th>
                        <th>Parent</th>
                        <th>Slug</th>
                        <th>Level</th>
                        <th>Status</th>
                        <th className="text-end pe-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sorted.map((category) => (
                        <tr key={category._id}>
                          <td className="ps-3 fw-medium">{label(category)}</td>
                          <td className="text-muted">{category.parent?.name || '—'}</td>
                          <td className="text-muted fs-13">{category.slug}</td>
                          <td>{category.level || 0}</td>
                          <td>
                            <Badge bg={category.isActive ? 'success' : 'secondary'}>{category.isActive ? 'Active' : 'Inactive'}</Badge>
                          </td>
                          <td className="text-end pe-3">
                            <div className="d-inline-flex gap-2">
                              <Button variant="soft-primary" size="sm" title="Edit" onClick={() => editCategory(category)}>
                                <IconifyIcon icon="bx:edit" className="fs-16" />
                              </Button>
                              <Button variant="soft-danger" size="sm" title="Delete" onClick={() => removeCategory(category)}>
                                <IconifyIcon icon="bx:trash" className="fs-16" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardBody>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default Categories;
