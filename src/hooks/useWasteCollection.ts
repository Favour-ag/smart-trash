// hooks/useWasteCollection.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface WasteCollectionSchedule {
  id: string;
  collection_type: string;
  frequency: string;
  weekday: number;
  start_date: string;
  end_date?: string;
  created_at: string;
  updated_at: string;
}

export interface CollectionException {
  id: string;
  schedule_id: string;
  exception_date: string;
  reason?: string;
}

export interface CollectionAlert {
  id: string;
  resident_id: string;
  schedule_id: string;
  collection_date: string;
  reason?: string;
  status: string;
}

export function useWasteSchedules() {
  return useQuery({
    queryKey: ["waste-schedules"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("waste_collection_schedules")
        .select("*")
        .order("weekday", { ascending: true })
        .order("collection_type", { ascending: true });

      if (error) throw error;
      return data as WasteCollectionSchedule[];
    },
  });
}

export function useScheduleExceptions(scheduleId?: string) {
  return useQuery({
    queryKey: ["schedule-exceptions", scheduleId],
    queryFn: async () => {
      if (!scheduleId) return [];

      const { data, error } = await supabase
        .from("waste_collection_exceptions")
        .select("*")
        .eq("schedule_id", scheduleId)
        .order("exception_date", { ascending: true });

      if (error) throw error;
      return data as CollectionException[];
    },
    enabled: !!scheduleId,
  });
}

export function useAddWasteSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      schedule: Omit<
        WasteCollectionSchedule,
        "id" | "created_at" | "updated_at"
      >
    ) => {
      const { data, error } = await supabase
        .from("waste_collection_schedules")
        .insert(schedule)
        .select()
        .single();

      if (error) throw error;
      return data as WasteCollectionSchedule;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["waste-schedules"]);
      toast({
        title: "Schedule created",
        description: "The waste collection schedule has been added.",
      });
    },
  });
}

export function useUpdateWasteSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      schedule: Partial<WasteCollectionSchedule> & { id: string }
    ) => {
      const { data, error } = await supabase
        .from("waste_collection_schedules")
        .update({
          ...schedule,
          updated_at: new Date().toISOString(),
        })
        .eq("id", schedule.id)
        .select()
        .single();

      if (error) throw error;
      return data as WasteCollectionSchedule;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["waste-schedules"]);
      toast({
        title: "Schedule updated",
        description: "The waste collection schedule has been updated.",
      });
    },
  });
}

export function useDeleteWasteSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("waste_collection_schedules")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["waste-schedules"]);
      toast({
        title: "Schedule deleted",
        description: "The waste collection schedule has been removed.",
      });
    },
  });
}

// Hook for resident alerts
export function useResidentAlerts(residentId?: string) {
  return useQuery({
    queryKey: ["resident-alerts", residentId],
    queryFn: async () => {
      if (!residentId) return [];

      const { data, error } = await supabase
        .from("waste_collection_alerts")
        .select("*, schedule:schedule_id(*)")
        .eq("resident_id", residentId)
        .order("collection_date", { ascending: true });

      if (error) throw error;
      return data as (CollectionAlert & {
        schedule: WasteCollectionSchedule;
      })[];
    },
    enabled: !!residentId,
  });
}

export function useCreateAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      alert: Omit<
        CollectionAlert,
        "id" | "status" | "created_at" | "updated_at"
      >
    ) => {
      const { data, error } = await supabase
        .from("waste_collection_alerts")
        .insert({
          ...alert,
          status: "PENDING",
        })
        .select()
        .single();

      if (error) throw error;
      return data as CollectionAlert;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(["resident-alerts", variables.resident_id]);
      toast({
        title: "Alert submitted",
        description:
          "Your collection alert has been sent to the waste managers.",
      });
    },
  });
}
