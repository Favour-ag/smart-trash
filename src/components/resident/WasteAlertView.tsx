import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useWasteAlerts } from "@/hooks/useWasteAlerts";
import { useWasteCollections } from "@/hooks/useWasteCollections";
import { useResidentInfo } from "@/hooks/useResidentInfo";
import { format, parseISO, isToday, isTomorrow, addDays } from "date-fns";
import AlertWasteForm from "./AlertWasteForm";
import {
  PlusCircle,
  CalendarCheck,
  Clock,
  CalendarX,
  AlertTriangle,
} from "lucide-react";

const WasteAlertsView = () => {
  const { data: residentInfo } = useResidentInfo();
  const [alertDialogOpen, setAlertDialogOpen] = useState(false);

  const { data: alerts = [], isLoading: alertsLoading } = useWasteAlerts(
    residentInfo?.id
  );

  const { data: collections = [], isLoading: collectionsLoading } =
    useWasteCollections(residentInfo?.id);

  // Get upcoming collections
  const upcomingCollections = collections.filter((collection) => {
    const collectionDate = parseISO(collection.collection_date);
    return collectionDate >= new Date() && collection.status === "PENDING";
  });

  // Get pending alerts
  const pendingAlerts = alerts.filter(
    (alert) => alert.status === "PENDING" || alert.status === "SCHEDULED"
  );

  // Get collection history
  const collectionHistory = collections.filter((collection) => {
    const collectionDate = parseISO(collection.collection_date);
    return (
      collectionDate < new Date() ||
      ["COMPLETED", "MISSED", "CANCELLED"].includes(collection.status)
    );
  });

  const getStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case "SCHEDULED":
        return <Badge className="bg-blue-100 text-blue-800">Scheduled</Badge>;
      case "COLLECTED":
      case "COMPLETED":
        return <Badge className="bg-green-100 text-green-800">Collected</Badge>;
      case "MISSED":
        return <Badge className="bg-red-100 text-red-800">Missed</Badge>;
      case "CANCELLED":
        return <Badge className="bg-gray-100 text-gray-800">Cancelled</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
    }
  };

  const getDateDisplay = (dateStr: string) => {
    const date = parseISO(dateStr);
    if (isToday(date)) {
      return "Today";
    } else if (isTomorrow(date)) {
      return "Tomorrow";
    } else {
      return format(date, "EEEE, MMM d");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            My Waste Collections
          </h1>
          <p className="text-muted-foreground">
            Request waste collection and track your alerts.
          </p>
        </div>
        <Button onClick={() => setAlertDialogOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Request Collection
        </Button>
      </div>

      {upcomingCollections.length > 0 && (
        <Card className="bg-green-50 border-green-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-green-800 flex items-center gap-2">
              <CalendarCheck className="h-5 w-5" />
              Upcoming Collections
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingCollections.map((collection) => (
                <div
                  key={collection.id}
                  className="flex justify-between items-center bg-white p-3 rounded-lg border border-green-100"
                >
                  <div>
                    <div className="font-medium">{collection.waste_type}</div>
                    <div className="text-sm text-muted-foreground">
                      {collection.collection_time || "Time not specified"}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">
                      {getDateDisplay(collection.collection_date)}
                    </div>
                    <div className="text-sm text-green-600">
                      {format(
                        parseISO(collection.collection_date),
                        "MMM d, yyyy"
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="alerts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="alerts">My Alerts</TabsTrigger>
          <TabsTrigger value="history">Collection History</TabsTrigger>
        </TabsList>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              {alertsLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-16 bg-gray-200 animate-pulse rounded"
                    ></div>
                  ))}
                </div>
              ) : pendingAlerts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <AlertTriangle className="mx-auto h-8 w-8 mb-2" />
                  <p>No active waste alerts. Request a collection if needed.</p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => setAlertDialogOpen(true)}
                  >
                    Request Collection
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingAlerts.map((alert) => (
                    <div key={alert.id} className="border rounded-md p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{alert.waste_type}</h3>
                            {getStatusBadge(alert.status)}
                          </div>
                          <p className="text-sm mt-1">{alert.description}</p>

                          {alert.preferred_date && (
                            <div className="flex items-center text-sm text-muted-foreground mt-2">
                              <CalendarCheck className="h-4 w-4 mr-1" />
                              Preferred date:{" "}
                              {format(
                                parseISO(alert.preferred_date),
                                "MMM d, yyyy"
                              )}
                            </div>
                          )}

                          <div className="text-xs text-gray-400 mt-2">
                            Submitted on{" "}
                            {format(parseISO(alert.created_at), "MMM d, yyyy")}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardContent className="pt-6">
              {collectionsLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-16 bg-gray-200 animate-pulse rounded"
                    ></div>
                  ))}
                </div>
              ) : collectionHistory.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="mx-auto h-8 w-8 mb-2" />
                  <p>No collection history available.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {collectionHistory.map((collection) => (
                    <div key={collection.id} className="border rounded-md p-4">
                      <div className="flex justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">
                              {collection.waste_type}
                            </h3>
                            {getStatusBadge(collection.status)}
                          </div>

                          {collection.collection_time && (
                            <div className="text-sm text-muted-foreground mt-1">
                              Time: {collection.collection_time}
                            </div>
                          )}

                          {collection.notes && (
                            <div className="text-sm mt-2">
                              {collection.notes}
                            </div>
                          )}
                        </div>

                        <div className="text-right">
                          <div className="font-medium">
                            {format(
                              parseISO(collection.collection_date),
                              "MMM d, yyyy"
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AlertWasteForm
        open={alertDialogOpen}
        onOpenChange={setAlertDialogOpen}
      />
    </div>
  );
};

export default WasteAlertsView;
