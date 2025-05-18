import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Calendar,
  Clock,
  Calendar as CalendarIcon,
  BellRing,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  format,
  parseISO,
  isToday,
  isTomorrow,
  addDays,
  isBefore,
  endOfDay,
} from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useResidentInfo } from "@/hooks/useResidentInfo";
import { useToast } from "@/hooks/use-toast";
import AlertWasteForm from "@/components/resident/AlertWasteForm";

interface CollectionSchedule {
  id: string;
  area_id: string;
  collection_day: string;
  collection_time: string | null;
  waste_type: string;
}

interface Collection {
  id: string;
  collection_date: string;
  status: string;
  schedule_id: string;
  waste_type?: string;
}

interface Area {
  id: string;
  name: string;
}

const ScheduleStatus = {
  UPCOMING: "upcoming",
  TODAY: "today",
  COMPLETED: "completed",
  MISSED: "missed",
};

const ResidentSchedule = () => {
  const [schedules, setSchedules] = useState<CollectionSchedule[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [areas, setAreas] = useState<Area[]>([]);
  const [userArea, setUserArea] = useState<string | null>(null);
  const [alertDialogOpen, setAlertDialogOpen] = useState(false);
  const { data: residentInfo } = useResidentInfo();
  const { toast } = useToast();

  useEffect(() => {
    const fetchUserAreas = async () => {
      try {
        // Get current user
        const { data: userData } = await supabase.auth.getUser();
        const user = userData?.user;
        if (!user) return;

        // Get user areas
        const { data: userAreas, error: userAreasError } = await supabase
          .from("user_areas")
          .select("area_id")
          .eq("user_id", user.id)
          .single();

        if (userAreasError && userAreasError.code !== "PGRST116") {
          console.error("Error fetching user areas:", userAreasError);
          return;
        }

        if (userAreas) {
          setUserArea(userAreas.area_id);
        }

        // If no specific user area, get all areas
        const { data: areasData, error: areasError } = await supabase
          .from("areas")
          .select("*");

        if (areasError) throw areasError;
        setAreas(areasData || []);
      } catch (error) {
        console.error("Error fetching areas:", error);
      }
    };

    fetchUserAreas();
  }, []);

  // Fetch schedules and collections when user area is set
  useEffect(() => {
    if (userArea) {
      fetchSchedules(userArea);
      fetchCollections(userArea);
    } else if (areas.length > 0) {
      // If no specific user area but we have areas, use the first one
      fetchSchedules(areas[0].id);
      fetchCollections(areas[0].id);
    }
  }, [userArea, areas]);

  const fetchSchedules = async (areaId: string) => {
    try {
      setIsLoading(true);

      const { data, error } = await supabase
        .from("collection_schedules")
        .select("*")
        .eq("area_id", areaId);

      if (error) throw error;
      setSchedules(data || []);
    } catch (error) {
      console.error("Error fetching schedules:", error);
      toast({
        variant: "destructive",
        title: "Failed to load schedules",
        description: "There was an issue loading your collection schedules.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCollections = async (areaId: string) => {
    try {
      setIsLoading(true);

      const { data: schedulesData } = await supabase
        .from("collection_schedules")
        .select("id")
        .eq("area_id", areaId);

      if (!schedulesData || schedulesData.length === 0) return;

      const scheduleIds = schedulesData.map((s) => s.id);

      const { data, error } = await supabase
        .from("collections")
        .select("*, collection_schedules!inner(waste_type)")
        .in("schedule_id", scheduleIds)
        .order("collection_date", { ascending: true });

      if (error) throw error;

      // Transform the data to include waste_type
      const collectionsWithDetails = data.map((item) => ({
        ...item,
        waste_type: item.collection_schedules.waste_type,
      }));

      setCollections(collectionsWithDetails || []);
    } catch (error) {
      console.error("Error fetching collections:", error);
      toast({
        variant: "destructive",
        title: "Failed to load collection data",
        description: "There was an issue loading your collection data.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getScheduleStatusBadge = (status: string) => {
    switch (status) {
      case ScheduleStatus.TODAY:
        return <Badge className="bg-green-100 text-green-800">Today</Badge>;
      case ScheduleStatus.UPCOMING:
        return <Badge className="bg-blue-100 text-blue-800">Upcoming</Badge>;
      case ScheduleStatus.COMPLETED:
        return <Badge className="bg-gray-100 text-gray-800">Completed</Badge>;
      case ScheduleStatus.MISSED:
        return <Badge className="bg-red-100 text-red-800">Missed</Badge>;
      default:
        return null;
    }
  };

  const getCollectionStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case "COLLECTED":
        return <Badge className="bg-green-100 text-green-800">Collected</Badge>;
      case "MISSED":
        return <Badge className="bg-red-100 text-red-800">Missed</Badge>;
      case "CANCELLED":
        return <Badge className="bg-gray-100 text-gray-800">Cancelled</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
    }
  };

  // Get upcoming collections (next 7 days)
  const upcomingCollections = collections
    .filter((collection) => {
      const collectionDate = parseISO(collection.collection_date);
      const now = new Date();
      const sevenDaysLater = addDays(now, 7);

      return collectionDate >= now && collectionDate <= sevenDaysLater;
    })
    .sort((a, b) => {
      return (
        new Date(a.collection_date).getTime() -
        new Date(b.collection_date).getTime()
      );
    });

  // Get recent collections (last 30 days)
  const recentCollections = collections
    .filter((collection) => {
      const collectionDate = parseISO(collection.collection_date);
      const today = new Date();
      const thirtyDaysAgo = addDays(today, -30);

      return (
        isBefore(collectionDate, endOfDay(today)) &&
        collectionDate >= thirtyDaysAgo
      );
    })
    .sort((a, b) => {
      return (
        new Date(b.collection_date).getTime() -
        new Date(a.collection_date).getTime()
      );
    });

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

  const getAreaName = (areaId: string) => {
    const area = areas.find((a) => a.id === areaId);
    return area ? area.name : "Unknown Area";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          My Collection Schedule
        </h1>
        <p className="text-muted-foreground">
          View your upcoming waste collection schedule.
        </p>
      </div>

      {residentInfo?.payment_status !== "APPROVED" && (
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="pt-6">
            <div className="flex items-start">
              <BellRing className="h-5 w-5 text-yellow-500 mr-2 mt-0.5" />
              <div>
                <p className="font-medium text-yellow-800">Payment Required</p>
                <p className="text-sm text-yellow-700">
                  Your payment has not been approved yet. Some collection
                  features may be limited. Please go to the Payments page to
                  submit or check your payment status.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-3 border-b">
          <CardTitle className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Calendar className="text-tw-green-600 h-5 w-5" />
              <span>Upcoming Collections</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAlertDialogOpen(true)}
              className="hidden sm:flex"
            >
              Report Issue
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="h-16 bg-gray-200 animate-pulse rounded"
                ></div>
              ))}
            </div>
          ) : upcomingCollections.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No upcoming collections scheduled. Check back later.
            </div>
          ) : (
            <div className="space-y-5">
              {upcomingCollections.map((collection) => (
                <div
                  key={collection.id}
                  className="flex items-center justify-between border-b pb-4 last:border-0"
                >
                  <div className="flex-1">
                    <div className="flex items-center">
                      <div className="mr-4 bg-tw-green-100 p-3 rounded-full">
                        <Calendar className="h-5 w-5 text-tw-green-700" />
                      </div>
                      <div>
                        <h3 className="font-medium">
                          {collection.waste_type || "Waste Collection"}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {getAreaName(userArea || areas[0]?.id || "")}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">
                      {getDateDisplay(collection.collection_date)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {schedules.find((s) => s.id === collection.schedule_id)
                        ?.collection_time || "Time not specified"}
                    </div>
                  </div>
                </div>
              ))}

              <div className="sm:hidden flex justify-center mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAlertDialogOpen(true)}
                  className="w-full"
                >
                  Report Collection Issue
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3 border-b">
          <CardTitle className="flex items-center gap-2">
            <Clock className="text-tw-blue-600 h-5 w-5" />
            <span>Collection History</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="h-16 bg-gray-200 animate-pulse rounded"
                ></div>
              ))}
            </div>
          ) : recentCollections.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No collection history available.
            </div>
          ) : (
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="hidden sm:table-cell">Area</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentCollections.map((collection) => (
                    <TableRow key={collection.id}>
                      <TableCell>
                        {format(
                          parseISO(collection.collection_date),
                          "MMM d, yyyy"
                        )}
                      </TableCell>
                      <TableCell>
                        {collection.waste_type || "General"}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {getAreaName(userArea || areas[0]?.id || "")}
                      </TableCell>
                      <TableCell className="text-right">
                        {getCollectionStatusBadge(collection.status)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertWasteForm
        open={alertDialogOpen}
        onOpenChange={setAlertDialogOpen}
      />
    </div>
  );
};

export default ResidentSchedule;
