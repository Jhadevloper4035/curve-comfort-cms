import PasswordFormInput from '@/components/form/PasswordFormInput';
import TextFormInput from '@/components/form/TextFormInput';
import { yupResolver } from '@hookform/resolvers/yup';
import { useState } from 'react';
import { Button, Col, Form, Row } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { useNotificationContext } from '@/context/useNotificationContext';
import { apiFetch } from '@/helpers/httpClient';

const SignUpForm = () => {
  const [loading, setLoading] = useState(false);
  const { showNotification } = useNotificationContext();
  const signUpSchema = yup.object({
    fullName: yup.string().required('Please enter a full name'),
    email: yup.string().email('Please enter a valid email').required('Please enter an email'),
    mobileNumber: yup.string().required('Please enter a mobile number'),
    role: yup.string().oneOf(['user', 'admin']).required('Please select a role'),
    password: yup.string().min(8, 'Password must be at least 8 characters').required('Please enter a password'),
    confirmPassword: yup.string().oneOf([yup.ref('password')], 'Passwords must match').required('Please confirm the password'),
  });
  const { control, handleSubmit, reset, register: registerField, formState: { errors } } = useForm({
    resolver: yupResolver(signUpSchema),
    defaultValues: { role: 'user', confirmPassword: '' },
  });
  const onSubmit = handleSubmit(async values => {
    setLoading(true);
    const { confirmPassword, ...payload } = values;
    try {
      const res = await apiFetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.success && res.data?.user) {
        showNotification({ message: `User "${res.data.user.fullName}" created successfully!`, variant: 'success' });
        reset({ fullName: '', email: '', mobileNumber: '', password: '', confirmPassword: '', role: 'user' });
      }
    } catch (e) {
      showNotification({ message: e.message ?? 'Failed to create user. Please try again.', variant: 'danger' });
    } finally {
      setLoading(false);
    }
  });
  return <form className="authentication-form" onSubmit={onSubmit}>
      <Row className="g-3 mb-3">
        <Col md={6}>
          <TextFormInput control={control} name="fullName" containerClassName="mb-0" label="Full Name" id="fullName" placeholder="Enter full name" />
        </Col>
        <Col md={6}>
          <TextFormInput control={control} name="email" containerClassName="mb-0" label="Email" id="email" placeholder="Enter email" />
        </Col>
        <Col md={6}>
          <TextFormInput control={control} name="mobileNumber" containerClassName="mb-0" label="Mobile Number" id="mobileNumber" placeholder="Enter mobile number" />
        </Col>
        <Col md={6}>
          <div className="mb-0">
            <label className="form-label">Role</label>
            <Form.Select isInvalid={Boolean(errors.role)} {...registerField('role')}>
              <option value="user">user</option>
              <option value="admin">admin</option>
            </Form.Select>
            {errors.role?.message && <div className="invalid-feedback d-block">{errors.role.message}</div>}
          </div>
        </Col>
        <Col md={6}>
          <PasswordFormInput control={control} name="password" containerClassName="mb-0" placeholder="Enter password" id="password-id" label="Password" />
        </Col>
        <Col md={6}>
          <PasswordFormInput control={control} name="confirmPassword" containerClassName="mb-0" placeholder="Confirm password" id="confirm-password-id" label="Confirm Password" />
        </Col>
      </Row>
      <div className="mb-1 text-center d-grid">
        <Button variant="primary" type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Create User'}
        </Button>
      </div>
    </form>;
};
export default SignUpForm;
