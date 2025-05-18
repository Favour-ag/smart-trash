import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface AdminStats {
  totalResidents: number;
  collectionSuccessRate: number;
  pendingIssues: number;
  todayCollections: number;
  todayCollectionProgress: number;
  areaProgress: {
    name: string;
    progress: number;
  }[];
  wasteDistribution: {
    general: number;
    recycling: number;
    organic: number;
    hazardous: number;
  };
  feedbackStats: {
    positive: number;
    neutral: number;
    negative: number;
  };
}

export function useAdminStats() {
  return useQuery({
    queryKey: ['admin-stats'],
    queryFn: async (): Promise<AdminStats> => {
      // Get residents count
      const { count: totalResidents, error: residentsError } = await supabase
        .from('resident_info')
        .select('*', { count: 'exact', head: true });

      if (residentsError) {
        console.error('Error fetching residents:', residentsError);
        throw new Error('Failed to fetch admin statistics');
      }

      // Get collections data for success rate calculation
      const { data: collections, error: collectionsError } = await supabase
        .from('collections')
        .select('status');
        
      if (collectionsError) {
        console.error('Error fetching collections:', collectionsError);
        throw new Error('Failed to fetch collections data');
      }
      
      const totalCollections = collections ? collections.length : 0;
      const successfulCollections = collections ? collections.filter(c => c.status === 'COLLECTED').length : 0;
      const collectionSuccessRate = totalCollections > 0 
        ? (successfulCollections / totalCollections) * 100 
        : 0;
        
      // Get pending issues count (from feedback table)
      const { count: pendingIssues, error: issuesError } = await supabase
        .from('feedback')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'NEW');
        
      if (issuesError) {
        console.error('Error fetching pending issues:', issuesError);
        throw new Error('Failed to fetch pending issues data');
      }
      
      // Get today's collections
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
      const { data: todayCollectionsData, error: todayError } = await supabase
        .from('collections')
        .select('status')
        .eq('collection_date', today);
        
      if (todayError) {
        console.error('Error fetching today\'s collections:', todayError);
        throw new Error('Failed to fetch today\'s collections data');
      }
      
      const todayCollections = todayCollectionsData ? todayCollectionsData.length : 0;
      const completedTodayCollections = todayCollectionsData 
        ? todayCollectionsData.filter(c => c.status === 'COLLECTED').length 
        : 0;
      const todayCollectionProgress = todayCollections > 0 
        ? (completedTodayCollections / todayCollections) * 100 
        : 0;

      // For area progress, we would need to join collections with areas
      // For now, let's fetch the areas at minimum and calculate mock progress
      const { data: areas, error: areasError } = await supabase
        .from('areas')
        .select('name');
        
      if (areasError) {
        console.error('Error fetching areas:', areasError);
        throw new Error('Failed to fetch areas data');
      }
      
      // Create area progress with mock data for now
      // In a real scenario, we would join with collections and calculate real progress
      const areaProgress = areas 
        ? areas.map((area, index) => ({
            name: area.name,
            progress: Math.max(30, Math.min(100, 30 + (index * 15))),
          }))
        : [];

      // For feedback stats
      // In a real scenario, we would have feedback sentiment analysis
      // For now, let's distribute any feedback entries we have
      const { count: totalFeedback, error: feedbackError } = await supabase
        .from('feedback')
        .select('*', { count: 'exact', head: true });
        
      if (feedbackError) {
        console.error('Error fetching feedback:', feedbackError);
        throw new Error('Failed to fetch feedback data');
      }

      return {
        totalResidents: totalResidents || 0,
        collectionSuccessRate: parseFloat(collectionSuccessRate.toFixed(1)),
        pendingIssues: pendingIssues || 0,
        todayCollections,
        todayCollectionProgress: parseFloat(todayCollectionProgress.toFixed(1)),
        areaProgress,
        // For waste distribution, we would need the waste_type field
        // For now, use a static distribution
        wasteDistribution: {
          general: 45,
          recycling: 30,
          organic: 20,
          hazardous: 5,
        },
        // Mock feedback stats for now
        feedbackStats: {
          positive: 65,
          neutral: 20,
          negative: 15,
        },
      };
    },
    // Refresh every minute to keep stats up to date
    refetchInterval: 60000,
  });
}
