// utils/scheduleGenerator.ts
import { addDays, format, isSameDay, nextDay, parseISO } from "date-fns";

export function generateUpcomingCollections(
  schedules: WasteCollectionSchedule[],
  exceptions: CollectionException[],
  weeksToShow: number = 4
) {
  const today = new Date();
  const endDate = addDays(today, weeksToShow * 7);
  const upcomingCollections: {
    date: Date;
    type: string;
    scheduleId: string;
  }[] = [];

  schedules.forEach((schedule) => {
    const exceptionDates = exceptions
      .filter((e) => e.schedule_id === schedule.id)
      .map((e) => parseISO(e.exception_date));

    let currentDate = new Date(today);

    // Find the next occurrence after today
    if (schedule.frequency === "WEEKLY") {
      currentDate = nextDay(currentDate, schedule.weekday as Day);

      while (currentDate <= endDate) {
        // Check if this date is an exception
        if (!exceptionDates.some((d) => isSameDay(d, currentDate))) {
          upcomingCollections.push({
            date: new Date(currentDate),
            type: schedule.collection_type,
            scheduleId: schedule.id,
          });
        }
        currentDate = addDays(currentDate, 7);
      }
    } else if (schedule.frequency === "BIWEEKLY") {
      currentDate = nextDay(currentDate, schedule.weekday as Day);

      while (currentDate <= endDate) {
        if (!exceptionDates.some((d) => isSameDay(d, currentDate))) {
          upcomingCollections.push({
            date: new Date(currentDate),
            type: schedule.collection_type,
            scheduleId: schedule.id,
          });
        }
        currentDate = addDays(currentDate, 14);
      }
    }
    // Add similar logic for MONTHLY if needed
  });

  // Sort by date
  return upcomingCollections.sort(
    (a, b) => a.date.getTime() - b.date.getTime()
  );
}
