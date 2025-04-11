// components/ui/form/FormCheckbox.tsx
type FormCheckboxProps = {
    id?: string;
    name?: string;
    checked: boolean;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    label: string;
    disabled?: boolean;
  };
  
  export function FormCheckbox({ 
    id, 
    name, 
    checked, 
    onChange, 
    label, 
    disabled = false 
  }: FormCheckboxProps) {
    return (
      <div className="form-checkbox-container">
        <input
          type="checkbox"
          id={id}
          name={name}
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className="form-checkbox"
        />
        <label htmlFor={id} className="form-checkbox-label">
          {label}
        </label>
      </div>
    );
  }