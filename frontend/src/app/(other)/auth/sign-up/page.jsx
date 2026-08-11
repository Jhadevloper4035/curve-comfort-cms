import { Card, CardBody, Col, Row } from 'react-bootstrap';
import LogoBox from '@/components/LogoBox';
import PageMetaData from '@/components/PageTitle';
import SignUpForm from './components/SignUpForm';
import signUpImg from '@/assets/images/sign-in.svg';
const SignUp = () => {
  return <>
      <PageMetaData title="Sign Up" />

      <Card className="overflow-hidden">
        <CardBody className="p-0">
          <Row className="align-items-stretch g-0" style={{ minHeight: 'calc(100vh - 180px)' }}>
            <Col xl={5} lg={6} className="d-none d-lg-flex border-end">
              <div className="auth-page-sidebar d-flex align-items-center justify-content-center w-100 p-4">
                <img src={signUpImg} width={521} height={521} alt="Create user" className="img-fluid" />
              </div>
            </Col>
            <Col xl={7} lg={6}>
              <div className="h-100 d-flex align-items-center justify-content-center p-4 p-xl-5">
                <div className="w-100" style={{ maxWidth: 720 }}>
                <LogoBox textLogo={{
                height: 24,
                width: 73
              }} squareLogo={{
                className: 'me-1'
              }} containerClassName="mx-auto mb-4 text-center auth-logo" />
                <h2 className="fw-bold text-center fs-18">Create User</h2>
                <p className="text-muted text-center mt-1 mb-4">Create a new user account and assign their role.</p>
                <SignUpForm />
                </div>
              </div>
            </Col>
          </Row>
        </CardBody>
      </Card>
    </>;
};
export default SignUp;
