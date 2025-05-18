import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

export interface ResidentInfo {
  id: string;
  user_id: string;
  full_name: string;
  street_address: string;
  house_number: string;
  occupation: string | null;
  profile_photo_url: string | null;
  created_at: string;
  updated_at: string;
}

export function useResidentInfo() {
  return useQuery({
    queryKey: ["resident-info"],
    queryFn: async () => {
      const { data: userData, error: userError } =
        await supabase.auth.getUser();
      if (userError || !userData.user) {
        throw new Error("Not authenticated");
      }

      // Changed table name from "residents" to "resident_info" to match the actual table name
      const { data, error } = await supabase
        .from("resident_info")
        .select("*")
        .eq("user_id", userData.user.id)
        .maybeSingle(); // Use maybeSingle instead of single to handle no rows case

      if (error) {
        // Only throw if it's not the PGRST116 error (which means no results)
        console.error("Error fetching resident info:", error);
        throw error;
      }

      return data as ResidentInfo | null;
    },
  });
}

export function useUpdateResidentInfo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: Partial<ResidentInfo>) => {
      console.log("Updating resident with data:", updates); // Add logging

      const { data: userData, error: userError } =
        await supabase.auth.getUser();
      if (userError || !userData.user) {
        throw new Error("Not authenticated");
      }

      // Check if resident exists
      const { data: existingResident, error: checkError } = await supabase
        .from("resident_info")
        .select("id")
        .eq("user_id", userData.user.id)
        .maybeSingle(); // Use maybeSingle instead of single

      if (checkError) {
        console.error("Error checking resident info:", checkError);
        throw checkError;
      }

      if (!existingResident) {
        console.log("Creating new resident");
        // Create new resident
        const { data, error } = await supabase
          .from("resident_info")
          .insert({
            user_id: userData.user.id,
            ...updates,
          })
          .select()
          .single();

        if (error) {
          console.error("Error creating resident:", error);
          throw error;
        }

        toast({
          title: "Profile created",
          description: "Your profile has been created successfully.",
        });

        return data;
      } else {
        console.log("Updating existing resident");
        // Update existing resident
        const { data, error } = await supabase
          .from("resident_info")
          .update({
            ...updates,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", userData.user.id)
          .select()
          .single();

        if (error) {
          console.error("Error updating resident:", error);
          throw error;
        }
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resident-info"] });
    },
  });
}

export function useAllResidentsInfo() {
  return useQuery({
    queryKey: ["all-residents-info"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("resident_info")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching all residents:", error);
        throw error;
      }

      return data as ResidentInfo[];
    },
  });
}
