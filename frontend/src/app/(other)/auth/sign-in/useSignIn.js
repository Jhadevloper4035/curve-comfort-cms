import { yupResolver } from '@hookform/resolvers/yup';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useSearchParams } from 'react-router-dom';
import * as yup from 'yup';
import { useAuthContext } from '@/context/useAuthContext';
import { useNotificationContext } from '@/context/useNotificationContext';
import { apiFetch } from '@/helpers/httpClient';
import { getDefaultPathForUser } from '@/constants/access';
const useSignIn = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const {
    saveSession
  } = useAuthContext();
  const [searchParams] = useSearchParams();
  const {
    showNotification
  } = useNotificationContext();
  const loginFormSchema = yup.object({
    email: yup.string().email('Please enter a valid email').required('Please enter your email'),
    password: yup.string().required('Please enter your password')
  });
  const {
    control,
    handleSubmit
  } = useForm({
    resolver: yupResolver(loginFormSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  });
  const redirectUser = (user) => {
    const redirectLink = searchParams.get('redirectTo');
    if (redirectLink) {
      navigate(redirectLink);
    } else {
      navigate(getDefaultPathForUser(user));
    }
  };
  const login = handleSubmit(async values => {
    setLoading(true);
    try {
      const res = await apiFetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      if (res.success && res.data?.user) {
        saveSession(res.data.user);
        redirectUser(res.data.user);
        showNotification({
          message: 'Successfully logged in. Redirecting....',
          variant: 'success'
        });
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e) {
      showNotification({
        message: e.message ?? 'Login failed. Please try again.',
        variant: 'danger'
      });
    } finally {
      setLoading(false);
    }
  });
  return {
    loading,
    login,
    control
  };
};
export default useSignIn;
