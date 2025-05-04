import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login_Redirect() {
  const navigate = useNavigate();

  useEffect(() => {
    const hash = window.location.hash;
    const params = new URLSearchParams(hash.substring(1));
    const token = params.get('id_token') || params.get('access_token');
    if (token) {
      localStorage.setItem('authToken', token);
      navigate('/dashboard');
    } else {
      navigate('/');
    }
  }, [navigate]);

  return <p>Logging you in...</p>;
}
