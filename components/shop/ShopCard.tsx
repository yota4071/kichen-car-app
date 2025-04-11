// components/shop/ShopCard.tsx
import Link from 'next/link';
import { useState } from 'react';

type ShopCardProps = {
  id: string;
  name: string;
  location: string;
  image: string;
  type: string;
  rating?: number;
  reviewCount?: number;
};

export default function ShopCard({ 
  id, 
  name, 
  location, 
  image, 
  type, 
  rating = 4, 
  reviewCount = 18 
}: ShopCardProps) {
  return (
    <Link href={`/shop/${id}`} className="shop-card">
      <div className="shop-image-container">
        <img src={image} alt={name} className="shop-image" />
        <div className="shop-type">{type}</div>
      </div>
      <div className="shop-details">
        <h3 className="shop-name">{name}</h3>
        <div className="shop-location">📍 {location}</div>
        <div className="rating">
          <div className="stars">
            {[1, 2, 3, 4, 5].map((star) => (
              <span 
                key={star} 
                className="star"
                style={{ color: star <= rating ? '#f6ad55' : '#cbd5e0' }}
              >
                {star <= rating ? '★' : '☆'}
              </span>
            ))}
          </div>
          <span>({reviewCount})</span>
        </div>
      </div>
    </Link>
  );
}