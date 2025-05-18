import React, { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, CheckCircle, XCircle } from "lucide-react";
import {
  usePaymentReceipts,
  useUpdatePaymentReceiptStatus,
} from "@/hooks/usePaymentReceipts";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

interface ResidentReceiptsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  residentId: string;
  residentName: string;
}

const ResidentReceiptsModal: React.FC<ResidentReceiptsModalProps> = ({
  open,
  onOpenChange,
  residentId,
  residentName,
}) => {
  const {
    data: receipts = [],
    isLoading,
    refetch,
  } = usePaymentReceipts(residentId);
  const updateStatus = useUpdatePaymentReceiptStatus();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!open || !residentId) return;

    // Subscribe to real-time changes for this resident's receipts
    const channel = supabase
      .channel(`admin-receipt-changes-${residentId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "payment_receipts",
          filter: `resident_id=eq.${residentId}`,
        },
        (payload) => {
          console.log("Admin receipt change detected:", payload);
          queryClient.invalidateQueries({
            queryKey: ["payment-receipts", residentId],
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [open, residentId, queryClient]);

  const handleStatusUpdate = async (
    id: string,
    status: "APPROVED" | "REJECTED"
  ) => {
    try {
      await updateStatus.mutateAsync({ id, status });
      toast({
        title: "Status updated",
        description: `Receipt marked as ${status.toLowerCase()}.`,
      });
      // Explicitly refetch to ensure we have the latest data
      refetch();

      // Also invalidate other related queries
      queryClient.invalidateQueries({ queryKey: ["resident-info"] });
      queryClient.invalidateQueries({ queryKey: ["all-residents-info"] });

      console.log(`Receipt ${id} status updated to ${status}`);
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        title: "Update failed",
        description: "Failed to update receipt status.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case "APPROVED":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            Approved
          </Badge>
        );
      case "REJECTED":
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200">
            Rejected
          </Badge>
        );
      default:
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
            Pending
          </Badge>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Payment Receipts for {residentName}</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-12 bg-gray-200 animate-pulse rounded"
              ></div>
            ))}
          </div>
        ) : (
          <div className="overflow-auto max-h-[60vh]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date Submitted</TableHead>
                  <TableHead>Receipt</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {receipts.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center py-4 text-muted-foreground"
                    >
                      No payment receipts found
                    </TableCell>
                  </TableRow>
                ) : (
                  receipts.map((receipt) => (
                    <TableRow key={receipt.id}>
                      <TableCell>
                        {format(new Date(receipt.created_at), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell>
                        <a
                          href={receipt.receipt_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-blue-600 hover:text-blue-800"
                        >
                          <ExternalLink className="h-4 w-4 mr-1" />
                          View Receipt
                        </a>
                      </TableCell>
                      <TableCell>{getStatusBadge(receipt.status)}</TableCell>
                      <TableCell className="text-right space-x-2">
                        {receipt.status !== "APPROVED" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-green-600 hover:text-green-800 hover:bg-green-50 p-1"
                            onClick={() =>
                              handleStatusUpdate(receipt.id, "APPROVED")
                            }
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
                        {receipt.status !== "REJECTED" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-600 hover:text-red-800 hover:bg-red-50 p-1"
                            onClick={() =>
                              handleStatusUpdate(receipt.id, "REJECTED")
                            }
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ResidentReceiptsModal;
