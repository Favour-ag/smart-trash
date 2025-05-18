import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calendar, MessageSquare, Bell } from "lucide-react";
import { useAnnouncements } from "@/hooks/useAnnouncements";
import { useCollections } from "@/hooks/useCollections";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { format, differenceInDays } from "date-fns";
import ProfileSummary from "@/components/resident/ProfileSummary";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useResidentInfo } from "@/hooks/useResidentInfo";

const ResidentDashboard = () => {
  const { data: announcements = [], isLoading: loadingAnnouncements } =
    useAnnouncements();
  const { data: collections = [], isLoading: loadingCollections } =
    useCollections("PENDING");
  const { data: stats, isLoading: loadingStats } = useDashboardStats();
  const { data: residentInfo } = useResidentInfo();

  // Find the next collection
  const nextCollection =
    collections.length > 0
      ? collections.sort(
          (a, b) =>
            new Date(a.collection_date).getTime() -
            new Date(b.collection_date).getTime()
        )[0]
      : null;

  // Get upcoming collections
  const today = new Date();
  const upcomingCollections = collections
    .filter((c) => new Date(c.collection_date) >= today)
    .sort(
      (a, b) =>
        new Date(a.collection_date).getTime() -
        new Date(b.collection_date).getTime()
    )
    .slice(0, 3);

  const pastCollections = collections
    .filter((c) => new Date(c.collection_date) < today)
    .sort(
      (a, b) =>
        new Date(b.collection_date).getTime() -
        new Date(a.collection_date).getTime()
    )
    .slice(0, 3);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Resident Dashboard
        </h1>
        <p className="text-muted-foreground">
          Welcome to your waste management dashboard.
        </p>
      </div>

      {/* Announcements */}
      <Card>
        <CardHeader className="bg-tw-blue-50 border-b">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-tw-blue-600" />
            <CardTitle className="text-tw-blue-800">Announcements</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {loadingAnnouncements ? (
            <div className="text-center py-4">Loading announcements...</div>
          ) : announcements.length === 0 ? (
            <div className="text-center py-4">
              No announcements at this time
            </div>
          ) : (
            <div className="space-y-4">
              {announcements.map((announcement) => (
                <div
                  key={announcement.id}
                  className={`border-l-4 border-tw-${
                    announcement.category === "alert"
                      ? "red"
                      : announcement.category === "info"
                      ? "blue"
                      : "green"
                  }-500 pl-4 py-1`}
                >
                  <p className="font-medium">{announcement.title}</p>
                  <p className="text-sm text-gray-600">
                    {announcement.message}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Posted on{" "}
                    {format(new Date(announcement.posted_at), "MMM d, yyyy")}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions and Stats */}
      <div className="tw-dashboard-grid">
        {/* Profile Summary */}
        <ProfileSummary compact />

        {/* Upcoming Collection */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-tw-green-600" />
              <CardTitle className="text-lg">Next Collection</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {loadingCollections ? (
              <div className="text-center py-2">Loading...</div>
            ) : nextCollection ? (
              <div className="mt-2 space-y-1">
                <div className="text-2xl font-bold text-tw-green-700">
                  {format(
                    new Date(nextCollection.collection_date),
                    "EEEE, MMM d"
                  )}
                </div>
                <div className="text-sm text-gray-500">
                  {nextCollection.waste_type || "General Waste"}
                </div>
                <div className="text-sm font-medium text-tw-green-600">
                  {differenceInDays(
                    new Date(nextCollection.collection_date),
                    today
                  ) === 0
                    ? "Today"
                    : differenceInDays(
                        new Date(nextCollection.collection_date),
                        today
                      ) === 1
                    ? "Tomorrow"
                    : `${differenceInDays(
                        new Date(nextCollection.collection_date),
                        today
                      )} days from now`}
                </div>
              </div>
            ) : (
              <div className="mt-2">
                <div className="text-lg font-medium">
                  No upcoming collections
                </div>
                <div className="text-sm text-gray-500">
                  Check back later for updates
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Feedback */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-tw-blue-600" />
              <CardTitle className="text-lg">My Recent Feedback</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mt-2 space-y-1">
              <Link to="/resident/feedback" className="block">
                <Button variant="outline" className="w-full">
                  View Feedbacks
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Collection History */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Collection History</CardTitle>
            <CardDescription>Last 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingCollections ? (
              <div className="text-center py-2">Loading...</div>
            ) : pastCollections.length === 0 ? (
              <div className="text-center py-2">
                No recent collection history
              </div>
            ) : (
              <div className="space-y-2">
                {pastCollections.map((collection) => (
                  <div
                    key={collection.id}
                    className="flex justify-between items-center"
                  >
                    <div>
                      <div className="font-medium">
                        {collection.waste_type || "General Waste"}
                      </div>
                      <div className="text-xs text-gray-500">
                        {format(
                          new Date(collection.collection_date),
                          "MMM d, yyyy"
                        )}
                      </div>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 bg-${
                        collection.status === "COLLECTED" ? "green" : "red"
                      }-100 text-${
                        collection.status === "COLLECTED" ? "green" : "red"
                      }-800 rounded-full`}
                    >
                      {collection.status === "COLLECTED"
                        ? "Collected"
                        : "Missed"}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4">
              <Link to="/resident/schedule">
                <Button variant="outline" size="sm" className="w-full">
                  View All Collections
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResidentDashboard;
