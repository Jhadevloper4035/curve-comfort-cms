import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Badge, Card, CardBody, Col, Row, Spinner } from 'react-bootstrap';
import Swal from 'sweetalert2';
import PageBreadcrumb from '@/components/layout/PageBreadcrumb';
import PageMetaData from '@/components/PageTitle';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import useSeoMetaStore from '@/store/seoMetaStore';

const Field = ({ label, value, mono = false }) => (
  <div className="mb-3">
    <p className="mb-1 text-muted fs-12 fw-medium text-uppercase">{label}</p>
    <p className={`mb-0 fs-13 ${mono ? 'font-monospace' : ''}`}>
      {value !== undefined && value !== null && value !== ''
        ? String(value)
        : <span className="text-muted fst-italic">—</span>
      }
    </p>
  </div>
);

const SectionCard = ({ title, children }) => (
  <Card className="shadow-none border mb-3">
    <CardBody>
      <h6 className="fw-semibold text-primary mb-3 pb-2 border-bottom">{title}</h6>
      {children}
    </CardBody>
  </Card>
);

const SeoMetaDetail = () => {
  const { seoId } = useParams();
  const navigate = useNavigate();
  const { seoMetas, loading, fetchSeoMetas, deleteSeoMeta } = useSeoMetaStore();
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchSeoMetas();
  }, [fetchSeoMetas]);

  const seo = seoMetas.find((s) => s._id === seoId);

  useEffect(() => {
    if (!loading && seoMetas.length > 0 && !seo) {
      navigate('/pages/error-404-alt');
    }
  }, [loading, seoMetas, seo, navigate]);

  if (loading && !seo) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" size="sm" />
      </div>
    );
  }

  if (!seo) return null;

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: 'Delete SEO meta?',
      text: `This will permanently delete "${seo.pageName}".`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Confirm',
      cancelButtonText: 'Cancel',
      reverseButtons: true,
      focusCancel: true,
    });

    if (!result.isConfirmed) return;

    setDeleting(true);
    const ok = await deleteSeoMeta(seoId);

    if (ok) {
      await Swal.fire({
        title: 'Deleted',
        text: 'The SEO meta entry was deleted successfully.',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
      });
      navigate('/seo-meta');
    } else {
      setDeleting(false);
    }
  };

  return (
    <>
      <PageMetaData title={seo.pageName} />
      <PageBreadcrumb title="SEO Meta Detail" subName="SEO Meta" />

      {/* Top actions */}
      <div className="d-flex gap-2 mb-3">
        <Link to={`/seo-meta/${seoId}/edit`} className="btn btn-primary">
          <IconifyIcon icon="bx:edit" className="me-1" />Edit
        </Link>
        <Link to="/seo-meta" className="btn btn-outline-secondary">
          <IconifyIcon icon="bx:arrow-back" className="me-1" />Back to List
        </Link>
        <button
          type="button"
          className="btn btn-danger"
          onClick={handleDelete}
          disabled={deleting}
        >
          {deleting ? <Spinner animation="border" size="sm" className="me-1" /> : <IconifyIcon icon="bx:trash" className="me-1" />}
          Delete
        </button>
        <span className="ms-auto d-flex align-items-center gap-2">
          {seo.isActive ? (
            <Badge bg="success" className="fs-12">Active</Badge>
          ) : (
            <Badge bg="danger" className="fs-12">Inactive</Badge>
          )}
          <Badge bg="secondary" className="fs-12">Priority: {seo.priority}</Badge>
        </span>
      </div>

      <Row className="g-3">
        <Col lg={6}>
          {/* Page Info */}
          <SectionCard title="Page Identification">
            <Row>
              <Col md={6}><Field label="Page Name" value={seo.pageName} /></Col>
              <Col md={6}><Field label="Category" value={seo.pageCategory} /></Col>
              <Col md={12}><Field label="Page Slug" value={`/${seo.pageSlug}`} mono /></Col>
            </Row>
          </SectionCard>

          {/* Basic SEO */}
          <SectionCard title="Basic SEO">
            <Field label="Title" value={seo.title} />
            <Field label="Description" value={seo.description} />
            <Field label="Keywords" value={seo.keywords} />
            <Field label="Author" value={seo.author} />
            <Field label="Canonical URL" value={seo.canonicalUrl} mono />
            <Field label="Robots" value={seo.robots} mono />
          </SectionCard>

          {/* Additional SEO */}
          <SectionCard title="Additional SEO">
            <Row>
              <Col md={4}><Field label="Geo Region" value={seo.geoRegion} /></Col>
              <Col md={4}><Field label="Geo Placename" value={seo.geoPlacename} /></Col>
              <Col md={4}><Field label="Language" value={seo.language} /></Col>
              <Col md={4}><Field label="Revisit After" value={seo.revisitAfter} /></Col>
              <Col md={4}><Field label="Distribution" value={seo.distribution} /></Col>
              <Col md={4}><Field label="Rating" value={seo.rating} /></Col>
            </Row>
          </SectionCard>
        </Col>

        <Col lg={6}>
          {/* Open Graph */}
          <SectionCard title="Open Graph (og:)">
            <Row>
              <Col md={4}><Field label="OG Type" value={seo.ogType} /></Col>
              <Col md={4}><Field label="OG Locale" value={seo.ogLocale} /></Col>
              <Col md={4}><Field label="OG Site Name" value={seo.ogSiteName} /></Col>
              <Col md={12}><Field label="OG Title" value={seo.ogTitle} /></Col>
              <Col md={12}><Field label="OG Description" value={seo.ogDescription} /></Col>
              <Col md={12}><Field label="OG URL" value={seo.ogUrl} mono /></Col>
            </Row>
            {seo.ogImage && (
              <>
                <p className="fw-medium mb-2 fs-12 text-muted text-uppercase mt-1">OG Image</p>
                {seo.ogImage.url && (
                  <img
                    src={seo.ogImage.url}
                    alt={seo.ogImage.alt || 'OG Image'}
                    className="rounded mb-2 border"
                    style={{ maxWidth: '100%', maxHeight: 160, objectFit: 'cover' }}
                  />
                )}
                <Row>
                  <Col md={8}><Field label="Image URL" value={seo.ogImage.url} mono /></Col>
                  <Col md={4}><Field label="Alt" value={seo.ogImage.alt} /></Col>
                  <Col md={3}><Field label="Width" value={seo.ogImage.width} /></Col>
                  <Col md={3}><Field label="Height" value={seo.ogImage.height} /></Col>
                </Row>
              </>
            )}
          </SectionCard>

          {/* Twitter Card */}
          <SectionCard title="Twitter Card">
            <Row>
              <Col md={4}><Field label="Card Type" value={seo.twitterCard} /></Col>
              <Col md={4}><Field label="Twitter Site" value={seo.twitterSite} /></Col>
              <Col md={12}><Field label="Twitter Title" value={seo.twitterTitle} /></Col>
              <Col md={12}><Field label="Twitter Description" value={seo.twitterDescription} /></Col>
              <Col md={12}><Field label="Twitter Image URL" value={seo.twitterImage} mono /></Col>
            </Row>
          </SectionCard>

          {/* Schema Markup */}
          {seo.schemaMarkup && (
            <SectionCard title="Schema Markup (JSON-LD)">
              <pre
                className="bg-light rounded p-3 fs-12 mb-0"
                style={{ maxHeight: 300, overflowY: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}
              >
                {JSON.stringify(seo.schemaMarkup, null, 2)}
              </pre>
            </SectionCard>
          )}
        </Col>
      </Row>
    </>
  );
};

export default SeoMetaDetail;
