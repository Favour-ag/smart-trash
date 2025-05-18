import React from "react";
import { UseFormReturn } from "react-hook-form";
import {
  FormField as ShadcnFormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";

interface FormFieldProps {
  form: UseFormReturn<any>;
  name: string;
  label: string;
  description?: string;
  children: React.ReactNode;
}

const FormField: React.FC<FormFieldProps> = ({
  form,
  name,
  label,
  description,
  children,
}) => {
  return (
    <ShadcnFormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            {React.cloneElement(children as React.ReactElement, { ...field })}
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default FormField;
