
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import AlertFormContent, { alertSchema, AlertFormValues } from './AlertFormContent';
import { useAlertSubmission } from '@/hooks/useAlertSubmission';

interface AlertWasteFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  residentId?: string;
}

const AlertWasteForm: React.FC<AlertWasteFormProps> = ({ open, onOpenChange, residentId }) => {
  const form = useForm<AlertFormValues>({
    resolver: zodResolver(alertSchema),
    defaultValues: {
      subject: '',
      description: '',
    },
  });

  const { isSubmitting, submitAlert } = useAlertSubmission(form, () => onOpenChange(false));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Alert Waste Managers</DialogTitle>
        </DialogHeader>
        <Card className="border-0 shadow-none">
          <CardContent className="p-0">
            <Form {...form}>
              <AlertFormContent 
                form={form} 
                isSubmitting={isSubmitting} 
                onSubmit={submitAlert} 
              />
            </Form>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};

export default AlertWasteForm;
