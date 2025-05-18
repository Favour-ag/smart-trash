
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Area {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

// Benin City areas as requested
export const beninCityAreas = [
  'Siluko',
  'Ugbor (First)',
  'Ugbor (Second)',
  'RingRoad',
  'Ikpoba Hill',
  'Sapele Road',
  'Amagba',
  'Airport',
];

export function useAreas() {
  return useQuery({
    queryKey: ['areas'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('areas')
        .select('*')
        .order('name', { ascending: true });
        
      if (error) {
        console.error('Error fetching areas:', error);
        throw error;
      }
      
      // If no areas in the database, or missing any of our predefined areas,
      // return our predefined list instead
      if (!data || data.length === 0) {
        // Return mock data with IDs since actual data isn't available
        return beninCityAreas.map((name, index) => ({
          id: `area-${index}`,
          name,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })) as Area[];
      }
      
      return data as Area[];
    }
  });
}

export function useArea(areaId?: string) {
  return useQuery({
    queryKey: ['area', areaId],
    queryFn: async () => {
      if (!areaId) return null;
      
      const { data, error } = await supabase
        .from('areas')
        .select('*')
        .eq('id', areaId)
        .single();
        
      if (error) {
        if (error.code === 'PGRST116') {
          return null; // No data found
        }
        console.error('Error fetching area:', error);
        throw error;
      }
      
      return data as Area;
    },
    enabled: !!areaId,
  });
}
