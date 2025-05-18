// components/AlertForm.tsx
import React, { useState } from "react";
import { useCreateAlert } from "@/hooks/useWasteCollection";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";

const AlertForm = ({
  residentId,
  scheduleId,
  collectionDate,
  onClose,
}: {
  residentId: string;
  scheduleId: string;
  collectionDate: string;
  onClose: () => void;
}) => {
  const [reason, setReason] = useState("");
  const createAlert = useCreateAlert();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createAlert.mutateAsync({
        resident_id: residentId,
        schedule_id: scheduleId,
        collection_date: collectionDate,
        reason,
      });
      onClose();
    } catch (error) {
      console.error("Failed to submit alert:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-bold mb-4">
          Report Collection Issue for{" "}
          {format(new Date(collectionDate), "MMMM d, yyyy")}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="reason">Reason (optional)</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="E.g., Will be traveling, bin is damaged..."
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Submit Alert</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AlertForm;
