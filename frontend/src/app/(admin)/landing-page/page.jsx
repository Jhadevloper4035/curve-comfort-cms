import { useEffect, useMemo, useState } from 'react';
import { Alert, Button, Card, CardBody, Col, Form, Row, Spinner } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import PageBreadcrumb from '@/components/layout/PageBreadcrumb';
import PageMetaData from '@/components/PageTitle';
import ImageUploader from '@/components/ImageUploader';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import useLandingPageStore from '@/store/landingPageStore';

const image = () => ({ url: '', key: '' });
const SECTIONS = {
  heroSlides: { label: 'Hero Slides', fields: [['title', 'Title'], ['subtitle', 'Subtitle'], ['description', 'Description', true], ['ctaText', 'CTA Text'], ['ctaLink', 'CTA Link'], ['order', 'Order', false, 'number']], images: [['bgImage', 'Background Image']], initial: () => ({ pageType: 'kitchen', title: '', subtitle: '', description: '', ctaText: '', ctaLink: '', bgImage: image(), order: 0 }) },
  aboutSection: { label: 'About Section', singleton: true, fields: [['eyebrow', 'Eyebrow'], ['heading', 'Heading'], ['introText', 'Introduction', true], ['mainCaption', 'Main Image Caption']], images: [['mainImage', 'Main Image']], initial: () => ({ pageType: 'kitchen', eyebrow: '', heading: '', introText: '', mainImage: image(), mainCaption: '', tabs: [] }) },
  layoutCards: { label: 'Layout Cards', fields: [['imageAlt', 'Image Alt Text'], ['tagLabel', 'Tag Label'], ['stepNumber', 'Step Number'], ['title', 'Title'], ['description', 'Description', true], ['isActive', 'Active', false, 'checkbox'], ['order', 'Order', false, 'number']], images: [['image', 'Image']], initial: () => ({ pageType: 'kitchen', image: image(), imageAlt: '', tagLabel: 'Curve', stepNumber: '', title: '', description: '', isActive: true, order: 0 }) },
  whyChooseItems: { label: 'Why Choose Items', fields: [['stepNumber', 'Step Number'], ['title', 'Title'], ['description', 'Description', true], ['order', 'Order', false, 'number']], initial: () => ({ pageType: 'kitchen', stepNumber: '', title: '', description: '', order: 0 }) },
  processSteps: { label: 'Process Steps', fields: [['title', 'Title'], ['description', 'Description', true], ['order', 'Order', false, 'number']], images: [['image', 'Image']], initial: () => ({ pageType: 'kitchen', image: image(), title: '', description: '', order: 0 }) },
  parallaxCta: { label: 'Parallax CTA', singleton: true, fields: [['eyebrow', 'Eyebrow'], ['heading', 'Heading'], ['linkText', 'Link Text'], ['linkHref', 'Link URL']], images: [['bgImage', 'Background Image']], initial: () => ({ pageType: 'kitchen', eyebrow: '', heading: '', bgImage: image(), linkText: '', linkHref: '' }) },
  consultationCta: { label: 'Consultation CTA', singleton: true, fields: [['eyebrow', 'Eyebrow'], ['heading', 'Heading'], ['ctaText', 'CTA Text'], ['ctaLink', 'CTA Link']], images: [['bgImage', 'Background Image']], initial: () => ({ pageType: 'kitchen', eyebrow: '', heading: '', bgImage: image(), ctaText: '', ctaLink: '/contact-us' }) },
  faqItems: { label: 'FAQ Items', fields: [['question', 'Question'], ['answer', 'Answer', true], ['order', 'Order', false, 'number']], initial: () => ({ pageType: 'kitchen', question: '', answer: '', order: 0 }) },
  pageMeta: { label: 'Page Meta', singleton: true, fields: [['title', 'Meta Title'], ['robots', 'Robots'], ['description', 'Meta Description', true], ['keywords', 'Keywords', true], ['canonicalUrl', 'Canonical URL'], ['ogTitle', 'Open Graph Title'], ['ogType', 'Open Graph Type'], ['ogDescription', 'Open Graph Description', true], ['ogImage', 'Open Graph Image URL'], ['twitterTitle', 'X / Twitter Title'], ['twitterDescription', 'X / Twitter Description', true], ['twitterImage', 'X / Twitter Image URL'], ['schemaMarkup', 'Structured Data (JSON-LD)', true]], initial: () => ({ pageType: 'kitchen', title: '', keywords: '', description: '', robots: 'index, follow', canonicalUrl: '', ogTitle: '', ogDescription: '', ogImage: '', ogType: 'website', twitterTitle: '', twitterDescription: '', twitterImage: '', schemaMarkup: '' }) },
};

const SECTION_SLUGS = Object.fromEntries(Object.keys(SECTIONS).map((key) => [key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`), key]));

const LandingPage = () => {
  const { sectionSlug } = useParams();
  const { content, loading, fetchContent, saveSection, deleteSection } = useLandingPageStore();
  const [pageType, setPageType] = useState('kitchen');
  const section = SECTION_SLUGS[sectionSlug] || 'heroSlides';
  const [editing, setEditing] = useState(null);
  const config = SECTIONS[section];
  const [form, setForm] = useState(config.initial());

  useEffect(() => { fetchContent(pageType); }, [fetchContent, pageType]);
  useEffect(() => { setEditing(null); setForm({ ...SECTIONS[section].initial(), pageType }); }, [section, pageType]);

  const entries = useMemo(() => {
    const value = content?.[section];
    return Array.isArray(value) ? value : value ? [value] : [];
  }, [content, section]);

  const setValue = (name, value) => setForm((current) => ({ ...current, [name]: value }));
  const startEdit = (entry) => {
    setEditing(entry);
    setForm({ ...config.initial(), ...entry, pageType, schemaMarkup: section === 'pageMeta' && entry.schemaMarkup ? JSON.stringify(entry.schemaMarkup, null, 2) : entry.schemaMarkup || '' });
  };
  const reset = () => { setEditing(null); setForm({ ...config.initial(), pageType }); };
  const setImage = (name, uploaded) => setValue(name, uploaded);
  const setTab = (index, name, value) => setValue('tabs', form.tabs.map((tab, tabIndex) => tabIndex === index ? { ...tab, [name]: value } : tab));

  const submit = async (event) => {
    event.preventDefault();
    const payload = { ...form, pageType };
    if (section === 'pageMeta' && payload.schemaMarkup?.trim()) {
      try { payload.schemaMarkup = JSON.parse(payload.schemaMarkup); } catch { return window.alert('Structured Data must be valid JSON-LD.'); }
    }
    const missingImage = config.images?.some(([name]) => !payload[name]?.url) || (section === 'aboutSection' && payload.tabs.some((tab) => !tab.image?.url));
    if (missingImage) return window.alert('Upload an image for every image field before saving.');
    const saved = await saveSection(section, editing?._id, payload);
    if (saved) { reset(); fetchContent(pageType); }
  };

  const remove = async (entry) => {
    if (!window.confirm('Delete this landing page entry?')) return;
    if (await deleteSection(section, entry._id)) { if (editing?._id === entry._id) reset(); fetchContent(pageType); }
  };

  return <>
    <PageMetaData title={config.label} />
    <PageBreadcrumb title={config.label} subName="Landing Page" />
    <Row className="mb-3">
      <Col md={4}><Form.Select value={pageType} onChange={(e) => setPageType(e.target.value)}><option value="kitchen">Kitchen</option><option value="wardrobe">Wardrobe</option></Form.Select></Col>
    </Row>
    <Row>
      <Col lg={7}>
        <Card><CardBody>
          <div className="d-flex justify-content-between align-items-center mb-3"><h5 className="mb-0">{editing ? `Edit ${config.label}` : `Create ${config.label}`}</h5>{editing && <Button size="sm" variant="soft-secondary" onClick={reset}>Cancel</Button>}</div>
          <Form onSubmit={submit}>
            <Row>{config.fields.map(([name, label, multiline, type]) => <Col md={name === 'description' || name === 'introText' || name === 'answer' ? 12 : 6} key={name}><Form.Group className="mb-3">
              {type === 'checkbox' ? <Form.Check type="switch" id={name} label={label} checked={Boolean(form[name])} onChange={(e) => setValue(name, e.target.checked)} /> : <><Form.Label>{label}</Form.Label><Form.Control as={multiline ? 'textarea' : undefined} rows={multiline ? 4 : undefined} type={type || 'text'} value={form[name] ?? ''} onChange={(e) => setValue(name, e.target.value)} required /></>}
            </Form.Group></Col>)}</Row>
            {config.images?.map(([name, label]) => <Form.Group className="mb-3" key={name}><Form.Label>{label}</Form.Label><ImageUploader folder="landing-page" multiple={false} maxFileSizeMB={5} value={form[name]?.url ? [form[name].url] : []} onCompleteDetails={([uploaded]) => setImage(name, uploaded)} onRemove={() => setValue(name, image())} /></Form.Group>)}
            {section === 'aboutSection' && <Form.Group className="mb-3"><div className="d-flex justify-content-between align-items-center mb-2"><Form.Label className="mb-0">About Tabs</Form.Label><Button type="button" size="sm" variant="soft-primary" onClick={() => setValue('tabs', [...form.tabs, { label: '', stepNumber: '', heading: '', body: '', image: image(), caption: '', ctaText: '', ctaLink: '', order: form.tabs.length }])}>Add Tab</Button></div>{form.tabs.map((tab, index) => <Card className="mb-2" key={index}><CardBody><div className="d-flex justify-content-between mb-2"><strong>Tab {index + 1}</strong><Button type="button" size="sm" variant="soft-danger" onClick={() => setValue('tabs', form.tabs.filter((_, tabIndex) => tabIndex !== index))}>Remove</Button></div><Row>{[['label', 'Label'], ['stepNumber', 'Step Number'], ['heading', 'Heading'], ['caption', 'Caption'], ['ctaText', 'CTA Text'], ['ctaLink', 'CTA Link'], ['order', 'Order', false, 'number'], ['body', 'Body', true]].map(([name, label, multiline, type]) => <Col md={multiline ? 12 : 6} key={name}><Form.Group className="mb-2"><Form.Label>{label}</Form.Label><Form.Control as={multiline ? 'textarea' : undefined} rows={multiline ? 3 : undefined} type={type || 'text'} value={tab[name] ?? ''} onChange={(e) => setTab(index, name, e.target.value)} required /></Form.Group></Col>)}</Row><Form.Label>Tab Image</Form.Label><ImageUploader folder="landing-page" multiple={false} maxFileSizeMB={5} value={tab.image?.url ? [tab.image.url] : []} onCompleteDetails={([uploaded]) => setTab(index, 'image', uploaded)} onRemove={() => setTab(index, 'image', image())} /></CardBody></Card>)}</Form.Group>}
            <Alert variant="info" className="small">
              <strong>Before you save:</strong>
              <ul className="mb-0 mt-1 ps-3">
                <li>Complete every required text field.</li>
                <li>Upload one image for each image field.</li>
                <li>Use JPG, PNG, WebP, or AVIF images up to 5 MB each.</li>
                <li>Recommended: 1920×1080 px for hero/CTA images; at least 1200×800 px for section cards.</li>
              </ul>
            </Alert>
            <Button type="submit"><IconifyIcon icon="bx:save" className="me-1" />{editing ? 'Update' : 'Create'} {config.label}</Button>
          </Form>
        </CardBody></Card>
      </Col>
      <Col lg={5}>
        <Card><CardBody><h5 className="mb-3">{config.label} ({entries.length})</h5>{loading ? <div className="text-center py-4"><Spinner animation="border" size="sm" /></div> : entries.length === 0 ? <div className="text-muted py-4 text-center">No entries yet</div> : entries.map((entry) => <div key={entry._id} className="border rounded p-3 mb-2"><div className="fw-medium">{entry.title || entry.heading || entry.question || entry.eyebrow}</div><div className="small text-muted">{entry.order !== undefined ? `Order: ${entry.order}` : 'One per page'}</div><div className="d-flex gap-2 mt-2"><Button size="sm" variant="soft-primary" onClick={() => startEdit(entry)}>Edit</Button><Button size="sm" variant="soft-danger" onClick={() => remove(entry)}>Delete</Button></div></div>)}</CardBody></Card>
      </Col>
    </Row>
  </>;
};

export default LandingPage;
