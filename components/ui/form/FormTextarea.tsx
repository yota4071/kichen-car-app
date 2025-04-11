// components/ui/form/FormTextarea.tsx
type FormTextareaProps = {
    id?: string;
    name?: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
    rows?: number;
  };
  
  export function FormTextarea({ 
    id, 
    name, 
    value, 
    onChange, 
    placeholder, 
    required = false, 
    disabled = false,
    rows = 4
  }: FormTextareaProps) {
    return (
      <textarea
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        rows={rows}
        className="form-textarea"
      />
    );
  }