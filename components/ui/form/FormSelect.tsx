// components/ui/form/FormSelect.tsx
type SelectOption = {
    value: string;
    label: string;
  };
  
  type FormSelectProps = {
    options: SelectOption[];
    id?: string;
    name?: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    required?: boolean;
    disabled?: boolean;
  };
  
  export function FormSelect({ 
    options, 
    id, 
    name, 
    value, 
    onChange, 
    required = false, 
    disabled = false 
  }: FormSelectProps) {
    return (
      <select
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className="form-select"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  }