// components/ui/form/FormLabel.tsx
import React, { ReactNode } from 'react';

type FormLabelProps = {
    children: ReactNode;
    htmlFor?: string;
    required?: boolean;
  };
  
  export function FormLabel({ 
    children, 
    htmlFor, 
    required = false 
  }: FormLabelProps) {
    return (
      <label htmlFor={htmlFor} className="form-label">
        {children}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
    );
  }