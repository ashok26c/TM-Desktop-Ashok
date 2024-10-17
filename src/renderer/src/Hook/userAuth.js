// userAuth.ts
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookie from 'js-cookie';

export function useAuth() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = Cookie.get('sessionToken');

    if (token) {
      navigate('/ClockIn');
    }
  }, [navigate]);
}
