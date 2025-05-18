
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Announcement {
  id: string;
  title: string;
  message: string;
  category: string;
  posted_at: string;
  created_at: string;
  updated_at: string;
}

export function useAnnouncements() {
  return useQuery({
    queryKey: ['announcements'],
    queryFn: async () => {
      try {
        // Since there's no announcements table yet, we'll return mock data
        // In a real implementation, we would create an announcements table
        // and fetch from it directly
        
        return [
          {
            id: '1',
            title: 'Service Interruption',
            message: 'Waste collection will be delayed by one day this week due to maintenance.',
            category: 'alert',
            posted_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: '2',
            title: 'New Recycling Guidelines',
            message: 'Please check the updated recycling guidelines on our website.',
            category: 'info',
            posted_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
            created_at: new Date(Date.now() - 86400000).toISOString(),
            updated_at: new Date(Date.now() - 86400000).toISOString()
          },
          {
            id: '3',
            title: 'Community Clean-up Day',
            message: 'Join us for the annual community clean-up this Saturday from 9am to 12pm.',
            category: 'success',
            posted_at: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
            created_at: new Date(Date.now() - 172800000).toISOString(),
            updated_at: new Date(Date.now() - 172800000).toISOString()
          }
        ] as Announcement[];
      } catch (error) {
        console.error('Error in announcements query:', error);
        return [] as Announcement[];
      }
    }
  });
}
