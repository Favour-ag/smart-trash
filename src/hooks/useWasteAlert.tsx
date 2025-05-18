import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { toast } from "@/hooks/use-toast";

export interface WasteAlert {
  id: string;
  resident_id: string;
  status: "PENDING" | "SCHEDULED" | "COLLECTED" | "CANCELLED";
  waste_type: string;
  description: string;
  preferred_date: string | null;
  preferred_time: string | null;
  location_details: string | null;
  created_at: string;
  updated_at: string;
}

export function useWasteAlerts(residentId?: string, isAdmin: boolean = false) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["waste-alerts", residentId, isAdmin],
    queryFn: async () => {
      let query = supabase.from("waste_alerts").select(`
        *,
        resident_info:resident_id (full_name, street_address, house_number)
      `);

      // If resident ID is provided and not in admin mode, filter by resident
      if (residentId && !isAdmin) {
        query = query.eq("resident_id", residentId);
      }

      const { data, error } = await query.order("created_at", {
        ascending: false,
      });

      if (error) {
        console.error("Error fetching waste alerts:", error);
        throw error;
      }

      return data;
    },
    enabled: isAdmin || !!residentId,
  });

  // Subscribe to real-time changes
  useEffect(() => {
    if (!residentId && !isAdmin) return;

    let channel;

    if (isAdmin) {
      // Admin subscribes to all alerts
      channel = supabase
        .channel("admin-waste-alerts")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "waste_alerts",
          },
          (payload) => {
            console.log("Waste alert change received:", payload);
            queryClient.invalidateQueries({
              queryKey: ["waste-alerts", residentId, isAdmin],
            });
          }
        )
        .subscribe();
    } else {
      // Resident subscribes only to their alerts
      channel = supabase
        .channel(`waste-alerts-${residentId}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "waste_alerts",
            filter: `resident_id=eq.${residentId}`,
          },
          (payload) => {
            console.log("Waste alert change received:", payload);
            queryClient.invalidateQueries({
              queryKey: ["waste-alerts", residentId, isAdmin],
            });
          }
        )
        .subscribe();
    }

    return () => {
      supabase.removeChannel(channel);
    };
  }, [residentId, isAdmin, queryClient]);

  return query;
}

export function useCreateWasteAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      residentId,
      wasteType,
      description,
      preferredDate,
      preferredTime,
      locationDetails,
    }: {
      residentId: string;
      wasteType: string;
      description: string;
      preferredDate?: string;
      preferredTime?: string;
      locationDetails?: string;
    }) => {
      const { data, error } = await supabase
        .from("waste_alerts")
        .insert({
          resident_id: residentId,
          waste_type: wasteType,
          description,
          status: "PENDING",
          preferred_date: preferredDate,
          preferred_time: preferredTime,
          location_details: locationDetails,
        })
        .select("*")
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, { residentId }) => {
      queryClient.invalidateQueries({
        queryKey: ["waste-alerts", residentId, false],
      });
      queryClient.invalidateQueries({
        queryKey: ["waste-alerts", undefined, true],
      });
      toast({
        title: "Alert Submitted",
        description:
          "Your waste collection alert has been submitted successfully.",
      });
    },
  });
}

export function useUpdateWasteAlertStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      status,
      collectionId,
    }: {
      id: string;
      status: "PENDING" | "SCHEDULED" | "COLLECTED" | "CANCELLED";
      collectionId?: string;
    }) => {
      const { data: alert, error: fetchError } = await supabase
        .from("waste_alerts")
        .select("resident_id")
        .eq("id", id)
        .single();

      if (fetchError) throw fetchError;

      const updates: any = {
        status,
        updated_at: new Date().toISOString(),
      };

      // If we're setting to scheduled and have a collection ID, add it
      if (status === "SCHEDULED" && collectionId) {
        updates.collection_id = collectionId;
      }

      const { error } = await supabase
        .from("waste_alerts")
        .update(updates)
        .eq("id", id);

      if (error) throw error;

      return { residentId: alert.resident_id };
    },
    onSuccess: (data) => {
      // Invalidate all related queries
      queryClient.invalidateQueries({
        queryKey: ["waste-alerts", data.residentId, false],
      });
      queryClient.invalidateQueries({
        queryKey: ["waste-alerts", undefined, true],
      });
    },
  });
}
