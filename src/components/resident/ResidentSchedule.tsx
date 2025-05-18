// components/ResidentScheduleView.tsx
import React, { useState } from "react";
import {
  useWasteSchedules,
  useScheduleExceptions,
  useResidentAlerts,
  useCreateAlert,
} from "@/hooks/useWasteCollection";
import { generateUpcomingCollections } from "@/utils/scheduleGenerator";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import AlertForm from "./AlertForm";

const ResidentScheduleView = ({ residentId }: { residentId: string }) => {
  const { data: schedules } = useWasteSchedules();
  const { data: exceptions } = useScheduleExceptions();
  const { data: alerts } = useResidentAlerts(residentId);
  const [showAlertForm, setShowAlertForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const { toast } = useToast();

  if (!schedules || !exceptions) return <div>Loading...</div>;

  const upcomingCollections = generateUpcomingCollections(
    schedules,
    exceptions
  );

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Upcoming Waste Collections</h2>

      <div className="space-y-2">
        {upcomingCollections.map((collection) => {
          const hasAlert = alerts?.some(
            (a) =>
              new Date(a.collection_date).toDateString() ===
                collection.date.toDateString() &&
              a.schedule_id === collection.scheduleId
          );

          return (
            <div
              key={`${collection.date.toISOString()}-${collection.type}`}
              className="border rounded-md p-4 flex justify-between items-center"
            >
              <div>
                <h3 className="font-medium">{collection.type} Collection</h3>
                <p className="text-sm text-muted-foreground">
                  {collection.date.toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>

              {hasAlert ? (
                <span className="text-sm text-yellow-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" /> Alert sent
                </span>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedDate(collection.date);
                    setShowAlertForm(true);
                  }}
                >
                  Report Issue
                </Button>
              )}
            </div>
          );
        })}
      </div>

      {showAlertForm && selectedDate && (
        <AlertForm
          residentId={residentId}
          scheduleId={
            upcomingCollections.find(
              (c) => c.date.toDateString() === selectedDate.toDateString()
            )?.scheduleId || ""
          }
          collectionDate={selectedDate.toISOString()}
          onClose={() => setShowAlertForm(false)}
        />
      )}
    </div>
  );
};

export default ResidentScheduleView;
