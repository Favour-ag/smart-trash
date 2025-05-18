// components/WasteScheduleAdmin.tsx
import React, { useState } from "react";
import {
  useWasteSchedules,
  useAddWasteSchedule,
  useUpdateWasteSchedule,
  useDeleteWasteSchedule,
  useScheduleExceptions,
} from "@/hooks/useWasteCollection";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Plus } from "lucide-react";
import ScheduleForm from "./ScheduleForm";
import ExceptionsList from "./ExceptionsList";

const WasteScheduleAdmin = () => {
  const { data: schedules, isLoading } = useWasteSchedules();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<string | null>(null);

  if (isLoading) {
    return <div>Loading schedules...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Waste Collection Schedules</h2>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" /> Add Schedule
        </Button>
      </div>

      {showForm && (
        <ScheduleForm
          onClose={() => {
            setShowForm(false);
            setEditingId(null);
          }}
          schedule={
            editingId ? schedules?.find((s) => s.id === editingId) : undefined
          }
        />
      )}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Type</TableHead>
            <TableHead>Frequency</TableHead>
            <TableHead>Weekday</TableHead>
            <TableHead>Start Date</TableHead>
            <TableHead>End Date</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {schedules?.map((schedule) => (
            <React.Fragment key={schedule.id}>
              <TableRow>
                <TableCell>{schedule.collection_type}</TableCell>
                <TableCell>{schedule.frequency}</TableCell>
                <TableCell>
                  {
                    [
                      "Sunday",
                      "Monday",
                      "Tuesday",
                      "Wednesday",
                      "Thursday",
                      "Friday",
                      "Saturday",
                    ][schedule.weekday]
                  }
                </TableCell>
                <TableCell>
                  {new Date(schedule.start_date).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {schedule.end_date
                    ? new Date(schedule.end_date).toLocaleDateString()
                    : "None"}
                </TableCell>
                <TableCell className="space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEditingId(schedule.id);
                      setShowForm(true);
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setSelectedSchedule(
                        selectedSchedule === schedule.id ? null : schedule.id
                      )
                    }
                  >
                    Exceptions
                  </Button>
                </TableCell>
              </TableRow>
              {selectedSchedule === schedule.id && (
                <TableRow>
                  <TableCell colSpan={6} className="p-0">
                    <ExceptionsList scheduleId={schedule.id} />
                  </TableCell>
                </TableRow>
              )}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default WasteScheduleAdmin;
