import { Card, CardBody, Col, Row } from 'react-bootstrap';
import LogoBox from '@/components/LogoBox';
import PageMetaData from '@/components/PageTitle';
import LoginForm from './LoginForm';
import signInImg from '@/assets/images/sign-in.svg';
const SignIn = () => {
  return <>
      <PageMetaData title="Sign In" />

      <Card className="auth-card sign-in-card">
        <CardBody className="p-0">
          <Row className="align-items-center g-0 h-100">
            <Col lg={6} className="d-none d-lg-flex border-end h-100">
              <div className="auth-page-sidebar sign-in-visual">
                <img src={signInImg} width={521} height={521} alt="auth" className="img-fluid" />
              </div>
            </Col>
            <Col lg={6} className="h-100">
              <div className="sign-in-panel">
                <div className="sign-in-form-wrap">
                <div className="mx-auto mb-4 text-center auth-logo">
                  <LogoBox textLogo={{
                  height: 24,
                  width: 73
                }} squareLogo={{
                  className: 'me-1'
                }} containerClassName="mx-auto mb-4 text-center auth-logo" />
                </div>
                <h2 className="fw-bold text-center fs-18">Sign In</h2>
                <p className="text-muted text-center mt-1 mb-4">Enter your email address and password to access admin panel.</p>
                <Row className="justify-content-center g-0">
                  <Col xs={12}>
                    <LoginForm />
                  </Col>
                </Row>
                </div>
              </div>
            </Col>
          </Row>
        </CardBody>
      </Card>
     
    </>;
};
export default SignIn;
