
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { AlertFormValues } from '@/components/resident/AlertFormContent';
import { UseFormReturn } from 'react-hook-form';

export const useAlertSubmission = (
  form: UseFormReturn<AlertFormValues>,
  onSuccess: () => void
) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const submitAlert = async (values: AlertFormValues) => {
    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      
      // Insert the feedback/alert
      const { error } = await supabase
        .from('feedback')
        .insert({
          user_id: user.id,
          subject: values.subject,
          description: values.description,
          status: 'NEW',
        });

      if (error) throw error;

      form.reset();
      
      toast({
        title: 'Alert submitted',
        description: 'Your waste alert has been submitted successfully.',
      });
      
      // Call the success callback (e.g., to close the dialog)
      onSuccess();
    } catch (error) {
      console.error('Error submitting alert:', error);
      toast({
        title: 'Error submitting alert',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    submitAlert
  };
};
