import { useState } from 'react'
import { Button, Card, CardBody, Col, Row } from 'react-bootstrap'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import PageBreadcrumb from '@/components/layout/PageBreadcrumb'
import PageMetaData from '@/components/PageTitle'
import PasswordFormInput from '@/components/form/PasswordFormInput'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { useNotificationContext } from '@/context/useNotificationContext'
import { apiFetch } from '@/helpers/httpClient'

const ChangePassword = () => {
  const [saving, setSaving] = useState(false)
  const { showNotification } = useNotificationContext()

  const schema = yup.object({
    currentPassword: yup.string().required('Please enter your current password'),
    newPassword: yup.string().min(8, 'Password must be at least 8 characters').required('Please enter a new password'),
    confirmPassword: yup.string().oneOf([yup.ref('newPassword')], 'Passwords must match').required('Please confirm the new password'),
  })

  const { control, handleSubmit, reset } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  })

  const onSubmit = handleSubmit(async ({ currentPassword, newPassword }) => {
    setSaving(true)
    try {
      const res = await apiFetch('/api/auth/change-password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      })

      if (res.success) {
        reset()
        showNotification({ message: res.message || 'Password changed successfully.', variant: 'success' })
      }
    } catch (error) {
      showNotification({ message: error.message || 'Failed to change password.', variant: 'danger' })
    } finally {
      setSaving(false)
    }
  })

  return (
    <>
      <PageBreadcrumb subName="Authentication" title="Change Password" />
      <PageMetaData title="Change Password" />

      <Row className="justify-content-center">
        <Col xl={7} lg={8}>
          <Card>
            <CardBody className="p-4 p-lg-5">
              <div className="d-flex align-items-center gap-3 mb-4">
                <div className="avatar-md bg-primary bg-opacity-10 text-primary rounded d-flex align-items-center justify-content-center">
                  <IconifyIcon icon="bx:lock-alt" className="fs-28" />
                </div>
                <div>
                  <h4 className="mb-1">Change Password</h4>
                  <p className="text-muted mb-0">Use your current password to set a new password.</p>
                </div>
              </div>

              <form onSubmit={onSubmit}>
                <PasswordFormInput
                  control={control}
                  name="currentPassword"
                  containerClassName="mb-3"
                  label="Current Password"
                  id="current-password"
                  placeholder="Enter current password"
                />
                <Row className="g-3">
                  <Col md={6}>
                    <PasswordFormInput
                      control={control}
                      name="newPassword"
                      containerClassName="mb-0"
                      label="New Password"
                      id="new-password"
                      placeholder="Enter new password"
                    />
                  </Col>
                  <Col md={6}>
                    <PasswordFormInput
                      control={control}
                      name="confirmPassword"
                      containerClassName="mb-0"
                      label="Confirm Password"
                      id="confirm-new-password"
                      placeholder="Confirm new password"
                    />
                  </Col>
                </Row>
                <div className="d-grid d-sm-flex justify-content-sm-end mt-4">
                  <Button type="submit" variant="primary" disabled={saving}>
                    {saving ? 'Updating...' : 'Update Password'}
                  </Button>
                </div>
              </form>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </>
  )
}

export default ChangePassword
