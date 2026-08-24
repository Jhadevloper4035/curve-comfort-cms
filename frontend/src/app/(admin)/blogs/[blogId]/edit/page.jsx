import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Button, Card, CardBody, Col, Row, Spinner } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import PageBreadcrumb from '@/components/layout/PageBreadcrumb';
import PageMetaData from '@/components/PageTitle';
import TextFormInput from '@/components/form/TextFormInput';
import TextAreaFormInput from '@/components/form/TextAreaFormInput';
import SelectFormInput from '@/components/form/SelectFormInput';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import useBlogStore from '@/store/blogStore';
import useBlogTaxonomyStore from '@/store/blogTaxonomyStore';
import ImageUploader from '@/components/ImageUploader';
import SeoFieldsForm, { buildSeoPayload, getSeoDefaults } from '@/components/form/SeoFieldsForm';

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];

const QUILL_MODULES = {
  toolbar: [
    [{ font: [] }, { size: [] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ color: [] }, { background: [] }],
    [{ header: [1, 2, 3, 4, 5, 6, false] }, 'blockquote', 'code-block'],
    [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }],
    [{ align: [] }],
    ['link', 'image', 'video'],
    ['clean'],
  ],
};

const EditBlog = () => {
  const { blogId } = useParams();
  const navigate = useNavigate();
  const { blogs, loading, fetchBlogs, updateBlog } = useBlogStore();
  const { items: taxonomyItems, fetchTaxonomies } = useBlogTaxonomyStore();
  const [saving, setSaving] = useState(false);
  const [content, setContent] = useState('');
  const [coverImage, setCoverImage] = useState('');

  const { control, handleSubmit, reset } = useForm();

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  useEffect(() => {
    fetchTaxonomies('category');
    fetchTaxonomies('tag');
  }, [fetchTaxonomies]);

  const blog = blogs.find((b) => b._id === blogId);
  const categoryOptions = [
    ...taxonomyItems.category.map((item) => ({ value: item.name, label: item.name })),
    ...(blog?.category && !taxonomyItems.category.some((item) => item.name === blog.category)
      ? [{ value: blog.category, label: blog.category }]
      : []),
  ];
  const tagOptions = [
    ...taxonomyItems.tag.map((item) => ({ value: item.name, label: item.name })),
    ...(blog?.tags || [])
      .filter((tag) => !taxonomyItems.tag.some((item) => item.name === tag))
      .map((tag) => ({ value: tag, label: tag })),
  ];

  useEffect(() => {
    if (blog) {
      reset({
        title:            blog.title            ?? '',
        url:              blog.url              ?? '',
        status:           blog.status           ?? 'active',
        author:           blog.author           ?? 'Admin',
        category:         blog.category         ?? '',
        tags:             blog.tags || [],
        meta_name:        blog.meta_name        ?? '',
        meta_tags:        blog.meta_tags        ?? '',
        meta_title:       blog.meta_title       ?? '',
        meta_description: blog.meta_description ?? '',
        seo:              getSeoDefaults(blog.seo),
      });
      setContent(blog.text ?? '');
      setCoverImage(blog.image ?? '');
    }
  }, [blog, reset]);

  useEffect(() => {
    if (!loading && blogs.length > 0 && !blog) {
      navigate('/pages/error-404-alt');
    }
  }, [loading, blogs, blog, navigate]);

  const onSubmit = async (values) => {
    setSaving(true);
    const payload = {
      title:            values.title,
      url:              values.url,
      image:            coverImage,
      text:             content,
      status:           values.status,
      author:           values.author,
      category:         values.category || null,
      tags:             values.tags || [],
      meta_name:        values.meta_name        || null,
      meta_tags:        values.meta_tags        || null,
      meta_title:       values.meta_title       || null,
      meta_description: values.meta_description || null,
      seo:              buildSeoPayload(values.seo),
    };
    const result = await updateBlog(blogId, payload);
    setSaving(false);
    if (result) navigate(`/blogs/${blogId}`);
  };

  if (loading && !blog) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" size="sm" />
      </div>
    );
  }

  return (
    <>
      <PageMetaData title={`Edit — ${blog?.title ?? ''}`} />
      <PageBreadcrumb title="Edit Blog" subName="Blogs" />

      <Row>
        <Col>
          <Card>
            <CardBody>
              <form onSubmit={handleSubmit(onSubmit)}>
                <Row>
                  <Col md={8}>
                    <TextFormInput
                      control={control}
                      name="title"
                      label="Title"
                      placeholder="e.g. Top 10 Interior Design Trends"
                      containerClassName="mb-3"
                    />
                  </Col>
                  <Col md={4}>
                    <SelectFormInput
                      control={control}
                      name="status"
                      label="Status"
                      options={STATUS_OPTIONS}
                      containerClassName="mb-3"
                    />
                  </Col>
                  <Col md={8}>
                    <TextFormInput
                      control={control}
                      name="url"
                      label="URL Slug"
                      placeholder="e.g. top-10-interior-design-trends"
                      containerClassName="mb-3"
                    />
                  </Col>
                  <Col md={4}>
                    <TextFormInput
                      control={control}
                      name="author"
                      label="Author"
                      placeholder="Admin"
                      containerClassName="mb-3"
                    />
                  </Col>
                  <Col md={6}>
                    <SelectFormInput
                      control={control}
                      name="category"
                      label="Category"
                      options={categoryOptions}
                      placeholder="Select a category"
                      isClearable
                      containerClassName="mb-3"
                    />
                  </Col>
                  <Col md={6}>
                    <SelectFormInput
                      control={control}
                      name="tags"
                      label="Tags"
                      options={tagOptions}
                      placeholder="Select one or more tags"
                      isMulti
                      closeMenuOnSelect={false}
                      containerClassName="mb-3"
                    />
                  </Col>

                  <Col md={12}>
                    <div className="mb-3">
                      <label className="form-label">Blog Cover Image</label>
                      <ImageUploader
                        folder="blogs"
                        multiple={false}
                        value={coverImage ? [coverImage] : []}
                        onComplete={([key]) => setCoverImage(key)}
                        onRemove={() => setCoverImage('')}
                      />
                    </div>
                  </Col>

                  <Col md={12}>
                    <div className="mb-3">
                      <label className="form-label">Blog Content</label>
                      <ReactQuill
                        theme="snow"
                        value={content}
                        onChange={setContent}
                        modules={QUILL_MODULES}
                        placeholder="Write your blog content here..."
                        style={{ minHeight: 500 }}
                      />
                    </div>
                  </Col>

                  <Col md={12}>
                    <hr className="my-3" />
                    <h6 className="text-muted mb-3">SEO / Meta Fields</h6>
                  </Col>
                  <Col md={6}>
                    <TextFormInput
                      control={control}
                      name="meta_title"
                      label="Meta Title"
                      placeholder="SEO title"
                      containerClassName="mb-3"
                    />
                  </Col>
                  <Col md={6}>
                    <TextFormInput
                      control={control}
                      name="meta_name"
                      label="Meta Name"
                      placeholder="e.g. interior-design-blog"
                      containerClassName="mb-3"
                    />
                  </Col>
                  <Col md={12}>
                    <TextFormInput
                      control={control}
                      name="meta_tags"
                      label="Meta Tags"
                      placeholder="e.g. interior design, home decor, trends"
                      containerClassName="mb-3"
                    />
                  </Col>
                  <Col md={12}>
                    <TextAreaFormInput
                      control={control}
                      name="meta_description"
                      label="Meta Description"
                      placeholder="Short description for search engines (150–160 chars)"
                      rows={3}
                      containerClassName="mb-3"
                    />
                  </Col>
                  <SeoFieldsForm control={control} />
                </Row>

                <div className="d-flex gap-2 mt-1">
                  <Button type="submit" variant="primary" disabled={saving}>
                    {saving && <Spinner animation="border" size="sm" className="me-1" />}
                    Save Changes
                  </Button>
                  <Link to={`/blogs/${blogId}`} className="btn btn-outline-secondary">
                    Cancel
                  </Link>
                </div>
              </form>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default EditBlog;
