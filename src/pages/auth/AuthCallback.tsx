
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from '@/hooks/use-toast';

const AuthCallback = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const handleAuthCallback = async () => {
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        toast({
          variant: "destructive",
          title: "Authentication error",
          description: error.message,
        });
        navigate('/login');
        return;
      }
      
      if (data.session) {
        try {
          // Fetch user profile to determine role
          const { data: profileData } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', data.session.user.id)
            .single();
          
          toast({
            title: "Successfully logged in",
            description: "Welcome to TrashWise!",
          });
          
          // Redirect based on role
          if (profileData?.role === 'ADMIN') {
            navigate('/admin');
          } else {
            navigate('/resident');
          }
        } catch (err) {
          console.error('Error fetching user profile:', err);
          navigate('/resident'); // Default to resident if role can't be determined
        }
      } else {
        navigate('/login');
      }
    };
    
    handleAuthCallback();
  }, [navigate, toast]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-2">Completing authentication...</h2>
        <p className="text-muted-foreground">Please wait while we log you in.</p>
      </div>
    </div>
  );
};

export default AuthCallback;
