// components/shop/TypeFilter.tsx
import React, { useState, useEffect } from 'react';
import { collection, getDocs, query } from "firebase/firestore";
import { db } from "@/lib/firebase";

type TypeFilterProps = {
  selectedType: string;
  onTypeChange: (type: string) => void;
  dishCategory?: string; // dishカテゴリー（和食、洋食など）
};

export default function TypeFilter({ 
  selectedType, 
  onTypeChange,
  dishCategory 
}: TypeFilterProps) {
  const [types, setTypes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false); // デフォルトで縮小状態

  useEffect(() => {
    const fetchTypes = async () => {
      setIsLoading(true);
      try {
        // Firestoreからkitchensコレクションを取得
        const kitchensRef = collection(db, "kitchens");
        const kitchensSnapshot = await getDocs(kitchensRef);
        
        // typeフィールドを抽出して重複を排除
        const typeSet = new Set<string>();
        
        kitchensSnapshot.docs.forEach(doc => {
          const data = doc.data();
          
          // dishCategoryが指定されている場合は、そのdishに合致するものだけを取得
          if (dishCategory && data.dish !== dishCategory) {
            return;
          }
          
          if (data.type) {
            typeSet.add(data.type);
          }
        });
        
        // Setから配列に変換してソート
        const typeArray = Array.from(typeSet).sort();
        setTypes(typeArray);
      } catch (error) {
        console.error("Error fetching types:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTypes();
  }, [dishCategory]);

  if (isLoading) {
    return <div>タイプを読み込み中...</div>;
  }

  return (
    <div className="type-filter">
      <div 
        className="filter-header"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3 className="filter-title">
          <span className="filter-icon"></span>
          料理タイプ
          {types.length > 0 && (
            <span className="filter-count">({types.length + 1}件)</span>
          )}
        </h3>
        <span className={`expand-icon ${isExpanded ? 'expanded' : ''}`}>
          ▼
        </span>
      </div>
      
      <div className={`filter-options ${isExpanded ? 'expanded' : 'collapsed'}`}>
        <button
          className={`filter-option ${selectedType === "" ? "active" : ""}`}
          onClick={() => onTypeChange("")}
        >
          すべて
        </button>
        {types.map((type) => (
          <button
            key={type}
            className={`filter-option ${selectedType === type ? "active" : ""}`}
            onClick={() => onTypeChange(type)}
          >
            {type}
          </button>
        ))}
      </div>
      
      <style jsx>{`
        .type-filter {
          margin-bottom: 1rem;
          background-color: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 0.75rem;
          overflow: hidden;
          transition: all 0.3s ease;
        }
        
        .filter-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem 1rem;
          cursor: pointer;
          background-color: white;
          transition: background-color 0.2s;
          user-select: none;
        }
        
        .filter-header:hover {
          background-color: #f8fafc;
        }
        
        .filter-title {
          font-size: 0.95rem;
          font-weight: 600;
          margin: 0;
          color: #374151;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .filter-icon {
          font-size: 0.875rem;
        }
        
        .filter-count {
          font-size: 0.75rem;
          font-weight: 400;
          color: #6b7280;
          margin-left: 0.25rem;
        }
        
        .expand-icon {
          font-size: 0.75rem;
          color: #6b7280;
          transition: transform 0.3s ease;
        }
        
        .expand-icon.expanded {
          transform: rotate(180deg);
        }
        
        .filter-options {
          transition: all 0.3s ease;
          overflow: hidden;
        }
        
        .filter-options.collapsed {
          max-height: 0;
          opacity: 0;
        }
        
        .filter-options.expanded {
          max-height: 500px;
          opacity: 1;
          padding: 0 1rem 1rem 1rem;
        }
        
        .filter-options.expanded {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        
        .filter-option {
          padding: 0.5rem 0.875rem;
          background-color: white;
          border: 1px solid #e5e7eb;
          border-radius: 20px;
          font-size: 0.8rem;
          color: #4b5563;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
        }
        
        .filter-option:hover {
          background-color: #f3f4f6;
          transform: translateY(-1px);
        }
        
        .filter-option.active {
          background-color: var(--primary-color);
          color: white;
          border-color: var(--primary-color);
        }
        
        @media (max-width: 768px) {
          .filter-options.expanded {
            overflow-x: auto;
            flex-wrap: nowrap;
            -webkit-overflow-scrolling: touch;
            scrollbar-width: none;
            -ms-overflow-style: none;
          }
          
          .filter-options.expanded::-webkit-scrollbar {
            display: none;
          }
          
          .filter-option {
            flex-shrink: 0;
            font-size: 0.75rem;
            padding: 0.4rem 0.75rem;
          }
        }
      `}</style>
    </div>
  );
}