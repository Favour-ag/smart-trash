
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Home from './Home';

const Index = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Check if the user is already logged in
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      // Redirect to the appropriate dashboard
      navigate(`/${user.role}`);
    }
  }, [navigate]);

  // Render the home page
  return <Home />;
};

export default Index;
