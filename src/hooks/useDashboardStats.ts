
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface DashboardStats {
  completed_collections: number;
  pending_collections: number;
  missed_collections: number;
  user_feedback_count: number;
  total_feedback_count: number;
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      // Since we can't use RLS on views, let's query the collections and feedback tables directly
      // and compute the statistics
      
      // Get collections statistics
      const collectionsPromise = supabase
        .from('collections')
        .select('status');
      
      // Get feedback statistics
      const feedbackPromise = supabase
        .from('feedback')
        .select('user_id');
      
      // Get current user
      const userPromise = supabase.auth.getUser();
      
      // Await all promises
      const [collectionsResult, feedbackResult, userResult] = await Promise.all([
        collectionsPromise, 
        feedbackPromise, 
        userPromise
      ]);
      
      if (collectionsResult.error) {
        console.error('Error fetching collections:', collectionsResult.error);
        throw new Error('Failed to fetch collections');
      }
      
      if (feedbackResult.error) {
        console.error('Error fetching feedback:', feedbackResult.error);
        throw new Error('Failed to fetch feedback');
      }
      
      const collections = collectionsResult.data || [];
      const feedback = feedbackResult.data || [];
      const currentUserId = userResult.data.user?.id;
      
      // Calculate statistics
      const stats: DashboardStats = {
        completed_collections: collections.filter(c => c.status === 'COLLECTED').length,
        pending_collections: collections.filter(c => c.status === 'PENDING').length,
        missed_collections: collections.filter(c => c.status === 'MISSED').length,
        user_feedback_count: currentUserId ? feedback.filter(f => f.user_id === currentUserId).length : 0,
        total_feedback_count: feedback.length
      };
      
      return stats;
    }
  });
}
