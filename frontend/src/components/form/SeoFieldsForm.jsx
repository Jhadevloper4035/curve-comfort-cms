import { Col } from 'react-bootstrap';
import TextAreaFormInput from './TextAreaFormInput';
import TextFormInput from './TextFormInput';

const EMPTY_SEO = {
  title: '',
  description: '',
  keywords: '',
  robots: 'index, follow',
  canonicalUrl: '',
  ogTitle: '',
  ogDescription: '',
  ogImage: '',
  ogType: 'website',
  twitterTitle: '',
  twitterDescription: '',
  twitterImage: '',
  schemaMarkup: '',
};

export const getSeoDefaults = (seo = {}) => ({
  ...EMPTY_SEO,
  ...seo,
  schemaMarkup: typeof seo.schemaMarkup === 'string'
    ? seo.schemaMarkup
    : seo.schemaMarkup
      ? JSON.stringify(seo.schemaMarkup, null, 2)
      : '',
});

export const buildSeoPayload = (seo = {}) => {
  const payload = { ...EMPTY_SEO, ...seo };
  const markup = payload.schemaMarkup?.trim?.();
  payload.schemaMarkup = markup || null;

  if (markup) {
    try {
      payload.schemaMarkup = JSON.parse(markup);
    } catch {
      payload.schemaMarkup = markup;
    }
  }

  return payload;
};

const SeoFieldsForm = ({ control }) => (
  <>
    <Col md={12}>
      <hr className="my-3" />
      <h6 className="text-muted mb-3">SEO Details</h6>
    </Col>
    <Col md={8}>
      <TextFormInput control={control} name="seo.title" label="Meta Title" placeholder="SEO title" containerClassName="mb-3" />
    </Col>
    <Col md={4}>
      <TextFormInput control={control} name="seo.robots" label="Robots" placeholder="index, follow" containerClassName="mb-3" />
    </Col>
    <Col md={12}>
      <TextAreaFormInput control={control} name="seo.description" label="Meta Description" placeholder="Search result description" rows={3} containerClassName="mb-3" />
    </Col>
    <Col md={12}>
      <TextAreaFormInput control={control} name="seo.keywords" label="Keywords" placeholder="comma separated keywords" rows={2} containerClassName="mb-3" />
    </Col>
    <Col md={12}>
      <TextFormInput control={control} name="seo.canonicalUrl" label="Canonical URL" placeholder="https://curvecomfort.com/page" containerClassName="mb-3" />
    </Col>
    <Col md={6}>
      <TextFormInput control={control} name="seo.ogTitle" label="OG Title" placeholder="Open Graph title" containerClassName="mb-3" />
    </Col>
    <Col md={6}>
      <TextFormInput control={control} name="seo.ogType" label="OG Type" placeholder="website" containerClassName="mb-3" />
    </Col>
    <Col md={12}>
      <TextAreaFormInput control={control} name="seo.ogDescription" label="OG Description" placeholder="Open Graph description" rows={2} containerClassName="mb-3" />
    </Col>
    <Col md={12}>
      <TextFormInput control={control} name="seo.ogImage" label="OG Image URL" placeholder="https://.../og-image.jpg" containerClassName="mb-3" />
    </Col>
    <Col md={6}>
      <TextFormInput control={control} name="seo.twitterTitle" label="Twitter Title" placeholder="Twitter card title" containerClassName="mb-3" />
    </Col>
    <Col md={6}>
      <TextFormInput control={control} name="seo.twitterImage" label="Twitter Image URL" placeholder="https://.../twitter-image.jpg" containerClassName="mb-3" />
    </Col>
    <Col md={12}>
      <TextAreaFormInput control={control} name="seo.twitterDescription" label="Twitter Description" placeholder="Twitter card description" rows={2} containerClassName="mb-3" />
    </Col>
    <Col md={12}>
      <TextAreaFormInput control={control} name="seo.schemaMarkup" label="Schema Markup" placeholder='{"@context":"https://schema.org"}' rows={4} containerClassName="mb-3" />
    </Col>
  </>
);

export default SeoFieldsForm;
