import { useEffect, useMemo, useState } from 'react';
import { Card, CardBody, Col, Row, Spinner, Badge, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import PageBreadcrumb from '@/components/layout/PageBreadcrumb';
import PageMetaData from '@/components/PageTitle';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import useBlogStore from '@/store/blogStore';
import useBlogTaxonomyStore from '@/store/blogTaxonomyStore';

const imageSrc = (value) => {
  if (!value) return '';
  return /^https?:\/\//i.test(value) ? value : `https://curvecomfort.com/${value}`;
};

const BlogCard = ({ blog }) => (
  <Col xs={12} sm={6} md={4} xl={3}>
    <Card className="h-100 shadow-none border">
      <div style={{ height: 160, overflow: 'hidden', background: '#f8f9fa' }} className="rounded-top">
        {blog.image ? (
          <img
            src={imageSrc(blog.image)}
            alt={blog.title}
            className="w-100 h-100"
            style={{ objectFit: 'cover' }}
          />
        ) : (
          <div className="w-100 h-100 d-flex align-items-center justify-content-center text-muted">
            <IconifyIcon icon="bx:image" width={40} height={40} />
          </div>
        )}
      </div>
      <CardBody className="p-2">
        <p className="mb-1 fw-semibold fs-13 lh-sm" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {blog.title}
        </p>
        <p className="mb-1 text-muted fs-12 text-truncate">/{blog.url}</p>
        <div className="d-flex gap-1 flex-wrap align-items-center">
          <Badge bg={blog.status === 'active' ? 'success' : 'danger'} className="fw-normal">
            {blog.status === 'active' ? 'Active' : 'Inactive'}
          </Badge>
          {blog.author && (
            <span className="text-muted fs-12">{blog.author}</span>
          )}
        </div>
        {(blog.category || blog.tags?.length > 0) && (
          <div className="d-flex gap-1 flex-wrap mt-2">
            {blog.category && <Badge bg="primary" className="fw-normal">{blog.category}</Badge>}
            {blog.tags?.map((tag) => <Badge key={tag} bg="light" text="dark" className="fw-normal">{tag}</Badge>)}
          </div>
        )}
      </CardBody>
      <div className="border-top p-2 d-flex gap-1">
        <Link
          to={`/blogs/${blog._id}`}
          className="btn btn-sm btn-soft-info flex-fill py-1"
          title="View"
        >
          <IconifyIcon icon="bx:show" />
        </Link>
        <Link
          to={`/blogs/${blog._id}/edit`}
          className="btn btn-sm btn-soft-secondary flex-fill py-1"
          title="Edit"
        >
          <IconifyIcon icon="bx:edit" />
        </Link>
        <a
          href={`${import.meta.env.VITE_WEBSITE_BASE_URL}/blog/${blog.url}`}
          target="_blank"
          rel="noreferrer"
          className="btn btn-sm btn-soft-primary flex-fill py-1"
          title="Live"
        >
          <IconifyIcon icon="bx:link-external" />
        </a>
      </div>
    </Card>
  </Col>
);

const Blogs = () => {
  const { blogs, loading, fetchBlogs } = useBlogStore();
  const { items: taxonomyItems, fetchTaxonomies } = useBlogTaxonomyStore();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [tag, setTag] = useState('');

  useEffect(() => {
    fetchTaxonomies('category');
    fetchTaxonomies('tag');
  }, [fetchTaxonomies]);

  useEffect(() => {
    fetchBlogs({ category, tag });
  }, [category, fetchBlogs, tag]);

  const filtered = useMemo(() => {
    if (!search.trim()) return blogs;
    const q = search.toLowerCase();
    return blogs.filter(
      (b) =>
        b.title?.toLowerCase().includes(q) ||
        b.url?.toLowerCase().includes(q) ||
        b.author?.toLowerCase().includes(q) ||
        b.meta_tags?.toLowerCase().includes(q)
    );
  }, [blogs, search]);

  return (
    <>
      <PageMetaData title="Blogs" />
      <PageBreadcrumb title="Blogs" subName="Website Utilities" />

      <Card className="mb-3">
        <CardBody>
          <div className="d-flex flex-wrap justify-content-between gap-3 align-items-center">
            <div className="search-bar">
              <span><IconifyIcon icon="bx:search-alt" className="mb-1" /></span>
              <input
                type="search"
                className="form-control"
                placeholder="Search blogs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="d-flex flex-wrap gap-2">
              <Form.Select aria-label="Filter by category" value={category} onChange={(e) => setCategory(e.target.value)} style={{ minWidth: 180 }}>
                <option value="">All categories</option>
                {taxonomyItems.category.map((item) => <option key={item._id} value={item.name}>{item.name}</option>)}
              </Form.Select>
              <Form.Select aria-label="Filter by tag" value={tag} onChange={(e) => setTag(e.target.value)} style={{ minWidth: 180 }}>
                <option value="">All tags</option>
                {taxonomyItems.tag.map((item) => <option key={item._id} value={item.name}>{item.name}</option>)}
              </Form.Select>
            </div>
            <Link to="/blogs/create" className="btn btn-primary d-flex align-items-center">
              <IconifyIcon icon="bx:plus" className="me-1" />
              Add Blog
            </Link>
          </div>
        </CardBody>
      </Card>

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" size="sm" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center text-muted py-5">No blogs found</div>
      ) : (
        <Row className="g-3">
          {filtered.map((blog) => (
            <BlogCard key={blog._id} blog={blog} />
          ))}
        </Row>
      )}
    </>
  );
};

export default Blogs;
