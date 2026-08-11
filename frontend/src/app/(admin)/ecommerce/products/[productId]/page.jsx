import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardBody, Col, Row, Spinner } from 'react-bootstrap';
import PageBreadcrumb from '@/components/layout/PageBreadcrumb';
import PageMetaData from '@/components/PageTitle';
import useProductStore from '@/store/productStore';
import ProductDetailView from './components/ProductDetailView';
import ProductImages from './components/ProductImages';
import { productDisplay } from '@/helpers/productDisplay';

const ProductDetail = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { products, loading, fetchProducts } = useProductStore();

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const product = products.find((p) => p._id === productId);

  useEffect(() => {
    if (!loading && products.length > 0 && !product) {
      navigate('/pages/error-404-alt');
    }
  }, [loading, products, product, navigate]);

  return (
    <>
      <PageBreadcrumb title="Product Details" subName="Ecommerce" />
      <PageMetaData title={product ? productDisplay(product).title : 'Product Details'} />
      <Row>
        <Col>
          <Card>
            <CardBody>
              {loading && !product ? (
                <div className="text-center py-5">
                  <Spinner animation="border" size="sm" />
                </div>
              ) : product ? (
                <Row>
                  <Col lg={4}><ProductImages product={product} /></Col>
                  <Col lg={8}><ProductDetailView product={product} /></Col>
                </Row>
              ) : null}
            </CardBody>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default ProductDetail;
