import { Button, Card, CardBody, Col, Row } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import PageBreadcrumb from '@/components/layout/PageBreadcrumb'
import PageMetaData from '@/components/PageTitle'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { getDefaultPathForUser } from '@/constants/access'
import { useAuthContext } from '@/context/useAuthContext'

const PermissionDenied = ({ routeName }) => {
  const { user } = useAuthContext()
  const fallbackPath = getDefaultPathForUser(user)
  const homePath = fallbackPath === '/error-404' ? '/auth/sign-in' : fallbackPath

  return (
    <>
      <PageBreadcrumb subName="Access" title="Permission Denied" />
      <PageMetaData title="Permission Denied" />

      <Row className="justify-content-center">
        <Col xl={7} lg={9}>
          <Card className="overflow-hidden">
            <CardBody className="p-4 p-lg-5 text-center">
              <div className="avatar-lg bg-danger bg-opacity-10 text-danger rounded d-inline-flex align-items-center justify-content-center mb-4">
                <IconifyIcon icon="bx:lock-alt" className="fs-36" />
              </div>
              <h3 className="fw-semibold mb-2">Permission Denied</h3>
              <p className="text-muted mb-4">
                Your account does not have access to {routeName ? <strong>{routeName}</strong> : 'this page'}.
                Contact an administrator if this page should be available for your role.
              </p>
              <div className="d-flex flex-wrap justify-content-center gap-2">
                <Button as={Link} to={homePath} variant="primary">
                  Go to Allowed Page
                </Button>
                <Button as={Link} to="/auth/sign-in" variant="soft-secondary">
                  Switch Account
                </Button>
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </>
  )
}

export default PermissionDenied
