// components/FoodTypeSelector.tsx

type FoodTypeSelectorProps = {
    selectedTypes: string[];
    availableTypes: string[];
    onChange: (type: string) => void;
  };
  
  export default function FoodTypeSelector({ 
    selectedTypes, 
    availableTypes, 
    onChange 
  }: FoodTypeSelectorProps) {
    return (
      <div style={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: '0.5rem', 
        marginTop: '0.5rem' 
      }}>
        {availableTypes.map(type => (
          <button
            key={type}
            type="button"
            onClick={() => onChange(type)}
            style={{ 
              padding: '0.5rem 1rem',
              borderRadius: '9999px',
              border: '1px solid #e2e8f0',
              background: selectedTypes.includes(type) ? '#3b82f6' : 'transparent',
              color: selectedTypes.includes(type) ? 'white' : '#64748b',
              cursor: 'pointer',
              transition: 'all 0.2s',
              fontSize: '0.875rem'
            }}
          >
            {type}
          </button>
        ))}
      </div>
    );
  }