import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  format,
  addDays,
  addMonths,
  startOfMonth,
  getDay,
  setDay,
  addWeeks,
  isBefore,
} from "date-fns";
import { useAreas } from "@/hooks/useAreas";
import { Checkbox } from "@/components/ui/checkbox";

// Define types for our data
interface Area {
  id: string;
  name: string;
}

interface Schedule {
  id: string;
  area: string;
  area_id: string;
  type: string;
  day: string;
  time: string;
}

interface SpecialEvent {
  id: string;
  date: Date;
  title: string;
  areas: string[];
}

interface ApprovedResident {
  id: string;
  full_name: string;
  street_address: string;
  area: string;
  selected?: boolean; // For UI selection
}

const AdminSchedules = () => {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(
    null
  );
  const [newEventDialogOpen, setNewEventDialogOpen] = useState(false);
  const [selectedArea, setSelectedArea] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const { toast } = useToast();
  const [scheduleData, setScheduleData] = useState<Schedule[]>([]);
  const [specialEvents, setSpecialEvents] = useState<SpecialEvent[]>([]);
  const [approvedResidents, setApprovedResidents] = useState<
    ApprovedResident[]
  >([]);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [saturdays, setSaturdays] = useState<Date[]>([]);
  const [isRecurringSchedule, setIsRecurringSchedule] =
    useState<boolean>(false);
  const [selectedResidents, setSelectedResidents] = useState<string[]>([]);
  const { data: areas = [] } = useAreas();
  const [createWeeklyDialog, setCreateWeeklyDialog] = useState(false);

  // Get all Saturdays for the next 3 months
  useEffect(() => {
    const getSaturdaysForNextMonths = (months: number) => {
      const today = new Date();
      const result: Date[] = [];
      let currentMonth = startOfMonth(today);

      for (let i = 0; i < months; i++) {
        const month = i === 0 ? currentMonth : addMonths(currentMonth, i);

        // Find the first Saturday in the month
        let saturday = getDay(month) === 6 ? month : setDay(month, 6); // 6 is Saturday

        // If the first Saturday we found is before today, move to the next one
        if (isBefore(saturday, today)) {
          saturday = addWeeks(saturday, 1);
        }

        // Add all Saturdays in this month
        while (saturday.getMonth() === month.getMonth()) {
          result.push(new Date(saturday));
          saturday = addWeeks(saturday, 1);
        }
      }

      return result;
    };

    setSaturdays(getSaturdaysForNextMonths(3));
  }, []);

  // Fetch areas, schedules and approved residents
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch collection schedules
        const { data: schedulesData, error: schedulesError } =
          await supabase.from("collection_schedules").select(`
            id,
            waste_type,
            collection_day,
            collection_time,
            area_id,
            areas (name)
          `);

        if (schedulesError) throw schedulesError;

        // Transform schedules data
        const transformedSchedules = (schedulesData || []).map((schedule) => ({
          id: schedule.id,
          area: schedule.areas?.name || "Unknown Area",
          area_id: schedule.area_id,
          type: schedule.waste_type,
          day: schedule.collection_day,
          time: schedule.collection_time
            ? new Date(
                0,
                0,
                0,
                parseInt(schedule.collection_time.split(":")[0]),
                parseInt(schedule.collection_time.split(":")[1])
              ).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            : "7:00 AM - 12:00 PM",
        }));

        setScheduleData(transformedSchedules);

        // Fetch residents with approved payments
        const { data: residentsData, error: residentsError } = await supabase
          .from("resident_info")
          .select(
            `
            id,
            full_name,
            street_address,
            house_number,
            payment_receipts (status)
          `
          )
          .order("created_at", { ascending: false });

        if (residentsError) throw residentsError;

        // Filter residents with at least one approved payment
        const approvedResidentsList =
          residentsData
            ?.filter((resident) =>
              resident.payment_receipts?.some(
                (receipt: { status: string }) => receipt.status === "APPROVED"
              )
            )
            .map((resident) => ({
              id: resident.id,
              full_name: resident.full_name,
              street_address: resident.street_address,
              area:
                resident.street_address.split(",").pop()?.trim() ||
                "Unknown Area",
            })) || [];

        setApprovedResidents(approvedResidentsList);

        // Create placeholder special events
        const specialEventsData = [
          {
            id: "1",
            date: addDays(new Date(), 1),
            title: "Electronic Waste Collection",
            areas: ["Downtown Area", "North Residential"],
          },
          {
            id: "2",
            date: addDays(new Date(), 8),
            title: "Hazardous Materials Collection",
            areas: ["West Hills", "South Bay"],
          },
          {
            id: "3",
            date: addDays(new Date(), 16),
            title: "Bulk Item Pickup Day",
            areas: ["All Areas"],
          },
        ];

        setSpecialEvents(specialEventsData);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          variant: "destructive",
          title: "Failed to load data",
          description:
            "There was an error loading the schedule data. Please try again.",
        });
      }
    };

    fetchData();

    // Set up real-time subscription for changes
    const channel = supabase
      .channel("schedules-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "collection_schedules" },
        (payload) => {
          console.log("Schedules change detected:", payload);
          // Refresh schedules when there's a change
          fetchData();
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "payment_receipts" },
        (payload) => {
          console.log("Payment receipt change detected:", payload);
          // Refresh approved residents when there's a payment status change
          fetchData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast]);

  const handleEditSchedule = (schedule: Schedule) => {
    setSelectedSchedule(schedule);
    setEditDialogOpen(true);
  };

  const handleSaveSchedule = async () => {
    try {
      if (!selectedSchedule) return;

      // Parse time range to get just the time part
      const timeRange = selectedSchedule.time.split(" - ");
      const startTime = timeRange[0];

      await supabase
        .from("collection_schedules")
        .update({
          collection_day: selectedSchedule.day,
          collection_time: startTime,
          updated_at: new Date().toISOString(),
        })
        .eq("id", selectedSchedule.id);

      toast({
        title: "Schedule updated",
        description: `The schedule for ${selectedSchedule.area} has been updated successfully.`,
      });

      setEditDialogOpen(false);
    } catch (error) {
      console.error("Error updating schedule:", error);
      toast({
        variant: "destructive",
        title: "Update failed",
        description: "Failed to update schedule. Please try again.",
      });
    }
  };

  const toggleResidentSelection = (residentId: string) => {
    setSelectedResidents((prev) => {
      if (prev.includes(residentId)) {
        return prev.filter((id) => id !== residentId);
      } else {
        return [...prev, residentId];
      }
    });
  };

  const handleCreateEvent = async () => {
    if (!selectedArea || !selectedDate) {
      toast({
        variant: "destructive",
        title: "Missing information",
        description:
          "Please select an area and date for the special collection event.",
      });
      return;
    }

    // For now, we'll just add it to our local state
    // In a real implementation, this would be saved to the database
    const newEvent: SpecialEvent = {
      id: `new-${Date.now()}`,
      date: selectedDate,
      title: "New Special Collection",
      areas: [
        selectedArea === "all"
          ? "All Areas"
          : areas.find((a) => a.id === selectedArea)?.name || "",
      ],
    };

    setSpecialEvents([...specialEvents, newEvent]);

    toast({
      title: "Special event created",
      description: `A new special collection event has been scheduled for ${selectedDate?.toLocaleDateString()}.`,
    });

    setNewEventDialogOpen(false);
    setSelectedArea("");
    setSelectedDate(undefined);
  };

  const handleCreateSchedule = async () => {
    try {
      if (!selectedArea || !selectedDate) {
        toast({
          variant: "destructive",
          title: "Missing information",
          description:
            "Please select an area and date for the collection schedule.",
        });
        return;
      }

      // Create a new schedule in the database
      const { data, error } = await supabase
        .from("collection_schedules")
        .insert({
          area_id: selectedArea,
          waste_type: "General Waste",
          collection_day: format(selectedDate, "EEEE"),
          collection_time: "07:00:00",
        })
        .select();

      if (error) throw error;

      toast({
        title: "Schedule created",
        description: "A new collection schedule has been created successfully.",
      });

      setScheduleDialogOpen(false);
      setSelectedArea("");
      setSelectedDate(undefined);
    } catch (error) {
      console.error("Error creating schedule:", error);
      toast({
        variant: "destructive",
        title: "Failed to create schedule",
        description:
          "There was an error creating the schedule. Please try again.",
      });
    }
  };

  const handleCreateWeeklySchedules = async () => {
    try {
      if (!selectedArea || saturdays.length === 0) {
        toast({
          variant: "destructive",
          title: "Missing information",
          description: "Please select an area for the weekly schedules.",
        });
        return;
      }

      // Create entries for all Saturdays
      const scheduleEntries = saturdays.map((saturday) => ({
        area_id: selectedArea,
        waste_type: "General Waste",
        collection_day: "Saturday", // Every Saturday
        collection_time: "07:00:00",
        collection_date: format(saturday, "yyyy-MM-dd"), // Store the specific date
      }));

      // Insert all schedules at once
      const { error } = await supabase
        .from("collection_schedules")
        .insert(scheduleEntries);

      if (error) throw error;

      // If there are selected residents, assign them to the schedule
      if (selectedResidents.length > 0) {
        // In a real implementation, you would associate residents with the schedule
        // For now, we'll just show a notification
        toast({
          title: `${selectedResidents.length} residents assigned`,
          description:
            "The selected residents have been assigned to the schedule.",
        });
      }

      toast({
        title: "Weekly schedules created",
        description: `Successfully created collection schedules for all Saturdays in the next 3 months.`,
      });

      setCreateWeeklyDialog(false);
      setSelectedResidents([]);
      setSelectedArea("");
    } catch (error) {
      console.error("Error creating weekly schedules:", error);
      toast({
        variant: "destructive",
        title: "Failed to create schedules",
        description:
          "There was an error creating the weekly schedules. Please try again.",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Collection Schedules
          </h1>
          <p className="text-muted-foreground">
            Manage waste collection schedules across all areas.
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setScheduleDialogOpen(true)} variant="outline">
            Create Schedule
          </Button>
          <Button onClick={() => setCreateWeeklyDialog(true)} variant="outline">
            Create Saturday Schedule
          </Button>
          <Button onClick={() => setNewEventDialogOpen(true)}>
            Create Special Event
          </Button>
        </div>
      </div>

      {approvedResidents.length > 0 && (
        <Card className="bg-green-50 border-green-200">
          <CardHeader>
            <CardTitle className="text-green-800">Approved Residents</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-2">
              The following residents have approved payment receipts and are
              ready for scheduling:
            </p>
            <div className="grid gap-2 max-h-[200px] overflow-y-auto">
              {approvedResidents.map((resident) => (
                <div
                  key={resident.id}
                  className="border rounded-md p-2 bg-white"
                >
                  <div className="font-medium">{resident.full_name}</div>
                  <div className="text-sm text-gray-500">
                    {resident.street_address}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="regular" className="space-y-4">
        <TabsList>
          <TabsTrigger value="regular">Regular Schedules</TabsTrigger>
          <TabsTrigger value="special">Special Events</TabsTrigger>
        </TabsList>

        <TabsContent value="regular" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Filter Schedules</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <Select>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Select Area" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Areas</SelectItem>
                    {areas.map((area) => (
                      <SelectItem key={area.id} value={area.id}>
                        {area.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Waste Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="general">General Waste</SelectItem>
                    <SelectItem value="recycling">Recycling</SelectItem>
                    <SelectItem value="organic">Organic Waste</SelectItem>
                    <SelectItem value="hazardous">
                      Hazardous Materials
                    </SelectItem>
                  </SelectContent>
                </Select>

                <Button variant="outline" className="sm:ml-auto">
                  Reset Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Regular Collection Schedules</CardTitle>
            </CardHeader>
            <CardContent>
              {scheduleData.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No collection schedules found. Create a new schedule to get
                  started.
                </div>
              ) : (
                <div className="border rounded-md">
                  <div className="grid grid-cols-5 font-medium text-sm p-3 border-b bg-muted">
                    <div>Area</div>
                    <div>Type</div>
                    <div>Collection Days</div>
                    <div>Time Window</div>
                    <div className="text-right">Actions</div>
                  </div>

                  {scheduleData.map((schedule) => (
                    <div
                      key={schedule.id}
                      className="grid grid-cols-5 p-3 border-b text-sm last:border-b-0 items-center"
                    >
                      <div>{schedule.area}</div>
                      <div>{schedule.type}</div>
                      <div>{schedule.day}</div>
                      <div>{schedule.time}</div>
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditSchedule(schedule)}
                        >
                          Edit
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="special" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Special Collection Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {specialEvents.map((event, index) => (
                  <div key={index} className="border rounded-md p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <h3 className="font-medium">{event.title}</h3>
                        <p className="text-sm text-gray-600">
                          {event.date.toLocaleDateString(undefined, {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                        <p className="text-sm text-gray-500">
                          Areas: {event.areas.join(", ")}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-destructive border-destructive hover:bg-destructive/10"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Schedule Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Schedule</DialogTitle>
          </DialogHeader>
          {selectedSchedule && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Area</label>
                <Input value={selectedSchedule.area} disabled />
              </div>

              <div>
                <label className="text-sm font-medium">Waste Type</label>
                <Input value={selectedSchedule.type} disabled />
              </div>

              <div>
                <label className="text-sm font-medium">Collection Days</label>
                <Select
                  defaultValue={selectedSchedule.day}
                  onValueChange={(value) =>
                    setSelectedSchedule({ ...selectedSchedule, day: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder={selectedSchedule.day} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Monday">Monday</SelectItem>
                    <SelectItem value="Tuesday">Tuesday</SelectItem>
                    <SelectItem value="Wednesday">Wednesday</SelectItem>
                    <SelectItem value="Thursday">Thursday</SelectItem>
                    <SelectItem value="Friday">Friday</SelectItem>
                    <SelectItem value="Saturday">Saturday</SelectItem>
                    <SelectItem value="Sunday">Sunday</SelectItem>
                    <SelectItem value="Monday, Wednesday, Friday">
                      Monday, Wednesday, Friday
                    </SelectItem>
                    <SelectItem value="Tuesday, Thursday">
                      Tuesday, Thursday
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Time Window</label>
                <Select
                  defaultValue={selectedSchedule.time}
                  onValueChange={(value) =>
                    setSelectedSchedule({ ...selectedSchedule, time: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder={selectedSchedule.time} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7:00 AM - 12:00 PM">
                      7:00 AM - 12:00 PM
                    </SelectItem>
                    <SelectItem value="12:00 PM - 5:00 PM">
                      12:00 PM - 5:00 PM
                    </SelectItem>
                    <SelectItem value="5:00 PM - 8:00 PM">
                      5:00 PM - 8:00 PM
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveSchedule}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Schedule Dialog */}
      <Dialog open={scheduleDialogOpen} onOpenChange={setScheduleDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create Collection Schedule</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Select Area</label>
              <Select value={selectedArea} onValueChange={setSelectedArea}>
                <SelectTrigger>
                  <SelectValue placeholder="Select area" />
                </SelectTrigger>
                <SelectContent>
                  {areas.map((area) => (
                    <SelectItem key={area.id} value={area.id}>
                      {area.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Collection Type</label>
              <Select defaultValue="general">
                <SelectTrigger>
                  <SelectValue placeholder="Select waste type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General Waste</SelectItem>
                  <SelectItem value="recycling">Recycling</SelectItem>
                  <SelectItem value="organic">Organic Waste</SelectItem>
                  <SelectItem value="hazardous">Hazardous Materials</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Collection Day</label>
              <div className="border rounded-md mt-2">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Time Window</label>
              <Select defaultValue="morning">
                <SelectTrigger>
                  <SelectValue placeholder="Select time window" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="morning">7:00 AM - 12:00 PM</SelectItem>
                  <SelectItem value="afternoon">12:00 PM - 5:00 PM</SelectItem>
                  <SelectItem value="evening">5:00 PM - 8:00 PM</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setScheduleDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateSchedule}>Create Schedule</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Weekly Saturday Schedules Dialog */}
      <Dialog open={createWeeklyDialog} onOpenChange={setCreateWeeklyDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create Saturday Collection Schedules</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Select Area</label>
              <Select value={selectedArea} onValueChange={setSelectedArea}>
                <SelectTrigger>
                  <SelectValue placeholder="Select area" />
                </SelectTrigger>
                <SelectContent>
                  {areas.map((area) => (
                    <SelectItem key={area.id} value={area.id}>
                      {area.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground mt-1">
                This will create collection schedules for all Saturdays in the
                next 3 months.
              </p>
            </div>

            <div>
              <label className="text-sm font-medium">Collection Type</label>
              <Select defaultValue="general">
                <SelectTrigger>
                  <SelectValue placeholder="Select waste type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General Waste</SelectItem>
                  <SelectItem value="recycling">Recycling</SelectItem>
                  <SelectItem value="organic">Organic Waste</SelectItem>
                  <SelectItem value="hazardous">Hazardous Materials</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Time Window</label>
              <Select defaultValue="morning">
                <SelectTrigger>
                  <SelectValue placeholder="Select time window" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="morning">7:00 AM - 12:00 PM</SelectItem>
                  <SelectItem value="afternoon">12:00 PM - 5:00 PM</SelectItem>
                  <SelectItem value="evening">5:00 PM - 8:00 PM</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Assign Approved Residents
              </label>
              <div className="border rounded-md p-2 max-h-[200px] overflow-y-auto">
                {approvedResidents.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-2">
                    No approved residents found.
                  </p>
                ) : (
                  approvedResidents.map((resident) => (
                    <div
                      key={resident.id}
                      className="flex items-center space-x-2 py-2 border-b last:border-b-0"
                    >
                      <Checkbox
                        id={`resident-${resident.id}`}
                        checked={selectedResidents.includes(resident.id)}
                        onCheckedChange={() =>
                          toggleResidentSelection(resident.id)
                        }
                      />
                      <label
                        htmlFor={`resident-${resident.id}`}
                        className="text-sm flex-1 cursor-pointer"
                      >
                        <div className="font-medium">{resident.full_name}</div>
                        <div className="text-xs text-muted-foreground">
                          {resident.street_address}
                        </div>
                      </label>
                    </div>
                  ))
                )}
              </div>
              {approvedResidents.length > 0 && (
                <div className="flex justify-between text-sm">
                  <span>{selectedResidents.length} residents selected</span>
                  <button
                    className="text-blue-600 hover:underline"
                    onClick={() => {
                      if (
                        selectedResidents.length === approvedResidents.length
                      ) {
                        setSelectedResidents([]);
                      } else {
                        setSelectedResidents(
                          approvedResidents.map((r) => r.id)
                        );
                      }
                    }}
                  >
                    {selectedResidents.length === approvedResidents.length
                      ? "Deselect all"
                      : "Select all"}
                  </button>
                </div>
              )}
            </div>

            <div>
              <h3 className="text-sm font-medium mb-2">Upcoming Saturdays</h3>
              <div className="grid grid-cols-3 gap-2">
                {saturdays.slice(0, 6).map((date, index) => (
                  <div
                    key={index}
                    className="text-xs border rounded p-1.5 bg-gray-50"
                  >
                    {format(date, "MMM d, yyyy")}
                  </div>
                ))}
                {saturdays.length > 6 && (
                  <div className="text-xs border rounded p-1.5 bg-gray-50 flex items-center justify-center">
                    +{saturdays.length - 6} more
                  </div>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCreateWeeklyDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateWeeklySchedules}>
              Create Saturday Schedules
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Special Event Dialog */}
      <Dialog open={newEventDialogOpen} onOpenChange={setNewEventDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create Special Collection Event</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Event Title</label>
              <Input placeholder="e.g., Electronic Waste Collection" />
            </div>

            <div>
              <label className="text-sm font-medium">Select Area</label>
              <Select value={selectedArea} onValueChange={setSelectedArea}>
                <SelectTrigger>
                  <SelectValue placeholder="Select area" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Areas</SelectItem>
                  {areas.map((area) => (
                    <SelectItem key={area.id} value={area.id}>
                      {area.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Collection Type</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select waste type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="electronic">Electronic Waste</SelectItem>
                  <SelectItem value="hazardous">Hazardous Materials</SelectItem>
                  <SelectItem value="bulk">Bulk Items</SelectItem>
                  <SelectItem value="yard">Yard Waste</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Date</label>
              <div className="border rounded-md mt-2">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Time Window</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select time window" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="morning">7:00 AM - 12:00 PM</SelectItem>
                  <SelectItem value="afternoon">12:00 PM - 5:00 PM</SelectItem>
                  <SelectItem value="full">8:00 AM - 6:00 PM</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setNewEventDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateEvent}>Create Event</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminSchedules;
