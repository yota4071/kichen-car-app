import Link from "next/link";
import { useState } from "react";

type Shop = {
  id: string;
  name: string;
  location: string;
  image: string;
  type: string;
  rating?: number;
  reviewCount?: number;
};

export default function ShopCard({ id, name, location, image, type, rating = 0, reviewCount = 0 }: Shop) {
  const [isHovered, setIsHovered] = useState(false);

  const renderRating = (rating: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill={star <= Math.round(rating) ? "currentColor" : "none"}
            stroke="currentColor"
            className={`w-4 h-4 ${
              star <= Math.round(rating) ? "text-amber-400" : "text-gray-300"
            }`}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={star <= Math.round(rating) ? "0" : "1.5"}
              d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
            />
          </svg>
        ))}
        <span className="ml-1 text-xs text-gray-600 dark:text-gray-400">
          ({reviewCount})
        </span>
      </div>
    );
  };

  return (
    <Link href={`/shop/${id}`} className="block group" data-testid={`shop-card-${id}`}>
      <div
        className="card hover-scale"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative overflow-hidden h-48">
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <span className="text-white font-medium text-sm">{location}</span>
          </div>
          <div className="absolute top-2 right-2">
            <span className="badge badge-primary text-xs">
              {type}
            </span>
          </div>
        </div>
        <div className="p-4">
          <h2 className="text-lg font-bold mb-1 text-gray-900 dark:text-white truncate">{name}</h2>
          <div className="flex items-center justify-between mt-2">
            {rating > 0 && renderRating(rating)}
            <div className="ml-auto">
              <span
                className={`text-xs font-medium py-1 px-2 rounded-full ${
                  isHovered
                    ? "bg-blue-600 text-white"
                    : "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                } transition-colors duration-300`}
              >
                詳細を見る
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}