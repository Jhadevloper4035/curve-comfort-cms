import PasswordFormInput from '@/components/form/PasswordFormInput';
import TextFormInput from '@/components/form/TextFormInput';
import { yupResolver } from '@hookform/resolvers/yup';
import { useState } from 'react';
import { Button, Col, Row } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import * as yup from 'yup';
import { useNotificationContext } from '@/context/useNotificationContext';
import { apiFetch } from '@/helpers/httpClient';

const SignUpForm = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { showNotification } = useNotificationContext();
  const signUpSchema = yup.object({
    fullName: yup.string().required('Please enter a full name'),
    email: yup.string().email('Please enter a valid email').required('Please enter an email'),
    mobileNumber: yup.string().required('Please enter a mobile number'),
    password: yup.string().min(8, 'Password must be at least 8 characters').required('Please enter a password'),
    confirmPassword: yup.string().oneOf([yup.ref('password')], 'Passwords must match').required('Please confirm the password'),
    setupCode: yup.string().required('Please enter the setup code'),
  });
  const { control, handleSubmit } = useForm({
    resolver: yupResolver(signUpSchema),
    defaultValues: { confirmPassword: '', setupCode: '' },
  });
  const onSubmit = handleSubmit(async values => {
    setLoading(true);
    const { confirmPassword, ...payload } = values;
    try {
      const res = await apiFetch('/api/auth/setup-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.success && res.data?.user) {
        showNotification({ message: `Admin "${res.data.user.fullName}" created successfully. Please sign in.`, variant: 'success' });
        navigate('/auth/sign-in');
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
          <PasswordFormInput control={control} name="password" containerClassName="mb-0" placeholder="Enter password" id="password-id" label="Password" />
        </Col>
        <Col md={6}>
          <PasswordFormInput control={control} name="confirmPassword" containerClassName="mb-0" placeholder="Confirm password" id="confirm-password-id" label="Confirm Password" />
        </Col>
        <Col md={12}>
          <PasswordFormInput control={control} name="setupCode" containerClassName="mb-0" placeholder="Enter setup code" id="setup-code" label="Setup Code" />
        </Col>
      </Row>
      <div className="mb-1 text-center d-grid">
        <Button variant="primary" type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Create Admin'}
        </Button>
      </div>
    </form>;
};
export default SignUpForm;
