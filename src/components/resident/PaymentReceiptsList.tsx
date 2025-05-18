import React, { useEffect } from "react";
import { usePaymentReceipts } from "@/hooks/usePaymentReceipts";
import { Badge } from "@/components/ui/badge";
import { FileIcon, CheckCircle, XCircle, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

interface PaymentReceiptsListProps {
  residentId: string;
}

const PaymentReceiptsList = ({ residentId }: PaymentReceiptsListProps) => {
  const { data: receipts, isLoading, isError } = usePaymentReceipts(residentId);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!residentId) return;

    // Subscribe to real-time changes specific to this resident's receipts
    const channel = supabase
      .channel(`resident-receipt-changes-${residentId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "payment_receipts",
          filter: `resident_id=eq.${residentId}`,
        },
        (payload) => {
          console.log("Resident receipt change detected:", payload);
          // Invalidate the query to refresh the data
          queryClient.invalidateQueries({
            queryKey: ["payment-receipts", residentId],
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [residentId, queryClient]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-tw-purple-600 border-t-transparent"></div>
        <span className="ml-2">Loading receipts...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-red-500 py-4">
        Failed to load payment receipts. Please try again later.
      </div>
    );
  }

  if (!receipts || receipts.length === 0) {
    return (
      <div className="text-muted-foreground py-4">
        No payment receipts found.
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
        return (
          <Badge className="bg-green-500">
            <CheckCircle className="h-3 w-3 mr-1" /> Approved
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-red-500">
            <XCircle className="h-3 w-3 mr-1" /> Rejected
          </Badge>
        );
      case "pending":
      default:
        return (
          <Badge className="bg-yellow-500">
            <Clock className="h-3 w-3 mr-1" /> Pending
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-4">
      {receipts.map((receipt) => (
        <div
          key={receipt.id}
          className="border rounded-md p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex items-center mb-2 sm:mb-0">
            <FileIcon className="h-5 w-5 mr-2 text-muted-foreground" />
            <div>
              <p className="font-medium">
                {receipt.original_file_name || receipt.file_name || "Receipt"}
              </p>
              <p className="text-xs text-muted-foreground">
                {new Date(receipt.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2 mt-2 sm:mt-0">
            {getStatusBadge(receipt.status)}
            <a
              href={receipt.receipt_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:underline"
            >
              View
            </a>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PaymentReceiptsList;
