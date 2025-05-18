
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Feedback } from '@/components/resident/FeedbackList';

export function useFeedbackData() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [isLoadingFeedbacks, setIsLoadingFeedbacks] = useState(true);
  const { toast } = useToast();

  const fetchFeedbacks = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;
      if (!user) return;

      const { data, error } = await supabase
        .from('feedback')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFeedbacks(data || []);
    } catch (error) {
      console.error('Error fetching feedback:', error);
      toast({
        variant: "destructive",
        title: "Failed to load feedback history",
        description: "Please try again later."
      });
    } finally {
      setIsLoadingFeedbacks(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
    
    // Set up real-time subscription for feedback updates
    let cleanupFunction: (() => void) | undefined;
    
    const setupRealtimeSubscription = async () => {
      try {
        const { data: userData } = await supabase.auth.getUser();
        const user = userData?.user;
        if (!user) return;
        
        const channel = supabase
          .channel('feedback-updates')
          .on('postgres_changes', 
            {
              event: '*',
              schema: 'public',
              table: 'feedback',
              filter: `user_id=eq.${user.id}`
            }, 
            () => {
              fetchFeedbacks();
            }
          )
          .subscribe();
          
        cleanupFunction = () => {
          supabase.removeChannel(channel);
        };
      } catch (error) {
        console.error('Error setting up realtime subscription:', error);
      }
    };
    
    // Execute the setup function
    setupRealtimeSubscription();
    
    // Return cleanup function
    return () => {
      if (cleanupFunction) {
        cleanupFunction();
      }
    };
  }, [toast]);

  return {
    feedbacks,
    isLoadingFeedbacks,
    refreshFeedbacks: fetchFeedbacks
  };
}
