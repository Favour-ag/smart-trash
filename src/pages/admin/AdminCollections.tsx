import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Calendar, Download, Filter, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCollections, Collection } from "@/hooks/useCollections";
import { format } from "date-fns";

const AdminCollections = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");

  const { data: collections = [], isLoading, error } = useCollections(filter);

  const filteredCollections = collections.filter((collection) => {
    const areaName = collection.area?.name || "";
    return areaName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "COLLECTED":
        return "success";
      case "PENDING":
        return "warning";
      case "MISSED":
        return "destructive";
      default:
        return "default";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Collections Management
        </h1>
        <p className="text-muted-foreground">
          Manage and track waste collection schedules and reports.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
        <div className="flex w-full sm:w-auto items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by area..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-xs pl-8"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="collected">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="missed">Missed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
          <Button variant="outline" className="gap-2">
            <Calendar className="h-4 w-4" />
            Schedule
          </Button>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Collection Records</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-4 text-center">Loading collections...</div>
          ) : error ? (
            <div className="py-4 text-center text-red-500">
              Error loading collections
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Area</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCollections.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      No collections found matching your criteria
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCollections.map((collection) => (
                    <TableRow key={collection.id}>
                      <TableCell className="font-medium">
                        {collection.id.substring(0, 8)}
                      </TableCell>
                      <TableCell>
                        {collection.area?.name || "Unknown"}
                      </TableCell>
                      <TableCell>
                        {collection.collection_date
                          ? format(
                              new Date(collection.collection_date),
                              "MMM dd, yyyy"
                            )
                          : "N/A"}
                      </TableCell>
                      <TableCell>
                        {collection.waste_type || "General"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(collection.status)}>
                          {collection.status.charAt(0) +
                            collection.status.slice(1).toLowerCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                        <Button variant="ghost" size="sm">
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminCollections;
