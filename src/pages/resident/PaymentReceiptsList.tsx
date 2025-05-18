import React from "react";
import { usePaymentReceipts, PaymentReceipt } from "@/hooks/usePaymentReceipts";
import { format } from "date-fns";
import { ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface PaymentReceiptsListProps {
  residentId: string;
  compact?: boolean;
}

const getStatusBadgeStyle = (status: string) => {
  switch (status.toUpperCase()) {
    case "APPROVED":
      return "bg-green-100 text-green-800 border-green-200";
    case "REJECTED":
      return "bg-red-100 text-red-800 border-red-200";
    default:
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
  }
};

const PaymentReceiptsList: React.FC<PaymentReceiptsListProps> = ({
  residentId,
  compact = false,
}) => {
  const { data: receipts = [], isLoading } = usePaymentReceipts(residentId);

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-12 bg-gray-200 animate-pulse rounded"></div>
        ))}
      </div>
    );
  }

  if (receipts.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        No payment receipts found.
      </p>
    );
  }

  return (
    <div className={`space-y-3 ${compact ? "" : "mt-4"}`}>
      {receipts.map((receipt) => (
        <div
          key={receipt.id}
          className="flex justify-between items-center p-3 border rounded-md"
        >
          <div>
            <div className="flex items-center gap-2">
              <a
                href={receipt.receipt_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 flex items-center gap-1 font-medium"
              >
                <ExternalLink className="h-4 w-4" />
                View Receipt
              </a>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Uploaded on {format(new Date(receipt.created_at), "MMM d, yyyy")}
            </div>
          </div>
          <Badge
            variant="outline"
            className={getStatusBadgeStyle(receipt.status)}
          >
            {receipt.status || "PENDING"}
          </Badge>
        </div>
      ))}
    </div>
  );
};

export default PaymentReceiptsList;
