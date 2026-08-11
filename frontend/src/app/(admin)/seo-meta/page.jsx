import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Badge, Button, Card, CardBody, Col, Row, Spinner } from 'react-bootstrap';
import Swal from 'sweetalert2';
import PageBreadcrumb from '@/components/layout/PageBreadcrumb';
import PageMetaData from '@/components/PageTitle';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import useSeoMetaStore from '@/store/seoMetaStore';

const SeoMetaList = () => {
  const { seoMetas, loading, fetchSeoMetas, deleteSeoMeta } = useSeoMetaStore();
  const [search, setSearch] = useState('');
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    fetchSeoMetas();
  }, [fetchSeoMetas]);

  const filtered = seoMetas.filter((s) => {
    const q = search.toLowerCase();
    return (
      s.pageName?.toLowerCase().includes(q) ||
      s.pageSlug?.toLowerCase().includes(q) ||
      s.pageCategory?.toLowerCase().includes(q)
    );
  });

  const handleDelete = async (seo) => {
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

    setDeleting(seo._id);
    const ok = await deleteSeoMeta(seo._id);
    setDeleting(null);

    if (ok) {
      await Swal.fire({
        title: 'Deleted',
        text: 'The SEO meta entry was deleted successfully.',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
      });
    }
  };

  return (
    <>
      <PageMetaData title="SEO Meta" />
      <PageBreadcrumb title="SEO Meta" subName="Website Utilities" />

      <Row className="mb-3 align-items-center">
        <Col>
          <input
            className="form-control"
            placeholder="Search by page name, slug or category…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </Col>
        <Col xs="auto">
          <Link to="/seo-meta/create" className="btn btn-primary d-flex align-items-center gap-1">
            <IconifyIcon icon="bx:plus" />
            Add SEO Meta
          </Link>
        </Col>
      </Row>

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" size="sm" />
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardBody className="text-center text-muted py-5">
            <IconifyIcon icon="bx:search-alt" width={40} height={40} className="mb-2" />
            <p className="mb-0">No SEO meta entries found.</p>
          </CardBody>
        </Card>
      ) : (
        <Card>
          <CardBody className="p-0">
            <div className="table-responsive">
              <table className="table table-hover table-centered mb-0">
                <thead className="bg-light">
                  <tr>
                    <th className="ps-3">Page Name</th>
                    <th>Category</th>
                    <th>Slug</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th className="text-end pe-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((seo) => (
                    <tr key={seo._id}>
                      <td className="ps-3 fw-medium">{seo.pageName}</td>
                      <td>
                        <Badge bg="secondary" className="fw-normal">{seo.pageCategory}</Badge>
                      </td>
                      <td className="text-muted fs-13">/{seo.pageSlug}</td>
                      <td className="fs-13">{seo.priority ?? 0.5}</td>
                      <td>
                        {seo.isActive ? (
                          <Badge bg="success">Active</Badge>
                        ) : (
                          <Badge bg="danger">Inactive</Badge>
                        )}
                      </td>
                      <td className="text-end pe-3">
                        <div className="d-flex gap-1 justify-content-end">
                          <Link
                            to={`/seo-meta/${seo._id}`}
                            className="btn btn-sm btn-outline-info"
                            title="View"
                          >
                            <IconifyIcon icon="bx:show" />
                          </Link>
                          <Link
                            to={`/seo-meta/${seo._id}/edit`}
                            className="btn btn-sm btn-outline-primary"
                            title="Edit"
                          >
                            <IconifyIcon icon="bx:edit" />
                          </Link>
                          <Button
                            size="sm"
                            variant="outline-danger"
                            title="Delete"
                            disabled={deleting === seo._id}
                            onClick={() => handleDelete(seo)}
                          >
                            {deleting === seo._id ? (
                              <Spinner animation="border" size="sm" />
                            ) : (
                              <IconifyIcon icon="bx:trash" />
                            )}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>
      )}
    </>
  );
};

export default SeoMetaList;
