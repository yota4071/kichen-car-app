// components/shop/PRCard.tsx
import Link from 'next/link';

type PRCardProps = {
  id: string;
  name: string;
  location: string;
  image: string;
  prMessage: string;
  url: string;
};

export default function PRCard({ 
  id, 
  name, 
  location, 
  image, 
  prMessage,
  url
}: PRCardProps) {
  return (
    <Link href={url} className="shop-card">
      <div className="shop-image-container">
        <img src={image} alt={name} className="shop-image" />
        <div className="shop-type">PR</div>
      </div>
      <div className="shop-details">
        <h3 className="shop-name">{name}</h3>
        {/* <div className="shop-location">📍 {location}</div> */}
        <div className="pr-message">
          {prMessage}
        </div>
      </div>
    </Link>
  );
}