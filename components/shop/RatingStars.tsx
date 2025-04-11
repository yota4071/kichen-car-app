// components/shop/RatingStars.tsx
type RatingStarsProps = {
    rating: number;
    maxRating?: number;
    size?: 'sm' | 'md' | 'lg';
    isEditable?: boolean;
    onChange?: (rating: number) => void;
  };
  
  export function RatingStars({ 
    rating, 
    maxRating = 5, 
    size = 'md', 
    isEditable = false,
    onChange
  }: RatingStarsProps) {
    const sizeClass = {
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg',
    }[size];
  
    const handleClick = (selectedRating: number) => {
      if (isEditable && onChange) {
        onChange(selectedRating);
      }
    };
  
    return (
      <div className={`rating-stars ${sizeClass}`}>
        {Array.from({ length: maxRating }).map((_, idx) => (
          <span
            key={idx}
            onClick={() => handleClick(idx + 1)}
            style={{ 
              cursor: isEditable ? 'pointer' : 'default',
              color: idx < rating ? '#FFB800' : '#CBD5E0',
              padding: isEditable ? '0 0.25rem' : '0',
              fontSize: size === 'lg' ? '1.5rem' : 'inherit'
            }}
          >
            {idx < rating ? '★' : '☆'}
          </span>
        ))}
      </div>
    );
  }