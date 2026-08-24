import { useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Badge, Card, CardBody, Col, Row, Spinner } from 'react-bootstrap';
import 'react-quill-new/dist/quill.snow.css';
import PageBreadcrumb from '@/components/layout/PageBreadcrumb';
import PageMetaData from '@/components/PageTitle';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import useBlogStore from '@/store/blogStore';

const imageSrc = (value) => {
  if (!value) return '';
  return /^https?:\/\//i.test(value) ? value : `https://curvecomfort.com/${value}`;
};

const Field = ({ label, value }) => (
  <div className="mb-3">
    <p className="mb-1 text-muted fs-12 fw-medium text-uppercase">{label}</p>
    <p className="mb-0 fs-14">{value || <span className="text-muted fst-italic">—</span>}</p>
  </div>
);

const BlogDetail = () => {
  const { blogId } = useParams();
  const navigate = useNavigate();
  const { blogs, loading, fetchBlogs } = useBlogStore();

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  const blog = blogs.find((b) => b._id === blogId);

  useEffect(() => {
    if (!loading && blogs.length > 0 && !blog) {
      navigate('/pages/error-404-alt');
    }
  }, [loading, blogs, blog, navigate]);

  if (loading && !blog) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" size="sm" />
      </div>
    );
  }

  if (!blog) return null;

  return (
    <>
      <PageMetaData title={blog.title} />
      <PageBreadcrumb title="Blog Detail" subName="Blogs" />

      <Row className="g-3">
        {/* Left: Image + actions */}
        <Col md={4}>
          <Card className="shadow-none border">
            <CardBody className="p-0">
              {blog.image ? (
                <img
                  src={imageSrc(blog.image)}
                  alt={blog.title}
                  className="w-100 rounded-top"
                  style={{ height: 220, objectFit: 'cover' }}
                />
              ) : (
                <div
                  className="w-100 d-flex align-items-center justify-content-center text-muted rounded-top bg-light"
                  style={{ height: 220 }}
                >
                  <IconifyIcon icon="bx:image" width={48} height={48} />
                </div>
              )}
              <div className="p-3">
                <Badge bg={blog.status === 'active' ? 'success' : 'danger'} className="mb-2">
                  {blog.status === 'active' ? 'Active' : 'Inactive'}
                </Badge>
                <p className="mb-1 text-muted fs-12">
                  <IconifyIcon icon="bx:user" className="me-1" />
                  {blog.author || 'Admin'}
                </p>
                {blog.created_at && (
                  <p className="mb-0 text-muted fs-12">
                    <IconifyIcon icon="bx:calendar" className="me-1" />
                    {new Date(blog.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </p>
                )}
              </div>
            </CardBody>
            <div className="border-top p-3 d-flex gap-2">
              <Link to={`/blogs/${blogId}/edit`} className="btn btn-primary flex-fill">
                <IconifyIcon icon="bx:edit" className="me-1" />
                Edit
              </Link>
              <a
                href={`${import.meta.env.VITE_WEBSITE_BASE_URL}/blog/${blog.url}`}
                target="_blank"
                rel="noreferrer"
                className="btn btn-outline-secondary flex-fill"
              >
                <IconifyIcon icon="bx:link-external" className="me-1" />
                Live
              </a>
            </div>
          </Card>
        </Col>

        {/* Right: Details */}
        <Col md={8}>
          <Card className="shadow-none border mb-3">
            <CardBody>
              <h5 className="fw-semibold mb-3">{blog.title}</h5>
              <Field label="URL Slug" value={`/${blog.url}`} />
              <Field label="Author" value={blog.author} />
              <Field label="Category" value={blog.category} />
              <Field label="Tags" value={(blog.tags || []).join(', ')} />

              <hr className="my-3" />
              <h6 className="text-muted mb-3">Content Preview</h6>
              {blog.text ? (
                <div
                  className="p-3 bg-light rounded fs-14 ql-editor"
                  style={{ maxHeight: 400, overflowY: 'auto' }}
                  dangerouslySetInnerHTML={{ __html: blog.text }}
                />
              ) : (
                <span className="text-muted fst-italic">No content</span>
              )}
            </CardBody>
          </Card>

          <Card className="shadow-none border">
            <CardBody>
              <h6 className="text-muted mb-3">SEO / Meta Fields</h6>
              <Row>
                <Col md={6}><Field label="Meta Title" value={blog.meta_title} /></Col>
                <Col md={6}><Field label="Meta Name" value={blog.meta_name} /></Col>
                <Col md={12}><Field label="Meta Tags" value={blog.meta_tags} /></Col>
                <Col md={12}><Field label="Meta Description" value={blog.meta_description} /></Col>
              </Row>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default BlogDetail;
