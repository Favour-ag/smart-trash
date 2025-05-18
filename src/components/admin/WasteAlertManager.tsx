import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  useWasteAlerts,
  useUpdateWasteAlertStatus,
} from "@/hooks/useWasteAlerts";
import { useCreateWasteCollection } from "@/hooks/useWasteCollections";
import { useAreas } from "@/hooks/useAreas";
import { format, parseISO, addDays } from "date-fns";
import { toast } from "@/hooks/use-toast";
import {
  Loader2,
  AlertCircle,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Info,
} from "lucide-react";

const WasteAlertsManager = () => {
  const { data: alerts = [], isLoading } = useWasteAlerts(undefined, true);
  const { data: areas = [] } = useAreas();
  const updateAlertStatus = useUpdateWasteAlertStatus();
  const createCollection = useCreateWasteCollection();

  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<any | null>(null);
  const [collectionDate, setCollectionDate] = useState<Date | undefined>(
    undefined
  );
  const [collectionTime, setCollectionTime] = useState("");
  const [notes, setNotes] = useState("");

  // Filter out non-pending alerts
  const pendingAlerts = alerts.filter((alert) => alert.status === "PENDING");

  const handleSchedule = (alert: any) => {
    setSelectedAlert(alert);
    setScheduleDialogOpen(true);

    // Set default collection date to preferred date if available
    if (alert.preferred_date) {
      setCollectionDate(parseISO(alert.preferred_date));
    } else {
      setCollectionDate(undefined);
    }

    // Set default collection time based on preferred time
    setCollectionTime(alert.preferred_time || "");
    setNotes("");
  };

  const handleCancelAlert = async (alertId: string) => {
    try {
      await updateAlertStatus.mutateAsync({
        id: alertId,
        status: "CANCELLED",
      });

      toast({
        title: "Alert Cancelled",
        description: "The waste alert has been cancelled.",
      });
    } catch (error) {
      console.error("Failed to cancel alert:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to cancel the alert. Please try again.",
      });
    }
  };

  const handleScheduleCollection = async () => {
    if (!selectedAlert || !collectionDate) {
      toast({
        variant: "destructive",
        title: "Missing information",
        description: "Please select a collection date.",
      });
      return;
    }

    try {
      await createCollection.mutateAsync({
        residentId: selectedAlert.resident_id,
        collectionDate: format(collectionDate, "yyyy-MM-dd"),
        collectionTime: collectionTime || undefined,
        wasteType: selectedAlert.waste_type,
        notes,
        alertId: selectedAlert.id,
      });

      setScheduleDialogOpen(false);
    } catch (error) {
      console.error("Failed to schedule collection:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to schedule collection. Please try again.",
      });
    }
  };

  // Calculate minimum date (tomorrow)
  const minDate = addDays(new Date(), 1);

  const getStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case "SCHEDULED":
        return <Badge className="bg-blue-500">Scheduled</Badge>;
      case "COLLECTED":
        return <Badge className="bg-green-500">Collected</Badge>;
      case "CANCELLED":
        return <Badge className="bg-gray-500">Cancelled</Badge>;
      default:
        return <Badge className="bg-yellow-500">Pending</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Waste Collection Alerts
          </h1>
          <p className="text-muted-foreground">
            Manage resident waste collection requests.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : pendingAlerts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <AlertCircle className="mx-auto h-8 w-8 mb-2" />
              <p>No pending waste collection alerts.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingAlerts.map((alert: any) => (
                <Card
                  key={alert.id}
                  className="overflow-hidden border-l-4 border-l-yellow-500"
                >
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{alert.waste_type}</h3>
                          {getStatusBadge(alert.status)}
                        </div>

                        <p className="text-sm text-gray-700">
                          {alert.description}
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                          {alert.preferred_date && (
                            <div className="flex items-center gap-1">
                              <CalendarIcon className="h-4 w-4 text-gray-500" />
                              <span>
                                Preferred date:{" "}
                                {format(
                                  parseISO(alert.preferred_date),
                                  "MMM d, yyyy"
                                )}
                              </span>
                            </div>
                          )}

                          {alert.preferred_time && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4 text-gray-500" />
                              <span>
                                Preferred time: {alert.preferred_time}
                              </span>
                            </div>
                          )}

                          {alert.location_details && (
                            <div className="flex items-center gap-1 col-span-full">
                              <MapPin className="h-4 w-4 text-gray-500" />
                              <span>Details: {alert.location_details}</span>
                            </div>
                          )}
                        </div>

                        <div className="text-sm text-gray-500">
                          <strong>From:</strong>{" "}
                          {alert.resident_info?.full_name || "Unknown"} •
                          {alert.resident_info?.street_address &&
                            ` ${alert.resident_info.house_number || ""} ${
                              alert.resident_info.street_address
                            }`}
                        </div>

                        <div className="text-xs text-gray-400">
                          Submitted on{" "}
                          {format(
                            parseISO(alert.created_at),
                            "MMM d, yyyy 'at' h:mm a"
                          )}
                        </div>
                      </div>

                      <div className="flex flex-row sm:flex-col gap-2 sm:min-w-[120px] justify-end">
                        <Button
                          onClick={() => handleSchedule(alert)}
                          className="flex-1 sm:flex-none"
                        >
                          Schedule
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handleCancelAlert(alert.id)}
                          className="flex-1 sm:flex-none"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Schedule Collection Dialog */}
      <Dialog open={scheduleDialogOpen} onOpenChange={setScheduleDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Schedule Waste Collection</DialogTitle>
          </DialogHeader>

          {selectedAlert && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex items-start gap-2">
                  <Info className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div>
                    <p className="font-medium">
                      {selectedAlert.waste_type} -{" "}
                      {selectedAlert.resident_info?.full_name}
                    </p>
                    <p className="text-sm text-gray-600">
                      {selectedAlert.description}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Collection Date*</label>
                <div className="border rounded-md mt-2">
                  <Calendar
                    mode="single"
                    selected={collectionDate}
                    onSelect={setCollectionDate}
                    disabled={(date) => date < minDate}
                    initialFocus
                  />
                </div>
                {selectedAlert.preferred_date && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Resident preferred date:{" "}
                    {format(
                      parseISO(selectedAlert.preferred_date),
                      "MMM d, yyyy"
                    )}
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium">Collection Time</label>
                <Select
                  value={collectionTime}
                  onValueChange={setCollectionTime}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select time window" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Morning (7AM-12PM)">
                      Morning (7AM-12PM)
                    </SelectItem>
                    <SelectItem value="Afternoon (12PM-5PM)">
                      Afternoon (12PM-5PM)
                    </SelectItem>
                    <SelectItem value="Evening (5PM-8PM)">
                      Evening (5PM-8PM)
                    </SelectItem>
                  </SelectContent>
                </Select>
                {selectedAlert.preferred_time && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Resident preferred time: {selectedAlert.preferred_time}
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium">Notes (Optional)</label>
                <Textarea
                  placeholder="Add any additional notes for the collection"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setScheduleDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleScheduleCollection}
              disabled={!collectionDate || createCollection.isPending}
            >
              {createCollection.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Scheduling...
                </>
              ) : (
                "Schedule Collection"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WasteAlertsManager;
