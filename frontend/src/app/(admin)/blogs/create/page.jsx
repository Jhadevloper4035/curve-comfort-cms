import { useEffect, useState } from 'react'
import { Card, CardBody, Col, Row } from 'react-bootstrap'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import ReactQuill from 'react-quill-new'
import 'react-quill-new/dist/quill.snow.css'

import PageBreadcrumb from '@/components/layout/PageBreadcrumb'
import PageMetaData from '@/components/PageTitle'
import TextFormInput from '@/components/form/TextFormInput'
import TextAreaFormInput from '@/components/form/TextAreaFormInput'
import SelectFormInput from '@/components/form/SelectFormInput'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import useBlogStore from '@/store/blogStore'
import useBlogTaxonomyStore from '@/store/blogTaxonomyStore'
import ImageUploader from '@/components/ImageUploader'
import SeoFieldsForm, { buildSeoPayload, getSeoDefaults } from '@/components/form/SeoFieldsForm'

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
]

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
}

const CreateBlog = () => {
  const navigate = useNavigate()
  const { createBlog } = useBlogStore()
  const { items: taxonomyItems, fetchTaxonomies } = useBlogTaxonomyStore()
  const [content, setContent] = useState('')
  const [coverImage, setCoverImage] = useState('')

  useEffect(() => {
    fetchTaxonomies('category')
    fetchTaxonomies('tag')
  }, [fetchTaxonomies])

  const categoryOptions = taxonomyItems.category.map((item) => ({ value: item.name, label: item.name }))
  const tagOptions = taxonomyItems.tag.map((item) => ({ value: item.name, label: item.name }))

  const { control, handleSubmit } = useForm({
    defaultValues: {
      title: '',
      url: '',
      status: 'active',
      author: 'Admin',
      category: '',
      tags: [],
      meta_name: '',
      meta_tags: '',
      meta_title: '',
      meta_description: '',
      seo: getSeoDefaults(),
    },
  })

  const onSubmit = async (values) => {
    const payload = {
      title: values.title,
      url: values.url,
      text: content,
      status: values.status,
      author: values.author,
      category: values.category || null,
      tags: values.tags || [],
      meta_name: values.meta_name || '',
      meta_tags: values.meta_tags || '',
      meta_title: values.meta_title || '',
      meta_description: values.meta_description || '',
      seo: buildSeoPayload(values.seo),
      image: coverImage,
    }

    const result = await createBlog(payload)
    if (result) navigate('/blogs')
  }

  return (
    <>
      <PageMetaData title="Create Blog" />
      <PageBreadcrumb title="Create Blog" subName="Blogs" />

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
                    <SelectFormInput control={control} name="status" label="Status" options={STATUS_OPTIONS} containerClassName="mb-3" />
                  </Col>
                  <Col md={8}>
                    <TextFormInput
                      control={control}
                      name="url"
                      label="URL Slug"
                      placeholder="e.g. top-10-interior-design-trends (auto-generated if empty)"
                      containerClassName="mb-3"
                    />
                  </Col>
                  <Col md={4}>
                    <TextFormInput control={control} name="author" label="Author" placeholder="Admin" containerClassName="mb-3" />
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
                      <ImageUploader folder="blogs" multiple={false} onComplete={([url]) => setCoverImage(url)} />
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
                      placeholder="SEO title (defaults to blog title)"
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
                  <button type="submit" className="btn btn-primary">
                    <IconifyIcon icon="bx:check" className="me-1" />
                    Create Blog
                  </button>
                  <button type="button" className="btn btn-outline-secondary" onClick={() => navigate('/blogs')}>
                    Cancel
                  </button>
                </div>
              </form>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </>
  )
}

export default CreateBlog
