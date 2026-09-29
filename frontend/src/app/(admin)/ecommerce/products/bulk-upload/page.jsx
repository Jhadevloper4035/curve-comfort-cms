import { Card, CardBody, Col, Row } from 'react-bootstrap';
import PageBreadcrumb from '@/components/layout/PageBreadcrumb';
import PageMetaData from '@/components/PageTitle';
import BulkProductImport from '../create/components/BulkProductImport';

const BulkProductUpload = () => (
  <>
    <PageMetaData title="Bulk Upload Products" />
    <PageBreadcrumb title="Bulk Upload Products" subName="Ecommerce" />

    <Row>
      <Col xl={7}>
        <Card>
          <CardBody>
            <BulkProductImport />
          </CardBody>
        </Card>
      </Col>
      <Col xl={5}>
        <Card>
          <CardBody>
            <h5 className="mb-3">Bulk upload rules</h5>
            <ol className="ps-3 mb-0">
              <li className="mb-2"><strong>Start with Download sample Excel.</strong> It contains every current product and the required column names.</li>
              <li className="mb-2"><strong>To update a product, keep its Product ID.</strong> Do not change, delete, or duplicate that value.</li>
              <li className="mb-2"><strong>To create a product, leave Product ID blank.</strong> The Title/Slug must not already belong to another product.</li>
              <li className="mb-2"><strong>Every row needs Title, Description, Base Price, Category, and at least one Image.</strong> Description must be 10–2,000 characters; price and stock must be zero or more.</li>
              <li className="mb-2"><strong>Category and subcategories must already exist.</strong> Use their name, slug, path, or ID exactly as shown in the CMS.</li>
              <li className="mb-2"><strong>Use | between multiple values.</strong> This applies to Images, Subcategories, Tags, and Care Instructions.</li>
              <li className="mb-2"><strong>Dropbox links are supported in Images.</strong> Set each Dropbox file to public access and use its share link. The importer copies JPG, PNG, WebP, and AVIF files up to 5 MB into this project’s S3 storage.</li>
              <li className="mb-2"><strong>Use valid values:</strong> Currency is INR, USD, EUR, or GBP; Is Active and Assembly Required accept true/false, yes/no, or 1/0.</li>
              <li className="mb-2"><strong>Only the first worksheet is imported.</strong> Do not rename the column headers. Upload an Excel (.xlsx) or CSV file up to 1 MB and 500 rows.</li>
              <li><strong>Missing rows are not deleted.</strong> Only rows in the uploaded file are created or updated.</li>
            </ol>
          </CardBody>
        </Card>
      </Col>
    </Row>
  </>
);

export default BulkProductUpload;
