// components/shop/ShopCard.tsx
import Link from 'next/link';
import { useState } from 'react';
import { RatingStars } from './shop/RatingStars';

type ShopCardProps = {
  id: string;
  name: string;
  location: string;
  image: string;
  type: string;
  rating: number;
  reviewCount: number;
};

export default function ShopCard({ 
  id, 
  name, 
  location, 
  image, 
  type, 
  rating, 
  reviewCount 
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
            <RatingStars rating={rating} />
          </div>
          <span>({reviewCount})</span>
        </div>
      </div>
    </Link>
  );
}