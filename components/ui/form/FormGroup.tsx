// components/ui/form/FormGroup.tsx
import { ReactNode } from 'react';

type FormGroupProps = {
  children: ReactNode;
  className?: string;
};

export function FormGroup({ children, className = '' }: FormGroupProps) {
  return (
    <div className={`form-group ${className}`}>
      {children}
    </div>
  );
}