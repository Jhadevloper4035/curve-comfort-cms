import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Button, Card, CardBody, Col, Row, Spinner } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import PageBreadcrumb from '@/components/layout/PageBreadcrumb';
import PageMetaData from '@/components/PageTitle';
import TextFormInput from '@/components/form/TextFormInput';
import TextAreaFormInput from '@/components/form/TextAreaFormInput';
import SelectFormInput from '@/components/form/SelectFormInput';
import useSeoMetaStore from '@/store/seoMetaStore';

const OG_TYPE_OPTIONS = [
  { value: 'website', label: 'website' },
  { value: 'product', label: 'product' },
  { value: 'product.group', label: 'product.group' },
  { value: 'place', label: 'place' },
  { value: 'article', label: 'article' },
];

const STATUS_OPTIONS = [
  { value: 'true', label: 'Active' },
  { value: 'false', label: 'Inactive' },
];

const SectionHeader = ({ title }) => (
  <h6 className="fw-semibold text-primary mb-3 pb-2 border-bottom">{title}</h6>
);

const EditSeoMeta = () => {
  const { seoId } = useParams();
  const navigate = useNavigate();
  const { seoMetas, loading, fetchSeoMetas, updateSeoMeta } = useSeoMetaStore();
  const [saving, setSaving] = useState(false);

  const { control, handleSubmit, reset } = useForm();

  useEffect(() => {
    fetchSeoMetas();
  }, [fetchSeoMetas]);

  const seo = seoMetas.find((s) => s._id === seoId);

  useEffect(() => {
    if (seo) {
      reset({
        pageName:     seo.pageName     ?? '',
        pageSlug:     seo.pageSlug     ?? '',
        pageCategory: seo.pageCategory ?? '',
        isActive:     seo.isActive !== false ? 'true' : 'false',
        priority:     seo.priority     ?? 0.5,
        // Basic SEO
        title:        seo.title        ?? '',
        description:  seo.description  ?? '',
        keywords:     seo.keywords     ?? '',
        author:       seo.author       ?? 'Curve Comfort',
        robots:       seo.robots       ?? '',
        canonicalUrl: seo.canonicalUrl ?? '',
        // Open Graph
        ogLocale:     seo.ogLocale     ?? 'en_US',
        ogType:       seo.ogType       ?? 'website',
        ogTitle:      seo.ogTitle      ?? '',
        ogDescription: seo.ogDescription ?? '',
        ogUrl:        seo.ogUrl        ?? '',
        ogSiteName:   seo.ogSiteName   ?? 'Curve Comfort',
        ogImageUrl:   seo.ogImage?.url    ?? '',
        ogImageWidth: seo.ogImage?.width  ?? 1200,
        ogImageHeight: seo.ogImage?.height ?? 630,
        ogImageAlt:   seo.ogImage?.alt    ?? '',
        // Twitter
        twitterCard:        seo.twitterCard        ?? 'summary_large_image',
        twitterTitle:       seo.twitterTitle       ?? '',
        twitterDescription: seo.twitterDescription ?? '',
        twitterImage:       seo.twitterImage       ?? '',
        twitterSite:        seo.twitterSite        ?? '@curve_comfort',
        // Additional
        geoRegion:    seo.geoRegion    ?? 'IN',
        geoPlacename: seo.geoPlacename ?? 'India',
        language:     seo.language     ?? 'English',
        revisitAfter: seo.revisitAfter ?? '7 days',
        distribution: seo.distribution ?? 'global',
        rating:       seo.rating       ?? 'general',
        // Schema
        schemaMarkup: seo.schemaMarkup
          ? JSON.stringify(seo.schemaMarkup, null, 2)
          : '',
      });
    }
  }, [seo, reset]);

  useEffect(() => {
    if (!loading && seoMetas.length > 0 && !seo) {
      navigate('/pages/error-404-alt');
    }
  }, [loading, seoMetas, seo, navigate]);

  const onSubmit = async (values) => {
    setSaving(true);

    let parsedSchema = null;
    if (values.schemaMarkup?.trim()) {
      try {
        parsedSchema = JSON.parse(values.schemaMarkup);
      } catch {
        parsedSchema = values.schemaMarkup;
      }
    }

    const payload = {
      pageName:     values.pageName,
      pageSlug:     values.pageSlug,
      pageCategory: values.pageCategory,
      isActive:     values.isActive === 'true',
      priority:     parseFloat(values.priority) || 0.5,
      // Basic SEO
      title:        values.title,
      description:  values.description,
      keywords:     values.keywords,
      author:       values.author,
      robots:       values.robots,
      canonicalUrl: values.canonicalUrl,
      // Open Graph
      ogLocale:     values.ogLocale,
      ogType:       values.ogType,
      ogTitle:      values.ogTitle,
      ogDescription: values.ogDescription,
      ogUrl:        values.ogUrl,
      ogSiteName:   values.ogSiteName,
      ogImage: {
        url:    values.ogImageUrl,
        width:  parseInt(values.ogImageWidth) || 1200,
        height: parseInt(values.ogImageHeight) || 630,
        alt:    values.ogImageAlt,
      },
      // Twitter
      twitterCard:        values.twitterCard,
      twitterTitle:       values.twitterTitle,
      twitterDescription: values.twitterDescription,
      twitterImage:       values.twitterImage,
      twitterSite:        values.twitterSite,
      // Additional
      geoRegion:    values.geoRegion,
      geoPlacename: values.geoPlacename,
      language:     values.language,
      revisitAfter: values.revisitAfter,
      distribution: values.distribution,
      rating:       values.rating,
      // Schema
      schemaMarkup: parsedSchema,
    };

    const result = await updateSeoMeta(seoId, payload);
    setSaving(false);
    if (result) navigate(`/seo-meta/${seoId}`);
  };

  if (loading && !seo) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" size="sm" />
      </div>
    );
  }

  return (
    <>
      <PageMetaData title={`Edit — ${seo?.pageName ?? ''}`} />
      <PageBreadcrumb title="Edit SEO Meta" subName="SEO Meta" />

      <form onSubmit={handleSubmit(onSubmit)}>
        <Row className="g-3">
          {/* ── Page Identification ─────────────────────────────── */}
          <Col md={12}>
            <Card>
              <CardBody>
                <SectionHeader title="Page Identification" />
                <Row>
                  <Col md={4}>
                    <TextFormInput control={control} name="pageName" label="Page Name" placeholder="e.g. Home Page" containerClassName="mb-3" />
                  </Col>
                  <Col md={4}>
                    <TextFormInput control={control} name="pageSlug" label="Page Slug" placeholder="e.g. home" containerClassName="mb-3" />
                  </Col>
                  <Col md={4}>
                    <TextFormInput control={control} name="pageCategory" label="Page Category" placeholder="e.g. Main, Product" containerClassName="mb-3" />
                  </Col>
                  <Col md={3}>
                    <TextFormInput control={control} name="priority" label="Priority (0–1)" type="number" placeholder="0.5" containerClassName="mb-0" />
                  </Col>
                  <Col md={3}>
                    <SelectFormInput control={control} name="isActive" label="Status" options={STATUS_OPTIONS} containerClassName="mb-0" />
                  </Col>
                </Row>
              </CardBody>
            </Card>
          </Col>

          {/* ── Basic SEO ───────────────────────────────────────── */}
          <Col md={12}>
            <Card>
              <CardBody>
                <SectionHeader title="Basic SEO" />
                <Row>
                  <Col md={8}>
                    <TextFormInput control={control} name="title" label="Meta Title (max 70 chars)" placeholder="Page title for SEO" containerClassName="mb-3" />
                  </Col>
                  <Col md={4}>
                    <TextFormInput control={control} name="author" label="Author" placeholder="Curve Comfort" containerClassName="mb-3" />
                  </Col>
                  <Col md={12}>
                    <TextAreaFormInput control={control} name="description" label="Meta Description (max 360 chars)" placeholder="Brief description for search results" rows={3} containerClassName="mb-3" />
                  </Col>
                  <Col md={12}>
                    <TextAreaFormInput control={control} name="keywords" label="Keywords" placeholder="comma separated keywords" rows={2} containerClassName="mb-3" />
                  </Col>
                  <Col md={12}>
                    <TextFormInput control={control} name="canonicalUrl" label="Canonical URL" placeholder="https://curvecomfort.com/page" containerClassName="mb-3" />
                  </Col>
                  <Col md={12}>
                    <TextFormInput control={control} name="robots" label="Robots" placeholder="index, follow, …" containerClassName="mb-0" />
                  </Col>
                </Row>
              </CardBody>
            </Card>
          </Col>

          {/* ── Open Graph ──────────────────────────────────────── */}
          <Col md={12}>
            <Card>
              <CardBody>
                <SectionHeader title="Open Graph (og:)" />
                <Row>
                  <Col md={4}>
                    <SelectFormInput control={control} name="ogType" label="OG Type" options={OG_TYPE_OPTIONS} containerClassName="mb-3" />
                  </Col>
                  <Col md={4}>
                    <TextFormInput control={control} name="ogLocale" label="OG Locale" placeholder="en_US" containerClassName="mb-3" />
                  </Col>
                  <Col md={4}>
                    <TextFormInput control={control} name="ogSiteName" label="OG Site Name" placeholder="Curve Comfort" containerClassName="mb-3" />
                  </Col>
                  <Col md={6}>
                    <TextFormInput control={control} name="ogTitle" label="OG Title" placeholder="Open Graph title" containerClassName="mb-3" />
                  </Col>
                  <Col md={6}>
                    <TextFormInput control={control} name="ogUrl" label="OG URL" placeholder="https://curvecomfort.com/page" containerClassName="mb-3" />
                  </Col>
                  <Col md={12}>
                    <TextAreaFormInput control={control} name="ogDescription" label="OG Description" placeholder="Open Graph description" rows={2} containerClassName="mb-3" />
                  </Col>

                  <Col md={12}><p className="fw-medium mb-2 fs-13 text-muted">OG Image</p></Col>
                  <Col md={6}>
                    <TextFormInput control={control} name="ogImageUrl" label="OG Image URL" placeholder="https://…/og-image.jpg" containerClassName="mb-3" />
                  </Col>
                  <Col md={6}>
                    <TextFormInput control={control} name="ogImageAlt" label="OG Image Alt" placeholder="Decorative alt text" containerClassName="mb-3" />
                  </Col>
                  <Col md={3}>
                    <TextFormInput control={control} name="ogImageWidth" label="Width (px)" type="number" placeholder="1200" containerClassName="mb-0" />
                  </Col>
                  <Col md={3}>
                    <TextFormInput control={control} name="ogImageHeight" label="Height (px)" type="number" placeholder="630" containerClassName="mb-0" />
                  </Col>
                </Row>
              </CardBody>
            </Card>
          </Col>

          {/* ── Twitter Card ────────────────────────────────────── */}
          <Col md={12}>
            <Card>
              <CardBody>
                <SectionHeader title="Twitter Card" />
                <Row>
                  <Col md={4}>
                    <TextFormInput control={control} name="twitterCard" label="Twitter Card Type" placeholder="summary_large_image" containerClassName="mb-3" />
                  </Col>
                  <Col md={4}>
                    <TextFormInput control={control} name="twitterSite" label="Twitter Site Handle" placeholder="@curve_comfort" containerClassName="mb-3" />
                  </Col>
                  <Col md={4}>
                    <TextFormInput control={control} name="twitterImage" label="Twitter Image URL" placeholder="https://…/twitter-image.jpg" containerClassName="mb-3" />
                  </Col>
                  <Col md={6}>
                    <TextFormInput control={control} name="twitterTitle" label="Twitter Title" placeholder="Twitter card title" containerClassName="mb-3" />
                  </Col>
                  <Col md={6}>
                    <TextAreaFormInput control={control} name="twitterDescription" label="Twitter Description" placeholder="Twitter card description" rows={2} containerClassName="mb-0" />
                  </Col>
                </Row>
              </CardBody>
            </Card>
          </Col>

          {/* ── Additional SEO ──────────────────────────────────── */}
          <Col md={12}>
            <Card>
              <CardBody>
                <SectionHeader title="Additional SEO" />
                <Row>
                  <Col md={2}>
                    <TextFormInput control={control} name="geoRegion" label="Geo Region" placeholder="IN" containerClassName="mb-3" />
                  </Col>
                  <Col md={3}>
                    <TextFormInput control={control} name="geoPlacename" label="Geo Placename" placeholder="India" containerClassName="mb-3" />
                  </Col>
                  <Col md={2}>
                    <TextFormInput control={control} name="language" label="Language" placeholder="English" containerClassName="mb-3" />
                  </Col>
                  <Col md={2}>
                    <TextFormInput control={control} name="revisitAfter" label="Revisit After" placeholder="7 days" containerClassName="mb-3" />
                  </Col>
                  <Col md={2}>
                    <TextFormInput control={control} name="distribution" label="Distribution" placeholder="global" containerClassName="mb-3" />
                  </Col>
                  <Col md={1}>
                    <TextFormInput control={control} name="rating" label="Rating" placeholder="general" containerClassName="mb-3" />
                  </Col>
                </Row>
              </CardBody>
            </Card>
          </Col>

          {/* ── Schema Markup ───────────────────────────────────── */}
          <Col md={12}>
            <Card>
              <CardBody>
                <SectionHeader title="Schema Markup (JSON-LD)" />
                <TextAreaFormInput
                  control={control}
                  name="schemaMarkup"
                  label="Schema JSON (optional)"
                  placeholder={'{\n  "@context": "https://schema.org",\n  "@type": "Organization"\n}'}
                  rows={8}
                  containerClassName="mb-0"
                />
              </CardBody>
            </Card>
          </Col>
        </Row>

        <div className="d-flex gap-2 mt-3">
          <Button type="submit" variant="primary" disabled={saving}>
            {saving && <Spinner animation="border" size="sm" className="me-1" />}
            Save Changes
          </Button>
          <Link to={`/seo-meta/${seoId}`} className="btn btn-outline-secondary">Cancel</Link>
        </div>
      </form>
    </>
  );
};

export default EditSeoMeta;
