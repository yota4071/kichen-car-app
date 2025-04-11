// components/ui/SuccessMessage.tsx
import { ReactNode } from 'react';

type SuccessMessageProps = {
  children: ReactNode;
  className?: string;
};

export default function SuccessMessage({ 
  children, 
  className = '' 
}: SuccessMessageProps) {
  return (
    <div 
      className={`success-message ${className}`}
      style={{ 
        marginTop: '1rem',
        padding: '1rem',
        backgroundColor: '#f0fff4',
        color: '#38a169',
        borderRadius: '0.5rem',
        textAlign: 'center',
        border: '1px solid #c6f6d5'
      }}
    >
      {children}
    </div>
  );
}