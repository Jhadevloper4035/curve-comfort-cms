import { useEffect, useState } from 'react';
import { Button, Card, CardBody, Col, Form, Row, Spinner } from 'react-bootstrap';
import PageBreadcrumb from '@/components/layout/PageBreadcrumb';
import PageMetaData from '@/components/PageTitle';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import useBlogTaxonomyStore from '@/store/blogTaxonomyStore';

const BlogTaxonomy = ({ type }) => {
  const label = type === 'category' ? 'Category' : 'Tag';
  const { items, loading, fetchTaxonomies, createTaxonomy, deleteTaxonomy } = useBlogTaxonomyStore();
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchTaxonomies(type);
  }, [fetchTaxonomies, type]);

  const submit = async (event) => {
    event.preventDefault();
    if (!name.trim()) return;

    setSaving(true);
    const created = await createTaxonomy(type, name.trim());
    setSaving(false);
    if (created) setName('');
  };

  const remove = async (item) => {
    if (window.confirm(`Delete ${item.name}?`)) await deleteTaxonomy(type, item._id);
  };

  return (
    <>
      <PageMetaData title={`Blog ${label}s`} />
      <PageBreadcrumb title={`Blog ${label}s`} subName="Blogs" />

      <Row>
        <Col lg={4}>
          <Card>
            <CardBody>
              <h5 className="mb-3">Add {label}</h5>
              <Form onSubmit={submit}>
                <Form.Group className="mb-3">
                  <Form.Label>Name</Form.Label>
                  <Form.Control value={name} onChange={(event) => setName(event.target.value)} placeholder={`e.g. ${type === 'category' ? 'Design Ideas' : 'interiors'}`} />
                </Form.Group>
                <Button type="submit" className="w-100" disabled={saving}>
                  {saving ? <Spinner animation="border" size="sm" className="me-1" /> : <IconifyIcon icon="bx:plus" className="me-1" />}
                  Add {label}
                </Button>
              </Form>
            </CardBody>
          </Card>
        </Col>
        <Col lg={8}>
          <Card>
            <CardBody className="p-0">
              {loading ? (
                <div className="text-center py-5"><Spinner animation="border" size="sm" /></div>
              ) : items[type].length === 0 ? (
                <div className="text-center text-muted py-5">No blog {type}s yet</div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover table-centered mb-0">
                    <thead className="bg-light">
                      <tr><th className="ps-3">Name</th><th>Slug</th><th>Used in Blogs</th><th className="text-end pe-3">Actions</th></tr>
                    </thead>
                    <tbody>
                      {items[type].map((item) => (
                        <tr key={item._id}>
                          <td className="ps-3 fw-medium">{item.name}</td>
                          <td className="text-muted fs-13">{item.slug}</td>
                          <td>{item.blogCount || 0}</td>
                          <td className="text-end pe-3">
                            <Button variant="soft-danger" size="sm" title="Delete" onClick={() => remove(item)}>
                              <IconifyIcon icon="bx:trash" className="fs-16" />
                            </Button>
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

export default BlogTaxonomy;
