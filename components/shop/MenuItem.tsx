// components/shop/MenuItem.tsx
import { useState } from 'react';
import Image from 'next/image';

type MenuItemProps = {
  id: string;
  name: string;
  price: number;
  description?: string;
  image?: string;
  category?: string;
  likes: number;
  onLike?: (menuId: string) => Promise<boolean>;
  userHasLiked?: boolean;
};

export function MenuItem({
  id,
  name,
  price,
  description,
  image,
  category,
  likes = 0,
  onLike,
  userHasLiked = false
}: MenuItemProps) {
  const [isLiked, setIsLiked] = useState(userHasLiked);
  const [likeCount, setLikeCount] = useState(likes);
  const [isLikeAnimating, setIsLikeAnimating] = useState(false);

  const handleLikeClick = async () => {
    if (onLike) {
      const success = await onLike(id);
      
      if (success) {
        if (isLiked) {
          setLikeCount(prev => prev - 1);
          setIsLiked(false);
        } else {
          setLikeCount(prev => prev + 1);
          setIsLiked(true);
          setIsLikeAnimating(true);
          setTimeout(() => setIsLikeAnimating(false), 500);
        }
      }
    }
  };

  const formattedPrice = new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: 'JPY'
  }).format(price);

  return (
    <div className="menu-item">
      <div className="menu-item-content">
        {image && (
          <div className="menu-item-image">
            <img src={image} alt={name} />
          </div>
        )}
        <div className="menu-item-details">
          <div className="menu-item-header">
            <h3 className="menu-item-name">{name}</h3>
            {category && <span className="menu-item-category">{category}</span>}
          </div>
          <div className="menu-item-price">{formattedPrice}</div>
          {description && <p className="menu-item-description">{description}</p>}
          <div className="menu-item-footer">
            <button 
              className={`menu-like-button ${isLiked ? 'liked' : ''} ${isLikeAnimating ? 'animating' : ''}`}
              onClick={handleLikeClick}
            >
              {isLiked ? '❤️' : '🤍'} <span className="like-count">{likeCount}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}