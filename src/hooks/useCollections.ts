
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

type CollectionStatus = 'PENDING' | 'COLLECTED' | 'MISSED' | 'CANCELLED';

export interface Collection {
  id: string;
  collection_date: string;
  status: CollectionStatus;
  schedule_id: string;
  area?: {
    name: string;
  };
  waste_type?: string;
}

export function useCollections(filter?: string) {
  return useQuery({
    queryKey: ['collections', filter],
    queryFn: async () => {
      try {
        let query = supabase
          .from('collections')
          .select('*');
        
        if (filter && filter !== 'all') {
          // Cast the filter to CollectionStatus to satisfy TypeScript
          query = query.eq('status', filter as CollectionStatus);
        }
        
        const { data, error } = await query;
        
        if (error) {
          console.error('Error fetching collections:', error);
          throw new Error('Failed to fetch collections');
        }
        
        // Map the data to match our Collection interface
        const collections = (data || []).map(item => {
          const collection: Collection = {
            id: item.id,
            collection_date: item.collection_date,
            status: item.status as CollectionStatus,
            schedule_id: item.schedule_id,
            waste_type: 'General Waste' // Default value since we don't have this in the current schema
          };
          
          // Add a placeholder area since we can't properly join
          collection.area = { name: 'Unknown Area' };
          
          return collection;
        });
        
        return collections;
      } catch (error) {
        console.error('Error in collections query:', error);
        return [] as Collection[];
      }
    }
  });
}
