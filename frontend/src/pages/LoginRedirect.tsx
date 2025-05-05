import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '@aws-amplify/auth';

export default function LoginRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    getCurrentUser()
      .then(() => navigate('/dashboard'))
      .catch(() => navigate('/'));
  }, [navigate]);

  return <p>Redirecting...</p>;
}
