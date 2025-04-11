// components/ui/form/FormInput.tsx
type FormInputProps = {
    type?: 'text' | 'email' | 'password' | 'number' | 'date';
    id?: string;
    name?: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
    min?: string | number;
    max?: string | number;
  };
  
  export function FormInput({ 
    type = 'text', 
    id, 
    name, 
    value, 
    onChange, 
    placeholder, 
    required = false, 
    disabled = false,
    min,
    max
  }: FormInputProps) {
    return (
      <input
        type={type}
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        min={min}
        max={max}
        className="form-input"
      />
    );
  }