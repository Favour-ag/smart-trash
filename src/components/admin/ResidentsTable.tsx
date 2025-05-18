import React, { useState, useEffect } from "react";
import { useAllResidentsInfo, ResidentInfo } from "@/hooks/useResidentInfo";
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
import { format } from "date-fns";
import { FileText, CheckCircle, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ResidentReceiptsModal from "./ResidentReceiptsModal";
import { useQueryClient } from "@tanstack/react-query";

const ResidentsTable = () => {
  const { data: residents = [], isLoading, refetch } = useAllResidentsInfo();
  const { toast } = useToast();
  const [selectedResident, setSelectedResident] = useState<ResidentInfo | null>(
    null
  );
  const [receiptsModalOpen, setReceiptsModalOpen] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel("resident-table-updates")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "payment_receipts" },
        (payload) => {
          console.log("Payment receipt change detected:", payload);
          queryClient.invalidateQueries({ queryKey: ["all-residents-info"] });
          queryClient.invalidateQueries({ queryKey: ["payment-receipts"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const showReceipts = (resident: ResidentInfo) => {
    setSelectedResident(resident);
    setReceiptsModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-10 bg-gray-200 animate-pulse rounded"></div>
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-16 bg-gray-200 animate-pulse rounded"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Address</TableHead>
            <TableHead>Date Joined</TableHead>
            <TableHead>Payment Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {residents.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={5}
                className="text-center py-6 text-muted-foreground"
              >
                No residents found
              </TableCell>
            </TableRow>
          ) : (
            residents.map((resident) => (
              <TableRow key={resident.id}>
                <TableCell className="font-medium">
                  {resident.full_name}
                </TableCell>
                <TableCell>
                  {resident.street_address}, {resident.house_number}
                </TableCell>
                <TableCell>
                  {format(new Date(resident.created_at), "MMM d, yyyy")}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={
                      resident.payment_status === "APPROVED"
                        ? "bg-green-100 text-green-800 border-green-200"
                        : resident.payment_status === "REJECTED"
                        ? "bg-red-100 text-red-800 border-red-200"
                        : "bg-yellow-100 text-yellow-800 border-yellow-200"
                    }
                  >
                    {resident.payment_status || "PENDING"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-1"
                    onClick={() => showReceipts(resident)}
                  >
                    <FileText className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {selectedResident && (
        <ResidentReceiptsModal
          open={receiptsModalOpen}
          onOpenChange={setReceiptsModalOpen}
          residentId={selectedResident.id}
          residentName={selectedResident.full_name}
        />
      )}
    </div>
  );
};

export default ResidentsTable;
