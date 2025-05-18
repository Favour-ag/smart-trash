
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/hooks/use-toast';
import { useResidentInfo, useUpdateResidentInfo } from '@/hooks/useResidentInfo';
import FormField from '@/components/resident/FormField';
import { Form } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Upload } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const profileFormSchema = z.object({
  fullName: z.string().min(3, { message: 'Full name is required' }),
  streetAddress: z.string().min(3, { message: 'Street address is required' }),
  houseNumber: z.string().min(1, { message: 'House number is required' }),
  occupation: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export function ProfileForm() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const { data: residentInfo, isLoading } = useResidentInfo();
  const updateResidentInfo = useUpdateResidentInfo();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      fullName: '',
      streetAddress: '',
      houseNumber: '',
      occupation: '',
    },
  });

  useEffect(() => {
    if (residentInfo && !isLoading) {
      form.reset({
        fullName: residentInfo.full_name,
        streetAddress: residentInfo.street_address,
        houseNumber: residentInfo.house_number,
        occupation: residentInfo.occupation || '',
      });
      
      if (residentInfo.profile_photo_url) {
        setPhotoUrl(residentInfo.profile_photo_url);
      }
      
      setLoading(false);
    } else if (!isLoading) {
      setLoading(false);
    }
  }, [residentInfo, isLoading, form]);

  const onSubmit = async (values: ProfileFormValues) => {
    setIsSubmitting(true);
    try {
      await updateResidentInfo.mutateAsync({
        full_name: values.fullName,
        street_address: values.streetAddress,
        house_number: values.houseNumber,
        occupation: values.occupation || null,
        profile_photo_url: photoUrl,
      });
      
      toast({
        title: 'Profile updated',
        description: 'Your information has been saved.',
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Error updating profile',
        description: 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    try {
      setUploadingPhoto(true);
      
      // Check if profile_photos bucket exists, if not create it
      const { data: buckets } = await supabase.storage.listBuckets();
      const profileBucketExists = buckets?.some(bucket => bucket.name === 'profile_photos');
      
      if (!profileBucketExists) {
        await supabase.storage.createBucket('profile_photos', { public: true });
      }
      
      // Upload the file
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      
      const { error: uploadError, data } = await supabase.storage
        .from('profile_photos')
        .upload(fileName, file);
        
      if (uploadError) throw uploadError;
      
      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from('profile_photos')
        .getPublicUrl(fileName);
        
      setPhotoUrl(publicUrlData.publicUrl);
      
      toast({
        title: 'Photo uploaded',
        description: 'Your profile photo has been updated.',
      });
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast({
        title: 'Error uploading photo',
        description: 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setUploadingPhoto(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="h-6 w-1/3 bg-gray-200 animate-pulse rounded"></div>
            <div className="h-10 bg-gray-200 animate-pulse rounded"></div>
            <div className="h-6 w-1/3 bg-gray-200 animate-pulse rounded"></div>
            <div className="h-10 bg-gray-200 animate-pulse rounded"></div>
            <div className="h-6 w-1/3 bg-gray-200 animate-pulse rounded"></div>
            <div className="h-10 bg-gray-200 animate-pulse rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Your Information</CardTitle>
          <CardDescription>
            Update your personal information.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Profile Photo Section */}
          <div className="flex flex-col items-center mb-6">
            <Avatar className="h-24 w-24 mb-4">
              <AvatarImage src={photoUrl || ''} />
              <AvatarFallback className="bg-tw-purple-100 text-tw-purple-800">
                <User size={32} />
              </AvatarFallback>
            </Avatar>
            <div className="flex items-center gap-2">
              <label htmlFor="photo-upload" className="cursor-pointer">
                <div className="flex items-center gap-2 text-sm text-tw-purple-600 hover:text-tw-purple-800">
                  <Upload className="h-4 w-4" />
                  <span>{uploadingPhoto ? 'Uploading...' : 'Upload Photo'}</span>
                </div>
                <input
                  id="photo-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoUpload}
                  disabled={uploadingPhoto}
                />
              </label>
            </div>
          </div>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                form={form}
                name="fullName"
                label="Full Name"
              >
                <Input placeholder="Your full name" />
              </FormField>
              
              <FormField
                form={form}
                name="streetAddress"
                label="Street Address"
              >
                <Input placeholder="Your street address" />
              </FormField>
              
              <FormField
                form={form}
                name="houseNumber"
                label="House Number"
              >
                <Input placeholder="Your house number" />
              </FormField>
              
              <FormField
                form={form}
                name="occupation"
                label="Occupation (Optional)"
              >
                <Input placeholder="Your occupation" />
              </FormField>

              <Button type="submit" className="w-full bg-tw-purple-600 hover:bg-tw-purple-700" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save Information'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

export default ProfileForm;
