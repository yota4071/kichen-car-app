// components/category/CategoryCard.tsx
import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

type CategoryCardProps = {
  name: string;
  description?: string;
  icon?: string;
  image?: string;
  count?: number;
  backgroundColor?: string;
  isSmall?: boolean;
};

export default function CategoryCard({
  name,
  description = '',
  icon = '🍽️',
  image,
  count = 0,
  backgroundColor = '#f0f9ff',
  isSmall = false,
}: CategoryCardProps) {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);
  
  const handleClick = () => {
    router.push(`/categories?category=${encodeURIComponent(name)}`);
  };
  
  const getBackgroundColor = () => {
    // 各カテゴリーに固有の色を割り当てる
    const colorMap: Record<string, string> = {
      '和食': '#f0f9ff', // 青系
      '洋食': '#fdf2f8', // ピンク系
      '中華': '#fef3c7', // 黄色系
      'アジア料理': '#ecfdf5', // 緑系
      'スイーツ': '#fdf2f8', // ピンク系
      'ドリンク': '#eff6ff', // 青系
      'その他': '#f3f4f6', // グレー系
    };
    
    return colorMap[name] || backgroundColor;
  };

  const getCategoryImage = () => {
    if (image) return image;
    
    // 各カテゴリーのデフォルト画像（実際のプロジェクトでは適切な画像URLに置き換える）
    const imageMap: Record<string, string> = {
      '和食': '/images/categories/japanese.jpg',
      '洋食': '/images/categories/western.jpg',
      '中華': '/images/categories/chinese.jpg',
      'アジア料理': '/images/categories/asian.jpg',
      'スイーツ': '/images/categories/sweets.jpg',
      'ドリンク': '/images/categories/drinks.jpg',
      'その他': '/images/categories/other.jpg',
    };
    
    return imageMap[name] || '/images/categories/default.jpg';
  };

  return (
    <div
      className={`styled-category-card ${isSmall ? 'min-h-24' : ''}`}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="styled-category-bg">
        {/* 実際のデプロイでは適切な画像パスに変更する必要があります */}
        {getCategoryImage() ? (
          <img 
            src={getCategoryImage()}
            alt={name}
            width={300}
            height={200}
          />
        ) : (
          <div style={{ 
            backgroundColor: getBackgroundColor(),
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '3rem'
          }}>
            {icon}
          </div>
        )}
      </div>
      
      <div className="styled-category-content">
        <h3 className="styled-category-title">{name}</h3>
        <div className="styled-category-count">{count}件のキッチンカー</div>
      </div>
    </div>
  );
}