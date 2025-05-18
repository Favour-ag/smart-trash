
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import FormFieldComponent from './FormField';
import { z } from 'zod';

export const alertSchema = z.object({
  subject: z.string().min(3, { message: 'Subject is required' }),
  description: z.string().min(10, { message: 'Please provide more details' }),
});

export type AlertFormValues = z.infer<typeof alertSchema>;

interface AlertFormContentProps {
  form: UseFormReturn<AlertFormValues>;
  isSubmitting: boolean;
  onSubmit: (values: AlertFormValues) => Promise<void>;
}

const AlertFormContent: React.FC<AlertFormContentProps> = ({
  form,
  isSubmitting,
  onSubmit,
}) => {
  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <FormFieldComponent
        form={form}
        name="subject"
        label="Subject"
      >
        <Input placeholder="E.g., Urgent waste collection needed" />
      </FormFieldComponent>
      
      <FormFieldComponent
        form={form}
        name="description"
        label="Details"
      >
        <Textarea 
          placeholder="Please provide details about your waste collection needs..." 
          className="min-h-[100px]" 
        />
      </FormFieldComponent>

      <Button 
        type="submit" 
        disabled={isSubmitting} 
        className="w-full bg-tw-green-600 hover:bg-tw-green-700"
      >
        {isSubmitting ? 'Submitting...' : 'Submit Alert'}
      </Button>
    </form>
  );
};

export default AlertFormContent;
