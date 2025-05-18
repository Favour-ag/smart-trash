import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { toast } from "@/hooks/use-toast";

export interface PaymentReceipt {
  id: string;
  resident_id: string;
  receipt_url: string;
  status: string;
  created_at: string;
  updated_at: string;
  original_file_name?: string;
  file_name?: string;
}

export function usePaymentReceipts(residentId?: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["payment-receipts", residentId],
    queryFn: async () => {
      if (!residentId) return [];

      const { data, error } = await supabase
        .from("payment_receipts")
        .select("*")
        .eq("resident_id", residentId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching payment receipts:", error);
        throw error;
      }

      return data as PaymentReceipt[];
    },
    enabled: !!residentId,
  });

  useEffect(() => {
    if (!residentId) return;

    // Subscribe to real-time changes on the payment_receipts table
    const channel = supabase
      .channel(`payment-receipts-changes-${residentId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "payment_receipts",
          filter: `resident_id=eq.${residentId}`,
        },
        (payload) => {
          console.log("Payment receipt change received:", payload);
          queryClient.invalidateQueries({
            queryKey: ["payment-receipts", residentId],
          });
          // Also invalidate resident info since payment status might change
          queryClient.invalidateQueries({ queryKey: ["resident-info"] });
          queryClient.invalidateQueries({ queryKey: ["all-residents-info"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [residentId, queryClient]);

  return query;
}

export function useAddPaymentReceipt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      residentId,
      receiptUrl,
      fileName,
    }: {
      residentId: string;
      receiptUrl: string;
      fileName?: string;
    }) => {
      const { data, error } = await supabase
        .from("payment_receipts")
        .insert({
          resident_id: residentId,
          receipt_url: receiptUrl,
          status: "PENDING",
          original_file_name: fileName,
        })
        .select("*")
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, { residentId }) => {
      queryClient.invalidateQueries({
        queryKey: ["payment-receipts", residentId],
      });
      queryClient.invalidateQueries({ queryKey: ["resident-info"] });
    },
  });
}

export function useUpdatePaymentReceiptStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string;
      status: "APPROVED" | "REJECTED" | "PENDING";
    }) => {
      // First get the resident ID for this receipt
      const { data: receipt, error: fetchError } = await supabase
        .from("payment_receipts")
        .select("resident_id")
        .eq("id", id)
        .single();

      if (fetchError) throw fetchError;

      // Update the receipt status
      const { error } = await supabase
        .from("payment_receipts")
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw error;

      return { residentId: receipt.resident_id };
    },
    onSuccess: (data) => {
      // Invalidate all related queries
      queryClient.invalidateQueries({
        queryKey: ["payment-receipts", data.residentId],
      });
      queryClient.invalidateQueries({
        queryKey: ["resident-info"],
      });
      queryClient.invalidateQueries({
        queryKey: ["all-residents-info"],
      });
    },
  });
}

// Function to check if all receipts for a resident are approved
export async function checkAllReceiptsApproved(residentId: string) {
  const { data, error } = await supabase
    .from("payment_receipts")
    .select("status")
    .eq("resident_id", residentId);

  if (error) {
    console.error("Error checking receipts status:", error);
    return false;
  }

  if (!data || data.length === 0) return false;

  return data.every((receipt) => receipt.status === "APPROVED");
}
