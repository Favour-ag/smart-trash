import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { format, addDays } from "date-fns";
import { useCreateWasteAlert } from "@/hooks/useWasteAlerts";
import { useResidentInfo } from "@/hooks/useResidentInfo";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface AlertWasteFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AlertWasteForm: React.FC<AlertWasteFormProps> = ({
  open,
  onOpenChange,
}) => {
  const [wasteType, setWasteType] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [preferredDate, setPreferredDate] = useState<Date | undefined>(
    undefined
  );
  const [preferredTime, setPreferredTime] = useState<string>("");
  const [locationDetails, setLocationDetails] = useState<string>("");

  const { data: residentInfo } = useResidentInfo();
  const createAlert = useCreateWasteAlert();

  const resetForm = () => {
    setWasteType("");
    setDescription("");
    setPreferredDate(undefined);
    setPreferredTime("");
    setLocationDetails("");
  };

  const handleSubmit = async () => {
    if (!residentInfo) {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          "Could not find your resident information. Please update your profile first.",
      });
      return;
    }

    if (!wasteType || !description) {
      toast({
        variant: "destructive",
        title: "Missing information",
        description: "Please fill in all required fields.",
      });
      return;
    }

    try {
      await createAlert.mutateAsync({
        residentId: residentInfo.id,
        wasteType,
        description,
        preferredDate: preferredDate
          ? format(preferredDate, "yyyy-MM-dd")
          : undefined,
        preferredTime,
        locationDetails,
      });

      onOpenChange(false);
      resetForm();
    } catch (error) {
      console.error("Failed to submit waste alert:", error);
    }
  };

  // Calculate minimum date (tomorrow)
  const minDate = addDays(new Date(), 1);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Request Waste Collection</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <label className="text-sm font-medium">Waste Type*</label>
            <Select value={wasteType} onValueChange={setWasteType}>
              <SelectTrigger>
                <SelectValue placeholder="Select waste type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="General Waste">General Waste</SelectItem>
                <SelectItem value="Recyclables">Recyclables</SelectItem>
                <SelectItem value="Organic Waste">Organic Waste</SelectItem>
                <SelectItem value="Bulk Items">Bulk Items</SelectItem>
                <SelectItem value="Electronic Waste">
                  Electronic Waste
                </SelectItem>
                <SelectItem value="Hazardous Materials">
                  Hazardous Materials
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium">Description*</label>
            <Textarea
              placeholder="Please describe your waste collection needs"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[100px]"
            />
          </div>

          <div>
            <label className="text-sm font-medium">
              Preferred Date (Optional)
            </label>
            <div className="border rounded-md mt-2">
              <Calendar
                mode="single"
                selected={preferredDate}
                onSelect={setPreferredDate}
                disabled={(date) => date < minDate}
                initialFocus
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">
              Preferred Time (Optional)
            </label>
            <Select value={preferredTime} onValueChange={setPreferredTime}>
              <SelectTrigger>
                <SelectValue placeholder="Select preferred time" />
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
          </div>

          <div>
            <label className="text-sm font-medium">
              Additional Location Details (Optional)
            </label>
            <Input
              placeholder="E.g., Gate access code, landmark, etc."
              value={locationDetails}
              onChange={(e) => setLocationDetails(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={createAlert.isPending}>
            {createAlert.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Alert"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AlertWasteForm;
