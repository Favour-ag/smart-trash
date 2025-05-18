// import React, { useState } from "react";
// import {
//   Card,
//   CardContent,
//   CardHeader,
//   CardTitle,
//   CardDescription,
// } from "@/components/ui/card";
// import { useResidentInfo } from "@/hooks/useResidentInfo";
// import { supabase } from "@/integrations/supabase/client";
// import { useAddPaymentReceipt } from "@/hooks/usePaymentReceipts";
// import { Upload } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { useToast } from "@/hooks/use-toast";
// import PaymentReceiptsList from "@/components/resident/PaymentReceiptsList";
// import AlertWasteForm from "@/components/resident/AlertWasteForm";

// const ResidentPayments = () => {
//   const { data: residentInfo, isLoading } = useResidentInfo();
//   const [file, setFile] = React.useState<File | null>(null);
//   const [isUploading, setIsUploading] = React.useState(false);
//   const [alertDialogOpen, setAlertDialogOpen] = useState(false);
//   const addPaymentReceipt = useAddPaymentReceipt();
//   const { toast } = useToast();

//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files && e.target.files[0]) {
//       setFile(e.target.files[0]);
//     }
//   };

//   const uploadReceipt = async () => {
//     if (!file || !residentInfo?.id) return;

//     setIsUploading(true);
//     try {
//       const user = await supabase.auth.getUser();
//       if (!user.data.user) throw new Error("Not authenticated");

//       const userId = user.data.user.id;
//       const fileExt = file.name.split(".").pop();
//       const fileName = `${userId}-receipt-${Date.now()}.${fileExt}`;
//       const filePath = `payment_receipts/${fileName}`;

//       const { error: uploadError } = await supabase.storage
//         .from("resident_receipts")
//         .upload(filePath, file);

//       if (uploadError) throw uploadError;

//       const { data: publicUrlData } = supabase.storage
//         .from("resident_receipts")
//         .getPublicUrl(filePath);

//       await addPaymentReceipt.mutateAsync({
//         residentId: residentInfo.id,
//         receiptUrl: publicUrlData.publicUrl,
//       });

//       setFile(null);

//       toast({
//         title: "Receipt uploaded",
//         description: "Your payment receipt has been submitted for approval.",
//       });
//     } catch (error) {
//       console.error("Error uploading receipt:", error);
//       toast({
//         title: "Error uploading receipt",
//         description: "Please try again.",
//         variant: "destructive",
//       });
//     } finally {
//       setIsUploading(false);
//     }
//   };

//   if (isLoading) {
//     return (
//       <div className="space-y-6">
//         <div>
//           <h1 className="text-3xl font-bold tracking-tight">
//             Payment & Receipts
//           </h1>
//           <p className="text-muted-foreground">
//             Manage your payment receipts for waste collection.
//           </p>
//         </div>
//         <Card>
//           <CardContent className="pt-6">
//             <div className="space-y-4">
//               <div className="h-6 w-1/3 bg-gray-200 animate-pulse rounded"></div>
//               <div className="h-10 bg-gray-200 animate-pulse rounded"></div>
//             </div>
//           </CardContent>
//         </Card>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       <div>
//         <h1 className="text-3xl font-bold tracking-tight">
//           Payment & Receipts
//         </h1>
//         <p className="text-muted-foreground">
//           Manage your payment receipts for waste collection.
//         </p>
//       </div>

//       <Card>
//         <CardHeader>
//           <CardTitle>Upload Payment Receipt</CardTitle>
//           <CardDescription>
//             Submit payment receipts for waste collection services.
//           </CardDescription>
//         </CardHeader>
//         <CardContent>
//           <div className="space-y-4">
//             <div className="flex flex-col sm:flex-row gap-4 items-center">
//               <div className="flex-1">
//                 <Button
//                   type="button"
//                   variant="outline"
//                   onClick={() =>
//                     document.getElementById("receipt-upload")?.click()
//                   }
//                   className="flex items-center gap-2 w-full sm:w-auto"
//                   disabled={isUploading}
//                 >
//                   <Upload className="h-4 w-4" />
//                   {file ? file.name : "Upload New Receipt"}
//                 </Button>
//                 <input
//                   id="receipt-upload"
//                   type="file"
//                   className="hidden"
//                   accept="image/*,.pdf"
//                   onChange={handleFileChange}
//                 />
//                 <p className="text-xs text-muted-foreground mt-2">
//                   Upload a photo or PDF of your payment receipt.
//                 </p>
//               </div>

//               <Button
//                 onClick={uploadReceipt}
//                 disabled={!file || isUploading}
//                 className="bg-tw-purple-600 hover:bg-tw-purple-700 w-full sm:w-auto"
//               >
//                 {isUploading ? "Uploading..." : "Submit Receipt"}
//               </Button>
//             </div>
//           </div>
//         </CardContent>
//       </Card>

//       <Card>
//         <CardHeader>
//           <CardTitle>Payment History</CardTitle>
//           <CardDescription>
//             Your submitted payment receipts and their status
//           </CardDescription>
//         </CardHeader>
//         <CardContent>
//           {residentInfo?.id ? (
//             <PaymentReceiptsList residentId={residentInfo.id} />
//           ) : (
//             <p className="text-muted-foreground text-sm">
//               Please complete your profile to submit receipts.
//             </p>
//           )}
//         </CardContent>
//       </Card>

//       <div className="flex justify-end">
//         <Button
//           onClick={() => setAlertDialogOpen(true)}
//           className="bg-tw-green-600 hover:bg-tw-green-700"
//         >
//           Alert Waste Manager
//         </Button>
//       </div>

//       <AlertWasteForm
//         open={alertDialogOpen}
//         onOpenChange={setAlertDialogOpen}
//         residentId={residentInfo?.id}
//       />
//     </div>
//   );
// };

// export default ResidentPayments;

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useResidentInfo } from "@/hooks/useResidentInfo";
import { supabase } from "@/integrations/supabase/client";
import { useAddPaymentReceipt } from "@/hooks/usePaymentReceipts";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import PaymentReceiptsList from "@/components/resident/PaymentReceiptsList";
import AlertWasteForm from "@/components/resident/AlertWasteForm";

const ResidentPayments = () => {
  const { data: residentInfo, isLoading } = useResidentInfo();
  const [file, setFile] = React.useState<File | null>(null);
  const [isUploading, setIsUploading] = React.useState(false);
  const [alertDialogOpen, setAlertDialogOpen] = useState(false);
  const addPaymentReceipt = useAddPaymentReceipt();
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const uploadReceipt = async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a file to upload",
        variant: "destructive",
      });
      return;
    }

    if (!residentInfo?.id) {
      toast({
        title: "Profile incomplete",
        description: "Please complete your resident profile first",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      // Check authentication
      const { data: userData, error: userError } =
        await supabase.auth.getUser();
      if (userError || !userData.user) {
        throw new Error("Authentication failed. Please log in again.");
      }

      const userId = userData.user.id;
      const fileExt = file.name.split(".").pop() || "file";
      const fileName = `${userId}-receipt-${Date.now()}.${fileExt}`;
      const filePath = `payment_receipts/${fileName}`;

      console.log("Uploading file to path:", filePath);
      console.log("File size:", file.size, "bytes");

      // Check file size
      if (file.size > 5 * 1024 * 1024) {
        // Limit to 5MB
        throw new Error(
          "File is too large. Please upload a file smaller than 5MB."
        );
      }

      // First check if the bucket exists
      const { data: buckets } = await supabase.storage.listBuckets();
      const bucketExists = buckets?.some((b) => b.name === "resident_receipts");

      if (!bucketExists) {
        throw new Error(
          "Storage bucket 'resident_receipts' does not exist. Please contact support."
        );
      }

      // Upload the file
      const { error: uploadError, data: uploadData } = await supabase.storage
        .from("resident_receipts")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        console.error("Upload error details:", uploadError);
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      // Get the public URL
      const { data: publicUrlData } = supabase.storage
        .from("resident_receipts")
        .getPublicUrl(filePath);

      if (!publicUrlData.publicUrl) {
        throw new Error("Failed to get public URL for the uploaded file");
      }

      console.log(
        "File uploaded successfully. Public URL:",
        publicUrlData.publicUrl
      );

      // Add to database
      await addPaymentReceipt.mutateAsync({
        residentId: residentInfo.id,
        receiptUrl: publicUrlData.publicUrl,
      });

      // Reset file input
      setFile(null);
      if (document.getElementById("receipt-upload")) {
        (document.getElementById("receipt-upload") as HTMLInputElement).value =
          "";
      }

      toast({
        title: "Receipt uploaded",
        description: "Your payment receipt has been submitted for approval.",
      });
    } catch (error) {
      console.error("Error uploading receipt:", error);
      let errorMessage = "Please try again.";

      if (error instanceof Error) {
        errorMessage = error.message;
      }

      toast({
        title: "Error uploading receipt",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Payment & Receipts
          </h1>
          <p className="text-muted-foreground">
            Manage your payment receipts for waste collection.
          </p>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="h-6 w-1/3 bg-gray-200 animate-pulse rounded"></div>
              <div className="h-10 bg-gray-200 animate-pulse rounded"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Payment & Receipts
        </h1>
        <p className="text-muted-foreground">
          Manage your payment receipts for waste collection.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upload Payment Receipt</CardTitle>
          <CardDescription>
            Submit payment receipts for waste collection services.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <div className="flex-1">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    document.getElementById("receipt-upload")?.click()
                  }
                  className="flex items-center gap-2 w-full sm:w-auto"
                  disabled={isUploading}
                >
                  <Upload className="h-4 w-4" />
                  {file ? file.name : "Upload New Receipt"}
                </Button>
                <input
                  id="receipt-upload"
                  type="file"
                  className="hidden"
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Upload a photo or PDF of your payment receipt.
                </p>
              </div>

              <Button
                onClick={uploadReceipt}
                disabled={!file || isUploading}
                className="bg-tw-purple-600 hover:bg-tw-purple-700 w-full sm:w-auto"
              >
                {isUploading ? "Uploading..." : "Submit Receipt"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
          <CardDescription>
            Your submitted payment receipts and their status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {residentInfo?.id ? (
            <PaymentReceiptsList residentId={residentInfo.id} />
          ) : (
            <p className="text-muted-foreground text-sm">
              Please complete your profile to submit receipts.
            </p>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          onClick={() => setAlertDialogOpen(true)}
          className="bg-tw-green-600 hover:bg-tw-green-700"
        >
          Alert Waste Manager
        </Button>
      </div>

      <AlertWasteForm
        open={alertDialogOpen}
        onOpenChange={setAlertDialogOpen}
        residentId={residentInfo?.id}
      />
    </div>
  );
};

export default ResidentPayments;
