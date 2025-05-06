import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchAuthSession } from 'aws-amplify/auth';
import { signInWithRedirect } from 'aws-amplify/auth';

const Login = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const session = await fetchAuthSession();
        const idToken = session.tokens?.idToken?.toString();

        if (idToken) {
          navigate('/dashboard');
        }
      } catch (err) {
      }
    };

    checkSession();
  }, [navigate]);

  return (
    <div>
      <h1>Login Page</h1>
      <button
        className="px-2 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700"
        onClick={() => signInWithRedirect()}
      >
        Login
      </button>
    </div>
  );
};

export default Login;
